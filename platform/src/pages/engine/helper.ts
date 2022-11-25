import { strapiRequestInstance } from '@/lib/request'
import { material, project } from '@alilc/lowcode-engine'
// import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { message, Modal } from 'antd'
import { TransformStage, RootSchema } from '@alilc/lowcode-types'
import assets from './assets.json'

// const defaultPageSchema: RootSchema = { componentName: 'Page', fileName: 'sample' }

/**
 * 保存schema
 */
export const saveSchema = async ({ navUuid }: any) => {
  try {
    const saveResult = await strapiRequestInstance(
      '/api/page-versions__POST',
      {
        description: 'test',
        navUuid,
        schema: project.exportSchema(TransformStage.Save)
      },
      {}
    )
    if (saveResult.data?.success) {
      message.success('保存成功')
    }
    // // 保存packages到localStorage
    // const packages = await filterPackages(material.getAssets().packages)
    // window.localStorage.setItem('packages', JSON.stringify(packages))
  } catch (error) {
    console.log(error)
  }
}

// export const resetSchema = async () => {
//   Modal.confirm({
//     content: '确定要重置吗？您所有的修改都将消失！',
//     onOk: () => {
//       window.localStorage.setItem(
//         'schema',
//         JSON.stringify({
//           componentsTree: [defaultPageSchema],
//           componentsMap: material.componentsMap
//         })
//       )
//       project.getCurrentDocument()?.importSchema(defaultPageSchema)
//       project.simulatorHost?.rerender()
//       message.success('成功重置页面')
//       return
//     }
//   })
// }

export const getPagePackages = () => {
  return assets.packages
}

export const preview = () => {
  window.open(`/pagePreview${location.search}`)
}
