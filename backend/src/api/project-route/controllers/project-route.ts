/**
 * project-route controller
 */

import { factories } from "@strapi/strapi";

const rootNavId = "NAV-SYSTEM-PARENT-UUID";
const groupTypeName = "NAV";

import { v4 as uuidv4 } from "uuid";
import { set as lodashSet, get as lodashGet } from "lodash";
export default factories.createCoreController(
  "api::project-route.project-route",
  ({ strapi }) => ({
    async find(ctx) {
      const { projectId } = ctx.request.query;
      try {
        const { results: projectRouteResult = [] } = (await strapi
          .service("api::project-route.project-route")
          .find({
            pagination: false,
            populate: {
              project: false,
              versions: false,
            },
            sort: {
              listOrder: "desc",
            },
            filters: {
              project: {
                id: {
                  $eq: projectId,
                },
              },
              status: "ONLINE",
            },
          })) as any;

        for (let route of projectRouteResult) {
          if (route.type === "PAGE") {
            const { results: pageVersionResult = [] } = (await strapi
              .service("api::page-version.page-version")
              .find({
                fields: ["id", "createdAt"],
                pagination: {
                  page: 1,
                  pageSize: 1,
                },
                populate: {
                  route: true,
                },
                sort: {
                  id: "desc",
                },
                filters: {
                  route: {
                    id: {
                      $eq: route.id,
                    },
                  },
                },
              })) as any;
            pageVersionResult.forEach((version) => {
              projectRouteResult.find(
                (route) => route.id === version.route.id
              )!.version = {
                id: version.id,
                createdAt: version.createdAt,
              };
            });
          }
        }

        const { listHaveOrder } = formatProjectRouteResult(projectRouteResult);

        return {
          data: {
            rootId: rootNavId,
            items: generateNavList(listHaveOrder),
          },
        };
      } catch (error) {
        console.log(error);
        return ctx.throw("????????????");
      }
    },
    async findByUuid(ctx) {
      const { navUuid } = ctx.request.query;
      try {
        const { results: projectRouteResult } = (await strapi
          .service("api::project-route.project-route")
          .find({
            pagination: false,
            populate: {
              project: false,
              versions: false,
            },
            filters: {
              navUuid: {
                $eq: navUuid,
              },
            },
          })) as any;

        if (!projectRouteResult[0]) {
          return ctx.notFound();
        }

        return {
          data: projectRouteResult[0],
        };
      } catch (error) {
        console.log(error);
        return ctx.throw("????????????");
      }
    },
    /**
     * ??????????????????????????????listOrder????????????tree??????
     */
    async deleteNav(ctx) {
      const { navUuid } = ctx.request.query;
      try {
        const count = (await strapi.db
          .query("api::project-route.project-route")
          .count({
            where: {
              parentNavUuid: navUuid,
            },
          })) as any;
        if (count > 0) {
          return {
            data: {
              success: false,
              message: "????????????????????????????????????????????????????????????",
            },
          };
        } else {
          await strapi.db.query("api::project-route.project-route").update({
            where: {
              navUuid,
            },
            data: {
              status: "DELETE",
            },
          });
          return {
            data: {
              success: true,
            },
          };
        }
      } catch (error) {
        console.log(error);
        return ctx.throw("????????????");
      }
    },
    /**
     * ???????????????????????????parentNavUuid????????????nav???listOrder????????????????????????nav????????????listOrder??????????????????
     * ????????????????????????listOrder????????????tree??????
     */
    async create(ctx) {
      const { title, type, url, parentNavUuid, projectId } = ctx.request.body;
      // ????????????
      if (!title || (type === "LINK" && !url)) {
        return ctx.badRequest("????????????");
      }
      try {
        const { results = [] } = (await strapi
          .service("api::project-route.project-route")
          .find({
            pagination: false,
            populate: {
              project: false,
            },
            sort: {
              listOrder: "desc",
            },
            filters: {
              project: {
                id: {
                  $eq: projectId,
                },
              },
              status: "ONLINE",
            },
          })) as any;

        if (parentNavUuid) {
          let parentNav = results.find((nav) => {
            return nav.navUuid === parentNavUuid;
          });
          if (parentNav && parentNav.type !== groupTypeName) {
            return ctx.badRequest("???????????????????????????");
          }
        }

        const createProjectRouteRes = (await strapi
          .service("api::project-route.project-route")
          .create({
            data: {
              title,
              type,
              navUuid: `${type}_${uuidv4().replace("-", "_")}`,
              parentNavUuid: parentNavUuid || "NAV-SYSTEM-PARENT-UUID",
              url: type === "LINK" ? url : null,
              listOrder: (results[0]?.listOrder ?? -1) + 1,
              project: {
                id: projectId,
              },
              status: "ONLINE",
            },
          })) as any;
        return {
          data: createProjectRouteRes,
        };
      } catch (error) {
        console.log(error);
        return ctx.throw("????????????");
      }
    },
    /**
     *
     */
    async updateOrder(ctx) {
      const { currentId, parentNavUuid, ids } = ctx.request.body;
      let projectId = ctx.state.projectId;
      try {
        // ???????????????????????????middlewares??????????????????projectId
        if (!projectId) {
          const projectRoute = await strapi.db
            .query("api::project-route.project-route")
            .findOne({
              populate: ["project"],
              where: { id: currentId },
            });
          projectId = projectRoute.project.id;
        }
        let { results: projectRouteResult = [] } = (await strapi
          .service("api::project-route.project-route")
          .find({
            pagination: false,
            populate: {
              project: false,
            },
            sort: {
              listOrder: "desc",
            },
            filters: {
              project: {
                id: {
                  $eq: projectId,
                },
              },
              status: "ONLINE",
            },
          })) as any;
        // ????????????
        if (ids.length !== projectRouteResult.length) {
          return ctx.badRequest("????????????????????????????????????????????????");
        }
        let parentNav = projectRouteResult.find((nav) => {
          return nav.navUuid === parentNavUuid;
        });
        // targetParent??????????????????
        if (parentNav && parentNav.type !== groupTypeName) {
          return ctx.badRequest("???????????????????????????");
        }

        const preIds = getNavListOrder(
          formatProjectRouteResult(projectRouteResult).listHaveOrder[0].children
        );

        const pendingUpdateOrderIds = {};

        for (let i = 0; i < preIds.length; i++) {
          const index = ids.indexOf(preIds[i]);
          if (index === -1) {
            return ctx.badRequest("????????????????????????????????????????????????");
          } else if (index !== i) {
            pendingUpdateOrderIds[preIds[i]] = index;
          }
        }
        if (pendingUpdateOrderIds[currentId] === undefined) {
          // ???????????????nav???????????????
          pendingUpdateOrderIds[currentId] = preIds.indexOf(currentId);
        }
        for (let [id, order] of Object.entries(pendingUpdateOrderIds)) {
          await strapi.service("api::project-route.project-route").update(id, {
            data: {
              listOrder: order,
              ...(id === String(currentId) ? { parentNavUuid } : {}),
            },
          });
        }

        return {
          data: {
            success: true,
          },
        };
      } catch (error) {
        console.log(error);
        return ctx.throw("????????????");
      }
    },
    /**
     * ?????????????????????master??????
     */
    async update(ctx) {
      const { title, url, isNewPage } = ctx.request.body;
      const { id } = ctx.params;

      try {
        const result = (await strapi
          .service("api::project-route.project-route")
          .update(id, {
            data: {
              title,
              url,
              isNewPage,
            },
          })) as any;
        return {
          data: result,
        };
      } catch (error) {
        console.log(error);
        return ctx.throw("????????????");
      }
    },
  })
);

