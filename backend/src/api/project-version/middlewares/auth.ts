export default (config, { strapi }) => {
  return async (context, next) => {
    const {
      state: {
        selfGlobalState: { isPlatformAdmin, userId },
      },
      routerPath,
      request: {
        method,
        query: { projectId },
        body: { projectId: bodyProjectId },
      },
    } = context;
    // 平台管理员无视规则
    if (!isPlatformAdmin) {
      // 发布新版本
      if (
        routerPath === "/api/project-versions" &&
        "POST" === method &&
        (await isProjectBelongsToUser({
          strapi,
          projectId: bodyProjectId,
          userId,
          isNeedProjectMaster: true,
        }))
      ) {
        await next();
        return;
      }
      // 查找版本
      else if (
        routerPath === "/api/project-versions" &&
        "GET" === method &&
        (await isProjectBelongsToUser({
          strapi,
          projectId: projectId,
          userId
        }))
      ) {
        await next();
        return;
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
