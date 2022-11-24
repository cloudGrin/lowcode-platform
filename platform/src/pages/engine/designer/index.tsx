import { common, config, plugins, skeleton } from '@alilc/lowcode-engine'
import { message, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import registerPlugins from './plugin'
import createAxiosHandler from '../datasource-axios-handler'
import { useStrapiRequest } from '@/lib/request'
import useQuery from '@/hooks/useQuery'

const Designer: React.FC = () => {
  const isInited = useRef<boolean>(false)
  /** 插件是否已初始化成功，因为必须要等插件初始化后才能渲染 Workbench */
  const [hasPluginInited, setHasPluginInited] = useState(false)
  const query = useQuery()

  const { data: projectResult, loading: projectLoading } = useStrapiRequest(
    '/api/projects/${id}',
    () => ({
      urlValue: {
        id: query.get('projectId') as string
      }
    }),
    {
      refreshDeps: [query]
    }
  )

  const { data: pageVersionsResult, loading: pageVersionsLoading } = useStrapiRequest(
    '/api/page-versions/latest',
    () => ({
      payload: {
        navUuid: query.get('navUuid') as string,
        pagination: {
          page: 1,
          pageSize: 1
        }
      }
    }),
    {
      refreshDeps: [query]
    }
  )

  useEffect(() => {
    async function initPlugins(projectResult: any, pageVersionsResult: any) {
      try {
        await registerPlugins({
          project: projectResult.data,
          schema: pageVersionsResult.data.schema,
          navUuid: query.get('navUuid')
        })
        config.setConfig({
          // designMode: 'live',
          /**
           * 是否开启 condition 的能力，默认在设计器中不管 condition 是啥都正常展示
           */
          enableCondition: true,
          /**
           * 打开画布的锁定操作，默认值：false
           */
          enableCanvasLock: true,
          /**
           * 设置所有属性支持变量配置，默认值：false
           */
          supportVariableGlobally: true,
          /**
           * 设置 simulator 相关的 url，默认值：undefined
           */
          // simulatorUrl 在当 engine-core.js 同一个父路径下时是不需要配置的！！！
          // 这里因为用的是 alifd cdn，在不同 npm 包，engine-core.js 和 react-simulator-renderer.js 是不同路径
          // simulatorUrl: [
          //   'https://alifd.alicdn.com/npm/@alilc/lowcode-react-simulator-renderer@latest/dist/css/react-simulator-renderer.css',
          //   'https://alifd.alicdn.com/npm/@alilc/lowcode-react-simulator-renderer@latest/dist/js/react-simulator-renderer.js'
          // ],
          /**
           * 数据源引擎的请求处理器映射
           */
          requestHandlersMap: {
            axios: createAxiosHandler()
          },
          /**
           * 工具类扩展
           */
          appHelper: {
            utils: {
              // xxx: () => {
              //   console.log('123')
              // }
            },
            /**
             * 全局常量
             */
            constants: {}
          }
        })

        await plugins.init()
        setHasPluginInited(true)
        isInited.current = true
      } catch (err) {
        console.error(err)
        message.error('插件初始化失败')
      }
    }
    if (projectResult && pageVersionsResult) {
      // 防止热更新重新注册插件报错
      if (isInited.current) return

      initPlugins(projectResult, pageVersionsResult)
    }
  }, [projectResult, pageVersionsResult, query])

  if (!hasPluginInited) {
    return <Spin />
  }

  return <common.skeletonCabin.Workbench skeleton={skeleton} />
}

export default Designer
