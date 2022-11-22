import React, { useCallback } from 'react'
import { Divider, Popover, Tooltip } from 'antd'
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { NavLink, Link, useRouteLoaderData, useNavigate } from 'react-router-dom'
import { getLoginState } from '@/lib/request'

export default function Header() {
  const navigate = useNavigate()
  const { userInfo } =
    (useRouteLoaderData('userAuth') as { userInfo: ApiTypes['/api/users/me']['response']['data'] }) || {}
  console.log(userInfo)
  const goLogout = useCallback(() => {
    getLoginState().removeUser()
    navigate('/login')
  }, [navigate])

  return (
    <header className='fixed top-0 left-0 w-full min-w-[835px] bg-white shadow-sm z-[9]'>
      <div className='relative flex items-center justify-between w-full px-[16px] h-header'>
        {/* logo */}
        <div className='flex items-center h-full'>
          <Link to='/' className='w-full h-full'>
            <div className='w-[85px] h-full bg-[length:85px_50px] bg-[url("@/assets/image/logo.png")] bg-no-repeat bg-left'></div>
          </Link>
        </div>
        {/* tabNav TODO */}
        {/* setting and user */}
        <div className='flex items-center'>
          {userInfo.isPlatformAdmin && (
            <NavLink
              to='platformManage/basicInfo'
              className={({ isActive }) => (isActive ? 'active-class-name' : undefined)}
            >
              <Tooltip placement='bottom' title='平台管理'>
                <button className='w-[32px] h-[32px] ml-[8px] rounded-[6px] text-[#878f95] hover:bg-[#e5e6e8] hover:text-[#171a1d] transition-all leading-none'>
                  <SettingOutlined className='text-[20px] align-middle' />
                </button>
              </Tooltip>
            </NavLink>
          )}
          <Popover
            placement='bottomRight'
            content={
              <div className='w-[150px]'>
                <div className='flex items-center'>
                  <span className='w-[36px] h-[36px] bg-[url("@/assets/image/avatar.jpg")] rounded-[6px] align-top inline-block bg-cover'></span>
                  <div className='ml-[8px] text-[16px]'>{userInfo.username}</div>
                </div>
                <Divider className='my-[12px]' />
                <div
                  className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'
                  onClick={goLogout}
                >
                  <LogoutOutlined className='align-middle' />
                  <span className='ml-[6px]'>退出登录</span>
                </div>
              </div>
            }
            trigger='hover'
          >
            <button className='w-[32px] h-[32px] ml-[8px] rounded-[6px] text-[#878f95] hover:bg-[#f1f2f3] transition-all'>
              <span className='w-[24px] h-[24px] bg-[url("@/assets/image/avatar.jpg")] rounded-[6px] align-top inline-block bg-cover'></span>
            </button>
          </Popover>
          <style jsx>{`
            div > :global(.active-class-name > button) {
              background-color: #e5e6e8;
              color: #171a1d;
            }
          `}</style>
        </div>
      </div>
    </header>
  )
}
