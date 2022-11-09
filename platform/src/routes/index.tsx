import { getLoginState, strapiRequestInstance } from '@/lib/request'
import Login from '@/pages/login'
import Register from '@/pages/register'
import { createBrowserRouter, redirect } from 'react-router-dom'
import RootErrorPage from './errorPage'
import UserAuth from './userAuth'

import platformRoutes from '@/pages/platform/routes'
import projectRoutes from '@/pages/project/routes'

async function authLoader() {
  const TokenUserInfo = getLoginState()
  if (TokenUserInfo.loginToken) {
    let userInfo
    const userInfoFromCookie = TokenUserInfo.userInfo
    if (userInfoFromCookie) {
      userInfo = userInfoFromCookie
    } else {
      try {
        userInfo = await strapiRequestInstance('/api/users/me')
        TokenUserInfo.setUserInfo(userInfo.data)
      } catch (error) {
        console.log(error)
      }
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
          children: [...platformRoutes, ...projectRoutes]
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
