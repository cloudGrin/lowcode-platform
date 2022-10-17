import { useState } from 'react'
import Link from 'next/link'
import logo from '@/assets/images/logo.png'

const Logo = () => {
  return (
    <Link href='/' passHref>
      <a className='block mr-18'>
        <img width='120px' src={logo} alt='log' />
      </a>
    </Link>
  )
}

export default Logo
