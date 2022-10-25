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
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: Date
  updatedAt: Date
  department?: string
}
