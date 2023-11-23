/**
 * page-version controller
 */

import { factories } from "@strapi/strapi";
import defaultPageSchema from '../../../../defaultPageSchema.json'

export default factories.createCoreController(
  "api::page-version.page-version",
  ({ strapi }) => ({
    /**
     * 权限：平台管理员或者项目组成员
     * 结果：当前page最新的schema，如果传入version则取制定版本的，都没有则返回 {id:0,schema:初始schema}
     */
    async findLatestVersion(ctx) {
      try {
        const { navUuid } = ctx.request.query;
        const { results } = (await strapi
          .service("api::page-version.page-version")
          .find({
            pagination: {
              page: 1,
              pageSize: 1,
            },
            populate: {
              route: true,
              operator: {
                fields: ["username"],
              },
            },
            sort: "id:desc",
            filters: {
              route: {
                navUuid: {
                  $eq: navUuid,
                },
              },
            },
          })) as any;
        if (results[0]) {
          const { id, description, createdAt, schema, operator } = results[0];
          return {
            data: {
              id,
              description,
              createdAt,
              schema,
              operator,
            },
          };
        } else {
          // 默认
          return {
            data: defaultPageSchema,
          };
        }
      } catch (error) {
        console.log(error);
        return ctx.throw("发生错误");
      }
    },
    /**
     * 权限：该应用成员
     */
    async create(ctx) {
      const {
        navUuid,
        schema,
        description,
        baseVersion,
        currentVersion,
        force,
      } = ctx.request.body;

      const {
        selfGlobalState: { userId, isPlatformAdmin },
      } = ctx.state;

      if (!schema || !navUuid) {
        return ctx.badRequest("参数错误");
      }

      try {
        const { results: projectRouteResult } = (await strapi
          .service("api::project-route.project-route")
          .find({
            pagination: false,
            populate: {
              project: true,
            },
            filters: {
              navUuid: {
                $eq: navUuid,
              },
            },
          })) as any;

        if (projectRouteResult[0]) {
          if (!isPlatformAdmin) {
            // 需要是该项目成员
            const count = await strapi.db
              .query("api::project-user-role.project-user-role")
              .count({
                where: {
                  project: {
                    id: projectRouteResult[0].project.id,
                  },
                  user: {
                    id: userId,
                  },
                },
              });
            if (count === 0) {
              return ctx.forbidden();
            }
          }
          const { results: pageVersionResults } = (await strapi
            .service("api::page-version.page-version")
            .find({
              pagination: {
                page: 1,
                pageSize: 1,
              },
              populate: {
                route: false,
                operator: false,
              },
              sort: "id:desc",
              filters: {
                route: {
                  navUuid: {
                    $eq: navUuid,
                  },
                },
              },
            })) as any;
          if (currentVersion && !force) {
            // 需要判断提交的版本是否是当前最新版本，不是的话可能存在多人编辑，需要提醒版本覆盖
            if (
              pageVersionResults[0] &&
              pageVersionResults[0].id > currentVersion
            ) {
              return {
                data: {
                  success: false,
                  code: 19601,
                  message:
                    "云端版本有更新，请确认是否存在多人编辑，防止覆盖",
                },
              };
            }
          }

          const createResult = await strapi
            .service("api::page-version.page-version")
            .create({
              data: {
                route: {
                  id: projectRouteResult[0].id,
                },
                schema,
                description,
                operator: {
                  id: userId,
                },
                baseVersion: baseVersion || pageVersionResults[0]?.id,
              },
            });

          return {
            data: {
              success: true,
              version: {
                id: createResult.id,
                description: createResult.description,
                createdAt: createResult.createdAt,
              },
            },
          };
        } else {
          return ctx.badRequest("参数错误");
        }
      } catch (error) {
        console.log(error);
        return ctx.throw("发生错误");
      }
    },
    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        const { navUuid } = ctx.request.query;
        if (!navUuid) {
          return ctx.badRequest("参数错误");
        }
        const result = (await strapi
          .service("api::page-version.page-version")
          .findOne(id, {
            where: {
              route: {
                navUuid,
              },
            },
            populate: {
              route: true,
              operator: false,
            },
          })) as any;
        if (result) {
          const { id, description, createdAt, schema, operator } = result;
          return {
            data: {
              id,
              description,
              createdAt,
              schema,
              operator,
            },
          };
        } else {
          return ctx.notFound();
        }
      } catch (error) {
        console.log(error);
        return ctx.throw("发生错误");
      }
    },
    async find(ctx) {
      try {
        const { navUuid, pagination } = ctx.request.query;

        const { results, pagination: paginationResult } = (await strapi
          .service("api::page-version.page-version")
          .find({
            pagination,
            populate: {
              route: false,
              baseVersion: {
                fields: ["id"],
              },
              operator: {
                fields: ["username"],
              },
            },
            sort: "id:desc",
            filters: {
              route: {
                navUuid: {
                  $eq: navUuid,
                },
              },
            },
          })) as any;
        return {
          data: results.map((item) => {
            const {
              id,
              description,
              createdAt,
              schema,
              operator,
              baseVersion,
            } = item;
            return {
              id,
              description,
              createdAt,
              schema,
              operator,
              baseVersion,
            };
          }),
          meta: {
            pagination: paginationResult,
          },
        };
      } catch (error) {
        console.log(error);
        return ctx.throw("发生错误");
      }
    },
  })
);
