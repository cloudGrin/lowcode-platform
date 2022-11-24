export default {
  routes: [
    {
      // Path defined with an URL parameter
      method: "GET",
      path: "/page-versions/latest",
      handler: "page-version.findLatestVersion",
      config: {
        auth: false,
      },
    },
  ],
};
