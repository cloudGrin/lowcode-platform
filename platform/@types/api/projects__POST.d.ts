interface ApiTypes {
  ['/api/projects__POST']: ApiProjects__POST
}

interface ApiProjects__POST {
  request: ApiProjectsRequest__POST
  response: ApiProjectsResponse__POST
}

interface ApiProjectsRequest__POST {
  name: string
  description?: string
}

interface ApiProjectsResponse__POST {
  data: {
    id: number
    name: string
    description: string
    appId: string
  }
}
