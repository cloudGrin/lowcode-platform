interface ApiTypes {
  ['/api/project-versions']: ApiProjectVersions
}

interface ApiProjectVersions {
  request: ApiProjectVersionsRequest
  response: ApiProjectVersionsResponse
}

interface ApiProjectVersionsRequest {
  projectId: number | string
  pagination?: {
    page: number
    pageSize: number
  }
}

interface ApiProjectVersionsResponse {
  data: {
    id: number
    version: string
    description: string
    navList: {
      rootId: string
      items: Record<
        string,
        {
          id: string
          children?: string[]
          data: {
            type: ApiProjectRouteType
            id: number | string
            title: string
            listOrder: number
            navUuid: string
            parentNavUuid: string
            url?: string
          }
          isExpanded?: boolean
        }
      >
    }
    routeToVersions: Record<string, any>
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
