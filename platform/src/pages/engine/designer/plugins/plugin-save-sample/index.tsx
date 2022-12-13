import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { Button, Input, Modal } from 'antd'
import { saveSchema } from '../../../helper'
import localForage from 'localforage'

// 保存功能示例
const SaveSamplePlugin = (ctx: ILowCodePluginContext, options: any) => {
  return {
    async init() {
      const { skeleton, config, hotkey } = ctx
      const { project: projectInfo, route, emitter } = options

      const cloudSync = (inputValue: string) => {
        const sotreKey = `PAGE_HISTORY-${projectInfo.appId}--__--${route.navUuid}}`

        const saveCallback = (result: ApiPageVersionsResponse__POST['data']) => {
          config.set('pageVersion', result.version)
          localForage.removeItem(sotreKey).finally(() => {
            emitter.emit('CloudSync:UPDATE_STATUS', 'same')
          })
        }
        // 判断当前基于的版本，如果小于线上需要提醒一下覆盖了
        localForage
          .getItem<any>(sotreKey)
          .then((value) => {
            if (value) {
              return {
                navUuid: route.navUuid,
                baseVersion: value.currentCloudVersion,
                description: inputValue
              }
            } else {
              return {
                navUuid: route.navUuid,
                description: inputValue
              }
            }
          })
          .then((payload) => {
            return saveSchema(payload).then((res) => {
              if (res!.success) {
                saveCallback(res)
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
                    return saveSchema({ ...payload, force: true }).then((res) => {
                      if (res!.success) {
                        saveCallback(res)
                      }
                    })
                  }
                })
              }
            })
          })
      }

      const hotkeySave = () => {
        let inputValue = ''
        Modal.confirm({
          width: 525,
          content: (
            <>
              <div className='text-[#747677] text-[14px] my-[10px]'>
                好的变更描述可帮助你分辨每次保存的记录，方便你以后从线上的保存历史列表中，挑选合适的版本恢复到本地
              </div>
              <Input.TextArea placeholder='请输入' onChange={(e) => (inputValue = e.target.value)} />
            </>
          ),
          title: <span className='text-[18px] leading-[22px]'>保存应用记录</span>,
          onOk() {
            cloudSync(inputValue)
          }
        })
      }

      skeleton.add({
        name: 'saveSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right'
        },
        content: <Button onClick={hotkeySave}>保存到云端</Button>
      })

      // 绑定保存快捷键
      hotkey.bind('command+s', (e) => {
        e.preventDefault()
        cloudSync('快捷键保存')
      })
    }
  }
}
SaveSamplePlugin.pluginName = 'SaveSamplePlugin'
SaveSamplePlugin.meta = {
  dependencies: ['CloudSyncPlugin'],
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'project',
        type: 'object',
        description: '应用信息'
      },
      {
        key: 'route',
        type: 'object',
        description: '页面信息'
      },
      {
        key: 'emitter',
        type: 'object',
        description: '事件总线'
      }
    ]
  }
}

export default SaveSamplePlugin
