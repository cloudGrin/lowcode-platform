import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { Button } from 'antd'
import { saveSchema } from '../../../helper'

// 保存功能示例
const SaveSamplePlugin = (ctx: ILowCodePluginContext, options: any) => {
  return {
    async init() {
      const { skeleton, hotkey, config } = ctx
      skeleton.add({
        name: 'saveSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right'
        },
        content: (
          <Button
            onClick={() =>
              saveSchema({
                navUuid: options.navUuid
              })
            }
          >
            保存到云端
          </Button>
        )
      })
      hotkey.bind('command+s', (e) => {
        e.preventDefault()
        saveSchema({
          navUuid: options.navUuid
        })
      })
    }
  }
}
SaveSamplePlugin.pluginName = 'SaveSamplePlugin'
SaveSamplePlugin.meta = {
  dependencies: ['EditorInitPlugin'],
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'navUuid',
        type: 'string',
        description: '页面uuid'
      }
    ]
  }
}

export default SaveSamplePlugin
