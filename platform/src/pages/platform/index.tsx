import React from 'react'
import { Outlet } from 'react-router-dom'
import Layout from './components/layout'
const WebPlatform: React.FC = () => {
  return (
    <div className='platform-container'>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  )
}

export default WebPlatform
