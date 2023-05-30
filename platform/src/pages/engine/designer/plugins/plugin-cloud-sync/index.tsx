import Icon from '@/components/icon'
import assets from '@/pages/engine/assets.json'
import PageVersionDrawer from '@/pages/engine/designer/components/pageVersionDrawer'
import { saveSchema } from '@/pages/engine/helper'
import { event, project } from '@alilc/lowcode-engine'
import { IPublicModelPluginContext } from '@alilc/lowcode-types';

import { injectAssets } from '@alilc/lowcode-plugin-inject'
import { TransformStage } from '@alilc/lowcode-types'
import { message, Modal, Tooltip } from 'antd'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import localForage from 'localforage'
import { debounce } from 'lodash'
import { PureComponent } from 'react'
dayjs.extend(isToday)

interface IState {
  status: 'before' | 'same' | 'after' | 'noVersion'
  open: boolean
  cloudVersion: ApiPageVersionsLatestResponse['data'] | null
  localVersion: {
    currentCloudVersion: number
    schema: ApiPageVersionsLatestResponse['data']['schema']
    createdAt: number
  } | null
}

interface IProps {
  navUuid: string
  changeProjectSchema: (schema: any) => void
  rollback: (version: any) => Promise<void>
  syncCloudVersion: (version: any) => Promise<void>
}

function getStoreKey({ route }: { route: any }) {
  return `PAGE_HISTORY--__--${route.navUuid}`
}

const cloudSyncService = ({
  navUuid,
  description,
  roolbackBaseVersion,
  lastPageVerison,
  updateLatestPageVersion
}: {
  navUuid: string
  description: string
  roolbackBaseVersion: number
  lastPageVerison: ApiPageVersionsLatestResponse['data']
  updateLatestPageVersion: (version: any) => void
}) => {
  const saveCallback = (result: ApiPageVersionsResponse__POST['data']) => {
    updateLatestPageVersion(result.version)
    localForage
      .removeItem(
        getStoreKey({
          route: {
            navUuid
          }
        })
      )
      .finally(() => {
        event.emit('CloudSync.UPDATE_STATUS', {
          status: 'same',
          cloudVersion: result.version,
          localVersion: null
        })
      })
  }

  return new Promise((resolve, reject) => {
    const payload = {
      navUuid: navUuid,
      description,
      baseVersion: roolbackBaseVersion,
      currentVersion: lastPageVerison.id
    }
    saveSchema(payload).then((res) => {
      if (res!.success) {
        message.success('回滚成功')
        saveCallback(res)
        resolve(true)
      } else if (res!.code === 19601) {
        // 云端有更新，覆盖提醒
        Modal.confirm({
          width: 350,
          title: (
            <>
              <div className='text-[16px]'>{res!.message}</div>
            </>
          ),
          okText: '继续保存',
          onOk() {
            return saveSchema({ ...payload, force: true })
              .then((res) => {
                if (res!.success) {
                  saveCallback(res)
                }
              })
              .finally(() => {
                resolve(true)
              })
          },
          onCancel() {
            resolve(true)
          }
        })
      }
    })
  })
}

class CloudSync extends PureComponent<IProps, IState> {
  static displayName = 'CloudSync'

  constructor(props: any) {
    super(props)
    this.state = {
      status: 'noVersion',
      open: false,
      cloudVersion: null,
      localVersion: null
    }
    this.bind()
  }
  bind() {
    event.on('common:CloudSync.UPDATE_STATUS', (({
      status,
      cloudVersion,
      localVersion
    }: Pick<IState, 'status' | 'cloudVersion' | 'localVersion'>) => {
      this.setState({
        status: status,
        cloudVersion,
        localVersion
      })
    }) as any)
    event.on('common:CloudSync.UPDATE_LAST_VERSION', ((version: IState['cloudVersion']) => {
      this.setState({
        cloudVersion: version
      })
    }) as any)
  }

