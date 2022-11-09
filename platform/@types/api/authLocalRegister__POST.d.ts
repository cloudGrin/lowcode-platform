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
  data: {
    jwt: string
    user: {
      id: number
      username: string
      email: string
      isPlatformAdmin: boolean
      isApplicationAdmin: boolean
      isSuperAdmin: boolean
    }
  }
}
