interface ApiTypes {
  ['/api/page-versions/latest']: ApiPageVersionsLatestLatest
}

interface ApiPageVersionsLatest {
  request: ApiPageVersionsLatestRequest
  response: ApiPageVersionsLatestResponse
}

interface ApiPageVersionsLatestRequest {
  navUuid: string
  pagination?: {
    page: number
    pageSize: number
  }
}

interface ApiPageVersionsLatestResponse {
  data: {
    id: number
    description: string
    schema: Record<string, any>
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
