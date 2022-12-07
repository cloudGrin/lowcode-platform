import { useStrapiRequest } from '@/lib/request'
import { FC, useCallback, useEffect, useState } from 'react'
import { Outlet, useLoaderData, useNavigate, useParams } from 'react-router-dom'

import { DesktopOutlined, FileOutlined, PieChartOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
import { Breadcrumb, Layout, Menu, MenuProps, Spin } from 'antd'
import { ItemId, TreeData, TreeItem } from '@atlaskit/tree'
import { findFirstPage, getAncestorIds } from '@/pages/project/pageManage/utils'

const { Content, Footer, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem
}

function generateMenu(tree: TreeData): MenuItem[] {
  const arr: MenuItem[] = []
  for (const uuid of tree.items?.[tree.rootId]?.children ?? []) {
    const item = tree.items[uuid]
    if (item && item.data.type !== 'NAV') {
      arr.push(getItem(item.data.title, item.data.navUuid))
    } else if (item && !!item.children?.length) {
      const result = generateMenu({
        rootId: item.id,
        items: tree.items
      })
      arr.push(getItem(item.data.title, item.data.navUuid, undefined, result))
    }
  }
  return arr
}

const AppPreview: FC = () => {
  const { projectInfo } = useLoaderData() as any
  const [items, setItems] = useState<MenuItem[]>([])
  const navigate = useNavigate()
  const { navUuid } = useParams()
  const [currentNav, setCurrentNav] = useState<TreeItem>()
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [navStatus, setNavStatus] = useState<'LOADING' | 'PAGE' | 'NO_PAGE'>('LOADING')

  const { data: routesResult, loading } = useStrapiRequest(
    '/api/project-routes',
    () => ({
      payload: {
        projectId: projectInfo.id
      }
    }),
    {
      refreshDeps: [projectInfo],
      onSuccess(res) {
        setItems(generateMenu(res.data as TreeData))
        // 有navUuid则选中对应的页面
        // 无则选中第一个PAGE，如果没有则修改navStatus为'NO_PAGE'
        const current: TreeItem = res.data.items?.[navUuid!] as TreeItem
        if (!current) {
          const firstPage = findFirstPage(res.data as TreeData)
          if (!firstPage) {
            setCurrentNav(undefined)
            setNavStatus('NO_PAGE')
            return
          } else {
            setNav(firstPage)
            navigate(firstPage.id as string)
            return
          }
        }
        setNav(current)
      }
    }
  )

  const setNav = useCallback(
    (nav) => {
      setCurrentNav(nav)
      setNavStatus('PAGE')
      // 选中PAGE后则将其父级的组展开
      const uuidPath = getAncestorIds(routesResult!.data.items as Record<ItemId, TreeItem>, [nav.id]).slice(1)
      setOpenKeys(uuidPath as string[])
    },
    [routesResult]
  )

  const clickMenu: MenuProps['onClick'] = (e) => {
    const nav = routesResult?.data.items[e.key]
    const type = nav!.data.type
    if (type === 'LINK') {
      if (nav!.data.isNewPage) {
        window.open(nav!.data.url)
      } else {
        location.href = nav!.data.url!
      }
    } else if (type === 'PAGE') {
      setCurrentNav(nav as TreeItem)
      setNavStatus('PAGE')
      navigate(e.key)
    }
  }

  return (
    <Spin spinning={loading}>
      <Layout className='min-h-[100vh]'>
        <Sider theme='light'>
          <div className=' text-[14px] h-[61px] pl-[20px] flex items-center border-b-[1px] border-c_line_2'>
            {projectInfo.name}
          </div>
          <Menu
            theme='light'
            defaultSelectedKeys={['1']}
            mode='inline'
            items={items}
            onClick={clickMenu}
            selectedKeys={currentNav ? [currentNav.id as string] : []}
            openKeys={openKeys}
          />
        </Sider>
        <Layout className='site-layout p-[16px_16px_0_16px]'>
          <Content className='relative bg-c_white'>
            {navStatus === 'LOADING' ? (
              <Spin className='absolute top-[30%] left-[50%] -translate-x-[50%]' />
            ) : navStatus === 'PAGE' && currentNav ? (
              <Outlet context={[currentNav]} key={currentNav!.id} />
            ) : null}
          </Content>
          <Footer style={{ textAlign: 'center' }}>Copyright © 2022 Powered by 乐搭 | Author cloudGrin</Footer>
        </Layout>
      </Layout>
    </Spin>
  )
}

export default AppPreview
