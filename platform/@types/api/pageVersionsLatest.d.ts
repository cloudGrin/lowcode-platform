interface ApiTypes {
  ['/api/page-versions/latest']: ApiPageVersionsLatest
}

interface ApiPageVersionsLatest {
  request: ApiPageVersionsLatestRequest
  response: ApiPageVersionsLatestResponse
}

interface ApiPageVersionsLatestRequest {
  navUuid: string
  /**
   * 不传则返回最新的
   */
  versionId?: string
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
