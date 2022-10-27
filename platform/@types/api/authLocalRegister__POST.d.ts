interface ApiTypes {
  ['/api/auth/local/register__POST']: AuthLocalRegister
}

interface AuthLocalRegister {
  request: AuthLocalRegisterRequest
  response: AuthLocalRegisterResponse
}

interface AuthLocalRegisterRequest {
  username: string
  email: string
  password: string
}

interface AuthLocalRegisterResponse {
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
