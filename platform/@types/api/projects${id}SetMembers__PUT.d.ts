interface ApiTypes {
  ['/api/projects/${id}/setMembers__PUT']: ApiProjectsIdSetMembers__PUT
}

interface ApiProjectsIdSetMembers__PUT {
  request: ApiProjectsIdSetMembersRequest__PUT
  response: ApiProjectsIdSetMembersResponse__PUT
}

interface ApiProjectsIdSetMembersRequest__PUT {
  memberIds: number[]
  toRole: 'master' | 'developer'
}

interface ApiProjectsIdSetMembersResponse__PUT {
  data: {
    success: boolean
  }
}
