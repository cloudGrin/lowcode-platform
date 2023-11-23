interface ApiTypes {
  ['/api/project-routes/deleteByUuid__DELETE']: ApiProjectRoutesDeleteByUuid__DELETE
}

interface ApiProjectRoutesDeleteByUuid__DELETE {
  request: ApiProjectRoutesDeleteByUuidRequest__DELETE
  response: ApiProjectRoutesDeleteByUuidResponse__DELETE
}

interface ApiProjectRoutesDeleteByUuidRequest__DELETE {
  navUuid: string
}

interface ApiProjectRoutesDeleteByUuidResponse__DELETE {
  data: {
    success: boolean
    message?: string
  }
}
