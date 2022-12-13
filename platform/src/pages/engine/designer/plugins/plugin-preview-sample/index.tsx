import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { Button } from 'antd'
import { preview } from '../../../helper'

// 保存功能示例
const PreviewSamplePlugin = (ctx: ILowCodePluginContext) => {
  return {
    async init() {
      const { skeleton, config } = ctx
      skeleton.add({
        name: 'previewSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right'
        },
        content: (
          <Button type='primary' onClick={preview}>
            预览
          </Button>
        )
      })
    }
  }
}
PreviewSamplePlugin.pluginName = 'PreviewSamplePlugin'
PreviewSamplePlugin.meta = {
  dependencies: ['CloudSyncPlugin']
}
export default PreviewSamplePlugin
