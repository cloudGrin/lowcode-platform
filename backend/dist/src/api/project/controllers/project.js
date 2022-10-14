"use strict";
/**
 * project controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController("api::project.project", ({ strapi }) => ({
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
        }));
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
}));
