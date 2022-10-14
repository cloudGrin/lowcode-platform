"use strict";
/**
 * project router
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreRouter("api::project.project", {
    only: ["find", "findOne", "create", "update", "delete"],
    config: {
        create: {
            middlewares: ["api::project.project-role"],
            // policies: ["is-can-create"],
            policies: ["is-auth"],
        },
        delete: {
            middlewares: ["api::project.project-role"],
            // policies: ["is-can-delete"],
            policies: ["is-auth"],
        },
        update: {
            middlewares: ["api::project.project-role"],
            // policies: ["is-can-findone-update"],
            policies: ["is-auth"],
        },
        find: {
            middlewares: ["api::project.project-role"],
        },
        findOne: {
            middlewares: ["api::project.project-role"],
            // policies: ["is-can-findone-update"],
            policies: ["is-auth"],
        },
    },
});
