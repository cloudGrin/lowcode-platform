import ReactRenderer from '@alilc/lowcode-react-renderer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import createAxiosHandler from '../datasource-axios-handler'

import useQuery from '@/hooks/useQuery'
import { useStrapiRequest } from '@/lib/request'
import { initPage } from '../helper'
import localForage from 'localforage'
import { message } from 'antd'

const SamplePreview: React.FC = () => {
  const [data, setData] = useState<any>({})
  const query = useQuery()

  const { run: getVersion } = useStrapiRequest(
    '/api/page-versions/${id}',
    () => ({
      urlValue: {
        id: query.get('versionId') as string
      },
      hideErrorMessage: true
    }),
    {
      manual: true,
      onSuccess(res) {
        generateData(res.data.schema)
      }
    }
  )

  const storeKey = useMemo(() => {
    const navUuid = query.get('navUuid')
    return navUuid ? `PAGE_HISTORY--__--${navUuid}` : ''
  }, [query])

  const generateData = useCallback((data) => {
    initPage({ projectSchema: data }).then(({ schema, components }) => {
      setData({
        schema,
        components
      })
    })
  }, [])

  useEffect(() => {
    const isProdPreview = query.get('tab') === 'prod'
    if (isProdPreview) {
      getVersion()
    } else {
      if (storeKey) {
        localForage.getItem<any>(storeKey).then((value) => {
          if (value) {
            // 存在本地版本
            generateData(value.schema)
            message.info('存在本地版本, 预览将展示本地版本')
          } else if (query.get('versionId')) {
            getVersion()
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

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
