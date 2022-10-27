interface ApiTypes {
  ['/api/projects']: Projects
}

interface Projects {
  request: ProjectsRequest
  response: ProjectsResponse
}

interface ProjectsRequest {}

interface ProjectsResponse {
  data: Data[]
  meta: Meta
}

export interface ProjectRole {
  id: number
  name: string
}

export interface User {
  id: number
  username: string
  projectRole: ProjectRole
}

export interface Attribute {
  name: string
  description: string
  createdAt: string
  updatedAt: string
  users: User[]
}

export interface Data {
  id: number
  attributes: Attribute
}

export interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface Meta {
  pagination: Pagination
}
