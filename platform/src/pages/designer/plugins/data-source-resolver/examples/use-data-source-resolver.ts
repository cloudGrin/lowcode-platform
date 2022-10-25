import { RuntimeOptionsConfig } from "@alilc/lowcode-datasource-types";
import { DataSourceResolver } from "../index";

const datasourceConfig = {
  type: "biFetch",
  isInit: true,
  options: {
    method: "GET",
    isCors: true,
    timeout: 5000,
    headers: {},
    uri: "http://rap2api.taobao.org/app/mock/250089/testCompanies",
    requestHandlers: [
      {
        "name": "filter-frontend-param",
        "desc": "过滤仅前端使用的参数",
        "config": {}
      },
      {
        "name": "tranform-param-format",
        "desc": "参数格式转换",
        "config": {}
      }
    ],
    responseHandlers: [
      {
        name: "add-meta-data",
        desc: "添加公共数据源",
        config: {},
      },
      {
        name: "add-columns",
        desc: "数据列添加",
        config: {},
      },
      {
        name: "filter-exception-data",
        desc: "异常数据数据过滤",
        config: {},
      },
      {
        name: "filter-derived-field",
        desc: "同环比字段过滤",
        config: {},
      },
      {
        name: "sort-data-table",
        desc: "数据表排序",
        config: {},
      }
    ],
    params: {},
  },
  id: "testCompanies",
};


function tranformParam(enable: boolean) {
  return async function (ctx, next) {
    console.log(ctx.params);
    if (enable && ctx.params.type === '1') {
      ctx.params.type === ['1'];
    }

    await next();
  };
}

function sortTableData(sortMeasure: string, type: string) {
  return async function (ctx, next) {
    console.log(ctx.params);
    ctx.columns = ctx.columns.sort((a, b) => {
      // 处理排序类型
      return a[sortMeasure] > b ? 1 : -1;
    });

    await next();
  };
}

// 初始化一个数据源处理器
const resolver = new DataSourceResolver(datasourceConfig as unknown as RuntimeOptionsConfig);

// 在请求前添加额外的自定义中间件，在执行完配置中申明的请求处理器后会进行处理
resolver.useRequestMiddleware(tranformParam(true));

// 在数据处理之后，添加额外的自定义中间件，在执行完配置中申明的响应处理器后会进行处理
resolver.useResponseMiddleware(sortTableData('sale_amt', 'desc'));

// 启动数据源处理器
resolver.startDataSourceResolver();
