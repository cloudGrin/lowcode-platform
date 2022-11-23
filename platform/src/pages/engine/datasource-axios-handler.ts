import { RuntimeOptionsConfig } from '@alilc/lowcode-datasource-types'
import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios'

// config 留着扩展
export default function createFetchHandler(config?: Record<string, unknown>) {
  return async function (options: RuntimeOptionsConfig) {
    const requestConfig: AxiosRequestConfig = {
      ...options,
      url: options.uri,
      method: options.method,
      data: options.params,
      headers: options.headers as RawAxiosRequestHeaders
    }
    const response = axios.request(requestConfig)
    return response
  }
}
