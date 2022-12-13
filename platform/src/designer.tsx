import React from 'react'
import ReactDOM from 'react-dom'
import Designer from './pages/engine/designer'
import zhCN from 'antd/locale/zh_CN'
import '@/styles/base.css'
import '@/styles/global.css'
import '@/styles/antd-reset.css'
import '@/styles/designer.css'
import { ConfigProvider } from 'antd'
import themeToken from '@/styles/var.json'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const request = require.context('@/assets/svg', false, /\.svg$/)
request.keys().forEach(request)

ReactDOM.render(
  // <React.StrictMode>
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
    <div className='relative h-[100vh] overflow-hidden'>
      <Designer />
    </div>
  </ConfigProvider>,
  // </React.StrictMode>
  document.getElementById('root')
)
