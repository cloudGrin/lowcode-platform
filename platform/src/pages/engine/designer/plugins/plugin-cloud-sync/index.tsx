import Icon from '@/components/icon'
import assets from '@/pages/engine/assets.json'
import PageVersionDrawer from '@/pages/engine/designer/components/pageVersionDrawer'
import { saveSchema } from '@/pages/engine/helper'
import { event, ILowCodePluginContext, project } from '@alilc/lowcode-engine'
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
        message.success('????????????')
        saveCallback(res)
        resolve(true)
      } else if (res!.code === 19601) {
        // ??????????????????????????????
        Modal.confirm({
          width: 350,
          title: (
            <>
              <div className='text-[16px]'>{res!.message}</div>
            </>
          ),
          okText: '????????????',
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
            <span className='ml-[4px] mr-[16px]'>?????????????????????</span>
          </>
        ) : status === 'same' ? (
          <>
            <Icon name='cloud-sync' className='w-[20px] h-[20px] ' />
            <span className='ml-[4px]'>
              {dayjs(cloudVersion!.createdAt).format(
                dayjs(cloudVersion!.createdAt).isToday() ? 'HH:mm' : 'MM-DD HH:mm'
              )}
            </span>
            <span className='ml-[4px] mr-[16px]'>??????????????????</span>
          </>
        ) : status === 'after' ? (
          <>
            <Icon name='cloud-not-sync' className='w-[20px] h-[20px] ' />
            <span className='ml-[4px] mr-[16px]'>?????????????????????</span>
          </>
        ) : null}
        <Tooltip title='????????????' placement='bottom'>
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
  ctx: ILowCodePluginContext,
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

      // ????????????????????????????????????????????? injectAssets ????????????
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
          // ????????????schema
          changeProjectSchema: (schema: any) => {
            project.currentDocument?.importSchema(schema.componentsTree?.[0])
            project.simulatorHost?.rerender()
          },
          // ??????
          rollback: (version: any) => {
            return new Promise((resolve, reject) => {
              localForage.getItem<any>(getStoreKey({ route })).then((value) => {
                if (value) {
                  // ??????????????????
                  Modal.confirm({
                    width: 350,
                    okText: '????????????',
                    title: (
                      <>
                        <div className='text-[16px]'>????????????????????????????????????????????????</div>
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
                    title: <span className='text-[16px]'>??????????????????????????????</span>,
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
          // ???????????????????????????????????????????????????????????????????????????
          syncCloudVersion: (version: any) => {
            return new Promise((resolve, reject) => {
              localForage.getItem<any>(getStoreKey({ route })).then((value) => {
                if (value) {
                  // ??????????????????
                  Modal.confirm({
                    width: 350,
                    okText: '????????????',
                    title: (
                      <>
                        <div className='text-[16px]'>????????????????????????????????????????????????</div>
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
              message.success('????????????')
            })
          }
        },
        content: CloudSync
      })

      // ???????????? schema
      localForage.getItem<any>(getStoreKey({ route })).then((value) => {
        let status = 'noVersion'
        if (value) {
          if (value.currentCloudVersion === lastPageVerison.id) {
            // ??????????????????????????????????????????????????????????????????????????????????????????????????????
            status = 'after'
            project.openDocument(value.schema.componentsTree?.[0])
          } else if (value.currentCloudVersion < lastPageVerison.id) {
            // ???????????????schema????????????????????????????????????????????????????????????
            status = 'before'
            Modal.confirm({
              width: 350,
              okText: '??????',
              title: (
                <>
                  <div className='text-[16px]'>???????????????????????????????????????</div>
                  <div className='text-c_level_4 text-[12px] mt-[10px]'>
                    ???????????????????????????????????????????????????????????????????????????
                  </div>
                </>
              )
            })
            project.openDocument(value.schema.componentsTree?.[0])
          } else {
            message.error('??????????????????')
            throw new Error('??????????????????')
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

      // ?????????????????????????????????????????????
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

      // ??????????????????????????????pageVersion
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
    title: '????????????',
    properties: [
      {
        key: 'route',
        type: 'object',
        description: '????????????'
      },
      {
        key: 'pageVersion',
        type: 'object',
        description: '??????????????????'
      }
    ]
  }
}
export default CloudSyncPlugin