  render(): React.ReactNode {
    const { status, open, cloudVersion, localVersion } = this.state
    const { navUuid, changeProjectSchema, rollback, syncCloudVersion } = this.props
    return (
      <div className='flex items-center'>
        {status === 'before' ? (
          <>
            <Icon name='cloud-forward' className='w-[20px] h-[20px] ' />
            <span className='ml-[4px] mr-[16px]'>云端版本有更新</span>
          </>
        ) : status === 'same' ? (
          <>
            <Icon name='cloud-sync' className='w-[20px] h-[20px] ' />
            <span className='ml-[4px]'>
              {dayjs(cloudVersion!.createdAt).format(
                dayjs(cloudVersion!.createdAt).isToday() ? 'HH:mm' : 'MM-DD HH:mm'
              )}
            </span>
            <span className='ml-[4px] mr-[16px]'>保存云端成功</span>
          </>
        ) : status === 'after' ? (
          <>
            <Icon name='cloud-not-sync' className='w-[20px] h-[20px] ' />
            <span className='ml-[4px] mr-[16px]'>暂未保存到云端</span>
          </>
        ) : null}
        <Tooltip title='历史版本' placement='bottom'>
          <div
            onClick={() => {
              this.setState({ open: true })
              event.emit('SaveSample.UPDATE_HISTORY_RECORDS_STATUS', 'open')
            }}
          >
            <Icon
              name='history'
              className='w-[18px] h-[18px] text-c_level_4 hover:text-c_level_2 cursor-pointer transition-all'
            />
          </div>
        </Tooltip>
        <PageVersionDrawer
          open={open}
          setOpen={(val: boolean) => {
            if (!val) {
              event.emit('SaveSample.UPDATE_HISTORY_RECORDS_STATUS', 'close')
            }
            this.setState({ open: val })
          }}
          navUuid={navUuid}
          cloudVersion={cloudVersion}
          localVersion={localVersion}
          changeProjectSchema={changeProjectSchema}
          rollback={rollback}
          update={syncCloudVersion}
        />
      </div>
    )
  }
}

