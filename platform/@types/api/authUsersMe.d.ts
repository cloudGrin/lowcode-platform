interface ApiTypes {
  ['/api/users/me']: UserMe
}

interface UserMe {
  request: UserMeRequest
  response: UserMeResponse
}

interface UserMeRequest {}

interface UserMeResponse {
  id: number
  username: string
  email: string
  isSuperAdmin: boolean
  isAdmin: boolean
  canCreateProject: boolean
}
