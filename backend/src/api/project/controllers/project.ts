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
          project: { id, name: projectName, createdAt, updatedAt, description },
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
     * 结果：超管查所有的；其余只能查自己关联的项目
     */
    async find(ctx) {
      const { userId, isSuperAdmin } = ctx.state.selfGlobalState;
      if (!isSuperAdmin) {
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
    },

    /**
     * 权限： 超管、平台管理员且是该项目的master角色
     */
    async delete(ctx) {
      const projectId = ctx.params.id;
      let result;
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
        isSuccess: true,
      };
    },

    /**
     * 权限：超管、平台管理员
     */
    async create(ctx) {
      const { data } = ctx.request.body || {};
      const { userId } = ctx.state.selfGlobalState;
      const { name, description } = data || {};
      const createProjectRes = (await strapi
        .service("api::project.project")
        .create({
          data: {
            name,
            description,
            appId: uuidv4(),
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
      await strapi.service("api::project-user-role.project-user-role").create({
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
        id: projectId,
        name: projectName,
        description: projectDesc,
        appId,
      };
    },
  })
);
