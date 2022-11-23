import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { Button } from 'antd'
import { saveSchema, resetSchema } from '../../../helper'

// 保存功能示例
const SaveSamplePlugin = (ctx: ILowCodePluginContext) => {
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
        content: <Button onClick={() => saveSchema()}>保存到本地</Button>
      })
      skeleton.add({
        name: 'resetSchema',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right'
        },
        content: <Button onClick={() => resetSchema()}>重置页面</Button>
      })
      hotkey.bind('command+s', (e) => {
        e.preventDefault()
        saveSchema()
      })
    }
  }
}
SaveSamplePlugin.pluginName = 'SaveSamplePlugin'
SaveSamplePlugin.meta = {
  dependencies: ['EditorInitPlugin']
}
export default SaveSamplePlugin
