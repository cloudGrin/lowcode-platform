import { saveSchema } from '@/pages/engine/helper'
import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { Button, Input, message, Modal } from 'antd'
import localForage from 'localforage'

// 保存功能示例
const SaveSamplePlugin = (ctx: ILowCodePluginContext, options: any) => {
  return {
    async init() {
      const { skeleton, config, hotkey } = ctx
      const { route, pageVersion, emitter } = options
      let historyRecordsStatus: 'close' | 'open' = 'close'
      let lastPageVerison = pageVersion
      const cloudSync = ({ navUuid, description, emitter }: { navUuid: string; description: string; emitter: any }) => {
        const storeKey = `PAGE_HISTORY--__--${navUuid}`

        const saveCallback = (result: ApiPageVersionsResponse__POST['data']) => {
          config.set('pageVersion', result.version)
          localForage.removeItem(storeKey).finally(() => {
            emitter.emit('CloudSync:UPDATE_STATUS', {
              status: 'same',
              cloudVersion: result.version,
              localVersion: null
            })
          })
        }
        // 判断当前基于的版本，如果小于线上需要提醒一下覆盖了
        return localForage
          .getItem<any>(storeKey)
          .then((value) => {
            if (value) {
              return {
                navUuid: navUuid,
                description,
                baseVersion: value.currentCloudVersion,
                currentVersion: value.currentCloudVersion
              }
            } else {
              return {
                navUuid: navUuid,
                description,
                baseVersion: lastPageVerison.id,
                currentVersion: lastPageVerison.id
              }
            }
          })
          .then((payload) => {
            return new Promise((resolve, reject) => {
              saveSchema(payload).then((res) => {
                if (res!.success) {
                  message.success('保存成功')
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
                            message.success('保存成功')
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
            return cloudSync({
              emitter,
              navUuid: route.navUuid,
              description: inputValue.trim() || '按钮保存'
            })
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

      emitter.on('SaveSample:UPDATE_HISTORY_RECORDS_STATUS', (status: typeof historyRecordsStatus) => {
        historyRecordsStatus = status
      })

      // 页面保存到云端，刷新pageVersion
      config.onGot('pageVersion', (data: ApiPageVersionsResponse__POST['data']['version']) => {
        lastPageVerison = data
      })

      // 绑定保存快捷键
      hotkey.bind('command+s', (e) => {
        e.preventDefault()
        if (historyRecordsStatus === 'close') {
          cloudSync({
            emitter,
            navUuid: route.navUuid,
            description: '快捷键保存'
          })
        }
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

export default SaveSamplePlugin
