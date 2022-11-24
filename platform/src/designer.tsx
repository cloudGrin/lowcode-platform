import React from 'react'
import ReactDOM from 'react-dom'
import Designer from './pages/engine/designer'
import '@/styles/base.css'
import '@/styles/global.css'
import '@/styles/antd-reset.css'

ReactDOM.render(
  <React.StrictMode>
    <div className='relative h-[100vh] overflow-hidden'>
      <Designer />
    </div>
  </React.StrictMode>,
  document.getElementById('root')
)
