import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import Preview from './pages/engine/preview'
import AppPreview from './pages/engine/appPreview'
import AppPreviewPageContent from './pages/engine/appPreview/appPreviewPageContent'
import '@/styles/base.css'
import { createBrowserRouter, LoaderFunction, RouterProvider } from 'react-router-dom'
import { strapiRequestInstance } from './lib/request'
import '@/styles/base.css'
import '@/styles/global.css'
import '@/styles/antd-reset.css'

const projectLoader: LoaderFunction = async function ({ params }) {
  try {
    const result = await strapiRequestInstance('/api/projects/appId/${appId}', {
      urlValue: {
        appId: params.appId!
      }
    })
    // 设置标题
    document.title = result.data.name
    return {
      projectInfo: result.data
    }
  } catch (error) {
    return {
      projectInfo: null
    }
  }
}

const router = createBrowserRouter(
  [
    {
      path: 'app/page',
      element: <Preview />
    },
    {
      path: 'app/:appId/workbench',
      id: 'project',
      element: <AppPreview />,
      loader: projectLoader,
      children: [
        {
          path: ':navUuid',
          element: <AppPreviewPageContent />
        }
      ]
    }
  ],
  {}
)

ReactDOM.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
  document.getElementById('root')
)
