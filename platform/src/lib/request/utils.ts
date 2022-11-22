import Cookies from 'js-cookie'

export function getLoginState() {
  class Config {
    /**
     * 登录token
     */
    get loginToken() {
      return Cookies.get('jwtToken') ?? ''
    }

    /**
     * 用户id
     */
    get userInfo() {
      return JSON.parse(Cookies.get('userInfo') || '""') as ApiTypes['/api/users/me']['response']['data']
    }

    /**
     * 设置登录token
     * @param {string} val 登录token
     */
    setLoginToken(val: string): this {
      Cookies.set('jwtToken', val, {
        expires: 7 // 7 day
      })
      return this
    }

    /**
     * 设置用户信息
     * @param {string} val 用户信息
     */
    setUserInfo(val: Record<string, any>): this {
      Cookies.set('userInfo', JSON.stringify(val), {
        expires: 7 // 7 day
      })
      return this
    }

    /**
     * 移除登录token
     */
    removeLoginToken(): this {
      Cookies.remove('jwtToken', {})
      return this
    }

    /**
     * 移除用户id
     */
    removeUserInfo(): this {
      Cookies.remove('userInfo', {})
      return this
    }

    /**
     * 移除登录token，用户id，租户id
     */
    removeUser(): this {
      this.removeLoginToken()
      this.removeUserInfo()
      return this
    }
  }
  return new Config()
}
