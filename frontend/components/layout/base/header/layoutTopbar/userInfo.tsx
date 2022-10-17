import { Popover } from 'antd'
import { userInfoAtom } from '@/atoms/user'
import ClientOnly from '@/components/common/clientOnly'
import { useAtomValue } from 'jotai/utils'
import React, { useMemo } from 'react'
import ArrowDownSvg from '@/assets/icons/arrow-down.svg?sprite'
import { useMemoizedFn } from 'ahooks'
import { getLoginState } from '@/lib/request/utils'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function UserInfo() {
  const userInfo = useAtomValue(userInfoAtom)
  const router = useRouter()
  const goLogout = useMemoizedFn(() => {
    getLoginState().removeUser()
    router.push('/login')
  })

  const UserContent = useMemo(() => {
    return (
      <div>
        <div className='flex items-center'>
          <div className='text-xs text-c_level_3'>{userInfo?.email}</div>
          <div className='ml-1.5 cursor-pointer text-xs pointer text-c_level_3 hover:text-c_primary' onClick={goLogout}>
            退出
          </div>
        </div>
      </div>
    )
  }, [userInfo])

  return (
    <ClientOnly>
      {userInfo ? (
        <Popover placement='bottomLeft' content={UserContent}>
          <div className='flex items-center ml-2.5 cursor-pointer pointer text-c_level_3 hover:text-c_primary'>
            <span className='mr-1.5'>{userInfo?.username}</span>
            <ArrowDownSvg width='12px' height='12px' />
          </div>
        </Popover>
      ) : (
        <div className='flex items-center'>
          <Link href='/login'>
            <a className='ml-1.5 text-c_primary'>请登录</a>
          </Link>
          <Link href='/register'>
            <a className='ml-1.5 text-c_primary'>去注册</a>
          </Link>
        </div>
      )}
    </ClientOnly>
  )
}
