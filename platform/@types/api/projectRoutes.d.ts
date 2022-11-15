interface ApiTypes {
  ['/api/project-routes']: ApiProjectRoutes
}

type ApiProjectRouteType = 'NAV' | 'LINK' | 'PAGE'

interface ApiProjectRoutes {
  request: ApiProjectRoutesRequest
  response: ApiProjectRoutesResponse
}

interface ApiProjectRoutesRequest {
  projectId: number | string
}

interface ApiProjectRoutesResponse {
  data: {
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
}
