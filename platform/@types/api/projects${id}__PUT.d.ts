interface ApiTypes {
  ['/api/projects/${id}__PUT']: ApiProjectsId__PUT
}

interface ApiProjectsId__PUT {
  request: ApiProjectsIdRequest__PUT
  response: ApiProjectsIdResponse__PUT
}

interface ApiProjectsIdRequest__PUT {
  name: string
  description?: string
}

interface ApiProjectsIdResponse__PUT {
  data: {
    id: number
    name: string
    description: string
    appId: string
  }
}
