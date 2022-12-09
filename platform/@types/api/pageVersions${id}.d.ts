interface ApiTypes {
  ['/api/page-versions/${id}']: ApiPageVersionsId
}

interface ApiPageVersionsId {
  request: ApiPageVersionsIdRequest
  response: ApiPageVersionsIdResponse
}

interface ApiPageVersionsIdRequest {}

interface ApiPageVersionsIdResponse {
  data: {
    id: number
    description: string
    schema: Record<string, any>
  }
}
