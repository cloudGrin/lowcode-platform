import { createContext } from 'react'

export const InfoContext = createContext<
  [data: ApiProjectsIdResponse['data'] | null, getData: () => Promise<ApiProjectsIdResponse['data'] | null>]
>([null, () => Promise.resolve(null)])

export const VersionsContext = createContext<
  [data: ApiProjectVersionsResponse['data'] | null, getData: () => Promise<ApiProjectVersionsResponse['data'] | null>]
>([null, () => Promise.resolve(null)])
