import Icon from '@/components/icon'
import useQuery from '@/hooks/useQuery'
import { strapiRequestInstance } from '@/lib/request'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import type {
  ItemId,
  RenderItemParams,
  TreeData,
  TreeDestinationPosition,
  TreeItem,
  TreeSourcePosition
} from '@atlaskit/tree'
import { moveItemOnTree, mutateTree } from '@atlaskit/tree'
import { useMemoizedFn } from 'ahooks'
import { Button, Divider, Form, Input, message, Modal, Popover, Tabs } from 'antd'
import classNames from 'classnames'
import produce from 'immer'
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LatestVersionsContext } from '../../projectInfoVersionsContext'
import { getAncestorIds } from '../utils'
import TreeWrapper from './treeWrapper'

function removeRouteApi({ uuid, successCb }: { uuid: ItemId; successCb?: () => void }) {
  return new Promise((resolve) => {
    Modal.confirm({
      width: 350,
      title: <span className='text-[16px] font-normal'>确定要删除吗？</span>,
      onOk: () => {
        strapiRequestInstance(
          '/api/project-routes/deleteByUuid__DELETE',
          {
            navUuid: uuid as string
          },
          {}
        )
          .then((res) => {
            if (res.data.success) {
              message.success('删除成功')
              resolve('')
              successCb && successCb()
            }
          })
          .catch((error) => {
            console.log(error)
          })
      }
    })
  })
}

