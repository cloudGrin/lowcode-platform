interface ApiTypes {
  ['/api/project-routes__POST']: ApiProjectRoutes__POST
}

interface ApiProjectRoutes__POST {
  request: ApiProjectRoutesRequest__POST
  response: ApiProjectRoutesResponse__POST
}

interface ApiProjectRoutesRequest__POST {
  projectId: string | number
  title: string
  type: ApiProjectRouteType
  parentNavUuid?: string
  url?: string
}

interface ApiProjectRoutesResponse__POST {
  data: {
    type: ApiProjectRouteType
    id: number
    title: string
    listOrder: number
    navUuid: string
    parentNavUuid: string
    url?: string
  }
}
