import React from 'react'
import type { RouteObject } from 'react-router'

import ErrorPageForPlatform from './errorPage'
import MyProjects from './myProjects'
import PlatformManage from './platformManage'
import Platform from './index'

const routes: RouteObject[] = [
  {
    path: '',
    element: <Platform />,
    errorElement: <ErrorPageForPlatform />,
    children: [
      {
        path: '',
        element: <MyProjects />
      },
      {
        path: 'platformManage',
        element: <PlatformManage />
      }
    ]
  }
]

export default routes
