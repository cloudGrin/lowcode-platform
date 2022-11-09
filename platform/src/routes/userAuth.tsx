import React from 'react'
import { Outlet } from 'react-router-dom'
const WebPlatform: React.FC = () => {
  return (
    <div className='platform-container'>
      <Outlet />
    </div>
  )
}

export default WebPlatform
