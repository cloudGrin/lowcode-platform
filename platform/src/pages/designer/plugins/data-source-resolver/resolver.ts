import request from "universal-request";
import { RequestOptions, AsObject} from 'universal-request/lib/types';
import { RuntimeOptionsConfig } from "@alilc/lowcode-datasource-types";

import {createMiddleware} from './middlerware'
import type {Middleware, Handler} from './middlerware'
import { Context } from './context';
import compose from './utils/compose';
import Param from './data-model/Param';

type MiddlewareType = 'request' | 'response';
type Emmiter = {};

interface LocodeRequestOptions extends RuntimeOptionsConfig {
    requestHandlers: any[],
    responseHandlers: any[]
}

class DataSourceResolver {
  private debug: boolean;
  private requestMiddleware: Middleware[];
  private responseMiddleware: Middleware[];
  private emmiter: Emmiter;
  private requestConfig: LocodeRequestOptions;
  private context: Context;

  constructor(options: RuntimeOptionsConfig) {
    const requestConfig: LocodeRequestOptions = {
        ...options,
        url: options.uri,
        method: options.method,
        data: options.data,
        headers: options.headers,
        requestHandlers: (options.requestHandlers || []) as any[],
        responseHandlers: (options.responseHandlers || []) as any[]
    };

    this.requestConfig = requestConfig;
    this.requestMiddleware = this.createMiddlewares(this.requestConfig.requestHandlers);
    this.responseMiddleware = this.createMiddlewares(this.requestConfig.responseHandlers);

    this.context = this.createContext(this.requestConfig);
  }

  createMiddlewares(requestHandlers: Handler[]): Middleware[] {
      const middlewares = requestHandlers.map(handler => {
          return createMiddleware(handler);
      })

      return middlewares;
  }

  useRequestMiddleware(fn: Middleware) {
    if (typeof fn !== "function")
      throw new TypeError("middleware must be a function!");
    // debug('use %s', fn._name || fn.name || '-')
    this.requestMiddleware.push(fn);
    return this;
  }

  useResponseMiddleware(fn: Middleware) {
    if (typeof fn !== "function")
      throw new TypeError("middleware must be a function!");
    // debug('use %s', fn._name || fn.name || '-')
    this.requestMiddleware.push(fn);
    return this;
  }

  // 开始处理一个数据源
  async startDataSourceResolver(): Promise<Context> {
    await this.handleRequest();
    return this.context;
  }

  async handleRequest() {
      const fnMiddleware = compose(this.requestMiddleware);

      // TODO try catch
      try {
        await fnMiddleware(this.context);
      }
      catch(err) {
        this.onerror(err);
      }

      const response = await this.request(this.requestConfig);

      this.context.tableFrame.fromOriginData(response.data);

      if (!response) {
          this.onerror(response);
          return;
      }
      this.context.setResponse(response);
      await this.handleResponse();
  }

  async handleResponse() {
    const fnMiddleware = compose(this.responseMiddleware);
    try {
      await fnMiddleware(this.context);
    }
    catch(err) {
      this.onerror(err);
    }
  }

  async request(options: RuntimeOptionsConfig) {
    const requestConfig: RequestOptions = {
      ...options,
      url: options.uri,
      method: options.method as RequestOptions['method'],
      data: options.params as AsObject,
      headers: options.headers as AsObject,
    };
    console.log('biFetch createFetchHandler options', options);
    let response;
    try {
      response = await request(requestConfig);
    }
    catch (err) {
      this.onerror(err);
    }
    console.log('biFetch createFetchHandler response', response);
    return response;

  }

  createContext(requestConfig: LocodeRequestOptions): Context {
    const param = new Param(requestConfig.params)
    return new Context(param);
  }

  onerror(err) {}

  on() {}

  toJSON() {}
}


export {
  DataSourceResolver
};