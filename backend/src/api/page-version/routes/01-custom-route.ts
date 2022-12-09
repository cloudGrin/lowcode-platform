export default {
  routes: [
    {
      // Path defined with an URL parameter
      method: "GET",
      path: "/page-versions/latest",
      handler: "page-version.findLatestVersion",
      config: {
        middlewares: ["api::project.project-role", "api::page-version.auth"],
      },
    },
  ],
};
