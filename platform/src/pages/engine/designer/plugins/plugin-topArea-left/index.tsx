import Icon from '@/components/icon'
import { ILowCodePluginContext } from '@alilc/lowcode-engine'
import { CodeOutlined, SettingOutlined, UnorderedListOutlined, UserOutlined, RightOutlined } from '@ant-design/icons'
import { Divider, Popover } from 'antd'
// 保存功能示例
const topAreaLeftPlugin = (
  ctx: ILowCodePluginContext,
  options: { project: ApiProjectsIdResponse['data']; route: ApiProjectRoutesFindByUuidResponse['data'] }
) => {
  return {
    async init() {
      const { skeleton, config } = ctx
      const { project: projectInfo, route } = options
      skeleton.add({
        name: 'topAreaLeftSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'left'
        },
        content: (
          <>
            <div className='flex items-center'>
              <Popover
                placement='bottomRight'
                content={
                  <div className='w-[110px]'>
                    <div
                      className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'
                      onClick={() => {
                        location.href = `/`
                      }}
                    >
                      <UserOutlined className='align-middle' />
                      <span className='ml-[6px]'>我的应用</span>
                    </div>
                    <Divider className='my-[12px]' />
                    <div
                      className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[30px] pl-[8px] transition-all'
                      onClick={() => {
                        location.href = `/platformManage`
                      }}
                    >
                      <SettingOutlined className='align-middle' />
                      <span className='ml-[6px]'>平台管理</span>
                    </div>
                  </div>
                }
                trigger='hover'
              >
                <div className='text-[18px]  text-[#878f95] p-[6px] rounded-[6px] justify-center flex items-center hover:bg-[#f1f2f3] hover:text-[#1f4469] transition-all cursor-pointer'>
                  <Icon name='menu-dots' className='w-[20px] h-[20px] ' />
                </div>
              </Popover>
              <div className='ml-[3px] flex items-center px-[4px]'>
                <div
                  className='flex items-center cursor-pointer p-[4px_6px] hover:bg-[#f1f2f3] hover:rounded-[6px]'
                  onClick={() => {
                    location.href = `/${projectInfo.id}/admin`
                  }}
                >
                  <div className='w-[24px] h-[24px] bg-[#0089ff] rounded-[6px] justify-center flex items-center'>
                    <CodeOutlined className='text-[16px] text-white' />
                  </div>
                  <span className='ml-[8px] text-[#171a1d] text-[14px] max-w-[126px] text-ellipsis whitespace-nowrap overflow-hidden'>
                    {projectInfo?.name}
                  </span>
                </div>
                <RightOutlined className='align-middle mx-[8px] text-[#747677] text-[16px]' />
                <span className='text-[#747677] text-[14px] max-w-[126px] text-ellipsis whitespace-nowrap overflow-hidden'>
                  {route.title}
                </span>
              </div>
            </div>
          </>
        )
      })
    }
  }
}
topAreaLeftPlugin.pluginName = 'topAreaLeftPlugin'
topAreaLeftPlugin.meta = {
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'project',
        type: 'object',
        description: '应用信息'
      },
      {
        key: 'route',
        type: 'object',
        description: '页面信息'
      }
    ]
  }
}
export default topAreaLeftPlugin
