import { memo } from 'react'

function Footer() {

  return (
    <div className='pt-40 mt-20 text-c_999 h-footer bg-c_white'>
      <div className='m-auto w-page_content'>
        <p className='mt-10 text-center'>
          COPYRIGHT © LOWCODE-PLATFORM
          <a
            className='ml-4 no-underline text-c_999'
            href='https://beian.miit.gov.cn/'
            target='_blank'
            rel='noreferrer'
          >
            沪ICP备 123123号-43
          </a>
        </p>

        <div>
          <div className='p-10 m-auto text-center' style={{ width: '300px' }}>
            <a
              target='_blank'
              href='http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=31011402009573'
              className='inline-flex items-center'
              rel='noreferrer'
            >
              <img
                src='https://shadow.zhaogangimg.com/assets/pm-nuxt-contrib-comp/static/wangbei-d0289dc.png'
                className=''
                alt='wangbei'
              />
              <span className='ml-6 ' style={{ color: '#939393' }}>
                沪公网安备 123122009573号
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Footer)
