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
      // 查找最新版本
      // 该应用成员才可以查
      if (
        routerPath === "/api/page-versions/latest" &&
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
