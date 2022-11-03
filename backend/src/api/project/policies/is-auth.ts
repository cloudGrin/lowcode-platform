export default async (policyContext, config, { strapi }) => {
  const {
    state: {
      user: {
        id: userId,
        role: { name: roleName },
      },
    },
    params: { id: dataId },
    routerPath,
    req: { method },
  } = policyContext;
  const isPlatformAdmin = ["SuperAdmin", "PlatformAdmin"].includes(
    roleName
  );
  if (isPlatformAdmin) {
    // 平台管理员和超管可以增删改
    return true;
  }

  const isApplicationAdmin = roleName === "ApplicationAdmin";
  // 应用管理员可以新增
  if (routerPath === "/api/projects" && method === "POST" && isApplicationAdmin) {
    // 新增
    return true;
  } 
  // 应用管理员且是该应用的管理员才可以删除
  else if (
    routerPath === "/api/projects/:id" &&
    method === "DELETE" &&
    isApplicationAdmin &&
    (await isProjectBelongsToUser(strapi, dataId, userId))
  ) {
    // 删除
    return true;
  } else if (
    routerPath === "/api/projects/:id" &&
    ["PUT", "GET"].includes(method) &&
    (await isProjectBelongsToUser(strapi, dataId, userId))
  ) {
    // 编辑 or 查询单个
    return true;
  }
  return false;
};

async function isProjectBelongsToUser(strapi, dataId, userId) {
  const count = await strapi.db
    .query("api::project-user-role.project-user-role")
    .count({
      where: {
        project: {
          id: dataId,
        },
        user: {
          id: userId,
        },
        projectRole: {
          name: "master",
        },
      },
    });

  return count > 0;
}
