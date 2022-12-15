import { useStrapiRequest } from '@/lib/request'
import { TreeItem } from '@atlaskit/tree'
import { FC, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router'
import ReactRenderer from '@alilc/lowcode-react-renderer'
import createAxiosHandler from '../datasource-axios-handler'
import { initPage } from '../helper'

const AppPreviewPageContent: FC = () => {
  const [nav] = useOutletContext<[TreeItem]>()
  const [data, setData] = useState<any>({})

  const {
    run: getPageVersion,
    data: pageVersionsResult,
    loading: pageVersionsLoading
  } = useStrapiRequest(
    '/api/page-versions/${id}',
    () => ({
      urlValue: {
        id: nav.data?.version?.id
      },
      hideErrorMessage: true
    }),
    {
      manual: true
    }
  )

  useEffect(() => {
    if (nav?.data?.version?.id) {
      getPageVersion()
    }
  }, [getPageVersion, nav])

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

export default AppPreviewPageContent
