interface ApiTypes {
  ['/api/auth/local__POST']: AuthLocal
}

interface AuthLocal {
  request: AuthLocalRequest
  response: AuthLocalResponse
}

interface AuthLocalRequest {
  identifier: string
  password: string
}

interface AuthLocalResponse {
  jwt: string
  user: {
    id: number
    username: string
    email: string
    isSuperAdmin: boolean
    isAdmin: boolean
    canCreateProject: boolean
  }
}
