import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
// import { destroyCookie } from 'nookies'
import { baseConfig } from './config'
import type { GetServerSidePropsContext } from 'next'

// ctx用来307和修改cookie（暂未用到）
export function createInstance({ ctx }: { ctx: GetServerSidePropsContext }) {
  const requestInstance = axios.create(baseConfig)

  requestInstance.interceptors.request.use((request) => {
    return request
  })

  requestInstance.interceptors.response.use((response) => {
    return response
  })

  const strapiRequestInstance = {
    /**
     * get请求
     * @param path 请求path
     * @param payload 请求入参（query）
     * @param config AxiosRequestConfig配置
     * @returns 接口返回数据
     */
    get<T extends keyof ApiTypes>(
      path: T,
      payload?: ApiTypes[T]['request'],
      config: AxiosRequestConfig = {}
    ): Promise<NonNullable<ApiTypes[T]['response']>> {
      console.log(`【请求】${path} 入参 ${JSON.stringify(payload)}`)
      return requestInstance
        .request<T>({
          params: payload,
          url: path,
          ...config
        })
        .then((res: any) => {
          console.log(`【请求】${path} 成功`)
          return res.data!
        })
        .catch((err) => {
          console.error(`【请求】${path} 失败：${err.message ?? '未知'}`)
          return Promise.reject(err)
        })
    },
    post() {
      throw new Error('服务端请求只支持get')
    }
  }
  return { requestInstance, strapiRequestInstance }
}
