/**
 * project router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::project.project", {
  only: [
    "find",
    "findOne",
    "create",
    "update",
    "delete",
  ],
  config: {
    create: {
      // auth: false,
      middlewares: ["api::project.project-role", "api::project.auth"],
    },
    delete: {
      middlewares: ["api::project.project-role", "api::project.auth"],
    },
    update: {
      middlewares: ["api::project.project-role", "api::project.auth"],
    },
    find: {
      middlewares: ["api::project.project-role"],
    },
    findOne: {
      auth: false
    },
  },
});
