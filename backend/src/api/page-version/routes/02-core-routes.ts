/**
 * page-version router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::page-version.page-version", {
  only: ['create'],
  config: {
    create: {
      middlewares: ["api::project.project-role"],
    },
  },
});
