import React from 'react'
import { useRouteLoaderData } from 'react-router-dom'

const PlatformManage: React.FC = () => {
  const { userInfo } = (useRouteLoaderData('userAuth') as any) || {}
  console.log('PlatformManage', userInfo)
  return <div className='my-projects-container'>2</div>
}

export default PlatformManage
