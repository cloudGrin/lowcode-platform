interface ApiTypes {
  ['/api/projects/${id}__DELETE']: ApiProjectsId__DELETE
}

interface ApiProjectsId__DELETE {
  request: ApiProjectsIdRequest__DELETE
  response: ApiProjectsIdResponse__DELETE
}

interface ApiProjectsIdRequest__DELETE {}

interface ApiProjectsIdResponse__DELETE {
  data: {
    success: boolean
  }
}
