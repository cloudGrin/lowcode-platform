interface ApiTypes {
  ['/api/users/applicationAdmin']: ApiUsersApplicationAdmin
}

interface ApiUsersApplicationAdmin {
  request: ApiUsersApplicationAdminRequest
  response: ApiUsersApplicationAdminResponse
}

interface ApiUsersApplicationAdminRequest {}

interface ApiUsersApplicationAdminResponse {
  data: {
    id: number
    username: string
    isPlatformAdmin: boolean
  }[]
}
