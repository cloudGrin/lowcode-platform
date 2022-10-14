interface ApiTypes {
  ['/api/auth/local/register']: AuthLocalRegister
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
    provider: string
    confirmed: boolean
    blocked: boolean
    createdAt: Date
    updatedAt: Date
  }
}
