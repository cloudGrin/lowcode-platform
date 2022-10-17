/* prettier-ignore-start */
import commonLayout from '@/components/layout/base'
import { ConfigProvider } from 'antd'
import 'moment/locale/zh-cn'
import zhCN from 'antd/lib/locale/zh_CN'
import type { NextPageWithLayout } from 'next'
import type { AppProps } from 'next/app'
import Head from 'next/head'

/** 以下css引入顺序请勿修改，会导致bug */
import '@/styles/base.css'
import 'antd/dist/antd.less'
import '@/styles/antd-reset.less'
import '@/styles/global.css'

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? commonLayout

  return (
    <>
      <Head>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>
      <ConfigProvider locale={zhCN} autoInsertSpaceInButton={false}>
        {getLayout(<Component {...pageProps} />)}
      </ConfigProvider>
    </>
  )
}

export default MyApp
/* prettier-ignore-end */
