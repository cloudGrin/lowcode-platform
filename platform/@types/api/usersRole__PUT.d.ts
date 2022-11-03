interface ApiTypes {
  ['/api/users/role__PUT']: ApiUsersRole
}

interface ApiUsersRole {
  request: ApiUsersRoleRequest
  response: ApiUsersRoleResponse
}

interface ApiUsersRoleRequest {
  toRole: 'Engineer' | 'ApplicationAdmin' | 'PlatformAdmin'
  userIds: number[]
}

interface ApiUsersRoleResponse {
  success: boolean
  errorMessage: string
}
