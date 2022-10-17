import Footer from '@/components/layout/base/footer'
import Header from '@/components/layout/base/header'
import { ReactElement, ReactNode } from 'react'

const commonLayout: (page: ReactElement) => ReactNode = (page) => {
  return (
    <>
      <Header />
      <main className='relative z-0 m-auto min-h-layout_content w-page_content'>{page}</main>
      <Footer />
    </>
  )
}

export default commonLayout
