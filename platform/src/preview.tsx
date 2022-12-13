import '@/styles/antd-reset.css'
import '@/styles/base.css'
import '@/styles/global.css'
import themeToken from '@/styles/var.json'
import zhCN from 'antd/locale/zh_CN'
import { ConfigProvider } from 'antd'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { createBrowserRouter, LoaderFunction, RouterProvider } from 'react-router-dom'
import { strapiRequestInstance } from './lib/request'
import AppPreview from './pages/engine/appPreview'
import AppPreviewPageContent from './pages/engine/appPreview/appPreviewPageContent'
import Preview from './pages/engine/preview'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const request = require.context('@/assets/svg', false, /\.svg$/)
request.keys().forEach(request)

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
    <ConfigProvider
      locale={zhCN}
      autoInsertSpaceInButton={false}
      theme={{
        token: {
          /**  全局主色 */
          colorPrimary: themeToken.c_primary,
          /**  链接色 */
          colorLink: themeToken.c_info,
          /**  a标签:hover颜色 */
          colorLinkHover: themeToken.c_primary,
          /**  成功色 */
          colorSuccess: themeToken.c_success,
          /**  警告色 */
          colorWarning: themeToken.c_warning,
          /**  错误色 */
          colorError: themeToken.c_error,
          /**  主字号 */
          fontSize: 12,
          /**  一级文本色 */
          colorText: themeToken.c_level_1,
          /** 二级文本色 */
          colorTextSecondary: themeToken.c_level_2,
          /**  失效色 */
          colorTextDisabled: themeToken.c_level_4,
          /**  边框色 */
          colorBorder: themeToken.c_line_1
          /**  height rules */
          // controlHeightSM: 32,
          // controlHeight: 36,
          // controlHeightLG: 40
        }
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>,
  document.getElementById('root')
)
