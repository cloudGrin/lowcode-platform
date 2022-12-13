export default (config, { strapi }) => {
  return async (context, next) => {
    const {
      state: {
        selfGlobalState: { isPlatformAdmin, userId },
      },
      routerPath,
      request: {
        method,
        query: { navUuid },
      },
    } = context;
    // 平台管理员无视规则
    if (!isPlatformAdmin) {
      // 查找最新版本
      // 该应用成员才可以查
      if (
        ["/api/page-versions/latest", "/api/page-versions"].includes(
          routerPath
        ) &&
        "GET" === method
      ) {
        if (!navUuid) {
          return context.badRequest("参数错误");
        }
        const projectRoute = await strapi.db
          .query("api::project-route.project-route")
          .findOne({
            populate: ["project"],
            where: { navUuid },
          });
        if (projectRoute) {
          if (
            await isProjectBelongsToUser({
              strapi,
              projectId: projectRoute.project.id,
              userId,
            })
          ) {
            await next();
            return;
          }
        }
      }

      context.status = 403;
      context.body = {
        data: null,
        error: {
          status: 403,
          message: "无权限",
        },
      };
      return;
    }
    // 平台管理员和超管可以不受限制的增删改查
    await next();
  };
};

async function isProjectBelongsToUser({
  strapi,
  userId,
  isNeedProjectMaster = false,
  projectId = "",
  appId = "",
}) {
  let projectIdCopy = projectId;
  if (appId) {
    const project = await strapi.db.query("api::project.project").findOne({
      where: { appId },
    });
    if (project && project.id) {
      projectIdCopy = project.id;
    }
  }
  if (projectIdCopy) {
    const count = await strapi.db
      .query("api::project-user-role.project-user-role")
      .count({
        where: {
          project: {
            id: projectIdCopy,
          },
          user: {
            id: userId,
          },
          ...(isNeedProjectMaster
            ? {
                projectRole: {
                  name: "master",
                },
              }
            : {}),
        },
      });

    return count > 0;
  } else {
    return false;
  }
}
