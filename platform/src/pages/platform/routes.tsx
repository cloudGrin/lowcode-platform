import { strapiRequestInstance } from '@/lib/request'
import React from 'react'
import type { RouteObject } from 'react-router'

import ErrorPageForPlatform from './children/errorPage'
import MyProjects from './children/myProjects'
import PlatformManage from './children/platformManage'

async function projectLoader() {
  const allProjects = await strapiRequestInstance('/api/projects', {
    params: {
      pagination: {
        page: 1,
        pageSize: 100
      }
    }
  })
  return { allProjects }
}

const routes: RouteObject[] = [
  {
    errorElement: <ErrorPageForPlatform />,
    children: [
      {
        path: '',
        loader: projectLoader,
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
