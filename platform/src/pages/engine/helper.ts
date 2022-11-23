import { material, project } from '@alilc/lowcode-engine'
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { message, Modal } from 'antd'
import { TransformStage, RootSchema } from '@alilc/lowcode-types'

const defaultPageSchema: RootSchema = { componentName: 'Page', fileName: 'sample' }

/**
 * 将schema和package保存到本地localStorage
 */
export const saveSchema = async () => {
  // 保存schema到localStorage
  window.localStorage.setItem('schema', JSON.stringify(project.exportSchema(TransformStage.Save)))
  // 保存packages到localStorage
  const packages = await filterPackages(material.getAssets().packages)
  window.localStorage.setItem('packages', JSON.stringify(packages))
  message.success('保存成功')
}

export const resetSchema = async () => {
  Modal.confirm({
    content: '确定要重置吗？您所有的修改都将消失！',
    onOk: () => {
      window.localStorage.setItem(
        'schema',
        JSON.stringify({
          componentsTree: [defaultPageSchema],
          componentsMap: material.componentsMap
        })
      )
      project.getCurrentDocument()?.importSchema(defaultPageSchema)
      project.simulatorHost?.rerender()
      message.success('成功重置页面')
      return
    }
  })
}

export const getPagePackages = () => {
  return JSON.parse(window.localStorage.getItem('packages') || '{}')
}

export const getProjectSchema = () => {
  return JSON.parse(window.localStorage.getItem('schema') || '{}')
}

export const getPageSchema = () => {
  return getProjectSchema()?.componentsTree?.[0] ?? defaultPageSchema
}

export const preview = () => {
  saveSchema()
  setTimeout(() => {
    window.open(`/pagePreview${location.search}`)
  }, 500)
}
