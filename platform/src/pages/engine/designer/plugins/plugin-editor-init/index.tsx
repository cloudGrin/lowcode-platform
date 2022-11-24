import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { injectAssets } from '@alilc/lowcode-plugin-inject'
import assets from '@/pages/engine/assets.json'

const EditorInitPlugin = (ctx: ILowCodePluginContext, options: any) => {
  return {
    async init() {
      const { material, project } = ctx
      // 设置物料描述前，使用插件提供的 injectAssets 进行处理
      material.setAssets(await injectAssets(assets))

      // 加载 schema
      project.openDocument(options.schema.componentsTree?.[0])
    }
  }
}
EditorInitPlugin.pluginName = 'EditorInitPlugin'

EditorInitPlugin.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'schema',
        type: 'object',
        description: '当前页面schema'
      }
    ]
  }
}

export default EditorInitPlugin
