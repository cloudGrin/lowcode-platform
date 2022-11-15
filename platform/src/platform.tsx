import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import 'moment/locale/zh-cn'
import React from 'react'
import ReactDOM from 'react-dom'
import { RouterProvider } from 'react-router-dom'
import router from '@/routes'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const request = require.context('@/assets/svg', false, /\.svg$/)
request.keys().forEach(request)
/* prettier-ignore-start */
/** 以下css引入顺序请勿修改，会导致bug */
import '@/styles/base.css'
import 'antd/dist/antd.less'
import '@/styles/antd-reset.less'
import '@/styles/global.css'
/* prettier-ignore-end */

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} autoInsertSpaceInButton={false}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
