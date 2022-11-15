interface ApiTypes {
  ['/api/project-routes/${uuid}__DELETE']: ApiProjectRoutes__DELETE
}

interface ApiProjectRoutes__DELETE {
  request: ApiProjectRoutesRequest__DELETE
  response: ApiProjectRoutesResponse__DELETE
}

interface ApiProjectRoutesRequest__DELETE {}

interface ApiProjectRoutesResponse__DELETE {
  data: {
    success: boolean
  }
}
