interface ApiTypes {
  ['/api/auth/local']: AuthLocal
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
    provider: string
    confirmed: boolean
    blocked: boolean
    createdAt: Date
    updatedAt: Date
    department?: string
  }
}
