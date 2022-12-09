interface ApiTypes {
  ['/api/projects/appId/${appId}']: ApiProjectsAppId
}

interface ApiProjectsAppId {
  request: ApiProjectsAppIdRequest
  response: ApiProjectsAppIdResponse
}

interface ApiProjectsAppIdRequest {}

interface ApiProjectsAppIdResponse {
  data: {
    id: number
    appId: string
    name: string
    description: string
    version?: {
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
              isNewPage?: boolean
            }
            isExpanded?: boolean
          }
        >
      }
    }
  }
}
