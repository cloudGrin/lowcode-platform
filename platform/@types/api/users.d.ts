interface ApiTypes {
  ['/api/users']: ApiUsers
}

interface ApiUsers {
  request: ApiUsersRequest
  response: ApiUsersResponse
}

interface ApiUsersRequest {}

interface ApiUsersResponse {
  data: {
    id: number
    username: string
    email: string
    isPlatformAdmin: boolean
    isApplicationAdmin: boolean
    isSuperAdmin: boolean
  }[]
}
