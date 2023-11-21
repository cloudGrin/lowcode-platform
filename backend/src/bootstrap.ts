const allRole = {
  Engineer: {
    description: "开发者，注册用户的默认身份",
  },
  ApplicationAdmin: {
    description: "应用管理员，具有创建应用的权限，仅可管理自己的应用",
  },
  PlatformAdmin: {
    description: "平台管理员具有管理所有应用的权限",
  },
  SuperAdmin: {
    description: "超级管理员，权限同平台管理员，另外可以管理平台管理员。",
  },
};

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: "",
    type: "type",
    name: "setup",
  });
  const initHasRun = await pluginStore.get({ key: "initHasRun" });
  await pluginStore.set({ key: "initHasRun", value: true });
  return !initHasRun;
}

async function createRole() {
  // 固定顺序，固定主键id
  for (let role in allRole) {
    await createRoleAndPermission({
      name: <keyof typeof allRole>role,
      description: allRole[role].description,
    });
  }
}

async function setPermission() {
  await setCommonAuthRolePermission();
  await setApiPermissions("ApplicationAdmin", {
    project: ["create", "delete", "update"],
  });

  for (let role of ["PlatformAdmin", "SuperAdmin"] as const) {
    await setApiPermissions(role, {
      project: ["create", "delete", "setMembers", "update"],
    });
    await setPluginPermissions(role, {
      "users-permissions": {
        user: [
          "changeUsersRole",
          "findApplicationAdmin",
          "findPlatformAdmin",
          "findUsersForApplicationAdmin",
          "findUsersForPlatformAdmin",
        ],
      },
    });
  }
}

/**
 * 删除默认的 authenticated 角色
 */
async function deleteAuthenticatedRole() {
  await strapi.db.query("plugin::users-permissions.role").delete({
    where: {
      type: "authenticated",
    },
  });
}

/**
 * 设置注册默认角色位 engineer
 */
// async function setRegisterDefaultRoles() {
//   const advanced = await strapi
//     .store({ type: "plugin", name: "users-permissions", key: "advanced" })
//     .get();

//   await strapi
//     .store({ type: "plugin", name: "users-permissions", key: "advanced" })
//     .set({
//       value: {
//         ...advanced,
//         default_role: "engineer",
//       },
//     });
// }

/**
 * 创建项目角色
 */
async function createProjectRole() {
  const allProjectRole = {
    developer: {
      description: "开发者拥有应用开发权限，无应用管理员设置等权限",
    },
    master: {
      description:
        "应用主管理员拥有应用管理后台的全部权限，可进行应用搭建、编辑及设置",
    },
  };
  for (let role in allProjectRole) {
    await strapi.db.query("api::project-role.project-role").create({
      data: {
        name: role,
        description: allProjectRole[role].description,
      },
    });
  }
}

async function importSeedData() {
  await createRole();
  await setPermission();
  await deleteAuthenticatedRole();
  // await setRegisterDefaultRoles();
  await createProjectRole();
}

async function bootStrap() {
  const shouldImportSeedData = await isFirstRun();
  if (shouldImportSeedData) {
    try {
      console.log("Setting up the template...");
      await importSeedData();
      console.log("Ready to go");
    } catch (error) {
      console.log("Could not import seed data");
      console.error(error);
    }
  }
}

/**
 * 创建角色
 */
async function createRoleAndPermission({
  name,
  description,
  permissions = {},
}: {
  name: keyof typeof allRole;
  description: string;
  permissions?: Record<string, any>;
}) {
  await strapi.query("plugin::users-permissions.role").create({
    data: {
      name,
      description,
      permissions,
      users: [],
      type: name.toLowerCase(),
    },
  });
}

async function setApiPermissions(role: keyof typeof allRole, newPermissions) {
  // Find the ID of the role
  const roleData = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        name: role,
      },
    });

  // Create the new permissions and link them to the role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query("plugin::users-permissions.permission").create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: roleData.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

async function setPluginPermissions(
  role: keyof typeof allRole,
  newPermissions
) {
  // Find the ID of the role
  const roleData = await strapi
    .query("plugin::users-permissions.role")
    .findOne({
      where: {
        name: role,
      },
    });

  // Create the new permissions and link them to the role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((plugin) => {
    const groups = newPermissions[plugin];
    Object.keys(groups).map((controller) => {
      const actions = groups[controller];
      const permissionsToCreate = actions.map((action) => {
        return strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: `plugin::${plugin}.${controller}.${action}`,
            role: roleData.id,
          },
        });
      });
      allPermissionsToCreate.push(...permissionsToCreate);
    });
  });
  await Promise.all(allPermissionsToCreate);
}

/**
 * 设置所有登录用户的通用权限
 */
async function setCommonAuthRolePermission() {
  for (let role in allRole) {
    await setApiPermissions(<keyof typeof allRole>role, {
      "page-version": ["create", "findLatestVersion","find"],
      project: ["find", "findUserAndRoleById"],
      "project-route": ["create", "deleteNav", "update", "updateOrder"],
      "project-version": ["create", "find"],
    });
    await setPluginPermissions(<keyof typeof allRole>role, {
      "users-permissions": {
        auth: ["changePassword"],
        role: ["find"],
        user: ["find", "me"],
      },
    });
  }
}

export default bootStrap;
