import { userInfoWAtom } from '@/atoms/user'
import { useUpdateAtom } from 'jotai/utils'
import { useStrapiRequest } from '@/lib/request'
import { getLoginState } from '@/lib/request/utils'
export default function useUserAndOrgInfo() {
  const setUsr = useUpdateAtom(userInfoWAtom)
  const TokenUserInfo = getLoginState()
  const { runAsync } = useStrapiRequest('/api/users/me', () => ({}), {
    onSuccess(res) {
      TokenUserInfo.setUserInfo(res)
      setUsr(res)
    },
    manual: true
  })
  return async function getUserInfo() {
    const userInfoFromCookie = TokenUserInfo.userInfo
    if (userInfoFromCookie) {
      setUsr(userInfoFromCookie)
      return Promise.resolve(userInfoFromCookie)
    } else {
      return runAsync()
    }
  }
}
