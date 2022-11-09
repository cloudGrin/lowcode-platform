import { factories } from "@strapi/strapi";

export default {
  routes: [
    {
      // Path defined with an URL parameter
      method: "GET",
      path: "/projects/appId/:appId",
      handler: "project.findByAppId",
      config: {
        middlewares: ["api::project.auth", "api::project.project-role"],
      },
    },
  ],
};
