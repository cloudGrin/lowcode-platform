import type { RouteObject } from 'react-router'

import { Navigate } from 'react-router-dom'
import AppSetting from './appSetting'
import ApplyPermission from './appSetting/applyPermission'
import BasicSetting from './appSetting/basicSetting'
import ErrorPageForProject from './errorPage'
import Project from './index'
import PageManage from './pageManage'
import Publish from './publish'

const routes: RouteObject[] = [
  {
    errorElement: <ErrorPageForProject />,
    path: ':id/admin',
    element: <Project />,
    children: [
      {
        path: 'appSetting',
        element: <AppSetting />,
        children: [
          {
            path: 'basicSetting',
            element: <BasicSetting />
          },
          {
            path: 'applyPermission',
            element: <ApplyPermission />
          },
          {
            path: '',
            element: <Navigate to='basicSetting' replace />
          }
        ]
      },
      {
        path: 'appPublish',
        element: <Publish />
      },
      {
        path: '',
        element: <Navigate to='empty' replace />
      },
      {
        path: ':routeId',
        element: <PageManage />
      }
    ]
  }
]

export default routes
