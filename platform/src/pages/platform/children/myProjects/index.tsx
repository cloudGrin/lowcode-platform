import React from 'react'
import { useRouteLoaderData } from 'react-router-dom'

const MyProjects: React.FC = () => {
  const { userInfo } = (useRouteLoaderData('platform') as any) || {}
  console.log('MyProjects', userInfo)
  return <div className='my-projects-container'>2</div>
}

export default MyProjects
