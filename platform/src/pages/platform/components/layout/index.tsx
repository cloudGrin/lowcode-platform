import React from 'react'
import Header from './header'

const Layout: React.FC = ({ children }) => {
  return (
    <div className='layout-container'>
      <Header />
      <section className='pt-[52px]'>{children}</section>
    </div>
  )
}

export default Layout
