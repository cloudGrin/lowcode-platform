import Icon from '@/components/icon'
import assets from '@/pages/engine/assets.json'
import { ILowCodePluginContext, project } from '@alilc/lowcode-engine'
import { TransformStage } from '@alilc/lowcode-types'
import { message, Modal, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { injectAssets } from '@alilc/lowcode-plugin-inject'
import localForage from 'localforage'
import { PureComponent } from 'react'
import { debounce } from 'lodash'
import PageVersionDrawer from '@/pages/engine/designer/components/pageVersionDrawer'
import isToday from 'dayjs/plugin/isToday'
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
  emitter: any
  navUuid: string
}

function getStoreKey({ route }: { route: any }) {
  return `PAGE_HISTORY--__--${route.navUuid}`
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
    this.props.emitter.on(
      'CloudSync:UPDATE_STATUS',
      ({ status, cloudVersion, localVersion }: Pick<IState, 'status' | 'cloudVersion' | 'localVersion'>) => {
        this.setState({
          status: status,
          cloudVersion,
          localVersion
        })
      }
    )
    this.props.emitter.on('CloudSync:UPDATE_LAST_VERSION', (version: IState['cloudVersion']) => {
      this.setState({
        cloudVersion: version
      })
    })
  }

  render(): React.ReactNode {
    const { status, open, cloudVersion, localVersion } = this.state
    const { navUuid } = this.props
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
            this.setState({ open: val })
          }}
          navUuid={navUuid}
          cloudVersion={cloudVersion}
          localVersion={localVersion}
          onOk={(version) => {
            console.log(version)
          }}
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
    emitter: any
  }
) => {
  return {
    async init() {
      const { skeleton, config, material } = ctx
      const { route, pageVersion, emitter } = options
      let lastPageVerison = pageVersion

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
          emitter,
          navUuid: route.navUuid
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

        emitter.emit('CloudSync:UPDATE_STATUS', {
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
          emitter.emit('CloudSync:UPDATE_STATUS', {
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
      config.onGot('pageVersion', (data: ApiPageVersionsResponse__POST['data']['version']) => {
        lastPageVerison = data
        emitter.emit('CloudSync:UPDATE_LAST_VERSION', data)
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
      },
      {
        key: 'emitter',
        type: 'object',
        description: '事件总线'
      }
    ]
  }
}
export default CloudSyncPlugin
