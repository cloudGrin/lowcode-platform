import type { RouteObject } from 'react-router'

import ErrorPageForPlatform from './errorPage'
import Platform from './index'
import MyProjects from './myProjects'
import PlatformManage from './platformManage'
// import BasicInfo from './platformManage/basicInfo'
import { getLoginState } from '@/lib/request'
import { Navigate } from 'react-router-dom'
import CorpManager from './platformManage/corpManager'

async function authPlatformAdminLoader() {
  const TokenUserInfo = getLoginState()
  const userInfo = TokenUserInfo.userInfo
  if (!userInfo.isPlatformAdmin) {
    throw new Response('无权限访问', { status: 401 })
  }
  return null
}

const routes: RouteObject[] = [
  {
    path: '',
    element: <Platform />,
    errorElement: <ErrorPageForPlatform />,
    children: [
      {
        index: true,
        element: <MyProjects />
      },
      {
        path: 'platformManage',
        element: <PlatformManage />,
        loader: authPlatformAdminLoader,
        children: [
          // {
          //   path: 'basicInfo',
          //   element: <BasicInfo />
          // },
          {
            path: 'corpManager',
            element: <CorpManager />
          },
          {
            path: '',
            element: <Navigate to='corpManager' replace />
          },
          {
            path: '*',
            element: <Navigate to='corpManager' replace />
          }
        ]
      }
    ]
  }
]

export default routes
