import linkPageImg from '@/assets/image/linkPage.png'
import newPageImg from '@/assets/image/newPage.png'
import { ItemId, TreeData, TreeItem } from '@atlaskit/tree'
import { Card, Col, Row } from 'antd'
import { produce } from 'immer'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AddRoute from './components/addRouteDialog'
import MenuManage from './components/menuManage'

import { useStrapiRequest } from '@/lib/request'
import { useState } from 'react'
import PageView from './components/pageView'
import { getAncestorIds, findFirstPage } from './utils'
import { useMemoizedFn } from 'ahooks'
import useQuery from '@/hooks/useQuery'
import { LatestVersionsContext } from '../projectInfoVersionsContext'

const PageManage: React.FC = () => {
  const [type, setType] = useState<'LOADING' | 'EMPTY' | 'HAVE_DATA'>('LOADING')
  const [open, setOpen] = useState(false)
  const [navType, setNavType] = useState<ApiProjectRouteType>('NAV')
  const query = useQuery()

  const { id, routeId } = useParams()
  const navigate = useNavigate()

  const [tree, setTree] = useState<TreeData>()
  const [prodTreeData, setProdTreeData] = useState<TreeData>()

  const [activeNav, setActiveNav] = useState<TreeItem>()

  const [activeTab, setActiveTab] = useState<'prod' | 'dev' | undefined>('dev')

  const jump = useCallback(
    (path) => {
      if (path === '' && routeId === 'empty') {
        return
      }

      navigate(`/${id}/admin/${path}`, { replace: true })
    },
    [id, navigate, routeId]
  )

  const [originalLatestVersion] = useContext(LatestVersionsContext)

  const latestVersion = useMemo(() => {
    return originalLatestVersion === 'NO_DATA' ? null : originalLatestVersion
  }, [originalLatestVersion])

  const handleDevTreeAndRouteId = useCallback(
    (tree: TreeData) => {
      if (Object.keys(tree.items).length === 1) {
        // 当前dev路由菜单已全部删除
        if (originalLatestVersion === 'NO_DATA') {
          setType('EMPTY')
          jump('empty?tab=prod')
        } else {
          setActiveTab('prod')
          jump(routeId + '?tab=prod')
        }
        return
      }
      let currentNav = tree?.items?.[routeId as ItemId] as TreeItem | undefined
      if (!currentNav || currentNav.data.type === 'NAV') {
        // 去第一个页面
        currentNav = findFirstPage(tree)
        if (currentNav && currentNav.data.type !== 'NAV') {
          jump(currentNav!.id + '?tab=dev')
        }
      }
      if (currentNav && currentNav.data.type !== 'NAV') {
        // 找到对应页面
        setActiveNav(currentNav)
        if (routeId !== currentNav.id) {
          jump(currentNav.id + '?tab=dev')
        }
        const uuidPath = getAncestorIds(tree!.items, [currentNav!.id]).slice(1)
        setTree(
          produce((draft) => {
            for (const item of Object.values(draft?.items ?? {})) {
              if (uuidPath.includes(item.id)) {
                item.isExpanded = true
              }
            }
          })
        )
        setType('HAVE_DATA')
      } else {
        // 跳转到 EMPTY
        setType('EMPTY')
      }
    },
    [jump, routeId, originalLatestVersion]
  )

  const { runAsync: getNavListApi } = useStrapiRequest(
    '/api/project-routes',
    () => ({
      payload: {
        projectId: id!
      }
    }),
    {
      refreshDeps: [id],
      onSuccess(res) {
        if (res) {
          if (tree) {
            // 以前展开的分组需要继续展开
            for (const [uuid, item] of Object.entries(res?.data?.items ?? {})) {
              const preItem = tree?.items?.[uuid]
              if (preItem) {
                item.isExpanded = preItem.isExpanded
              }
            }
          }
          setTree(res.data as TreeData)
          if (query.get('tab') !== 'prod' && (!tree || (tree && routeId && !(res.data as TreeData).items[routeId]))) {
            handleDevTreeAndRouteId(res.data as TreeData)
          }
        } else {
          setType('EMPTY')
        }
        return res
      },
      onError() {
        setType('EMPTY')
      }
    }
  )

  const handleProdTree = useMemoizedFn(() => {
    if (query && query.get('tab') === 'prod' && latestVersion && routeId) {
      let currentNav = latestVersion.navList.items[routeId] as TreeItem | undefined
      if (!currentNav || currentNav.data.type === 'NAV') {
        // 去第一个页面
        currentNav = findFirstPage(latestVersion.navList as TreeData)
        if (currentNav && currentNav.data.type !== 'NAV') {
          jump(currentNav!.id + '?tab=prod')
        }
      }
      if (currentNav && currentNav.data.type !== 'NAV') {
        // 找到对应页面
        setActiveNav(currentNav as TreeItem)
        setType('HAVE_DATA')
        const uuidPath = getAncestorIds(latestVersion.navList.items as Record<ItemId, TreeItem>, [
          currentNav!.id
        ]).slice(1)
        setProdTreeData(
          produce((draft) => {
            for (const item of Object.values(draft?.items ?? {})) {
              if (uuidPath.includes(item.id)) {
                item.isExpanded = true
              }
            }
          })
        )
      } else {
        if (tree && Object.keys(tree.items).length > 1) {
          handleDevTreeAndRouteId(tree)
          jump(routeId + '?tab=dev')
          setActiveTab('dev')
        } else {
          setType('EMPTY')
        }
      }
    }
  })

  useEffect(() => {
    if (latestVersion) {
      setProdTreeData(latestVersion.navList as TreeData)
    }
  }, [latestVersion])

  useEffect(() => {
    if (!activeNav) {
      handleProdTree()
    }
  }, [handleProdTree, query, latestVersion, activeNav, routeId])

  const checkOriginalLatestVersion = useMemoizedFn(() => {
    if (query.get('tab') === 'prod' && originalLatestVersion === 'NO_DATA') {
      setActiveTab('dev')
      if (tree) {
        if (Object.keys(tree?.items).length > 1) {
          jump(routeId + '?tab=dev')
          handleDevTreeAndRouteId(tree)
        } else {
          jump('empty' + '?tab=dev')
          setType('EMPTY')
        }
      }
    }
  })

  useEffect(() => {
    checkOriginalLatestVersion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalLatestVersion, query])

  const createSuccessCallback = useCallback(
    (val) => {
      const navUuid = val?.data?.navUuid
      getNavListApi().then((res) => {
        const nav = res?.data?.items?.[navUuid]
        if (navUuid && nav && nav.data.type !== 'NAV') {
          jump(navUuid + '?tab=dev')
          setActiveTab('dev')
          setActiveNav(nav as TreeItem)
        }
      })
    },
    [getNavListApi, jump]
  )

  return (
    <>
      {type === 'EMPTY' ? (
        <div className='p-[16px] bg-[#f1f2f3] h-[calc(100vh-theme(height.header))]'>
          <div className='text-[24px] text-[#171a1d] leading-[36px] pt-[60px] text-center'>
            从创建第一个页面开始，构建应用
          </div>
          <div className='w-[95%] max-w-[930px] mx-auto my-[30px]'>
            <Row className='' gutter={24}>
              <Col span='12'>
                <Card
                  hoverable
                  className='flex flex-col justify-center text-center h-[200px]'
                  bodyStyle={{ padding: 0 }}
                  onClick={() => {
                    setNavType('PAGE')
                    setOpen(true)
                  }}
                >
                  <img alt='customPage' src={newPageImg} className='w-[72px] mx-auto' />
                  <div className='text-[18px] text-[#171a1d] mt-[20px]'>新建页面</div>
                  <div className='text-[14px] text-[#a2a3a5] leading-[21px] mt-[8px]'>可视化搭建页面</div>
                </Card>
              </Col>
              <Col span='12'>
                <Card
                  hoverable
                  className='flex flex-col justify-center text-center h-[200px]'
                  bodyStyle={{ padding: 0 }}
                  onClick={() => {
                    setNavType('LINK')
                    setOpen(true)
                  }}
                >
                  <img alt='customPage' src={linkPageImg} className='w-[72px] mx-auto' />
                  <div className='text-[18px] text-[#171a1d] mt-[20px]'>添加外部链接</div>
                  <div className='text-[14px] text-[#a2a3a5] leading-[21px] mt-[8px]'>从本站点链接到外部</div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      ) : type === 'HAVE_DATA' ? (
        <div className='flex bg-[#f1f2f3] h-[calc(100vh-theme(height.header))]'>
          <div className=' bg-c_white flex-[0_1_220px] border-r-[1px] border-[#f1f2f3] p-[16px_0_8px] h-full overflow-hidden'>
            <MenuManage
              tree={tree}
              setTree={setTree}
              prodTreeData={prodTreeData}
              setProdTreeData={setProdTreeData}
              getNavListApi={getNavListApi}
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setOpen={setOpen}
              setNavType={setNavType}
            />
          </div>
          <PageView activeNav={activeNav} setActiveNav={setActiveNav} tree={tree} />
        </div>
      ) : (
        <></>
      )}
      <AddRoute open={open} setOpen={setOpen} type={navType} onOk={createSuccessCallback} tree={tree} />
    </>
  )
}

export default PageManage
