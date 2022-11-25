/**
 * project-route router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::project-route.project-route", {
  only: ["find", "create", "update"],
  config: {
    create: {
      middlewares: ["api::project.project-role", "api::project-route.auth"],
    },
    update: {
      middlewares: ["api::project.project-role", "api::project-route.auth"],
    },
    find: {
      auth: false,
    },
  },
});