const PureTreeFc: React.FC<{
  tree?: TreeData
  setTree: React.Dispatch<React.SetStateAction<TreeData | undefined>>
  getNavListApi: () => Promise<ApiProjectRoutesResponse>
  activeNav?: TreeItem
  setActiveNav: React.Dispatch<React.SetStateAction<TreeItem | undefined>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setNavType: React.Dispatch<React.SetStateAction<ApiProjectRouteType>>
}> = ({ tree, setTree, getNavListApi, activeNav, setActiveNav, setOpen, setNavType }) => {
  const [activeTab, setActiveTab] = useState<'prod' | 'dev'>('dev')
  const [tabs, setTabs] = useState([
    {
      label: '开发中',
      key: 'dev'
    }
  ])
  const [prodTreeData, setProdTreeData] = useState<TreeData>()
  const [changeTitleId, setChangeTitleId] = useState()
  const { id, routeId } = useParams()
  const navigate = useNavigate()
  const query = useQuery()
  const [latestVersion] = useContext(LatestVersionsContext)
  const activeTree = useMemo(() => {
    return activeTab === 'dev' ? tree : prodTreeData
  }, [activeTab, prodTreeData, tree])

  const onExpand = useMemoizedFn((itemId: ItemId) => {
    if (activeTab === 'dev') {
      setTree(mutateTree(tree!, itemId, { isExpanded: true }))
    } else {
      setProdTreeData(mutateTree(prodTreeData!, itemId, { isExpanded: true }))
    }
  })

  const onCollapse = useMemoizedFn((itemId: ItemId) => {
    if (activeTab === 'dev') {
      setTree(mutateTree(tree!, itemId, { isExpanded: false }))
    } else {
      setProdTreeData(mutateTree(prodTreeData!, itemId, { isExpanded: false }))
    }
  })

  const onDragEnd = useMemoizedFn((source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
    if (!destination) {
      return
    }
    if (tree!.items[destination.parentId].data.type !== 'NAV') {
      // 不支持页面被当做分组
      return
    }
    // const ancestorDepth = getAncestorIds(tree.items, [destination.parentId])?.length - 1
    const newTree = moveItemOnTree(tree!, source, destination)
    const flattenedTree = flattenTree(tree!)
    const flattenedNewTree = flattenTree(newTree)
    if (!checkEqual(flattenedTree, flattenedNewTree)) {
      if (isDragLegal(flattenedNewTree)) {
        if (newTree.items[destination.parentId].data.type === 'NAV') {
          // 放置后打开父组
          newTree.items[destination.parentId].isExpanded = true
        }
        setTree(newTree)
        strapiRequestInstance(
          '/api/project-routes/updateOrder__POST',
          {
            currentId: tree!.items[tree!.items[source.parentId].children[source.index]].data.id,
            parentNavUuid: destination.parentId as string,
            ids: flattenedNewTree.map((i) => i.item.data.id)
          },
          {}
        )
          .then((res) => {
            if (res.data.success) {
              message.info('移动成功')
              getNavListApi()
            } else {
              setTree(tree)
            }
          })
          .catch((error) => {
            console.log(error)
            setTree(tree)
          })
      } else {
        message.error('暂不支持三层嵌套分组')
      }
    }
  })

  const removeRoute = useMemoizedFn((item: TreeItem) => {
    if (!item.children?.length) {
      removeRouteApi({
        uuid: item.id,
        successCb() {
          getNavListApi()
        }
      })
    } else {
      message.error('分组不为空不可删除，如需删除请先移出子集')
    }
  })

  const changeTitle = useMemoizedFn((values: { title: string }, item: TreeItem) => {
    strapiRequestInstance('/api/project-routes/${id}__PUT', { title: values.title }, { urlValue: { id: item.data.id } })
      .then((res) => {
        if (res.data) {
          message.success('修改成功')
          setChangeTitleId(undefined)
          getNavListApi()
        }
      })
      .catch((error) => {
        console.log(error)
      })
  })

  const clickNav = useMemoizedFn((item: TreeItem, onExpand, onCollapse) => {
    if (item.data.type === 'NAV') {
      item.isExpanded ? onCollapse(item.id) : onExpand(item.id)
    } else {
      if (item.id !== activeNav?.id || query.get('tab') !== activeTab) {
        navigate(`/${id}/admin/${item.id}?tab=${activeTab}`)
        setActiveNav(item)
      }
    }
  })

  const renderItem = useCallback(
    ({ item, onExpand, onCollapse, provided, snapshot }: RenderItemParams) => {
      return (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={classNames(
            'flex items-center h-[40px] hover:bg-[#f1f2f3] rounded-[6px] mb-[4px]',
            snapshot.isDragging ? ['bg-[#f1f2f3e6]'] : undefined,
            activeNav && activeNav.id === item.id && query.get('tab') === activeTab ? ['bg-[#f1f2f3]'] : undefined
          )}
          onClick={() => {
            clickNav(item, onExpand, onCollapse)
          }}
        >
          {item.data.type === 'NAV' ? (
            item.isExpanded ? (
              <Icon name='folder-open-outline' className='w-[14px] h-[14px] text-[#0089ff] ml-[8px] flex-none' />
            ) : item.hasChildren ? (
              <Icon name='folder-have-file' className='w-[15px] h-[15px] text-[#0089ff] ml-[8px] -mr-[1px] flex-none' />
            ) : (
              <Icon name='folder' className='w-[14px] h-[14px] text-[#0089ff] ml-[8px] flex-none' />
            )
          ) : item.data.type === 'LINK' ? (
            <Icon name='link' className='w-[14px] h-[14px] ml-[8px] flex-none' />
          ) : (
            <Icon name='web-page' className='w-[14px] h-[14px] text-[#ffb626] ml-[8px] flex-none' />
          )}
          <div className='flex items-center flex-auto ml-[8px] min-w-0 content'>
            <Popover
              content={
                <Form
                  layout='vertical'
                  className='w-[200px]'
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onFinish={(values) => changeTitle(values, item)}
                >
                  <Form.Item
                    name='title'
                    label={item.data.type === 'NAV' ? '分组名称' : '页面名称'}
                    initialValue={item.data.title}
                    rules={[{ required: true, message: '必填字段' }]}
                    className='mb-[6px]'
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item className='flex items-center justify-end mb-0'>
                    <Button
                      size='small'
                      onClick={() => {
                        setChangeTitleId(undefined)
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size='small'
                      // loading={loading}
                      type='primary'
                      htmlType='submit'
                      className='ml-[10px]'
                    >
                      确认
                    </Button>
                  </Form.Item>
                </Form>
              }
              placement='bottomLeft'
              open={changeTitleId === item.data.id}
              // defaultOpen
            >
              <div className='text-[14px] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-auto'>
                {item.data ? item.data.title : ''}
              </div>
            </Popover>
            <div
              className={classNames(
                'px-[2px] flex-none pr-[10px] actions hidden',
                activeTab === 'dev' ? 'hidden' : '!hidden'
              )}
            >
              <Popover
                placement='bottomRight'
                content={
                  <div
                    className='w-[70px]'
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <div
                      className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[24px] transition-all mb-[10px]'
                      onClick={() => {
                        setChangeTitleId(item.data.id)
                      }}
                    >
                      <span className='ml-[6px]'>修改名称</span>
                    </div>
                    <Divider className='my-[12px]' />
                    <div
                      className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[24px] transition-all'
                      onClick={() => {
                        removeRoute(item)
                      }}
                    >
                      <span className='ml-[6px] text-c_error'>删除</span>
                    </div>
                  </div>
                }
                trigger='hover'
              >
                <button
                  className='w-[24px] h-[24px] rounded-[6px] text-[#878f95] hover:bg-[#e5e6e8] hover:text-[#171a1d] transition-all'
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <SettingOutlined className='text-[14px] align-middle text-[#878f95]' />
                </button>
              </Popover>
            </div>
            <style jsx>{`
              .content:hover > .actions {
                display: block;
              }
            `}</style>
          </div>
        </div>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNav, activeTab, changeTitleId, query]
  )

  const changeTab = useCallback(
    (val) => {
      setActiveTab(val)
    },
    [setActiveTab]
  )

  const checkActiveTab = useMemoizedFn((query) => {
    const queryTab = query.get('tab') as 'dev' | 'prod'
    if (queryTab !== activeTab && ['dev', 'prod'].includes(queryTab)) {
      setActiveTab(queryTab)
    }
  })

  useEffect(() => {
    setTabs([
      ...(latestVersion
        ? [
            {
              label: `版本(${latestVersion.version})`,
              key: 'prod'
            }
          ]
        : []),
      {
        label: '开发中',
        key: 'dev'
      }
    ])
    if (latestVersion) {
      setProdTreeData(latestVersion.navList as TreeData)
    }
  }, [latestVersion])

  useEffect(() => {
    checkActiveTab(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const checkActiveNavByUuid = useMemoizedFn((routeId) => {
    if (routeId !== activeNav?.id) {
      const uuidToItem = activeTree?.items?.[routeId]
      if (uuidToItem) {
        setActiveNav(uuidToItem)
        // 如果分组关闭则打开该分组
        const uuidPath = getAncestorIds(activeTree!.items, [uuidToItem.id]).slice(1)
        for (let i = uuidPath.length - 1; i >= 0; i--) {
          if (activeTree?.items?.[uuidPath[i]].isExpanded) {
            uuidPath.splice(i, 1)
          }
        }
        if (!!uuidPath.length) {
          if (activeTab === 'dev') {
            setTree(
              produce((draft) => {
                for (const item of Object.values(draft?.items ?? {})) {
                  if (uuidPath.includes(item.id)) {
                    item.isExpanded = true
                  }
                }
              })
            )
          } else if (activeTab === 'prod') {
            setProdTreeData(
              produce((draft) => {
                for (const item of Object.values(draft?.items ?? {})) {
                  if (uuidPath.includes(item.id)) {
                    item.isExpanded = true
                  }
                }
              })
            )
          }
        }
      }
    }
  })

  useEffect(() => {
    checkActiveNavByUuid(routeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  return (
    <div className='flex flex-col w-full h-full'>
      <div className='h-[32px] flex-none px-[19px] flex items-center justify-between bg-c_white'>
        <Tabs className='' activeKey={activeTab} centered items={tabs} onChange={changeTab} />
        <Popover
          placement='topRight'
          content={
            <div className='w-[120px]'>
              <div
                onClick={() => {
                  setActiveTab('dev')
                  setNavType('PAGE')
                  setOpen(true)
                }}
                className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all mb-[10px]'
              >
                <Icon name='web-page' className='w-[16px] h-[16px] text-[#ffb626]' />
                <span className='ml-[6px]'>新建页面</span>
              </div>
              <div
                onClick={() => {
                  setActiveTab('dev')
                  setNavType('LINK')
                  setOpen(true)
                }}
                className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'
              >
                <Icon name='link' className='w-[16px] h-[16px]' />
                <span className='ml-[6px]'>新增外部链接</span>
              </div>
              <Divider className='my-[12px]' />
              <div
                onClick={() => {
                  setActiveTab('dev')
                  setNavType('NAV')
                  setOpen(true)
                }}
                className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'
              >
                <Icon name='folder-open-fill' className='w-[16px] h-[16px] text-[#0089ff]' />
                <span className='ml-[6px]'>新建分组</span>
              </div>
            </div>
          }
          trigger='hover'
        >
          <div className='w-[32px] h-[32px] bg-[#0089ff] rounded-[6px] justify-center flex items-center cursor-pointer'>
            <PlusOutlined className='text-[16px] text-white' />
          </div>
        </Popover>
        <style jsx>{`
          div :global(.ant-tabs-nav) {
            margin-bottom: 0;
            height: 100%;
          }
          div :global(.ant-tabs-content-holder) {
            display: none;
          }
          div :global(.ant-tabs-top > .ant-tabs-nav::before) {
            border-bottom: none;
          }

          div :global(.ant-tabs-nav) {
            margin-bottom: 0;
            padding: 0;
          }
          div :global(.ant-tabs-tab) {
            font-size: 12px;
            padding: 8px;
          }
          div :global(.ant-tabs-tab .ant-tabs-tab-btn) {
            color: #747677;
            font-weight: 400;
          }
          div :global(.ant-tabs-tab + .ant-tabs-tab) {
            margin: 0 0 0 6px;
          }
          div :global(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
            color: #171a1d;
          }
        `}</style>
      </div>
      <div className='p-[8px_19px] flex-auto overflow-y-auto mr-[-10px] tree-wrap'>
        <TreeWrapper
          activeTree={activeTree}
          renderItem={renderItem}
          onExpand={onExpand}
          onCollapse={onCollapse}
          onDragEnd={onDragEnd}
          isDragEnabled={activeTab === 'dev'}
        />

        <style jsx>{`
          .tree-wrap > :global(div) {
            height: 100%;
          }
        `}</style>
      </div>
    </div>
  )
}

type FlattenTree = { item: TreeItem; path: number[] }[]

function flattenTree(tree: TreeData, path: number[] = []): FlattenTree {
  return tree.items[tree.rootId]
    ? tree.items[tree.rootId].children.reduce((accum, itemId, index) => {
        // iterating through all the children on the given level
        const item = tree.items[itemId]
        const currentPath = [...path, index] // we create a flattened item for the current item

        const currentItem = {
          item,
          path: currentPath
        } // we flatten its children

        const children = flattenTree(
          {
            rootId: item.id,
            items: tree.items
          },
          currentPath
        ) // append to the accumulator

        return [...accum, currentItem, ...children]
      }, [] as FlattenTree)
    : []
}

function isDragLegal(flattenedTree: FlattenTree) {
  for (const { item, path } of flattenedTree) {
    if (path.length >= 4) {
      return false
    }
    if (path.length === 3 && item.data.type === 'NAV') {
      return false
    }
  }
  return true
}

function checkEqual(prev: FlattenTree, next: FlattenTree): boolean {
  for (let i = 0, length = prev.length; i < length; i++) {
    if (prev[i].item.id !== next[i].item.id) {
      return false
    } else if (prev[i].path.join('--') !== next[i].path.join('--')) {
      return false
    }
  }

  return true
}

export default memo(PureTreeFc)
