/**
 * page-version controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::page-version.page-version",
  ({ strapi }) => ({
    /**
     * 权限：无权限
     * 结果：当前page最新的schema，如果传入version则取制定版本的，都没有则返回 {id:0,schema:初始schema}
     */
    async findLatestVersion(ctx) {
      try {
        const { navUuid, versionId } = ctx.request.query;
        const { results } = (await strapi
          .service("api::page-version.page-version")
          .find({
            pagination: {
              page: 1,
              pageSize: 1,
            },
            populate: {
              route: true,
            },
            sort: "id:desc",
            filters: {
              route: {
                navUuid: {
                  $eq: navUuid,
                },
              },
              ...(versionId
                ? {
                    id: versionId,
                  }
                : {}),
            },
          })) as any;
        if (results[0]) {
          const { id, description, createdAt, schema } = results[0];
          return {
            data: {
              id,
              description,
              createdAt,
              schema,
            },
          };
        } else {
          if (versionId) {
            return ctx.notFound();
          }
          // 默认
          return {
            data: {
              id: 0,
              description: "默认",
              schema: {
                i18n: {},
                version: "1.0.0",
                componentsMap: [
                  {
                    main: "lib/index.js",
                    package: "@alifd/pro-layout",
                    version: "1.0.1-beta.6",
                    exportName: "Page",
                    componentName: "NextPage",
                    destructuring: true,
                  },
                  {
                    devMode: "lowCode",
                    componentName: "Page",
                  },
                  {
                    main: "lib/index.js",
                    package: "@alifd/pro-layout",
                    subName: "",
                    version: "1.0.1-beta.6",
                    exportName: "Col",
                    componentName: "NextCol",
                    destructuring: true,
                  },
                  {
                    main: "lib/index.js",
                    package: "@alifd/pro-layout",
                    subName: "",
                    version: "1.0.1-beta.6",
                    exportName: "Row",
                    componentName: "NextRow",
                    destructuring: true,
                  },
                  {
                    main: "lib/index.js",
                    package: "@alifd/pro-layout",
                    subName: "",
                    version: "1.0.1-beta.6",
                    exportName: "RowColContainer",
                    componentName: "NextRowColContainer",
                    destructuring: true,
                  },
                  {
                    main: "lib/index.js",
                    package: "@alifd/pro-layout",
                    subName: "",
                    version: "1.0.1-beta.6",
                    exportName: "BlockCell",
                    componentName: "NextBlockCell",
                    destructuring: true,
                  },
                  {
                    main: "lib/index.js",
                    package: "@alifd/pro-layout",
                    subName: "",
                    version: "1.0.1-beta.6",
                    exportName: "Block",
                    componentName: "NextBlock",
                    destructuring: true,
                  },
                ],
                componentsTree: [
                  {
                    id: "node_dockcviv8fo1",
                    css: ".pro-layout-page-content { padding: 0;}",
                    props: {
                      ref: "outerView",
                      style: {},
                    },
                    state: {},
                    title: "",
                    hidden: false,
                    methods: {},
                    children: [
                      {
                        id: "node_oclaut6bec6s",
                        props: {
                          nav: false,
                          ref: "nextpage-02fb984a",
                          aside: false,
                          isTab: false,
                          style: {},
                          footer: false,
                          navProps: {
                            width: 200,
                          },
                          minHeight: "100vh",
                          presetNav: true,
                          asideProps: {
                            width: 200,
                          },
                          background: "lining",
                          headerProps: {
                            background: "surface",
                          },
                          presetAside: true,
                          contentProps: {
                            style: {
                              background: "rgba(255,255,255,0)",
                            },
                          },
                          headerDivider: true,
                          placeholderStyle: {
                            gridRowEnd: "span 1",
                            gridColumnEnd: "span 12",
                          },
                          contentAlignCenter: false,
                        },
                        title: "页面",
                        hidden: false,
                        children: [
                          {
                            id: "node_oclauurbcg1",
                            props: {
                              mode: "transparent",
                              title: "",
                              colGap: 20,
                              rowGap: 20,
                              strict: true,
                              colSpan: 12,
                              rowSpan: 1,
                              noBorder: false,
                              noPadding: false,
                              background: "surface",
                              layoutmode: "O",
                              placeholderStyle: {
                                height: "100%",
                              },
                              childTotalColumns: 12,
                            },
                            title: "区域",
                            hidden: false,
                            children: [
                              {
                                id: "node_oclauurbcg2",
                                props: {
                                  mode: "transparent",
                                  text: true,
                                  title: "",
                                  _title: "",
                                  colSpan: 12,
                                  loading: false,
                                  rowSpan: 1,
                                  hasDivider: true,
                                  operations: [],
                                  bodyPadding: "",
                                  hasCollapse: false,
                                  isAutoContainer: true,
                                  isFillContainer: true,
                                  operationConfig: {
                                    align: "center",
                                  },
                                  visibleButtonCount: 3,
                                },
                                title: "",
                                hidden: false,
                                children: [
                                  {
                                    id: "node_oclauurbcg3",
                                    props: {
                                      colGap: 20,
                                      rowGap: 20,
                                    },
                                    title: "行列容器",
                                    hidden: false,
                                    children: [
                                      {
                                        id: "node_oclauurbcg4",
                                        props: {},
                                        title: "行",
                                        hidden: false,
                                        children: [
                                          {
                                            id: "node_oclauurbcg5",
                                            props: {
                                              colSpan: 1,
                                            },
                                            title: "列",
                                            hidden: false,
                                            isLocked: false,
                                            condition: true,
                                            componentName: "NextCol",
                                            conditionGroup: "",
                                          },
                                        ],
                                        isLocked: false,
                                        condition: true,
                                        componentName: "NextRow",
                                        conditionGroup: "",
                                      },
                                    ],
                                    isLocked: false,
                                    condition: true,
                                    componentName: "NextRowColContainer",
                                    conditionGroup: "",
                                  },
                                ],
                                isLocked: false,
                                condition: true,
                                componentName: "NextBlockCell",
                                conditionGroup: "",
                              },
                            ],
                            isLocked: false,
                            condition: true,
                            componentName: "NextBlock",
                            conditionGroup: "",
                          },
                        ],
                        isLocked: false,
                        condition: true,
                        componentName: "NextPage",
                        conditionGroup: "",
                      },
                    ],
                    fileName: "/",
                    isLocked: false,
                    condition: true,
                    dataSource: {
                      list: [],
                    },
                    lifeCycles: {
                      componentDidMount: {
                        type: "JSFunction",
                        value:
                          "function componentDidMount() {\n  console.log('did mount');\n}",
                        source:
                          "function componentDidMount() {\n  console.log('did mount');\n}",
                      },
                      componentWillUnmount: {
                        type: "JSFunction",
                        value:
                          "function componentWillUnmount() {\n  console.log('will unmount');\n}",
                        source:
                          "function componentWillUnmount() {\n  console.log('will unmount');\n}",
                      },
                    },
                    originCode:
                      "class LowcodeComponent extends Component {\n  state = {}\n  componentDidMount() {\n    console.log('did mount');\n  }\n  componentWillUnmount() {\n    console.log('will unmount');\n  }\n}",
                    componentName: "Page",
                    conditionGroup: "",
                  },
                ],
              },
            },
          };
        }
      } catch (error) {
        console.log(error);
        return ctx.throw("发生错误");
      }
    },
    /**
     * 权限：该应用成员
     */
    async create(ctx) {
      const { navUuid, schema, description } = ctx.request.body;

      const {
        selfGlobalState: { userId, isPlatformAdmin },
      } = ctx.state;

      if (!schema || !navUuid) {
        return ctx.badRequest("参数错误");
      }

      try {
        const { results: projectRouteResult } = (await strapi
          .service("api::project-route.project-route")
          .find({
            pagination: false,
            populate: {
              project: true,
            },
            filters: {
              navUuid: {
                $eq: navUuid,
              },
            },
          })) as any;

        if (projectRouteResult[0]) {
          if (!isPlatformAdmin) {
            // 需要是该项目成员
            const count = await strapi.db
              .query("api::project-user-role.project-user-role")
              .count({
                where: {
                  project: {
                    id: projectRouteResult[0].project.id,
                  },
                  user: {
                    id: userId,
                  },
                },
              });
            if (count === 0) {
              return ctx.forbidden();
            }
          }
          await strapi.service("api::page-version.page-version").create({
            data: {
              route: {
                id: projectRouteResult[0].id,
              },
              schema,
              description,
              operator: {
                id: userId,
              },
            },
          });

          return {
            data: {
              success: true,
            },
          };
        } else {
          return ctx.badRequest("参数错误");
        }
      } catch (error) {
        console.log(error);
        return ctx.throw("发生错误");
      }
    },
  })
);
