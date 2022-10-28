import React from 'react'
import { getLoginState, strapiRequestInstance } from '@/lib/request'
import Login from '@/pages/login'
import Register from '@/pages/register'
import { createBrowserRouter, redirect } from 'react-router-dom'
import RootErrorPage from './errorPage'
import UserAuth from './userAuth'

import userAuthChildrenRoutes from '@/pages/platform/routes'

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
      errorElement: <RootErrorPage />,
      children: [
        {
          path: '/',
          loader: authLoader,
          element: <UserAuth />,
          id: 'userAuth',
          children: userAuthChildrenRoutes
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
      ]
    }
  ],
  {}
)
export default router
