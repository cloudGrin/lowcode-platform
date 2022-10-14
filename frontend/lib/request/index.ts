import { getInstance as getClientInstance, useStrapiRequest } from './requestClient'
import { createInstance as createServerInstance } from './requestServer'
import { AxiosRequestConfig } from 'axios'

function getStrapiRequestInstance(ctx?: any): {
  /**
   * get请求
   * @param mt 请求path
   * @param payload 请求入参（query）
   * @param config AxiosRequestConfig配置
   * @returns 接口返回数据
   */
  get<T extends keyof ApiTypes>(
    mt: T,
    payload?: ApiTypes[T]['request'],
    config?: AxiosRequestConfig
  ): Promise<NonNullable<ApiTypes[T]['response']>>
  post<T extends keyof ApiTypes>(
    mt: T,
    payload?: ApiTypes[T]['request'],
    config?: AxiosRequestConfig
  ): Promise<NonNullable<ApiTypes[T]['response']>>
} {
  if (typeof window === 'undefined') {
    return createServerInstance({
      ctx
    }).strapiRequestInstance
  } else {
    return getClientInstance().strapiRequestInstance
  }
}

export { getStrapiRequestInstance, useStrapiRequest }

export { getClientInstance }
