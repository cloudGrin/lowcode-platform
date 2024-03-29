import { useStrapiRequest } from '@/lib/request'
import { TreeItem } from '@atlaskit/tree'
import { FC, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router'
import ReactRenderer from '@alilc/lowcode-react-renderer'
import createAxiosHandler from '../datasource-axios-handler'
import { initPage } from '../helper'
import { createStore } from 'zustand/vanilla'
import { useNavigateTo, parseQuery } from '@/pages/engine/utils'
import { useParams } from 'react-router-dom'

const store = createStore(() => ({}))
const AppPreviewPageContent: FC = () => {
  const [nav] = useOutletContext<[TreeItem]>()
  const [data, setData] = useState<any>({})
  const navigateTo = useNavigateTo()
  const { navUuid } = useParams()

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
      hideErrorMessage: true,
      payload: {
        navUuid: navUuid!
      }
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
          },
          constants: {
            store
          },
          utils: {
            navigateTo,
            parseQuery
          }
        }}
      />
    </div>
  )
}

export default AppPreviewPageContent
