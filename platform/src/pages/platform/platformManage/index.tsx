import { UserOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type
  } as MenuItem
}

const items: MenuItem[] = [
  // getItem(
  //   '基础',
  //   'basic',
  //   null,
  //   [getItem('基本信息', '/platformManage/basicInfo', <SettingOutlined className='!text-[16px]' />)],
  //   'group'
  // ),
  getItem(
    '组织管理',
    'organizationalManagement',
    null,
    [getItem('平台权限管理', '/platformManage/corpManager', <UserOutlined className='!text-[16px]' />)],
    'group'
  )
]

const PlatformManage: React.FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  return (
    <div className='flex'>
      <aside>
        <div className='pt-[16px] pb-[8px] h-full border-r-[1px] border-r-[#f1f2f3]'>
          <Menu
            className='h-full'
            style={{ width: 220 }}
            mode='vertical'
            items={items}
            onClick={onClick}
            selectedKeys={[pathname]}
          />
        </div>
      </aside>
      <section className='flex-auto'>
        <Outlet />
      </section>
      <style jsx>{`
        div {
          height: calc(100vh - theme(height.header));
        }
        div :global(.ant-menu .ant-menu-item-group-title) {
          padding: 0 24px;
          height: 30px;
          line-height: 30px;
          color: #a2a3a5;
          font-size: 14px;
        }
        div :global(.ant-menu-item-group-list .ant-menu-item) {
          padding: 0 8px;
          height: 36px;
          line-height: 36px;
          margin: 4px 16px;
          display: flex;
          align-items: center;
          color: #171a1d;
          font-size: 14px;
          border-radius: 6px;
          font-weight: 400;
        }

        div :global(.ant-menu-item-group-list .ant-menu-item:hover) {
          background: #f1f2f3;
        }
        div :global(.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected) {
          background: #e5e6e8;
          font-weight: 500;
        }
        div :global(.ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left) {
          border: none;
        }
      `}</style>
    </div>
  )
}

export default PlatformManage
