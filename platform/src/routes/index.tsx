import React from 'react'
import { getLoginState, strapiRequestInstance } from '@/lib/request'
import Login from '@/pages/login'
import Platform from '@/pages/platform'
import ErrorPage from '@/pages/platform/errorPage'
import Register from '@/pages/register'
import { createBrowserRouter, redirect } from 'react-router-dom'

import platformChildrenRoutes from '@/pages/platform/routes'

async function authLoader() {
  const TokenUserInfo = getLoginState()
  if (TokenUserInfo.loginToken) {
    let userInfo
    const userInfoFromCookie = TokenUserInfo.userInfo
    if (userInfoFromCookie) {
      userInfo = userInfoFromCookie
    } else {
      userInfo = await strapiRequestInstance('/api/users/me')
      TokenUserInfo.setUserInfo(userInfo)
    }
    return {
      userInfo
    }
  } else {
    return redirect('/login')
  }
}

async function loginLoader() {
  const TokenUserInfo = getLoginState()
  if (TokenUserInfo.loginToken) {
    return redirect('/')
  }
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      loader: authLoader,
      element: <Platform />,
      id: 'platform',
      errorElement: <ErrorPage />,
      children: platformChildrenRoutes
    },
    {
      path: '/login',
      loader: loginLoader,
      element: <Login />
    },
    {
      path: '/register',
      element: <Register />
    }
  ],
  {}
)
export default router
