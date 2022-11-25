import Icon from '@/components/icon'
import { SettingOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, Popover } from 'antd'
import classNames from 'classnames'
import React, { memo } from 'react'

const RenderItemInner: React.FC<Record<string, any>> = ({
  item,
  changeTitle,
  setChangeTitleId,
  changeTitleId,
  removeRoute
}) => {
  return (
    <>
      {item.data.type === 'NAV' ? (
        item.isExpanded ? (
          <Icon name='folder-open-outline' className='w-[14px] h-[14px] text-[#0089ff] ml-[8px] flex-none' />
        ) : item.hasChildren ? (
          <Icon name='folder-have-file' className='w-[15px] h-[15px] text-[#0089ff] ml-[8px] -mr-[1px] flex-none' />
        ) : (
          <Icon name='folder' className='w-[14px] h-[14px] text-[#0089ff] ml-[8px] flex-none' />
        )
      ) : item.data.type === 'LINK' ? (
        <Icon name='link' className='w-[14px] h-[14px] ml-[8px] flex-none' />
      ) : (
        <Icon name='web-page' className='w-[14px] h-[14px] text-[#ffb626] ml-[8px] flex-none' />
      )}
      <div className='flex items-center flex-auto ml-[8px] min-w-0 content'>
        <Popover
          content={
            <Form
              layout='vertical'
              className='w-[200px]'
              onClick={(e) => {
                e.stopPropagation()
              }}
              onFinish={(values) => changeTitle(values, item)}
            >
              <Form.Item
                name='title'
                label={item.data.type === 'NAV' ? '分组名称' : '页面名称'}
                initialValue={item.data.title}
                rules={[{ required: true, message: '必填字段' }]}
                className='mb-[6px]'
              >
                <Input />
              </Form.Item>
              <Form.Item className='flex items-center justify-end mb-0'>
                <Button
                  size='small'
                  onClick={() => {
                    setChangeTitleId(undefined)
                  }}
                >
                  取消
                </Button>
                <Button
                  size='small'
                  // loading={loading}
                  type='primary'
                  htmlType='submit'
                  className='ml-[10px]'
                >
                  确认
                </Button>
              </Form.Item>
            </Form>
          }
          placement='bottomLeft'
          open={changeTitleId === item.data.id}
          // defaultOpen
        >
          <div className='text-[14px] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-auto'>
            {item.data ? item.data.title : ''}
          </div>
        </Popover>
        <div
          className={classNames(
            'px-[2px] flex-none pr-[10px] actions hidden'
            // activeTab === 'dev' ? 'hidden' : '!hidden'
          )}
        >
          <Popover
            placement='bottomRight'
            content={
              <div
                className='w-[70px]'
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <div
                  className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[24px] transition-all mb-[10px]'
                  onClick={() => {
                    setChangeTitleId(item.data.id)
                  }}
                >
                  <span className='ml-[6px]'>修改名称</span>
                </div>
                <Divider className='my-[12px]' />
                <div
                  className='cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[24px] transition-all'
                  onClick={() => {
                    removeRoute(item)
                  }}
                >
                  <span className='ml-[6px] text-c_error'>删除</span>
                </div>
              </div>
            }
            trigger='hover'
          >
            <button
              className='w-[24px] h-[24px] rounded-[6px] text-[#878f95] hover:bg-[#e5e6e8] hover:text-[#171a1d] transition-all'
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <SettingOutlined className='text-[14px] align-middle text-[#878f95]' />
            </button>
          </Popover>
        </div>
        <style jsx>{`
          .content:hover > .actions {
            display: block;
          }
        `}</style>
      </div>
    </>
  )
}

export default memo(RenderItemInner)
