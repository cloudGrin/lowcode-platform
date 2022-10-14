"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (config, { strapi }) => {
    return async (context, next) => {
        const { user: { username = undefined, id: userId = undefined, role: { name: roleName = undefined } = {}, } = {}, } = context.state;
        const isSuperAdmin = roleName === "SuperAdmin";
        const isAdmin = roleName === "Admin";
        context.state.selfGlobalState = {
            isGetUser: !!userId,
            isSuperAdmin,
            isAdmin,
            username: username,
            userId,
        };
        await next();
    };
};
