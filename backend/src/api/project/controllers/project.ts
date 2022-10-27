/**
 * project controller
 */

import { factories } from "@strapi/strapi";

function formatProjectUserRoleResult(results) {
  return Object.values(
    results.reduce(
      (
        projects,
        {
          projectRole: { id: roleId, name: roleName } = {} as any,
          project: { id, name: projectName, createdAt, updatedAt, description },
          user: { id: userId, username },
        }
      ) => {
        if (projects[id]) {
          projects[id].attributes.users.push({
            id: userId,
            username,
            projectRole: {
              id: roleId,
              name: roleName,
            },
          });
        } else {
          projects[id] = {
            id,
            attributes: {
              name: projectName,
              description,
              createdAt,
              updatedAt,
              users: [
                {
                  id: userId,
                  username,
                  projectRole: {
                    id: roleId,
                    name: roleName,
                  },
                },
              ],
            },
          };
        }
        return projects;
      },
      {}
    )
  );
}

export default factories.createCoreController(
  "api::project.project",
  ({ strapi }) => ({
    // TODO 排序
    async find(ctx) {
      const { userId, isSuperAdmin } = ctx.state.selfGlobalState;
      if (!isSuperAdmin) {
        const { results: projectUserRoleResults = [], pagination } =
          (await strapi
            .service("api::project-user-role.project-user-role")
            .find({
              pagination: ctx.query.pagination,
              populate: {
                user: true,
                project: true,
              },
              // sort: "updatedAt:desc",
              filters: {
                user: {
                  id: {
                    $eq: userId,
                  },
                },
              },
            })) as any;
        const projectIds = [
          ...new Set(projectUserRoleResults.map(({ project: { id } }) => id)),
        ];
        const { results = [] } = (await strapi
          .service("api::project-user-role.project-user-role")
          .find({
            pagination: false,
            populate: {
              user: true,
              project: true,
              projectRole: true,
            },
            // sort: "updatedAt:desc",
            filters: {
              project: {
                id: {
                  $in: projectIds,
                },
              },
            },
          })) as any;
        return {
          data: formatProjectUserRoleResult(results),
          meta: {
            pagination,
          },
        };
      } else {
        const { results: projects = [], pagination } = (await strapi
          .service("api::project.project")
          .find({
            pagination: ctx.query.pagination,
            // sort: "updatedAt:desc",
          })) as any;
        const projectIds = projects.map((i) => i.id);
        const { results = [] } = (await strapi
          .service("api::project-user-role.project-user-role")
          .find({
            pagination: false,
            populate: {
              user: true,
              project: true,
              projectRole: true,
            },
            // sort: "updatedAt:desc",
            filters: {
              project: {
                id: {
                  $in: projectIds,
                },
              },
            },
          })) as any;
        return {
          data: formatProjectUserRoleResult(results),
          meta: {
            pagination,
          },
        };
      }
    },
  })
);
