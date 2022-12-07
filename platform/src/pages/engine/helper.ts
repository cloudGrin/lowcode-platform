import { strapiRequestInstance } from '@/lib/request'
import { project } from '@alilc/lowcode-engine'
// import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { TransformStage } from '@alilc/lowcode-types'
import { message } from 'antd'
import assets from './assets.json'

import { injectComponents } from '@alilc/lowcode-plugin-inject'
import { AssetLoader, buildComponents } from '@alilc/lowcode-utils'

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
  window.open(`/app/page${location.search}`)
}

export async function initPage({ projectSchema }: any) {
  const packages = getPagePackages()
  const { componentsMap: componentsMapArray, componentsTree } = projectSchema
  const componentsMap: any = {}
  componentsMapArray?.forEach((component: any) => {
    componentsMap[component.componentName] = component
  })
  const schema = componentsTree?.[0]

  const libraryMap = {} as Record<string, any>
  const libraryAsset: any[] = []
  packages.forEach(({ package: _package, library, urls, renderUrls }: Record<string, any>) => {
    libraryMap[_package] = library
    if (renderUrls) {
      libraryAsset.push(renderUrls)
    } else if (urls) {
      libraryAsset.push(urls)
    }
  })

  // TODO asset may cause pollution
  const assetLoader = new AssetLoader()
  await assetLoader.load(libraryAsset)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const components = await injectComponents(buildComponents(libraryMap, componentsMap))

  return {
    schema,
    components
  }
}
