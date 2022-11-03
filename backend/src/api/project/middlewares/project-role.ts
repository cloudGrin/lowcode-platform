export default (config, { strapi }) => {
  return async (context, next) => {
    const {
      user: {
        username = undefined,
        id: userId = undefined,
        role: { name: roleName = undefined } = {},
      } = {},
    } = context.state;
    const isSuperAdmin = roleName === "SuperAdmin";
    const isPlatformAdmin = ["SuperAdmin", "PlatformAdmin"].includes(
      roleName
    );
    const isApplicationAdmin = ["SuperAdmin", "PlatformAdmin","ApplicationAdmin"].includes(
      roleName
    );
    context.state.selfGlobalState = {
      isGetUser: !!userId,
      isSuperAdmin,
      isPlatformAdmin,
      isApplicationAdmin,
      username: username,
      userId,
    };
    await next();
  };
};
