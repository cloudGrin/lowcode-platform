import { strapiRequestInstance } from '@/lib/request'
import React, { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useLoaderData, useParams } from 'react-router-dom'
import Layout from './components/layout'
import { InfoContext, LatestVersionsContext } from './projectInfoVersionsContext'
// const useQuery = () => new URLSearchParams(useLocation().search)

const Project: React.FC = () => {
  const { id } = useParams()

  const [info, setInfo] = useState<ApiProjectsIdResponse['data'] | null>(null)
  const [latestVersion, setLatestVersion] = useState<ApiProjectVersionsResponse['data'][number] | null | 'NO_DATA'>(
    null
  )

  const getInfoApi = useCallback(async () => {
    const result = await strapiRequestInstance('/api/projects/${id}', {
      urlValue: {
        id: id!
      }
    })
    setInfo(result.data)
    return result.data
  }, [id])

  const getVersionsApi = useCallback(async () => {
    const result = await strapiRequestInstance(
      '/api/project-versions',
      {
        projectId: id!,
        pagination: {
          page: 1,
          pageSize: 1
        },
        isNeedNavList: true
      },
      {}
    )
    setLatestVersion(result.data?.[0] || 'NO_DATA')
    return result.data?.[0] || null
  }, [id])

  useEffect(() => {
    if (id) {
      getInfoApi().then(() => getVersionsApi())
    }
  }, [getInfoApi, getVersionsApi, id])

  return (
    <InfoContext.Provider value={[info, getInfoApi]}>
      <LatestVersionsContext.Provider value={[latestVersion, getVersionsApi, setLatestVersion]}>
        <div className='project-container'>
          <Layout>
            <Outlet />
          </Layout>
        </div>
      </LatestVersionsContext.Provider>
    </InfoContext.Provider>
  )
}

export default Project
