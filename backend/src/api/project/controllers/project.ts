/**
 * project controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::project.project",
  ({ strapi }) => ({
    async find(ctx) {
      const { userId, isSuperAdmin } = ctx.state.selfGlobalState;
      const { results = [], pagination } = (await strapi
        .service("api::project.project")
        .find({
          pagination: ctx.query.pagination,
          populate: {
            users: true,
          },
          sort: "updatedAt:desc",
          filters: isSuperAdmin // 超级管理员能看到所有的项目
            ? {}
            : {
                users: {
                  id: {
                    $eq: userId,
                  },
                },
              },
        })) as any;

      return {
        data: results.map(({ id, ...rest }) => ({
          id,
          attributes: rest,
        })),
        meta: {
          pagination,
        },
      };
    },
  })
);
