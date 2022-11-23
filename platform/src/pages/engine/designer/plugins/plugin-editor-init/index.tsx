import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { injectAssets } from '@alilc/lowcode-plugin-inject'
import assets from '../../assets.json'
import { getPageSchema } from '../../../helper'

const EditorInitPlugin = (ctx: ILowCodePluginContext) => {
  return {
    async init() {
      const { material, project } = ctx
      // 设置物料描述前，使用插件提供的 injectAssets 进行处理
      material.setAssets(await injectAssets(assets))

      // 加载 schema
      project.openDocument(getPageSchema())
    }
  }
}
EditorInitPlugin.pluginName = 'EditorInitPlugin'

export default EditorInitPlugin
