import { Spin } from 'antd'

import { injectComponents } from '@alilc/lowcode-plugin-inject'
import ReactRenderer from '@alilc/lowcode-react-renderer'
import { AssetLoader, buildComponents } from '@alilc/lowcode-utils'
import { useEffect, useState } from 'react'
import createAxiosHandler from '../datasource-axios-handler'

import { getPagePackages } from '../helper'
import useQuery from '@/hooks/useQuery'
import { useStrapiRequest } from '@/lib/request'

async function init({ projectSchema }: any) {
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

const SamplePreview: React.FC = () => {
  const [data, setData] = useState<any>({})
  const query = useQuery()

  const { data: pageVersionsResult, loading: pageVersionsLoading } = useStrapiRequest(
    '/api/page-versions/latest',
    () => ({
      payload: {
        navUuid: query.get('navUuid') as string,
        versionId: query.get('versionId'),
        pagination: {
          page: 1,
          pageSize: 1
        }
      }
    }),
    {
      refreshDeps: [query]
    }
  )

  useEffect(() => {
    if (pageVersionsResult) {
      init({ projectSchema: pageVersionsResult.data.schema }).then(({ schema, components }) => {
        setData({
          schema,
          components
        })
      })
    }
  }, [pageVersionsResult])

  const { schema, components } = data

  if (!schema || !components) {
    return <></>
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
