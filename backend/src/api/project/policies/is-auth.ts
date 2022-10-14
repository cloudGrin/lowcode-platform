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
  const isSuperAdmin = roleName === "SuperAdmin";
  if (isSuperAdmin) {
    // 超级管理员
    return true;
  }

  const isAdmin = roleName === "Admin";
  if (routerPath === "/api/projects" && method === "POST" && isAdmin) {
    // 新增
    return true;
  } else if (
    routerPath === "/api/projects/:id" &&
    method === "DELETE" &&
    isAdmin &&
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
  const entry = await strapi.service("api::project.project").find({
    populate: {
      users: true,
    },
    filters: {
      id: dataId,
      users: {
        id: {
          $eq: userId,
        },
      },
    },
  });
  if (entry.pagination.total > 0) {
    // 查询不到说明管理员不属于这个项目
    return true;
  }
  return false;
}
