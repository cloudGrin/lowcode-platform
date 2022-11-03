interface ApiTypes {
  ['/api/auth/local__POST']: ApiAuthLocal__POST
}

interface ApiAuthLocal__POST {
  request: ApiAuthLocalRequest__POST
  response: ApiAuthLocalResponse__POST
}

interface ApiAuthLocalRequest__POST {
  identifier: string
  password: string
}

interface ApiAuthLocalResponse__POST {
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
