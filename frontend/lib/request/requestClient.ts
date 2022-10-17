import { message } from 'antd'
import type { Options, Result } from 'ahooks/lib/useRequest/src/types'
import { useRequest } from 'ahooks'
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { baseConfig } from './config'
import { getLoginState } from './utils'

const getInstance: any = () => {
  const { result } = getInstance
  if (result) {
    // 复用实例
    return result
  }

  const requestInstance = axios.create(baseConfig)
  const TokenUserInfo = getLoginState()

  requestInstance.interceptors.request.use((request) => {
    const token = TokenUserInfo.loginToken

    return {
      ...request,
      headers: {
        ...request.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  })

  requestInstance.interceptors.response.use(
    (response) => {
      return response.data
    },
    (error) => {
      if (error.response.status === 401) {
        const { isStrictAuth = true } = error.request

        TokenUserInfo.removeUser()
        if (isStrictAuth) {
          location.href = '/login'
        }
        return Promise.reject(error)
      }

      message.error(error.response.data.error.message || '错误')
      return Promise.reject(error)
    }
  )

  getInstance.result = requestInstance
  return getInstance.result
}

/** useRequest */

type TypeCombineService<T extends keyof ApiTypes, V extends any[] = any> = (
  ...argv: V
) => AxiosRequestConfig<ApiTypes[T]['request']>

function useStrapiRequest<T extends keyof ApiTypes, P extends any[] = any, U = any, UU extends U = any>(
  path: T,
  service?: TypeCombineService<T, P>,
  options?: Options<UU, P> & {
    formatResult: (res: ApiTypes[T]['response']) => U
  }
): Result<U, P>

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
    let realService = service ?? (() => ({}))
    const config = realService(params)
    let resPromise = getInstance().request({
      url: path,
      ...config
    })
    if (options?.formatResult) {
      resPromise = resPromise.then(options.formatResult)
    }
    return resPromise
  }, options)
}

export { useStrapiRequest, getInstance }
