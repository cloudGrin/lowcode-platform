export default [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      headers: ["Cache-Control", "Content-Type", "Authorization"],
      origin: "*",
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
