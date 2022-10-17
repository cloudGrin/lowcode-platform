import { atom } from 'jotai'

type IGetIntentionUserInfoRes = ApiTypes['/api/users/me']['response']

/**
 * 公司信息
 */
export const userInfoAtom = atom<IGetIntentionUserInfoRes | null>(null)

/**
 * 用户信息（只写）
 */
export const userInfoWAtom = atom<null, IGetIntentionUserInfoRes | null>(null, (_get, set, info) => {
  console.log(info)
  set(userInfoAtom, info)
})
