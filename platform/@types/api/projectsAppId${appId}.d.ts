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
}
