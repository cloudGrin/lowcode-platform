interface ApiTypes {
  ['/api/projects/${id}/users']: ApiProjectsUsers
}

interface ApiProjectsUsers {
  request: ApiProjectsUsersRequest
  response: ApiProjectsUsersResponse
}

interface ApiProjectsUsersRequest {}

interface ApiProjectsUsersResponse {
  data: {
    id: number
    appId: string
    master: { id: number; username: string }[]
    developer: { id: number; username: string }[]
  }
}
