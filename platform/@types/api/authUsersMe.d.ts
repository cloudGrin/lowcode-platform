interface ApiTypes {
  ['/api/users/me']: ApiUserMe
}

interface ApiUserMe {
  request: ApiUserMeRequest
  response: ApiUserMeResponse
}

interface ApiUserMeRequest {}

interface ApiUserMeResponse {
  id: number
  username: string
  email: string
  isSuperAdmin: boolean
  isAdmin: boolean
  canCreateProject: boolean
}
