/**
 * project router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::project.project", {
  only: ["find", "findOne", "create", "update", "delete"],
  config: {
    create: {
      middlewares: ["api::project.auth", "api::project.project-role"],
    },
    delete: {
      middlewares: ["api::project.auth", "api::project.project-role"],
    },
    update: {
      middlewares: ["api::project.auth", "api::project.project-role"],
    },
    find: {
      middlewares: ["api::project.auth", "api::project.project-role"],
    },
    findOne: {
      middlewares: ["api::project.auth", "api::project.project-role"],
    },
  },
});
