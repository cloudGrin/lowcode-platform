import { strapiRequestInstance } from '@/lib/request'
import React, { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation, useLoaderData, useParams } from 'react-router-dom'
import Layout from './components/layout'
import { InfoContext, VersionsContext } from './projectInfoVersionsContext'
// const useQuery = () => new URLSearchParams(useLocation().search)

const Project: React.FC = () => {
  const { id } = useParams()

  const [info, setInfo] = useState<ApiProjectsIdResponse['data'] | null>(null)
  const [versions, setVersions] = useState<ApiProjectVersionsResponse['data'] | null>(null)

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
        }
      },
      {}
    )
    setVersions(result.data)
    return result.data
  }, [id])

  useEffect(() => {
    if (id) {
      getInfoApi().then(() => getVersionsApi())
    }
  }, [getInfoApi, getVersionsApi, id])

  return (
    <InfoContext.Provider value={[info, getInfoApi]}>
      <VersionsContext.Provider value={[versions, getVersionsApi]}>
        <div className='project-container'>
          <Layout>
            <Outlet />
          </Layout>
        </div>
      </VersionsContext.Provider>
    </InfoContext.Provider>
  )
}

export default Project
