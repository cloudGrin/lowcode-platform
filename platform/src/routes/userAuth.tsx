import React from 'react'
import { Outlet, useLoaderData } from 'react-router-dom'
const WebPlatform: React.FC = () => {
  const { userInfo } = useLoaderData() as { userInfo: ApiTypes['/api/users/me']['response']['data'] }
  console.log('platform', userInfo)
  return (
    <div className='platform-container'>
      <Outlet />
    </div>
  )
}

export default WebPlatform
