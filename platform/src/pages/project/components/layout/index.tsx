import React from 'react'
import Header from './header'

const Layout: React.FC = ({ children }) => {
  return (
    <div className='layout-container'>
      <Header />
      <section>{children}</section>
      <style jsx>{`
        div > section {
          padding-top: theme(height.header);
        }
      `}</style>
    </div>
  )
}

export default Layout
