interface ApiTypes {
  ['/api/projects']: ApiProjects
}

interface ApiPagination {
  page: number
  pageSize: number
}

interface ApiProjects {
  request: ApiProjectsRequest
  response: ApiProjectsResponse
}

interface ApiProjectsRequest {
  pagination?: ApiPagination
}

interface ApiProjectsResponse {
  data: {
    id: number
    appId: string
    name: string
    description: string
  }[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
