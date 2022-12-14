interface ApiTypes {
  ['/api/users/me']: ApiUsersMe
}

interface ApiUsersMe {
  request: ApiUsersMeRequest
  response: ApiUsersMeResponse
}

interface ApiUsersMeRequest {}

interface ApiUsersMeResponse {
  data: {
    id: number
    username: string
    email: string
    isPlatformAdmin: boolean
    isApplicationAdmin: boolean
    isSuperAdmin: boolean
  }
}