function formatProjectRouteResult(navList: any[]) {
  const copyList = [...navList];
  const pendingCheckUuid = [rootNavId];
  const listHaveOrder = [
    {
      uuid: rootNavId,
      children: [],
      data: {
        type: groupTypeName,
      },
    },
  ];
  const listOrderPath = { [rootNavId]: [0] };

  for (let y = 0; y < pendingCheckUuid.length; y++) {
    for (let i = copyList.length - 1; i >= 0; i--) {
      if (copyList[i].parentNavUuid === pendingCheckUuid[y]) {
        const curPath = listOrderPath[pendingCheckUuid[y]];
        const { createdAt, updatedAt, publishedAt, ...item } = copyList[i];
        const itemIsNav = item.type === groupTypeName;
        const curPathChildren = lodashGet(listHaveOrder, [
          ...curPath,
          "children",
        ]);
        if (itemIsNav) {
          pendingCheckUuid.push(item.navUuid);
          listOrderPath[item.navUuid] = [
            ...curPath,
            "children",
            curPathChildren.length,
          ];
        }
        lodashSet(
          listHaveOrder,
          [...curPath, "children"],
          [
            ...curPathChildren,
            {
              uuid: item.navUuid,
              data: {
                ...item,
              },
              ...(itemIsNav
                ? {
                    children: [],
                  }
                : {}),
            },
          ]
        );
        copyList.splice(i, 1);
      }
    }
  }
  return {
    listHaveOrder,
    listOrderPath,
  };
}

function getNavListOrder(children): number[] {
  let result = [];
  children.forEach((item) => {
    result.push(item.data.id);
    if (item.children) {
      result.push(...getNavListOrder(item.children));
    }
  });
  return result;
}

function generateNavList(children) {
  let obj = {};
  children.forEach((item) => {
    obj[item.uuid] = {
      id: item.uuid,
      data: item.data,
      children: item.children?.map((childItem) => childItem.uuid) ?? [],
      // isExpanded: true
    };
    if (item.children) {
      obj = { ...obj, ...generateNavList(item.children) };
    }
  });
  return obj;
}
