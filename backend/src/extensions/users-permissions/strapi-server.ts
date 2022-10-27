const { getService } = require("@strapi/plugin-users-permissions/server/utils");

async function getUserInfoAndRole(userId) {
  let data = await getService("user").fetch(userId, {
    populate: ["role"],
  });
  const {
    username,
    email,
    role: { name: roleName, description: roleDesc },
  } = data;

  return {
    id: userId,
    username,
    email,
    /**
     * 增加辅助字段，把权限判断逻辑收缩到服务端
     */
    isSuperAdmin: roleName === "SuperAdmin",
    isAdmin: roleName === "Admin",
    canCreateProject: ["SuperAdmin", "Admin"].includes(roleName),
  };
}

async function handlerJwtUser(ctx, next) {
  await next();
  const userInfo = await getUserInfoAndRole(ctx.body.user.id);
  ctx.body = {
    jwt: ctx.body.jwt,
    user: userInfo,
  };
}

async function handlerUser(ctx, next) {
  await next();
  const userInfo = await getUserInfoAndRole(ctx.body.id);
  ctx.body = userInfo
}



module.exports = (plugin) => {

  ["/auth/local/register", "/auth/local"].forEach((path) => {
    plugin.routes["content-api"].routes
      .find((i) => i.path === path)
      .config.middlewares.push(handlerJwtUser);
  });

  ['/users/me'].forEach((path) => {
    plugin.routes["content-api"].routes
      .find((i) => i.path === path)
      .config.middlewares = [handlerUser];
  });

  return plugin;
};
