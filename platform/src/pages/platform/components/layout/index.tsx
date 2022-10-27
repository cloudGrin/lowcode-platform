import React from 'react'
import Header from './header'

const Layout: React.FC = ({ children }) => {
  return (
    <div className='layout-container'>
      <Header />
      <main className='pt-[52px]'>{children}</main>
    </div>
  )
}

export default Layout
