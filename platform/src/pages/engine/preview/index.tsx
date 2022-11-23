import { Spin } from 'antd'

import { injectComponents } from '@alilc/lowcode-plugin-inject'
import ReactRenderer from '@alilc/lowcode-react-renderer'
import { AssetLoader, buildComponents } from '@alilc/lowcode-utils'
import { useState } from 'react'
import createAxiosHandler from '../datasource-axios-handler'

import { getPagePackages, getProjectSchema } from '../helper'

const SamplePreview: React.FC = () => {
  const [data, setData] = useState<any>({})

  async function init() {
    const packages = getPagePackages()
    const projectSchema = getProjectSchema()
    const { componentsMap: componentsMapArray, componentsTree } = projectSchema
    const componentsMap: any = {}
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component
    })
    const schema = componentsTree[0]

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

    setData({
      schema,
      components
    })
  }

  const { schema, components } = data

  if (!schema || !components) {
    init()
    return <Spin />
  }

  return (
    <div className='lowcode-plugin-sample-preview'>
      <ReactRenderer
        className='lowcode-plugin-sample-preview-content'
        schema={schema}
        components={components}
        appHelper={{
          requestHandlersMap: {
            axios: createAxiosHandler()
          }
        }}
      />
    </div>
  )
}

export default SamplePreview
