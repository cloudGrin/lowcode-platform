import { RuntimeOptionsConfig } from "@alilc/lowcode-datasource-types";
import { DataSourceResolver } from "../../index";
import { Context } from '../../context';

import request from 'universal-request';
import { RequestOptions, AsObject } from 'universal-request/lib/types';

// config 留着扩展
export function createBiFetchHandler(config?: Record<string, unknown>) {
  // eslint-disable-next-line space-before-function-paren
  return async function(options: RuntimeOptionsConfig) {
    console.log('createBiFetchHandler', options);
    // 初始化一个数据源处理器
    const resolver = new DataSourceResolver(options);
    // 启动数据源处理器
    const context: Context = await resolver.startDataSourceResolver();
    console.log('createBiFetchHandler', context.tableFrame.data())
    return {
      status: 200,
      data: context.tableFrame.data(),
      headers: []
    };

  };
}
