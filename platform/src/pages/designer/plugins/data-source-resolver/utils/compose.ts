/**
 * 没有直接使用koa-compose，而选择重写的原因
 * 1. 模块的输出形式: npm包通过 module.exports = compose 输出；
 * 2. TS 类型系统的一致性，对 context 有类型约束；
 * 3. 版本升级可能带来的问题；
 *
 * https://github.com/koajs/compose/blob/master/index.js
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

export default function compose(middleware) {
  if (!Array.isArray(middleware))
    throw new TypeError("Middleware stack must be an array!");
  for (const fn of middleware) {
    if (typeof fn !== "function")
      throw new TypeError("Middleware must be composed of functions!");
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next?: () => {}) {
    // last called middleware #
    let index = -1;
    return dispatch(0);

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error("next() called multiple times"));
      }

      index = i;
      let fn = middleware[i];
      if (i === middleware.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }

      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
