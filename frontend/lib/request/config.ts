/**
 * 基础请求配置
 */
export const baseConfig = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 基础请求全局超时时间
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
}
