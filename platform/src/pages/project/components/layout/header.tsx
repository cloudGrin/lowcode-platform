import Icon from '@/components/icon'
import { CodeOutlined, UserOutlined, UnorderedListOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Divider, Popover, Tabs } from 'antd'
import { useContext } from 'react'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom'
import { InfoContext } from '../../projectInfoVersionsContext'
const tabs = [
  {
    label: '页面管理',
    key: '/\\d+/admin((/\\S+)|(/?))',
    routePath: '/\\d+/admin',
    matchOrder: 3
  },
  {
    label: '应用设置',
    key: '/\\d+/admin/appSetting',
    matchOrder: 2
  },
  {
    label: '应用发布',
    key: '/\\d+/admin/appPublish',
    matchOrder: 1
  }
]

export default function Header() {
  const [projectInfo] = useContext(InfoContext)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()

  const activeKey = useMemo(() => {
    for (const tab of [...tabs].sort((a, b) => a.matchOrder - b.matchOrder)) {
      const result = pathname.match(new RegExp(tab.key))
      if (result) {
        return tab.key
      }
    }
  }, [pathname])

  const jumpRoute = useCallback(
    (v: any) => {
      const item = tabs.find((tab) => tab.key === v)!
      navigate((item.routePath ?? item.key).replace('\\d+', id + ''))
    },
    [navigate, id]
  )

  return (
    <header className='fixed top-0 left-0 w-full bg-white z-[9] border-b-[1px] border-[#f1f2f3]'>
      <div className='relative flex items-center justify-between w-full px-[16px] h-header'>
        {/* projectNameLogo */}
        <div className='flex items-center width-[205px]'>
          <Popover
            placement='bottomRight'
            content={
              <div className='w-[110px]'>
                <Link to='/'>
                  <div className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'>
                    <UserOutlined className='align-middle' />
                    <span className='ml-[6px]'>我的应用</span>
                  </div>
                </Link>
                <Divider className='my-[12px]' />
                <Link to='/platformManage'>
                  <div className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'>
                    <SettingOutlined className='align-middle' />
                    <span className='ml-[6px]'>平台管理</span>
                  </div>
                </Link>
              </div>
            }
            trigger='hover'
          >
            <div className='text-[18px]  text-[#878f95] p-[6px] rounded-[6px] justify-center flex items-center hover:bg-[#f1f2f3] hover:text-[#1f4469] transition-all cursor-pointer'>
              <Icon name='menu-dots' className='w-[20px] h-[20px] ' />
            </div>
          </Popover>
          <div className='ml-[9px] flex items-center px-[4px]'>
            <div className='w-[24px] h-[24px] bg-[#0089ff] rounded-[6px] justify-center flex items-center'>
              <CodeOutlined className='text-[16px] text-white' />
            </div>
            <span className='ml-[8px] text-[#171a1d] text-[14px] max-w-[126px] text-ellipsis whitespace-nowrap overflow-hidden'>
              {projectInfo?.name}
            </span>
          </div>
        </div>
        {/* tabNav */}
        <Tabs
          className='absolute left-0 right-0 h-full mx-auto w-fit'
          activeKey={activeKey}
          centered
          items={tabs}
          onChange={jumpRoute}
        />
        {/* visit */}
        <Button className='leading-none text-[14px]'>访问</Button>
        <style jsx>{`
          div :global(.ant-tabs-nav) {
            margin-bottom: 0;
            height: 100%;
          }
          div :global(.ant-tabs-content-holder) {
            display: none;
          }
          div :global(.ant-tabs-top > .ant-tabs-nav::before) {
            border-bottom: none;
          }

          div :global(.ant-tabs-nav) {
            margin-bottom: 0;
            padding: 0 24px;
          }
          div :global(.ant-tabs-tab) {
            font-size: 14px;
            padding: 8px 12px;
          }
          div :global(.ant-tabs-tab .ant-tabs-tab-btn) {
            color: #747677;
            font-weight: 400;
          }
          div :global(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
            color: #171a1d;
          }
          div :global(.ant-tabs-content-holder) {
            background-color: #f1f2f3;
            padding: 16px;
          }
          div :global(.ant-tabs-content) {
            background-color: #fff;
            padding: 24px;
            border-radius: 6px;
          }
        `}</style>
      </div>
    </header>
  )
}
