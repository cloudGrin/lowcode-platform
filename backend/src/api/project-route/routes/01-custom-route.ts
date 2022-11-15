export default {
  routes: [
    {
      // Path defined with an URL parameter
      method: "DELETE",
      path: "/project-routes/:navUuid",
      handler: "project-route.deleteNav",
      config: {
        middlewares: ["api::project.project-role", "api::project-route.auth"],
      },
    },
    {
      // Path defined with an URL parameter
      method: "POST",
      path: "/project-routes/updateOrder",
      handler: "project-route.updateOrder",
      config: {
        middlewares: ["api::project.project-role", "api::project-route.auth"],
      },
    },
  ],
};
