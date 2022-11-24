import { TreeItem } from '@atlaskit/tree'
import { Button, Checkbox, Dropdown, Form, Input, MenuProps, message, Modal, Tooltip } from 'antd'
import { FC, useCallback, useMemo, useState } from 'react'
import { SettingOutlined, DownOutlined } from '@ant-design/icons'
import Icon from '@/components/icon'
import { useStrapiRequest } from '@/lib/request'
import produce from 'immer'
import { useParams } from 'react-router-dom'

const onMenuClick: MenuProps['onClick'] = (e) => {
  console.log('click', e)
}

const pageActions = [
  {
    key: 'design',
    icon: <Icon name='web-page' className='w-[14px] h-[14px] text-[#878f95] flex-none' />,
    label: '页面设计'
  },
  {
    key: 'setting',
    icon: <SettingOutlined className='text-[14px] align-middle text-[#878f95]' />,
    label: '页面设置'
  }
]

const PageView: FC<{
  activeNav?: {
    data: TreeItem
    type: 'dev' | 'prod'
  }
  setActiveNav: React.Dispatch<
    React.SetStateAction<
      | {
          data: TreeItem
          type: 'dev' | 'prod'
        }
      | undefined
    >
  >
}> = ({ activeNav, setActiveNav }) => {
  const { id } = useParams()
  const [open, setOpen] = useState(false)

  const pageType = activeNav?.data?.data.type as 'PAGE' | 'LINK'
  const [form] = Form.useForm()

  const setLink = () => {
    form.setFieldsValue({
      url: activeNav?.data?.data.url,
      isNewPage: activeNav?.data?.data.isNewPage
    })
    setOpen(true)
  }

  const { runAsync: updateRouteApi, loading } = useStrapiRequest(
    '/api/project-routes/${id}__PUT',
    (payload: ApiProjectRoutesIdRequest__PUT) => ({
      urlValue: {
        id: activeNav?.data?.data.id
      },
      payload
    }),
    {
      manual: true
    }
  )

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const { data: route } = await updateRouteApi(values)
      setOpen(false)
      message.success('修改成功')
      setActiveNav(
        produce((draft) => {
          draft!.data.data = route
        })
      )
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
    }
  }, [form, updateRouteApi, setActiveNav])

  const iframeUrl = useMemo(() => {
    if (activeNav?.data.data.type === 'PAGE') {
      return `${location.origin}/pagePreview?navUuid=${activeNav?.data?.id}`
    } else if (activeNav?.data.data.type === 'LINK') {
      return activeNav?.data?.data.url
    }
  }, [activeNav])

  return (
    <div className='flex flex-col flex-auto'>
      <div className='bg-c_white p-[23px_24px] h-[74px] flex items-center justify-between flex-none'>
        <div className='text-[16px] min-w-[310px] w-[calc(100%-310px)] overflow-hidden text-ellipsis whitespace-nowrap'>
          {activeNav?.data.data.title}
        </div>
        <div>
          <Tooltip
            placement='bottomRight'
            title='已发布页面仅可查看'
            open={activeNav?.type === 'prod' ? undefined : false}
          >
            {pageType === 'PAGE' ? (
              <Dropdown.Button
                disabled={activeNav?.type === 'prod'}
                type='primary'
                menu={{ items: pageActions, onClick: onMenuClick }}
                icon={<DownOutlined />}
                onClick={() => {
                  location.href = `/pageDesigner?navUuid=${activeNav?.data.id}&projectId=${id}`
                }}
              >
                编辑自定义页
              </Dropdown.Button>
            ) : (
              <Button disabled={activeNav?.type === 'prod'} type='primary' onClick={setLink}>
                外链设置
              </Button>
            )}
          </Tooltip>
        </div>
      </div>
      <div className='h-[calc(100%-74px)] p-[16px] overflow-hidden'>
        <div className='w-full h-full'>
          <iframe src={iframeUrl} className='w-full h-full' />
        </div>
      </div>
      <Modal
        title='外链设置'
        open={open}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        okButtonProps={{
          loading
        }}
      >
        <Form layout='vertical' form={form}>
          <Form.Item
            name='url'
            label='链接地址'
            rules={[
              { required: true, message: '必填字段' },
              { type: 'url', message: '不是一个有效的链接' }
            ]}
          >
            <Input placeholder='请输入' />
          </Form.Item>
          <Form.Item name='isNewPage' label='' valuePropName='checked'>
            <Checkbox>打开方式-新开页面</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PageView
