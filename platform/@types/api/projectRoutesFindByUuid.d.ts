interface ApiTypes {
  ['/api/project-routes/findByUuid']: ApiProjectRoutesFindByUuid
}

interface ApiProjectRoutesFindByUuid {
  request: ApiProjectRoutesFindByUuidRequest
  response: ApiProjectRoutesFindByUuidResponse
}

interface ApiProjectRoutesFindByUuidRequest {
  navUuid: number | string
}

interface ApiProjectRoutesFindByUuidResponse {
  data: {
    type: ApiProjectRouteType
    id: number | string
    title: string
    listOrder: number
    navUuid: string
    parentNavUuid: string
    url?: string
    isNewPage?: boolean
  }
}
