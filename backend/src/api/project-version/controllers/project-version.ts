/**
 * project-version controller
 */

import { factories } from "@strapi/strapi";
import semver from "semver";

export default factories.createCoreController(
  "api::project-version.project-version",
  ({ strapi }) => ({
    async find(ctx) {
      const { projectId } = ctx.request.query;
      try {
        const { results, pagination } = (await strapi
          .service("api::project-version.project-version")
          .find({
            pagination: ctx.query.pagination,
            populate: {
              project: false,
            },
            sort: {
              updatedAt: "desc",
            },
            filters: {
              project: {
                id: {
                  $eq: projectId,
                },
              },
            },
          })) as any;

        return {
          data: results,
          meta: {
            pagination,
          },
        };
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },
    /**
     * 权限：该应用主管理员
     */
    async create(ctx) {
      const { projectId, version, description } = ctx.request.body;
      const {
        selfGlobalState: { userId },
      } = ctx.state;

      if (!description || semver.valid(version) === null) {
        ctx.status = 400;
        ctx.body = {
          data: null,
          error: {
            status: 400,
            message: "参数错误",
          },
        };
        return;
      }
      try {
        const { data: projectRouteResult } = (await strapi
          .controller("api::project-route.project-route")
          .find({
            ...ctx,
            request: {
              ...ctx.request,
              query: {
                ...ctx.request.query,
                projectId,
              },
            },
          })) as any;
        await strapi.service("api::project-version.project-version").create({
          data: {
            project: {
              id: projectId,
            },
            version,
            description,
            navList: projectRouteResult,
            operator: {
              id: userId,
            },
          },
        });

        return {};
      } catch (error) {
        console.log(error);
        ctx.status = 500;
        ctx.body = {
          data: null,
          error: {
            status: 500,
            message: "发生错误",
          },
        };
      }
    },
  })
);
