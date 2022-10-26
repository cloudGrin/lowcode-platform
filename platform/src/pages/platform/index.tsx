import React from 'react'
import { Outlet, useLoaderData } from 'react-router-dom'
import Layout from './components/layout'
const WebPlatform: React.FC = () => {
  const { userInfo } = useLoaderData() as { userInfo: ApiTypes['/api/users/me']['response'] }
  console.log('platform', userInfo)
  return (
    <div className='platform-container'>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  )
}

export default WebPlatform
