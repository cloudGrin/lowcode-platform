import type { LoaderFunctionArgs, RouteObject } from 'react-router'

import { strapiRequestInstance } from '@/lib/request'
import AppSetting from './appSetting'
import BasicSetting from './appSetting/basicSetting'
import ApplyPermission from './appSetting/applyPermission'
import ErrorPageForProject from './errorPage'
import Project from './index'
import PageManage from './pageManage'
import Publish from './publish'
import { Navigate } from 'react-router-dom'

async function projectLoader({ params }: LoaderFunctionArgs) {
  try {
    const result = await strapiRequestInstance('/api/projects/${id}', {
      urlValue: {
        id: params.id!
      }
    })
    return {
      projectInfo: result.data
    }
  } catch (error) {
    throw new Response('NOT FOUND', { status: 404 })
  }
}

const routes: RouteObject[] = [
  {
    errorElement: <ErrorPageForProject />,
    path: ':id/admin',
    element: <Project />,
    loader: projectLoader,
    id: 'project',
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
