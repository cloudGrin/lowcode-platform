interface ApiTypes {
  ['/api/page-versions__POST']: ApiPageVersions__POST
}

interface ApiPageVersions__POST {
  request: ApiPageVersionsRequest__POST
  response: ApiPageVersionsResponse__POST
}

interface ApiPageVersionsRequest__POST {
  schema: Record<string, any>
  description: string
  navUuid: string
}

interface ApiPageVersionsResponse__POST {
  data: {
    success: boolean
  }
}
