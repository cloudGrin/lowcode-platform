import { useStrapiRequest } from '@/lib/request'
import { Button, Form, Input, message } from 'antd'
import React, { useCallback, useEffect } from 'react'
import { useRevalidator, useRouteLoaderData } from 'react-router-dom'

const BasicSetting: React.FC = () => {
  const { projectInfo } = (useRouteLoaderData('project') as { projectInfo: ApiProjectsIdResponse['data'] }) || {}
  const revalidator = useRevalidator()
  const [form] = Form.useForm()

  const setInitForm = useCallback(() => {
    form.setFieldsValue({
      name: projectInfo.name,
      description: projectInfo.description
    })
  }, [form, projectInfo])

  useEffect(() => {
    setInitForm()
  }, [setInitForm])

  const { runAsync: createProject, loading } = useStrapiRequest(
    '/api/projects/${id}__PUT',
    (payload: ApiProjectsIdRequest__PUT) => ({
      payload,
      urlValue: {
        id: projectInfo.id
      }
    }),
    {
      manual: true
    }
  )
  const confirm = useCallback(async () => {
    try {
      const values = await form.validateFields()
      await createProject(values)
      message.success('修改成功')
      revalidator.revalidate()
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
      // message.success('新增失败')
    }
  }, [createProject, form, revalidator])

  return (
    <div className='h-full'>
      <div className='overflow-y-auto h-[calc(100%-64px)] rounded-[6px]'>
        <div className='bg-white rounded-[6px] min-h-full'>
          <div className='p-[24px_24px_0]'>
            <span className='inline-block max-w-[calc(100%-50px)] text-[18px] leading-[28px] overflow-hidden text-ellipsis whitespace-nowrap align-top font-medium'>
              基础属性
            </span>
          </div>
          <div className='p-[16px_24px_24px] max-w-[600px]'>
            <Form layout='vertical' form={form}>
              <Form.Item name='name' label='应用名称' rules={[{ required: true, message: '应用名称是必填字段' }]}>
                <Input placeholder='请输入' />
              </Form.Item>
              <Form.Item name='description' label='应用描述'>
                <Input.TextArea placeholder='请输入' maxLength={200} showCount />
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      <div className='h-[64px] bg-white absolute w-[100vw] shadow-[0_-1px_0_0_rgb(126_134_142_/_16%)] left-0 bottom-0 flex justify-center items-center'>
        <Button type='primary' size='large' className='text-[14px] leading-none' loading={loading} onClick={confirm}>
          保存
        </Button>
      </div>
    </div>
  )
}

export default BasicSetting
