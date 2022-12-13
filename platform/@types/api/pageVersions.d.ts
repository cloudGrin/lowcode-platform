interface ApiTypes {
  ['/api/page-versions']: ApiPageVersions
}

interface ApiPageVersions {
  request: ApiPageVersionsRequest
  response: ApiPageVersionsResponse
}

interface ApiPageVersionsRequest {
  navUuid: string
  pagination?: ApiPagination
}

interface ApiPageVersionsResponse {
  data: {
    id: number
    description: string
    schema: Record<string, any>
    createdAt?: string
    operator?: {
      id: number
      username: string
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
