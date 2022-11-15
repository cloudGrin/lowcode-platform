interface ApiTypes {
  ['/api/project-routes/${id}__PUT']: ApiProjectRoutesId__PUT
}

interface ApiProjectRoutesId__PUT {
  request: ApiProjectRoutesIdRequest__PUT
  response: ApiProjectRoutesIdResponse__PUT
}

interface ApiProjectRoutesIdRequest__PUT {
  title: string
}

interface ApiProjectRoutesIdResponse__PUT {
  data: Record<string, any>
}
