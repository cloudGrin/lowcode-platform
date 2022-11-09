export default (config, { strapi }) => {
  return async (context, next) => {
    const {
      state: {
        user: {
          id: userId,
          role: { name: roleName },
        },
      },
      params: { id: projectId, appId },
      routerPath,
      req: { method },
    } = context;
    const isPlatformAdmin = ["SuperAdmin", "PlatformAdmin"].includes(roleName);
    if (!isPlatformAdmin) {
      const isApplicationAdmin = roleName === "ApplicationAdmin";
      if (
        // 应用管理员可以新增
        !(
          routerPath === "/api/projects" &&
          method === "POST" &&
          isApplicationAdmin
        ) ||
        // 应用管理员且是该应用的管理员才可以删除
        !(
          routerPath === "/api/projects/:id" &&
          method === "DELETE" &&
          isApplicationAdmin &&
          (await isProjectBelongsToUser({
            strapi,
            projectId,
            userId,
            isNeedProjectMaster: true,
          }))
        ) ||
        // 查询单个
        !(
          routerPath === "/api/projects/:id" &&
          "GET" === method &&
          (await isProjectBelongsToUser({ strapi, projectId, userId }))
        ) ||
        // 编辑
        !(
          routerPath === "/api/projects/:id" &&
          "PUT" === method &&
          (await isProjectBelongsToUser({
            strapi,
            projectId,
            userId,
            isNeedProjectMaster: true,
          }))
        ) ||
        // 通过appId查询
        !(
          routerPath === "/api/projects/appId/:appId" &&
          ["GET"].includes(method) &&
          (await isProjectBelongsToUser({ strapi, appId, userId }))
        )
      ) {
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
