import useQuery from '@/hooks/useQuery'
import { getLoginState, useStrapiRequest } from '@/lib/request'
import { common, config, plugins, skeleton } from '@alilc/lowcode-engine'
import { useMemoizedFn } from 'ahooks'
import { message, Spin } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import createAxiosHandler from '../datasource-axios-handler'
import registerPlugins from './plugin'
import { createStore } from 'zustand/vanilla'
import { parseQuery } from '../utils'

const store = createStore(() => ({}))
async function authLoader() {
  const TokenUserInfo = getLoginState()
  if (TokenUserInfo.loginToken) {
    // try {
    //   const res = await strapiRequestInstance('/api/users/me')
    //   TokenUserInfo.setUserInfo(res.data)
    // } catch (error) {
    //   console.log(error)
    // }
  } else {
    location.href = '/login'
  }
}

const Designer: React.FC = () => {
  const isInited = useRef<boolean>(false)
  /** 插件是否已初始化成功，因为必须要等插件初始化后才能渲染 Workbench */
  const [hasPluginInited, setHasPluginInited] = useState(false)
  const query = useQuery()

  const { data: projectResult } = useStrapiRequest(
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

  const { data: pageVersionsResult } = useStrapiRequest(
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

  const { data: routeResult } = useStrapiRequest(
    '/api/project-routes/findByUuid',
    () => ({
      payload: {
        navUuid: query.get('navUuid') as string
      }
    }),
    {
      refreshDeps: [query]
    }
  )


  const init = useMemoizedFn(() => {
    async function initPlugins(projectResult: any, pageVersionsResult: any, routeResult: any) {
      try {
        await registerPlugins({
          project: projectResult.data,
          pageVersion: pageVersionsResult.data,
          route: routeResult.data
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
          // enableWorkspaceMode: true,
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
            axios: createAxiosHandler({
              store
            })
          },
          /**
           * 工具类扩展
           */
          appHelper: {
            utils: {
              navigateTo() {
                message.info('编辑器中不支持跳转')
              },
              parseQuery
            },
            /**
             * 全局常量
             */
            constants: {
              store
            }
          }
          // focusNodeSelector: (rootNode: any) => {
          //   console.log(rootNode)
          //   return rootNode
          // }
        })

        await plugins.init()
        setHasPluginInited(true)
        isInited.current = true
      } catch (err) {
        console.error(err)
        message.error('插件初始化失败')
      }
    }
    // 防止热更新重新注册插件报错
    if (isInited.current) return

    initPlugins(projectResult, pageVersionsResult, routeResult)
  })

  useEffect(() => {
    if (projectResult && pageVersionsResult && routeResult) {
      init()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectResult, pageVersionsResult, routeResult])

  useEffect(() => {
    authLoader()
  }, [])

  if (!hasPluginInited) {
    return <Spin />
  }

  return <common.skeletonCabin.Workbench skeleton={skeleton} />
}

export default Designer
