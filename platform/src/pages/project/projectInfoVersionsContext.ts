import { createContext, Dispatch, SetStateAction } from 'react'

export const InfoContext = createContext<
  [data: ApiProjectsIdResponse['data'] | null, getData: () => Promise<ApiProjectsIdResponse['data'] | null>]
>([null, () => Promise.resolve(null)])

export const LatestVersionsContext = createContext<
  [
    data: ApiProjectVersionsResponse['data'][number] | null | 'NO_DATA',
    getData: () => Promise<ApiProjectVersionsResponse['data'][number] | null | 'NO_DATA'>,
    mutateData: Dispatch<SetStateAction<ApiProjectVersionsResponse['data'][number] | null | 'NO_DATA'>>
  ]
>([null, () => Promise.resolve(null), () => {}])
