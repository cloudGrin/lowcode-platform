

export default {
  routes: [
    {
      // Path defined with an URL parameter
      method: "GET",
      path: "/projects/:id/users",
      handler: "project.findUserAndRoleById",
      config: {
        middlewares: ["api::project.project-role"],
      },
    },
    {
      // Path defined with an URL parameter
      method: "PUT",
      path: "/projects/:id/setMembers",
      handler: "project.setMembers",
      config: {
        middlewares: ["api::project.project-role", "api::project.auth"],
      },
    },
    {
      // Path defined with an URL parameter
      method: "GET",
      path: "/projects/appId/:appId",
      handler: "project.findByAppId",
      config: {
        auth: false
      },
    },
  ],
};
