export default (config, { strapi }) => {
  return async (context, next) => {
    const {
      state: {
        selfGlobalState: { isPlatformAdmin, isApplicationAdmin, userId },
      },
      params: { id, navUuid },
      routerPath,
      request: {
        method,
        body: { projectId: bodyProjectId, currentId },
      },
    } = context;
    // 平台管理员无视规则
    if (!isPlatformAdmin) {
      // 查询 (无权限)
      if (routerPath === "/api/project-routes" && "GET" === method) {
        await next();
        return;
      }
      // 更新（改名字）
      else if (routerPath === "/api/project-routes/:id" && "PUT" === method) {
        const projectRoute = await strapi.db
          .query("api::project-route.project-route")
          .findOne({
            populate: ["project"],
            where: { id },
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
      // 删除
      else if (
        routerPath === "/api/project-routes/:navUuid" &&
        "DELETE" === method
      ) {
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
      // 新增
      else if (
        routerPath === "/api/project-routes" &&
        "POST" === method &&
        !!bodyProjectId &&
        (await isProjectBelongsToUser({
          strapi,
          projectId: bodyProjectId,
          userId,
        }))
      ) {
        await next();
        return;
      }
      // 改变顺序
      else if (
        routerPath === "/api/project-routes/updateOrder" &&
        "POST" === method &&
        !!currentId
      ) {
        const projectRoute = await strapi.db
          .query("api::project-route.project-route")
          .findOne({
            populate: ["project"],
            where: { id: currentId },
          });
        if (projectRoute) {
          if (
            await isProjectBelongsToUser({
              strapi,
              projectId: projectRoute.project.id,
              userId,
            })
          ) {
            context.state.projectId = projectRoute.project.id;
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
