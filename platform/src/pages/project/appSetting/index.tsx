import { TeamOutlined, SettingOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import React, { useCallback, useMemo } from 'react'
import { Outlet, useLocation, useNavigate, useRouteLoaderData } from 'react-router-dom'

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
  getItem('基础设置', '/\\d+/admin/appSetting/basicSetting', <SettingOutlined className='!text-[16px]' />),
  getItem('应用权限', '/\\d+/admin/appSetting/applyPermission', <TeamOutlined className='!text-[16px]' />)
]

const PlatformManage: React.FC = () => {
  const { projectInfo } = (useRouteLoaderData('project') as { projectInfo: ApiProjectsIdResponse['data'] }) || {}
  const { pathname } = useLocation()

  const navigate = useNavigate()

  const activeKey = useMemo(() => {
    for (const tab of items) {
      const result = pathname.match(new RegExp(tab!.key as string))
      if (result) {
        return tab!.key
      }
    }
  }, [pathname])

  const jumpRoute = useCallback(
    (e) => {
      const item = items.find((tab) => tab!.key === e.key)!
      navigate((item.key as string).replace('\\d+', projectInfo.id + ''))
    },
    [navigate, projectInfo.id]
  )

  return (
    <div className='flex h-[calc(100vh-theme(height.header))]'>
      <aside>
        <div className='pt-[16px] pb-[8px] h-full border-r-[1px] border-r-[#f1f2f3]'>
          <Menu
            className='h-full'
            style={{ width: 220 }}
            mode='vertical'
            items={items}
            onClick={jumpRoute}
            selectedKeys={[activeKey as string]}
          />
        </div>
      </aside>
      <section className='flex-auto bg-[#f1f2f3] p-[16px] overflow-y-auto'>
        <Outlet />
      </section>
      <style jsx>{`
        div :global(.ant-menu-item) {
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

        div :global(.ant-menu-item:hover) {
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
