/**
 * 基础请求配置
 */
export const baseConfig = {
  headers: {
    'Content-Type': 'application/json',
    /**
     * 目前发现不加的话，页面管理里跳转编辑页面后点击浏览器返回接口直接使用了 disk cache
     */
    'Cache-Control': 'no-cache'
  },
  timeout: 30000, // 基础请求全局超时时间
  baseURL: process.env.PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
}
