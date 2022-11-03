interface ApiTypes {
  ['/api/users/forApplicationAdmin']: ApiUsersForApplicationAdmin
}

interface ApiUsersForApplicationAdmin {
  request: ApiUsersForApplicationAdminRequest
  response: ApiUsersForApplicationAdminResponse
}

interface ApiUsersForApplicationAdminRequest {}

interface ApiUsersForApplicationAdminResponse {
  data: {
    id: number
    username: string
    email: string
  }[]
}
