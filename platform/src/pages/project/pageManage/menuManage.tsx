import Icon from '@/components/icon'
import { strapiRequestInstance, useStrapiRequest } from '@/lib/request'
import { PlusOutlined, SettingOutlined } from '@ant-design/icons'
import type {
  ItemId,
  RenderItemParams,
  TreeData,
  TreeDestinationPosition,
  TreeItem,
  TreeSourcePosition
} from '@atlaskit/tree'
import Tree, { moveItemOnTree, mutateTree } from '@atlaskit/tree'
import { Button, Divider, Form, Input, message, Modal, Popover } from 'antd'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PADDING_PER_LEVEL = 22

function removeRouteApi({ uuid, successCb }: { uuid: ItemId; successCb?: () => void }) {
  return new Promise((resolve) => {
    Modal.confirm({
      width: 350,
      title: <span className='text-[16px] font-normal'>确定要删除吗？</span>,
      onOk: () => {
        strapiRequestInstance('/api/project-routes/${uuid}__DELETE', {
          urlValue: {
            uuid
          }
        })
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
  setActiveNav: React.Dispatch<React.SetStateAction<TreeItem | undefined>>
  getNavListApi: () => Promise<ApiProjectRoutesResponse>
  activeNav?: TreeItem
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setNavType: React.Dispatch<React.SetStateAction<ApiProjectRouteType>>
}> = ({ tree, setTree, getNavListApi, activeNav, setActiveNav, setOpen, setNavType }) => {
  const { id } = useParams()
  const navigate = useNavigate()

  const onExpand = useCallback(
    (itemId: ItemId) => {
      setTree(mutateTree(tree!, itemId, { isExpanded: true }))
    },
    [setTree, tree]
  )

  const onCollapse = useCallback(
    (itemId: ItemId) => {
      setTree(mutateTree(tree!, itemId, { isExpanded: false }))
    },
    [setTree, tree]
  )

  const onDragEnd = useCallback(
    (source: TreeSourcePosition, destination?: TreeDestinationPosition) => {
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
    },
    [getNavListApi, tree]
  )

  const [changeTitleId, setChangeTitleId] = useState()

  const removeRoute = useCallback(
    (item: TreeItem) => {
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
    },
    [getNavListApi]
  )

  const changeTitle = useCallback(
    (values: { title: string }, item: TreeItem) => {
      strapiRequestInstance(
        '/api/project-routes/${id}__PUT',
        { title: values.title },
        { urlValue: { id: item.data.id } }
      )
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
    },
    [getNavListApi]
  )

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
            activeNav && activeNav.id === item.id ? ['bg-[#f1f2f3]'] : undefined
          )}
          onClick={() => {
            if (item.data.type === 'NAV') {
              item.isExpanded ? onCollapse(item.id) : onExpand(item.id)
            } else {
              if (item.id !== activeNav?.id) {
                navigate(`/${id}/admin/${item.id}`)
                setActiveNav(item)
              }
            }
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
            <div className='px-[2px] flex-none pr-[10px] actions hidden'>
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
    [activeNav, changeTitleId, navigate, id, setActiveNav, changeTitle, removeRoute]
  )

  return (
    <div className='flex flex-col w-full h-full'>
      <div className='p-[8px_19px] flex-auto overflow-y-auto mr-[-10px] tree-wrap'>
        {tree && (
          <Tree
            tree={tree}
            renderItem={renderItem}
            onExpand={onExpand}
            onCollapse={onCollapse}
            onDragEnd={onDragEnd}
            offsetPerLevel={PADDING_PER_LEVEL}
            isDragEnabled
            isNestingEnabled
          />
        )}
        <style jsx>{`
          .tree-wrap > :global(div) {
            height: 100%;
          }
        `}</style>
      </div>
      <div className='h-[32px] flex-none px-[19px] flex items-center py-[30px] bg-c_white'>
        <Popover
          placement='topRight'
          content={
            <div className='w-[120px]'>
              <div
                onClick={() => {
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
          <div className='w-full h-[32px] bg-[#5caef5] rounded-[6px] justify-center flex items-center cursor-pointer'>
            <span className='text-c_white text-[14px]'>添加路由</span>
            <PlusOutlined className='text-[16px] text-white ml-[10px]' />
          </div>
        </Popover>
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

export default PureTreeFc
