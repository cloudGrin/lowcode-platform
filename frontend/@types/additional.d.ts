import next, { NextPage as OriginNextPage } from 'next'
import { ReactElement, ReactNode } from 'react'
declare module 'next' {
  export type NextPageWithLayout<P = {}, IP = P> = OriginNextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode
  }
}