const CloudSyncPlugin = (
  ctx: IPublicModelPluginContext,
  options: {
    project: ApiProjectsIdResponse['data']
    route: ApiProjectRoutesFindByUuidResponse['data']
    pageVersion: ApiPageVersionsLatestResponse['data']
    event: any
  }
) => {
  return {
    async init() {
      const { skeleton, config, material } = ctx
      const { route, pageVersion } = options
      let lastPageVerison: ApiPageVersionsLatestResponse['data'] = pageVersion

      // 设置物料描述前，使用插件提供的 injectAssets 进行处理
      material.setAssets(await injectAssets(assets))
      skeleton.add({
        name: 'topAreaRightCloudSync',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right'
        },
        contentProps: {
          event,
          navUuid: route.navUuid,
          // 切换页面schema
          changeProjectSchema: (schema: any) => {
            project.currentDocument?.importSchema(schema.componentsTree?.[0])
            project.simulatorHost?.rerender()
          },
          // 回滚
          rollback: (version: any) => {
            return new Promise((resolve, reject) => {
              localForage.getItem<any>(getStoreKey({ route })).then((value) => {
                if (value) {
                  // 存在本地版本
                  Modal.confirm({
                    width: 350,
                    okText: '继续回滚',
                    title: (
                      <>
                        <div className='text-[16px]'>存在本地版本，回滚将清空本地版本</div>
                      </>
                    ),
                    onOk() {
                      return cloudSyncService({
                        description: version.description,
                        navUuid: route.navUuid,
                        roolbackBaseVersion: version.id,
                        lastPageVerison,
                        updateLatestPageVersion(version: any) {
                          lastPageVerison = version
                        }
                      }).then(resolve)
                    },
                    onCancel() {
                      reject()
                    }
                  })
                } else {
                  Modal.confirm({
                    title: <span className='text-[16px]'>确定要回滚该版本吗？</span>,
                    onOk() {
                      return cloudSyncService({
                        description: version.description,
                        navUuid: route.navUuid,
                        roolbackBaseVersion: version.id,
                        lastPageVerison,
                        updateLatestPageVersion(version: any) {
                          lastPageVerison = version
                        }
                      }).then(resolve)
                    },
                    onCancel() {
                      reject()
                    }
                  })
                }
              })
            })
          },
          // 云端有更新，在历史记录里已显示，更新页面到这个版本
          syncCloudVersion: (version: any) => {
            return new Promise((resolve, reject) => {
              localForage.getItem<any>(getStoreKey({ route })).then((value) => {
                if (value) {
                  // 存在本地版本
                  Modal.confirm({
                    width: 350,
                    okText: '继续更新',
                    title: (
                      <>
                        <div className='text-[16px]'>存在本地版本，更新将清空本地版本</div>
                      </>
                    ),
                    onOk() {
                      return localForage
                        .removeItem(
                          getStoreKey({
                            route
                          })
                        )
                        .then(resolve)
                    },
                    onCancel() {
                      reject()
                    }
                  })
                } else {
                  resolve(true)
                }
              })
            }).then(() => {
              lastPageVerison = version
              event.emit('CloudSync.UPDATE_STATUS', {
                status: 'same',
                cloudVersion: version,
                localVersion: null
              })
              message.success('更新成功')
            })
          }
        },
        content: CloudSync
      })

      // 初始加载 schema
      localForage.getItem<any>(getStoreKey({ route })).then((value) => {
        let status = 'noVersion'
        if (value) {
          if (value.currentCloudVersion === lastPageVerison.id) {
            // 本地同步到线上会清空本地的存储，能取到说明在线上版本之后又进行了开发
            status = 'after'
            project.openDocument(value.schema.componentsTree?.[0])
          } else if (value.currentCloudVersion < lastPageVerison.id) {
            // 本地存储的schema落后于线上，可能是别的开发者提交了新版本
            status = 'before'
            Modal.confirm({
              width: 350,
              okText: '确定',
              title: (
                <>
                  <div className='text-[16px]'>当前本地版本落后于云端版本</div>
                  <div className='text-c_level_4 text-[12px] mt-[10px]'>
                    将以本地版本加载，稍后可以通过历史版本控件进行管理
                  </div>
                </>
              )
            })
            project.openDocument(value.schema.componentsTree?.[0])
          } else {
            message.error('本地版本异常')
            throw new Error('本地版本异常')
          }
        } else {
          if (lastPageVerison.id !== 0) {
            status = 'same'
          } else {
            status = 'noVersion'
          }
          project.openDocument(pageVersion.schema.componentsTree?.[0])
        }

        event.emit('CloudSync.UPDATE_STATUS', {
          status,
          cloudVersion: pageVersion,
          localVersion: value
        })
      })

      const saveSchemaToLocal = debounce(() => {
        localForage.getItem<any>(getStoreKey({ route })).then((value) => {
          const isBeforeCloudVersion = value && value.currentCloudVersion < lastPageVerison.id
          const localVersion = {
            currentCloudVersion: isBeforeCloudVersion ? value.currentCloudVersion : lastPageVerison.id,
            schema: JSON.parse(JSON.stringify(project.exportSchema(TransformStage.Save))),
            createdAt: new Date().getTime()
          }
          localForage.setItem(getStoreKey({ route }), localVersion)
          event.emit('CloudSync.UPDATE_STATUS', {
            status: isBeforeCloudVersion ? 'before' : 'after',
            cloudVersion: lastPageVerison,
            localVersion: localVersion
          })
        })
      }, 600)

      // 监听用户操作后，实时保存到本地
      project.onChangeDocument(() => {
        project.currentDocument!.onAddNode(() => {
          saveSchemaToLocal()
        })
        project.currentDocument!.onChangeNodeChildren(() => {
          saveSchemaToLocal()
        })
        // project.currentDocument!.onChangeNodeProp(() => {
        //   saveSchemaToLocal()
        // })
        project.currentDocument!.onChangeNodeVisible(() => {
          saveSchemaToLocal()
        })
        project.currentDocument!.onMountNode(() => {
          saveSchemaToLocal()
        })
        // project.currentDocument!.onRemoveNode(() => {
        //   saveSchemaToLocal()
        // })
      })

      // 页面保存到云端，刷新pageVersion
      config.onGot('pageVersion', (data: ApiPageVersionsLatestResponse['data']) => {
        lastPageVerison = data
        event.emit('CloudSync.UPDATE_LAST_VERSION', data)
      })
    }
  }
}
CloudSyncPlugin.pluginName = 'CloudSyncPlugin'
CloudSyncPlugin.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'route',
        type: 'object',
        description: '页面信息'
      },
      {
        key: 'pageVersion',
        type: 'object',
        description: '页面版本信息'
      }
    ]
  }
}
export default CloudSyncPlugin
