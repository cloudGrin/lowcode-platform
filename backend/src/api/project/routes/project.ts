/**
 * project router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::project.project", {
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
