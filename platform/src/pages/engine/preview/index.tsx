import ReactRenderer from '@alilc/lowcode-react-renderer'
import { useEffect, useState } from 'react'
import createAxiosHandler from '../datasource-axios-handler'

import useQuery from '@/hooks/useQuery'
import { useStrapiRequest } from '@/lib/request'
import { initPage } from '../helper'

const SamplePreview: React.FC = () => {
  const [data, setData] = useState<any>({})
  const query = useQuery()

  const {
    data: pageVersionsResult,
    loading: pageVersionsLoading,
    run: getVersion
  } = useStrapiRequest(
    '/api/page-versions/${id}',
    () => ({
      urlValue: {
        id: query.get('versionId') as string
      },
      hideErrorMessage: true
    }),
    {
      manual: true
    }
  )

  useEffect(() => {
    if (query && query.get('versionId')) {
      getVersion()
    }
  }, [getVersion, query])

  useEffect(() => {
    if (pageVersionsResult) {
      initPage({ projectSchema: pageVersionsResult.data.schema }).then(({ schema, components }) => {
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
