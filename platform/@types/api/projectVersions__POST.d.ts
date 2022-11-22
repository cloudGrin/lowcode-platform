interface ApiTypes {
  ['/api/project-versions__POST']: ApiProjectVersions__POST
}

interface ApiProjectVersions__POST {
  request: ApiProjectVersionsRequest__POST
  response: ApiProjectVersionsResponse__POST
}

interface ApiProjectVersionsRequest__POST {
  version: string
  description: string
  projectId: string | number
}

interface ApiProjectVersionsResponse__POST {
  data: {
    success: boolean
  }
}
