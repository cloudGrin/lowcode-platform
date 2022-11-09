/**
 * project controller
 */

import { factories } from "@strapi/strapi";
import { v4 as uuidv4 } from "uuid";
function formatProjectUserRoleResult(results) {
  return Object.values(
    results.reduce(
      (
        projects,
        {
          projectRole: { id: roleId, name: roleName } = {} as any,
          project: {
            id,
            name: projectName,
            createdAt,
            updatedAt,
            description,
            appId,
          },
          user: { id: userId, username },
        }
      ) => {
        if (projects[id]) {
          projects[id].attributes.users.push({
            id: userId,
            username,
            projectRole: {
              id: roleId,
              name: roleName,
            },
          });
        } else {
          projects[id] = {
            id,
            attributes: {
              appId,
              name: projectName,
              description,
              createdAt,
              updatedAt,
              users: [
                {
                  id: userId,
                  username,
                  projectRole: {
                    id: roleId,
                    name: roleName,
                  },
                },
              ],
            },
          };
        }
        return projects;
      },
      {}
    )
  );
}

export default factories.createCoreController(
  "api::project.project",
  ({ strapi }) => ({
    /**
     * 权限：登录用户
     * 结果：平台管理员查所有的；其余只能查自己关联的项目
     */
    async find(ctx) {
      const { userId, isPlatformAdmin } = ctx.state.selfGlobalState;
      try {
        if (!isPlatformAdmin) {
          const { results: projectUserRoleResults = [], pagination } =
            (await strapi
              .service("api::project-user-role.project-user-role")
              .find({
                pagination: ctx.query.pagination,
                populate: {
                  user: true,
                  project: true,
                },
                // sort: "updatedAt:desc",
                filters: {
                  user: {
                    id: {
                      $eq: userId,
                    },
                  },
                },
              })) as any;
          const projectIds = [
            ...new Set(
              projectUserRoleResults
                .map(({ project }) => project?.id)
                .filter(Boolean)
            ),
          ];
          const { results = [] } = (await strapi
            .service("api::project-user-role.project-user-role")
            .find({
              pagination: false,
              populate: {
                user: true,
                project: true,
                projectRole: true,
              },
              // sort: "updatedAt:desc",
              filters: {
                project: {
                  id: {
                    $in: projectIds,
                  },
                },
              },
            })) as any;
          return {
            data: formatProjectUserRoleResult(results),
            meta: {
              pagination,
            },
          };
        } else {
          const { results: projects = [], pagination } = (await strapi
            .service("api::project.project")
            .find({
              pagination: ctx.query.pagination,
              // sort: "updatedAt:desc",
            })) as any;
          const projectIds = projects.map((i) => i.id);
          const { results = [] } = (await strapi
            .service("api::project-user-role.project-user-role")
            .find({
              pagination: false,
              populate: {
                user: true,
                project: true,
                projectRole: true,
              },
              // sort: "updatedAt:desc",
              filters: {
                project: {
                  id: {
                    $in: projectIds,
                  },
                },
              },
            })) as any;
          return {
            data: formatProjectUserRoleResult(results),
            meta: {
              pagination,
            },
          };
        }
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },
    /**
     * 权限：平台管理员或该项目成员
     * 根据appId查询应用信息及应用关联用户
     */
    async findByAppId(ctx) {
      const { appId } = ctx.params;
      try {
        const { results: projects } = (await strapi
          .service("api::project.project")
          .find({
            pagination: false,
            filters: {
              appId,
            },
          })) as any;

        if (projects.length === 0) {
          ctx.status = 404;
          ctx.body = {
            data: null,
            error: {
              status: 404,
              name: "NotFoundError",
              message: "Not Found",
              details: {},
            },
          };
          return;
        }
        const projectId = projects[0].id;

        const { results = [] } = (await strapi
          .service("api::project-user-role.project-user-role")
          .find({
            pagination: false,
            populate: {
              user: true,
              project: true,
              projectRole: true,
            },
            // sort: "updatedAt:desc",
            filters: {
              project: {
                id: projectId,
              },
            },
          })) as any;
        const data = Object.values(
          formatProjectUserRoleResult(results)
        )[0] as any;
        return {
          data: {
            id: data.id,
            ...data.attributes,
          },
        };
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },

    /**
     * 权限： 应用管理员且是该项目的master角色
     */
    async delete(ctx) {
      const projectId = ctx.params.id;
      let result;
      try {
        async function deleteOne() {
          return await strapi.db
            .query("api::project-user-role.project-user-role")
            .delete({
              where: {
                project: {
                  id: projectId,
                },
              },
            });
        }
        // 批量删除
        do {
          result = await deleteOne();
        } while (result);

        await strapi.db.query("api::project.project").delete({
          where: {
            id: projectId,
          },
        });
        return {
          data: {
            success: true,
          },
        };
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },

    /**
     * 权限：应用管理员
     */
    async create(ctx) {
      const { name, description } = ctx.request.body;
      const { userId } = ctx.state.selfGlobalState;
      try {
        const createProjectRes = (await strapi
          .service("api::project.project")
          .create({
            data: {
              name,
              description,
              appId: `APP_${uuidv4().replace("-", "_")}`,
            },
          })) as any;
        const {
          id: projectId,
          name: projectName,
          description: projectDesc,
          appId,
        } = createProjectRes;
        const projectRoleRes = await strapi.db
          .query("api::project-role.project-role")
          .findOne({
            where: {
              name: "master",
            },
          });
        const { id: roleId } = projectRoleRes;
        await strapi
          .service("api::project-user-role.project-user-role")
          .create({
            data: {
              user: {
                id: userId,
              },
              project: {
                id: projectId,
              },
              projectRole: {
                id: roleId,
              },
            },
          });
        return {
          data: {
            id: projectId,
            name: projectName,
            description: projectDesc,
            appId,
          },
        };
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },
    /**
     * 权限：该项目的master角色
     */
    async update(ctx) {
      const { name, description } = ctx.request.body;
      const { id } = ctx.params;

      try {
        const {
          appId,
          description: projectDesc,
          id: projectId,
          name: projectName,
        } = (await strapi.service("api::project.project").update(id, {
          data: {
            name,
            description,
          },
        })) as any;
        return {
          data: {
            appId,
            description: projectDesc,
            id: projectId,
            name: projectName,
          },
        };
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },
  })
);
