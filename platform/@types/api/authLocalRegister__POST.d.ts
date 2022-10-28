interface ApiTypes {
  ['/api/auth/local/register__POST']: ApiAuthLocalRegister__POST
}

interface ApiAuthLocalRegister__POST {
  request: ApiAuthLocalRegisterRequest__POST
  response: ApiAuthLocalRegisterResponse__POST
}

interface ApiAuthLocalRegisterRequest__POST {
  username: string
  email: string
  password: string
}

interface ApiAuthLocalRegisterResponse__POST {
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
