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
    attributes: {
      name: string
      description: string
      createdAt: string
      updatedAt: string
      users: {
        id: number
        username: string
        projectRole: {
          id: number
          name: string
        }
      }[]
    }
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
