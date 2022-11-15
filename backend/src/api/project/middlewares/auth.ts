export default (config, { strapi }) => {
  return async (context, next) => {
    const {
      state: {
        selfGlobalState: { isPlatformAdmin, isApplicationAdmin, userId },
      },
      params: { id: projectId, appId },
      routerPath,
      request: { method },
    } = context;

    if (!isPlatformAdmin) {
      // 应用管理员可以新增
      if (
        routerPath === "/api/projects" &&
        method === "POST" &&
        isApplicationAdmin
      ) {
        await next();
        return;
      }
      // 应用管理员且是该应用的管理员才可以删除
      else if (
        routerPath === "/api/projects/:id" &&
        method === "DELETE" &&
        isApplicationAdmin &&
        (await isProjectBelongsToUser({
          strapi,
          projectId,
          userId,
          isNeedProjectMaster: true,
        }))
      ) {
        await next();
        return;
      }
      // 查询单个
      else if (
        routerPath === "/api/projects/:id" &&
        "GET" === method &&
        (await isProjectBelongsToUser({ strapi, projectId, userId }))
      ) {
        await next();
        return;
      }
      // 编辑
      else if (
        routerPath === "/api/projects/:id" &&
        "PUT" === method &&
        (await isProjectBelongsToUser({
          strapi,
          projectId,
          userId,
          isNeedProjectMaster: true,
        }))
      ) {
        await next();
        return;
      }
      // 设置成员
      else if (
        routerPath === "/api/projects/:id/setMembers" &&
        "PUT" === method &&
        (await isProjectBelongsToUser({
          strapi,
          projectId,
          userId,
          isNeedProjectMaster: true,
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
