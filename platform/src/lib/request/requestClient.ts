import { message } from 'antd'
import type { Options, Result } from 'ahooks/lib/useRequest/src/types'
import { useRequest } from 'ahooks'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { baseConfig } from './config'
import { getLoginState } from './utils'
import { template } from 'lodash'

const requestInstance = axios.create(baseConfig)
const TokenUserInfo = getLoginState()

requestInstance.interceptors.request.use((request) => {
  const token = TokenUserInfo.loginToken
  const { needAuth = true, urlValue, url } = request
  let urlFormat = url
  if (urlValue) {
    urlFormat = template(url)(urlValue)
  }
  return {
    ...request,
    url: urlFormat,
    headers: {
      ...request.headers,
      ...(token && needAuth ? { Authorization: `Bearer ${token}` } : {})
    }
  }
})

requestInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { needAuth = true, hideErrorMessage = false } = error.config
    if (error.response.status === 401) {
      TokenUserInfo.removeUser()
      if (needAuth) {
        location.href = '/login'
      }
      return Promise.reject(error)
    }
    if (!hideErrorMessage) {
      message.error(error.response.data.error.message || '错误')
    }
    return Promise.reject(error)
  }
)

type AxiosRequestConfigOmitMt<T = any> = Omit<AxiosRequestConfig, 'params' | 'data'> & {
  payload?: T
}

function strapiRequestInstance<T extends keyof ApiTypes>(
  path: T,
  config?: AxiosRequestConfig
): Promise<ApiTypes[T]['response']>

function strapiRequestInstance<T extends keyof ApiTypes>(
  path: T,
  payload: ApiTypes[T]['request'],
  config: AxiosRequestConfig
): Promise<ApiTypes[T]['response']>

function strapiRequestInstance(path: any, payload?: any, config?: any): any {
  const [url, method = 'GET'] = path.split('__')
  if (typeof config !== 'undefined') {
    return requestInstance.request({
      url,
      method,
      [method === 'GET' ? 'params' : 'data']: payload,
      ...config
    })
  }
  const config_ = payload ?? {}
  return requestInstance.request({
    url,
    method,
    ...config_
  })
}

/** useRequest */
type TypeCombineService<T extends keyof ApiTypes, V extends any[] = any> = (
  ...argv: V
) => AxiosRequestConfigOmitMt<ApiTypes[T]['request']>

function useStrapiRequest<T extends keyof ApiTypes, P extends any[] = any>(
  path: T,
  service?: TypeCombineService<T, P>,
  options?: Options<ApiTypes[T]['response'], P>
): Result<ApiTypes[T]['response'], P>

/**
 *
 * @param path 接口path
 * @param service 返回axios config风格的函数
 * @param options useRequest 配置
 */
function useStrapiRequest(path: any, service?: any, options?: any): any {
  return useRequest((params) => {
    const realService = service ?? (() => ({}))
    const config = realService(params)
    const { payload, ...rest } = config
    const [url, method = 'GET'] = path.split('__')
    let resPromise = requestInstance.request({
      url,
      method,
      ...rest,
      [method === 'GET' ? 'params' : 'data']: payload
    })
    if (options?.formatResult) {
      resPromise = resPromise.then(options.formatResult)
    }
    return resPromise
  }, options)
}

export { useStrapiRequest, requestInstance, strapiRequestInstance }
