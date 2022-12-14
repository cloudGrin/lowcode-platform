import Icon from '@/components/icon'
import { strapiRequestInstance } from '@/lib/request'
import { useMemoizedFn, usePagination } from 'ahooks'
import { Drawer, List, message, Modal, Tag, Tooltip } from 'antd'
import classNames from 'classnames'
import dayjs from 'dayjs'
import VirtualList from 'rc-virtual-list'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { project } from '@alilc/lowcode-engine'

const SelectPeopleDialog: React.FC<{
  navUuid: string
  open: boolean
  setOpen: (val: boolean) => void
  onOk: (version: any) => void
  cloudVersion: ApiPageVersionsLatestResponse['data'] | null
  localVersion: {
    currentCloudVersion: number
    schema: ApiPageVersionsLatestResponse['data']['schema']
    createdAt: number
  } | null
}> = ({ navUuid, open, setOpen, onOk, cloudVersion, localVersion }) => {
  const [data, setData] = useState<ApiPageVersionsResponse['data']>([])
  const [containerHeight, setContainerHeight] = useState(100)
  const listWrapper = useRef<HTMLDivElement>(null)
  const [currentVersionId, setCurrentVersionId] = useState<number>()

  const getVersionsApi = useCallback(
    async ({ current, pageSize }: { current: number; pageSize: number }) => {
      const result = await strapiRequestInstance(
        '/api/page-versions',
        {
          navUuid,
          pagination: {
            page: current,
            pageSize: pageSize
          }
        },
        {}
      )
      return {
        list: result.data,
        total: result.meta.pagination.total
      }
    },
    [navUuid]
  )

  const {
    loading: versionLoading,
    pagination: versionPagination,
    runAsync
  } = usePagination(getVersionsApi, {
    defaultPageSize: 10,
    manual: true
  })

  const loadMoreData = useMemoizedFn(() => {
    if (versionLoading || data.length >= versionPagination.total) {
      return
    }

    runAsync({
      current: versionPagination.current + 1,
      pageSize: versionPagination.pageSize
    }).then((body) => {
      setData([...data, ...body.list])
    })
  })

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement, UIEvent>) => {
      if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === containerHeight) {
        loadMoreData()
      }
    },
    [containerHeight, loadMoreData]
  )

  const rollback = useCallback(
    (item: any) => {
      // Modal.confirm({
      //   title: <span className='text-[18px] leading-[22px]'>你确定要回滚该版本吗？</span>,
      //   onOk() {
      //     onOk(item)
      //   }
      // })
      message.info('开发中')
    },
    [onOk]
  )

  const formatData = useMemo(() => {
    if (localVersion) {
      // 本地存在版本
      const idx = data.findIndex((i) => i.id === localVersion.currentCloudVersion)
      if (idx >= 0) {
        const copy = [...data] as any[]
        copy.splice(idx, 0, {
          schema: localVersion?.schema,
          isCurrentVersion: true,
          type: 'local',
          createdAt: localVersion.createdAt,
          id: -1
        })
        return copy
      }
      return data
    } else {
      return data.map((i, idx) => {
        if (idx === 0) {
          return {
            ...i,
            isCurrentVersion: true,
            type: 'cloud'
          }
        }
        return i
      })
    }
  }, [localVersion, data])

  const clickItem = useCallback((item: any) => {
    setCurrentVersionId(item.id)
    project.currentDocument?.importSchema(item.schema.componentsTree?.[0])
    project.simulatorHost?.rerender()
  }, [])

  useEffect(() => {
    if (open) {
      setContainerHeight(listWrapper.current!.offsetHeight)
      runAsync({
        current: 1,
        pageSize: 10
      }).then((body) => {
        setData([...body.list])
      })
    }
  }, [open, runAsync])

  // useEffect(() => {
  //   debugger
  //   if (localVersion) {
  //     setCurrentVersionId(-1)
  //   } else if (cloudVersion) {
  //     setCurrentVersionId(cloudVersion.id)
  //   }
  // }, [localVersion, cloudVersion])

  return (
    <Drawer
      title='历史记录'
      open={open}
      width='300px'
      onClose={() => {
        setOpen(false)
      }}
      destroyOnClose
      className='history-wrapper'
      maskStyle={{
        backgroundColor: 'transparent'
      }}
    >
      <div className='h-full' ref={listWrapper}>
        <List>
          <VirtualList data={formatData} height={containerHeight} itemHeight={85} itemKey='id' onScroll={onScroll}>
            {(item: any) => (
              <List.Item>
                <div
                  className={classNames(
                    'text-[#00000099] cursor-pointer w-full p-[12px_24px]',
                    currentVersionId === item.id ? 'bg-[#1f38581a]' : undefined
                  )}
                  onClick={() => {
                    clickItem(item)
                  }}
                >
                  <div>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                  <Tooltip title={item.description} placement='bottom' open={item.description ? undefined : false}>
                    <div className='line-clamp-1 text-c_level_1 min-h-[20px]'>{item.description}</div>
                  </Tooltip>
                  <div className='flex items-center justify-between'>
                    {item.isCurrentVersion ? (
                      <div className='flex items-center'>
                        <div className='truncate max-w-[130px]'>当前版本</div>
                        <Tag className='ml-[6px]' color={item.type === 'local' ? 'orange' : 'geekblue'}>
                          {item.type === 'local' ? '本地' : '云端'}
                        </Tag>
                      </div>
                    ) : (
                      <div className='truncate max-w-[130px]'>{item.operator.username}</div>
                    )}

                    {currentVersionId === item.id && !item.isCurrentVersion && (
                      <div className='flex items-center text-c_level_3'>
                        <div
                          className='flex items-center cursor-pointer hover:text-c_primary'
                          onClick={(e) => {
                            e.stopPropagation()
                            rollback(item)
                          }}
                        >
                          <span>回滚</span>
                          <Icon name='rollback' className='w-[14px] h-[14px] ml-[2px]' />
                        </div>
                        <div
                          className='flex items-center cursor-pointer hover:text-c_primary ml-[10px]'
                          onClick={(e) => {
                            e.stopPropagation()
                            message.info('开发中')
                          }}
                        >
                          <span>diff</span>
                          <Icon name='compare' className='w-[12px] h-[12px] ml-[2px]' />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          </VirtualList>
        </List>
      </div>
      <style jsx>{`
        :global(.history-wrapper .ant-drawer-body) {
          padding: 0 !important;
        }
        :global(.history-wrapper .ant-list-item) {
          padding: 0 !important;
        }
      `}</style>
    </Drawer>
  )
}

export default React.memo(SelectPeopleDialog)
