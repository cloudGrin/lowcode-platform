import { useMount } from 'ahooks'
import useUser from '@/hooks/useUser'
import { getLoginState } from '@/lib/request/utils'
import { memo } from 'react'
import LayoutTopbar from './layoutTopbar'
import Head from 'next/head'

function Header() {
  const getUserAndOrgInfo = useUser()

  useMount(async () => {
    if (getLoginState().loginToken) {
      try {
        await getUserAndOrgInfo()
      } catch (error) {
        console.log(error)
      }
    }
  })

  return (
    <>
      <Head>
        <title>lowcode-platform</title>
      </Head>
      <div className='layout_common_header'>
        <LayoutTopbar />
      </div>
    </>
  )
}

export default memo(Header)
