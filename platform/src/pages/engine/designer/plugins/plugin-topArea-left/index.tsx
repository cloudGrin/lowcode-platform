import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { Button } from 'antd'

// 保存功能示例
const topAreaLeftPlugin = (ctx: ILowCodePluginContext, options: { project: ApiProjectsIdResponse['data'] }) => {
  return {
    async init() {
      const { skeleton, config } = ctx
      const { project } = options
      skeleton.add({
        name: 'topAreaLeftSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'left'
        },
        content: <>{project.name}</>
      })
    }
  }
}
topAreaLeftPlugin.pluginName = 'topAreaLeftPlugin'
topAreaLeftPlugin.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'project',
        type: 'object',
        description: '应用信息'
      }
    ]
  }
}
export default topAreaLeftPlugin
