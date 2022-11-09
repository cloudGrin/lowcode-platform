import React from 'react'
import { Outlet } from 'react-router-dom'
import Layout from './components/layout'
const Project: React.FC = () => {
  return (
    <div className='project-container'>
      <Layout>
        <Outlet />
      </Layout>
    </div>
  )
}

export default Project
