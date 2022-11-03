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
    isPlatformAdmin: ["SuperAdmin", "PlatformAdmin"].includes(roleName),
    isApplicationAdmin: [
      "SuperAdmin",
      "PlatformAdmin",
      "ApplicationAdmin",
    ].includes(roleName),
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
  ctx.body = userInfo;
}

module.exports = (plugin) => {
  ["/auth/local/register", "/auth/local"].forEach((path) => {
    plugin.routes["content-api"].routes
      .find((i) => i.path === path)
      .config.middlewares.push(handlerJwtUser);
  });

  ["/users/me"].forEach((path) => {
    plugin.routes["content-api"].routes.find(
      (i) => i.path === path
    ).config.middlewares = [handlerUser];
  });

  plugin.controllers.user.findApplicationAdmin = async (ctx) => {
    let result = await getService("user").fetchAll({
      populate: ["role"],
      filters: {
        role: {
          name: ["SuperAdmin", "PlatformAdmin", "ApplicationAdmin"],
        },
      },
    });

    ctx.send({
      data: result.map(({ id, username, role: { name: roleName } }) => ({
        id,
        username,
        isPlatformAdmin: ["SuperAdmin", "PlatformAdmin"].includes(roleName),
      })),
    });
  };

  plugin.controllers.user.findPlatformAdmin = async (ctx) => {
    let result = await getService("user").fetchAll({
      populate: ["role"],
      filters: {
        role: {
          name: ["SuperAdmin", "PlatformAdmin"],
        },
      },
    });

    ctx.send({
      data: result.map(({ id, username, role: { name: roleName } }) => ({
        id,
        username,
        isSuperAdmin: "SuperAdmin" === roleName,
      })),
    });
  };

  plugin.controllers.user.findUsersForApplicationAdmin = async (ctx) => {
    let result = await getService("user").fetchAll({
      filters: {
        role: {
          name: {
            $notIn: ["SuperAdmin", "PlatformAdmin", "ApplicationAdmin"],
          },
        },
      },
    });

    ctx.send({
      data: result.map(({ id, username, email }) => ({
        id,
        username,
        email,
      })),
    });
  };

  plugin.controllers.user.findUsersForPlatformAdmin = async (ctx) => {
    let result = await getService("user").fetchAll({
      filters: {
        role: {
          name: {
            $notIn: ["SuperAdmin", "PlatformAdmin"],
          },
        },
      },
    });

    ctx.send({
      data: result.map(({ id, username, email }) => ({
        id,
        username,
        email,
      })),
    });
  };

  /**
   * @description 修改用户的平台角色
   */
  plugin.controllers.user.changeUsersRole = async (ctx) => {
    const {
      // 要修改成哪个角色
      toRole,
      userIds,
    } = ctx.request.body as {
      toRole: "Engineer" | "ApplicationAdmin" | "PlatformAdmin";
      userIds: number[];
    };
    // 当前调用接口的用户是什么角色
    const { isSuperAdmin, isPlatformAdmin, isApplicationAdmin } =
      ctx.state.selfGlobalState;
    if (
      ["Engineer", "ApplicationAdmin", "PlatformAdmin"].includes(toRole) &&
      Object.prototype.toString.apply(userIds) === "[object Array]" &&
      userIds.length > 0
    ) {
      if (isPlatformAdmin) {
        let result = await getService("user").count({
          role: {
            name: "SuperAdmin",
          },
          id: userIds,
        });
        if (result === 0) {
          // 被操作用户没有superAdmin
          const roleResult = await getService("role").find();
          const roleNameToId = roleResult.reduce((result, role) => {
            result[role.name] = role.id;
            return result;
          }, {});
          const userIdsCopy = [...userIds];
          async function updateRole(userId) {
            return getService("user").edit(userId, {
              role: {
                id: roleNameToId[toRole],
              },
            });
          }
          try {
            do {
              result = await updateRole(userIdsCopy.shift());
            } while (userIdsCopy.length > 0);
            ctx.send({ success: true });
          } catch (error) {
            debugger;
            ctx.send({ success: false, errorMessage: "发生错误" });
          }
        } else {
          ctx.send({ success: false, errorMessage: "无权限" });
        }
      } else {
        ctx.send({ success: false, errorMessage: "无权限" });
      }
    } else {
      ctx.send({ success: false, errorMessage: "参数错误" });
    }
  };

  // 不能用push，否则会被 /user/:id 捕获
  plugin.routes["content-api"].routes.unshift(
    {
      method: "GET",
      path: "/users/applicationAdmin",
      handler: "user.findApplicationAdmin",
      config: {
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/users/platformAdmin",
      handler: "user.findPlatformAdmin",
      config: {
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/users/forApplicationAdmin",
      handler: "user.findUsersForApplicationAdmin",
      config: {
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/users/forPlatformAdmin",
      handler: "user.findUsersForPlatformAdmin",
      config: {
        prefix: "",
      },
    },
    {
      method: "PUT",
      path: "/users/role",
      handler: "user.changeUsersRole",
      config: {
        prefix: "",
        middlewares: ["api::project.project-role"],
      },
    }
  );

  return plugin;
};
