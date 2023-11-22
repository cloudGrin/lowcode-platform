import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'
// import { message } from 'antd'

export function useNavigateTo() {
  const navigate = useNavigate()
  const { appId, navUuid } = useParams()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  /**
   * 用来路由跳转
   * @param pageNavId 要传输到的页面的id
   * @param params 通过 URL 传递的查询参数。用于与目标页面共享信息。请参阅通过查询参数共享数据。
   * @example navigateTo("PageName", {"param": "value"}
   */
  return function navigateTo(pageNavId: string, params: Record<string, string> = {}, replace = false) {
    const isPageRoute = pathname.match(new RegExp('/app/page'))
    if (isPageRoute) {
      const paramsNavUuid = searchParams.get('navUuid')
      if (paramsNavUuid !== pageNavId) {
        try {
          const nextUrl = `/app/page?${new URLSearchParams({
            navUuid: pageNavId,
            ...params
          }).toString()}`
          if (window.self !== window.top) {
            // 在iframe中，可以判断当前在页面管理界面
            window.parent.postMessage(
              {
                source: 'page-preview',
                payload: {
                  navUuid: pageNavId,
                  ...params
                }
              },
              location.origin
            )
          } else {
            navigate(nextUrl, { replace })
          }
          // if (searchParams.get('tab') === 'prod') {
          //   message.info('该模式下跳转路由会访问目的地路由的最新保存版本，非当前查看的发布版本')
          // }
        } catch (error) {
          console.error(error)
        }
      }
    } else {
      if (navUuid !== pageNavId) {
        navigate(`/app/${appId}/workbench/${pageNavId}?${new URLSearchParams(params).toString()}`, { replace })
      }
    }
  }
}

export function parseQuery(locationSearch = window.location.search) {
  const searchParams = new URLSearchParams(locationSearch)

  // 将 URL 查询参数转换为对象
  const queryParams: Record<string, unknown> = {}
  for (const [key, value] of searchParams) {
    queryParams[key] = value
  }
  return queryParams
}
