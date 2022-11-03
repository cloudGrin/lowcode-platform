interface ApiTypes {
  ['/api/users/forPlatformAdmin']: ApiUsersForPlatformAdmin
}

interface ApiUsersForPlatformAdmin {
  request: ApiUsersForPlatformAdminRequest
  response: ApiUsersForPlatformAdminResponse
}

interface ApiUsersForPlatformAdminRequest {}

interface ApiUsersForPlatformAdminResponse {
  data: {
    id: number
    username: string
    email: string
  }[]
}
