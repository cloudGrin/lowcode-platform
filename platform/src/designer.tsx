import React from 'react'
import ReactDOM from 'react-dom'
import Designer from './pages/engine/designer'
import '@/styles/base.css'
import '@/styles/global.css'
import '@/styles/antd-reset.css'
import '@/styles/designer.css'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const request = require.context('@/assets/svg', false, /\.svg$/)
request.keys().forEach(request)

ReactDOM.render(
  <React.StrictMode>
    <div className='relative h-[100vh] overflow-hidden'>
      <Designer />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
)
