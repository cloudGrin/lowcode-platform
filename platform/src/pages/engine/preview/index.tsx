import ReactRenderer from '@alilc/lowcode-react-renderer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import createAxiosHandler from '../datasource-axios-handler'

import useQuery from '@/hooks/useQuery'
import { useStrapiRequest } from '@/lib/request'
import { initPage } from '../helper'
import localForage from 'localforage'
import { message } from 'antd'
import { createStore } from 'zustand/vanilla'
import { parseQuery, useNavigateTo } from '@/pages/engine/utils'

const store = createStore(() => ({}))

if (window.self !== window.top) {
  // 在iframe中，可以判断当前在页面管理界面
  store.subscribe(() => {
    window.parent.postMessage(
      {
        source: 'store-update',
        payload: {
          data: store.getState()
        }
      },
      location.origin
    )
  })

  window.parent.postMessage(
    {
      source: 'store-get'
    },
    location.origin
  )

  window.addEventListener('message', function (event) {
    if (event.origin === location.origin) {
      const { source, payload = {} } = event.data || {}
      if (source === 'store-sync') {
        console.log('Message from parent:', source, payload)
        store.setState({ ...(payload.data || {}) })
      }
    }
  })
}

const SamplePreview: React.FC = () => {
  const [data, setData] = useState<any>({})
  const query = useQuery()
  const navigateTo = useNavigateTo()

  const { run: getVersionById } = useStrapiRequest(
    '/api/page-versions/${id}',
    () => ({
      urlValue: {
        id: query.get('versionId') as string
      },
      hideErrorMessage: true,
      payload: {
        navUuid: query.get('navUuid')!
      }
    }),
    {
      manual: true,
      onSuccess(res) {
        generateData(res.data.schema)
      }
    }
  )

  const { run: getLatestVersion } = useStrapiRequest(
    '/api/page-versions/latest',
    () => ({
      payload: {
        navUuid: query.get('navUuid')!,
        pagination: {
          page: 1,
          pageSize: 1
        }
      }
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

  const getVersion = () => {
    if (query.get('versionId')) {
      getVersionById()
    } else {
      getLatestVersion()
    }
  }

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
          } else {
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

export default SamplePreview
