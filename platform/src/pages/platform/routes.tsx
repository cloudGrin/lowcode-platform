import React from 'react'
import type { RouteObject } from 'react-router'

import ErrorPageForPlatform from './errorPage'
import MyProjects from './myProjects'
import PlatformManage from './platformManage'
import Platform from './index'
// import BasicInfo from './platformManage/basicInfo'
import CorpManager from './platformManage/corpManager'
import { Navigate } from 'react-router-dom'
import { getLoginState } from '@/lib/request'

async function authPlatformAdminLoader() {
  const TokenUserInfo = getLoginState()
  const userInfo = TokenUserInfo.userInfo
  if (!userInfo.isPlatformAdmin) {
    throw new Response('无权限访问', { status: 401 })
  }
}

const routes: RouteObject[] = [
  {
    path: '',
    element: <Platform />,
    errorElement: <ErrorPageForPlatform />,
    children: [
      {
        path: 'myApp',
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
      },
      {
        path: '',
        element: <Navigate to='myApp' replace />
      },
      {
        path: '*',
        element: <Navigate to='myApp' replace />
      }
    ]
  }
]

export default routes
