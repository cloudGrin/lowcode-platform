interface ApiTypes {
  ['/api/users/platformAdmin']: ApiUsersPlatformAdmin
}

interface ApiUsersPlatformAdmin {
  request: ApiUsersPlatformAdminRequest
  response: ApiUsersPlatformAdminResponse
}

interface ApiUsersPlatformAdminRequest {}

interface ApiUsersPlatformAdminResponse {
  data: {
    id: number
    username: string
    isSuperAdmin: boolean
  }[]
}
