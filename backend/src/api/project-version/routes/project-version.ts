/**
 * project-version router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::project-version.project-version",
  {
    only: ["find", "create"],
    config: {
      create: {
        middlewares: ["api::project.project-role", "api::project-version.auth"],
      },
      find: {
        middlewares: ["api::project.project-role", "api::project-version.auth"],
      },
    },
  }
);
