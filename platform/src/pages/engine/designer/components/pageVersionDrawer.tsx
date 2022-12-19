import Icon from '@/components/icon'
import { strapiRequestInstance } from '@/lib/request'
import { project } from '@alilc/lowcode-engine'
import { TransformStage } from '@alilc/lowcode-types'
import { useMemoizedFn, usePagination, useUpdateEffect } from 'ahooks'
import { Drawer, Empty, List, message, Modal, Tag, Tooltip } from 'antd'
import classNames from 'classnames'
import dayjs from 'dayjs'
import VirtualList from 'rc-virtual-list'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { editor } from 'monaco-editor'

function handlerVersionCoherence(data: any[]) {
  return data.map((item, idx) => {
    const current = data[idx]
    const next = data[idx + 1]
    if (next && next.id !== current.baseVersion!.id) {
      return {
        ...item,
        roolback: true
      }
    }
    return item
  })
}

const PageVersionDrawer: React.FC<{
  navUuid: string
  open: boolean
  setOpen: (val: boolean) => void
  rollback: (version: any) => Promise<void>
  update: (version: any) => Promise<void>
  cloudVersion: ApiPageVersionsLatestResponse['data'] | null
  localVersion: {
    currentCloudVersion: number
    schema: ApiPageVersionsLatestResponse['data']['schema']
    createdAt: number
  } | null
  changeProjectSchema: (schema: any) => void
}> = ({ navUuid, open, setOpen, rollback, update, cloudVersion, localVersion, changeProjectSchema }) => {
  const [data, setData] = useState<ApiPageVersionsResponse['data']>([])
  const [containerHeight, setContainerHeight] = useState(100)
  const listWrapper = useRef<HTMLDivElement>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<number>()
  const isJumpReCurrentVersion = useRef(false)

  //diff弹窗
  const [isShowModal, setIsShowModal] = useState<boolean>(false)

  const diffContainer = useRef<HTMLDivElement>(null)
  const editorContainer = diffContainer.current
  const diffEditor = useMemo(() => {
    if (editorContainer) {
      return editor.createDiffEditor(editorContainer, {
        enableSplitViewResizing: false,
        automaticLayout: true,
        dragAndDrop: true
      })
    }
  }, [editorContainer])

  const diff = useMemoizedFn((oldSchema: any, newSchema: any) => {
    diffEditor?.setModel({
      original: editor.createModel(oldSchema),
      modified: editor.createModel(newSchema)
    })
  })

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
      setData([
        ...data.slice(0, -1),
        ...handlerVersionCoherence((!!data.length ? [data[data.length - 1]] : []).concat(body.list))
      ])
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

  // 确定当前版本
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
      if (cloudVersion) {
        const idx = data.findIndex((i) => i.id === cloudVersion.id)
        if (idx >= 0) {
          const copy = [...data] as any[]
          copy.splice(idx, 1, {
            ...copy[idx],
            isCurrentVersion: true
          })
          return copy
        } else {
          // 找不到说明更新数量太多，超过了一页
          return data
        }
      }
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
  }, [localVersion, data, cloudVersion])

  // 当前版本ID
  const currentVersionIdx = useMemo(() => {
    return formatData.findIndex((item) => item.isCurrentVersion)
  }, [formatData])

  const clickItem = useCallback(
    (item: any) => {
      if (selectedVersionId !== item.id) {
        setSelectedVersionId(item.id)
        changeProjectSchema(item.schema)
      }
    },
    [changeProjectSchema, selectedVersionId]
  )

  const openToInit = useMemoizedFn(() => {
    setContainerHeight(listWrapper.current!.offsetHeight)
    runAsync({
      current: 1,
      pageSize: 10
    }).then((body) => {
      setData(handlerVersionCoherence(body.list))
    })
    if (localVersion) {
      setSelectedVersionId(-1)
    } else if (cloudVersion) {
      setSelectedVersionId(cloudVersion.id)
    }
  })

  // 关闭的时候需要恢复到正确版本
  // 回滚和更新时不应该触发
  const reCurrentVersion = useMemoizedFn(() => {
    const current = formatData.find((item) => item.isCurrentVersion)
    current && changeProjectSchema(current.schema)
  })

  useUpdateEffect(() => {
    if (open) {
      isJumpReCurrentVersion.current = false
      openToInit()
    } else if (!isJumpReCurrentVersion.current) {
      reCurrentVersion()
    }
  }, [open, openToInit, reCurrentVersion])

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
        {!!formatData.length ? (
          <List>
            <VirtualList data={formatData} height={containerHeight} itemHeight={85} itemKey='id' onScroll={onScroll}>
              {(item: any, idx: number) => (
                <List.Item>
                  <div
                    className={classNames(
                      'text-[#00000099] cursor-pointer w-full p-[12px_24px]',
                      selectedVersionId === item.id ? 'bg-[#1f38581a]' : undefined
                    )}
                    onClick={() => {
                      clickItem(item)
                    }}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div>{item.type === 'local' ? `基于版本${formatData[idx + 1].id}` : `版本${item.id}`}</div>
                      </div>
                      <div className='ml-[15px]'>{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <Tooltip title={item.description} placement='bottom' open={item.description ? undefined : false}>
                        <div className='line-clamp-1 text-c_level_1 min-h-[20px]'>{item.description}</div>
                      </Tooltip>
                      {item.roolback && (
                        <div className='flex-none text-c_warning'>{`上一版本${item.baseVersion.id}`}</div>
                      )}
                    </div>
                    <div className='flex items-center justify-between'>
                      {item.isCurrentVersion ? (
                        <div className='truncate max-w-[130px] text-c_primary_light'>当前版本</div>
                      ) : (
                        <div className='truncate max-w-[130px]'>{item.operator.username}</div>
                      )}

                      {item.isCurrentVersion && item.type === 'local' && (
                        <Tag className='mx-0' color={item.type === 'local' ? 'orange' : 'geekblue'}>
                          本地未上传
                        </Tag>
                      )}

                      {selectedVersionId === item.id && !item.isCurrentVersion && (
                        <div className='flex items-center text-c_level_3'>
                          {currentVersionIdx < 0 || idx < currentVersionIdx ? (
                            <div
                              className='flex items-center cursor-pointer hover:text-c_primary'
                              onClick={(e) => {
                                e.stopPropagation()
                                isJumpReCurrentVersion.current = true
                                update(item)
                                  .then(() => {
                                    setOpen(false)
                                  })
                                  .catch(() => {})
                              }}
                            >
                              <span>更新</span>
                              <Icon name='cloud-update' className='w-[14px] h-[14px] ml-[2px]' />
                            </div>
                          ) : (
                            <div
                              className='flex items-center cursor-pointer hover:text-c_primary'
                              onClick={(e) => {
                                e.stopPropagation()
                                isJumpReCurrentVersion.current = true
                                rollback(item)
                                  .then(() => {
                                    setOpen(false)
                                  })
                                  .catch(() => {})
                              }}
                            >
                              <span>回滚</span>
                              <Icon name='rollback' className='w-[14px] h-[14px] ml-[2px]' />
                            </div>
                          )}

                          <div
                            className='flex items-center cursor-pointer hover:text-c_primary ml-[10px]'
                            onClick={(e) => {
                              e.stopPropagation()

                              setIsShowModal(true)
                              const currentVersion = JSON.stringify(item.schema.componentsTree[0], null, ' ')
                              const diffVersion = JSON.stringify(
                                currentVersionIdx === -1
                                  ? project.exportSchema(TransformStage.Save).componentsTree[0]
                                  : formatData[currentVersionIdx].schema.componentsTree[0],
                                null,
                                ' '
                              )
                              diff(currentVersion, diffVersion)

                              // message.info('开发中')
                            }}
                          >
                            <span>diff</span>
                            <Icon name='compare' className='w-[12px] h-[12px] ml-[2px]' />
                          </div>
                        </div>
                      )}
                      {selectedVersionId !== item.id && !item.isCurrentVersion && idx < currentVersionIdx && (
                        <div className='text-c_success'>新版本</div>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            </VirtualList>
          </List>
        ) : (
          <div className='pt-[20vh]'>
            <Empty />
          </div>
        )}
      </div>
      <Modal
        title='schema diff'
        open={isShowModal}
        onCancel={() => {
          setIsShowModal(false)
        }}
        style={{ width: '100%', height: '100%' }}
        forceRender={true}
        getContainer={false}
        centered={false}
        footer={() => {}}
      >
        <div style={{ height: 'calc(100vh - 80px)' }} ref={diffContainer}></div>
      </Modal>
      <style jsx>{`
        :global(.history-wrapper .ant-drawer-body) {
          padding: 0 !important;
        }
        :global(.history-wrapper .ant-list-item) {
          padding: 0 !important;
        }
        :global(.history-wrapper .ant-modal) {
          width: calc(100vw - 300px) !important;
          height: 100% !important;
          margin: 0;
          top: 0;
        }
      `}</style>
    </Drawer>
  )
}

export default React.memo(PageVersionDrawer)
