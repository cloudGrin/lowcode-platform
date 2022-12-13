/**
 * page-version router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::page-version.page-version", {
  only: ["create", "findOne", "find"],
  config: {
    create: {
      middlewares: ["api::project.project-role"],
    },
    find: {
      middlewares: ["api::project.project-role","api::page-version.auth"],
    },
    findOne: {
      auth: false,
    },
  },
});
