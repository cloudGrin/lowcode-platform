interface ApiTypes {
  ['/api/projects/${id}']: ApiProjectsId
}

interface ApiProjectsId {
  request: ApiProjectsIdRequest
  response: ApiProjectsIdResponse
}

interface ApiProjectsIdRequest {}

interface ApiProjectsIdResponse {
  data: {
    id: number
    appId: string
    name: string
    description: string
  }
}
