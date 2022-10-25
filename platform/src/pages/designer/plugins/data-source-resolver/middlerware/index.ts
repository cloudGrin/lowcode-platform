import type { Context } from "../context";

export type Middleware = (ctx: Context, next?: () => void) => void;

export type CreateMiddlewareByHanlerConfig = (config: any) => Middleware;

export type MiddlewareMeta = {
    // 处理器的唯一标识
    name: string;
    title: string;
    help: string;
    icon?: string;
    middleware: Middleware;
    // formily/react 的schema协议，用来进行处理器配置项的渲染
    schema: any;
};

export type Handler = {
  name: string;
  desc: string;
  config: any;
};

type MiddlewareMetaMap = {
    [name: string]: MiddlewareMeta
};

type MiddlewareMap = {
    [name: string]: Middleware
};

const middlerwareMetaMap: MiddlewareMetaMap = {};

function testMiddlerware(handlerConfig: any) {
  return async function testMiddlerwareCallback(ctx: Context, next: () => void) {
    console.log("testMiddlerwareCallback ctx", ctx);
    console.log("testMiddlerwareCallback handlerConfig", handlerConfig);
    ctx.param.add('type', ["1"]);
    await next();
  };
}

/**
 *  对于公共处理器，可以根据处理器的配置，动态返回基于配置生成的中间件
 * @param handlerConfig
 * @returns
 */
export const createMiddleware = (handlerConfig: Handler): Middleware => {
    // 根据处理器的name，并结合处理器的配置项，动态生成中间件函数
    const { name, config } = handlerConfig;
    const middlerwareMeta = middlerwareMetaMap[name];
    if (!middlerwareMeta) {
        return testMiddlerware(config);
    }
    return middlerwareMeta['middleware'](config) as unknown as Middleware;
};
