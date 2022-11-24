/**
 * project controller
 */

import { factories } from "@strapi/strapi";
import { v4 as uuidv4 } from "uuid";

export default factories.createCoreController(
  "api::project.project",
  ({ strapi }) => ({
    /**
     * 权限：登录用户
     * 结果：平台管理员查所有的；其余只能查自己关联的应用
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
            .service("api::project.project")
            .find({
              pagination: false,
              // populate: {
              //   user: true,
              //   project: true,
              //   projectRole: true,
              // },
              // sort: "updatedAt:desc",
              filters: {
                id: {
                  $in: projectIds,
                },
                status: "ONLINE",
              },
            })) as any;
          return {
            data: formatProjectResult(results),
            meta: {
              pagination,
            },
          };
        } else {
          const { results, pagination } = (await strapi
            .service("api::project.project")
            .find({
              pagination: ctx.query.pagination,
              filters: {
                status: "ONLINE",
              },
              // sort: "updatedAt:desc",
            })) as any;

          return {
            data: formatProjectResult(results),
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
     * 权限：无权限
     * 根据id查询应用信息
     */
    async findOne(ctx) {
      const { id } = ctx.params;
      try {
        const { results } = (await strapi.service("api::project.project").find({
          pagination: false,
          filters: {
            id,
          },
        })) as any;

        if (results.length === 0 || results[0].status === "DELETE") {
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

        return {
          data: formatProjectResult(results)[0],
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
     * 权限：平台管理员或该应用成员
     * 查询应用成员及其角色
     */
    async findUserAndRoleById(ctx) {
      const { id } = ctx.params;
      try {
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
                id,
              },
            },
          })) as any;
        return {
          data: formatProjectUserRoleResult(results),
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
     * 权限： 应用管理员且是该应用的master角色
     */
    async delete(ctx) {
      const projectId = ctx.params.id;
      // let result;
      try {
        // async function deleteOne() {
        //   return await strapi.db
        //     .query("api::project-user-role.project-user-role")
        //     .delete({
        //       where: {
        //         project: {
        //           id: projectId,
        //         },
        //       },
        //     });
        // }
        // // 批量删除
        // do {
        //   result = await deleteOne();
        // } while (result);

        await strapi.service("api::project.project").update(projectId, {
          data: {
            status: "DELETE",
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
              status: "ONLINE",
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
        await createProjectUserRole({
          userId,
          roleId,
          projectId,
          strapi,
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
     * 权限：该应用的master角色
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
    /**
     * 权限：平台管理员或该应用master
     * 一个用户在一个应用中可以同时是多个角色
     */
    async setMembers(ctx) {
      const { memberIds, toRole } = ctx.request.body;
      const { id: projectId } = ctx.params;

      if (Object.prototype.toString.apply(memberIds) === "[object Array]") {
        if (!memberIds.length && toRole === "master") {
          ctx.status = 400;
          ctx.body = {
            data: null,
            error: {
              status: 400,
              message: "不能为空",
            },
          };
          return;
        }
        try {
          const { results: projects } = (await strapi
            .service("api::project.project")
            .find({
              pagination: false,
              filters: {
                id: projectId,
              },
            })) as any;

          if (projects.length === 0) {
            ctx.status = 400;
            ctx.body = {
              data: null,
              error: {
                status: 400,
                message: "参数错误",
              },
            };
            return;
          }
          const projectRoleRes = await strapi.db
            .query("api::project-role.project-role")
            .findOne({
              where: {
                name: toRole,
              },
            });
          if (projectRoleRes) {
            const { id: roleId } = projectRoleRes;

            const { results: currentProjectUserRoleRes = [] } = (await strapi
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
                  projectRole: {
                    id: roleId,
                  },
                },
              })) as any;

            const cureentArr = currentProjectUserRoleRes.map(
              (i) => `${projectId}--${i.user.id}--${i.projectRole.id}`
            );
            const nextArr = memberIds.map(
              (i) => `${projectId}--${i}--${roleId}`
            );
            const removeArr = cureentArr.filter(function (v) {
              return nextArr.indexOf(v) == -1;
            });
            const addArr = nextArr.filter(function (v) {
              return cureentArr.indexOf(v) == -1;
            });
            for (let relation of removeArr) {
              const [projectId, userId, roleId] = relation.split("--");
              await removeProjectUserRole({
                userId,
                roleId,
                projectId,
                strapi,
              });
            }
            for (let relation of addArr) {
              const [projectId, userId, roleId] = relation.split("--");
              await createProjectUserRole({
                userId,
                roleId,
                projectId,
                strapi,
              });
            }
            ctx.send({
              data: {
                success: true,
              },
            });
            return;
          } else {
            ctx.status = 400;
            ctx.body = {
              data: null,
              error: {
                status: 400,
                message: "参数错误",
              },
            };
            return;
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
          return;
        }
      } else {
        ctx.status = 400;
        ctx.body = {
          data: null,
          error: {
            status: 400,
            message: "参数错误",
          },
        };
        return;
      }
    },
  })
);

function formatProjectResult(projects) {
  return projects.map(({ id, name, description, appId }) => ({
    id,
    name,
    description,
    appId,
  }));
}

function formatProjectUserRoleResult(results) {
  return results.reduce(
    (
      result: any,
      {
        projectRole: { id: roleId, name: roleName } = {} as any,
        project: { id, appId },
        user: { id: userId, username },
      }
    ) => {
      result.id = id;
      result.appId = appId;
      result[roleName].push({ id: userId, username });
      return result;
    },
    { master: [], developer: [] }
  );
}

/**
 * 一定要前置判断：表中不存在
 * 创建用户-应用-角色关系
 */
async function createProjectUserRole({ userId, roleId, projectId, strapi }) {
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
}

/**
 * 一定要前置判断：表中存在
 * 移除用户-应用-角色关系
 */
async function removeProjectUserRole({ userId, roleId, projectId, strapi }) {
  await strapi.db.query("api::project-user-role.project-user-role").delete({
    where: {
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
}
