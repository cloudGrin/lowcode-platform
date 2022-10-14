import 'antd/dist/antd.less'
import '../styles/global.css'
import '../styles/antd-custom.less'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
