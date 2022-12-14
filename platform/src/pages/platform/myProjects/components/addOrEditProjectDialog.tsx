import { useStrapiRequest } from '@/lib/request'
import { Form, Input, message, Modal } from 'antd'
import React, { useCallback } from 'react'

const AddOrEditProjectDialog: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: () => void
}> = ({ open, setOpen, onOk }) => {
  const [form] = Form.useForm()
  const { runAsync: createProject, loading } = useStrapiRequest(
    '/api/projects__POST',
    (projectInfo: ApiProjectsRequest__POST) => ({
      payload: projectInfo
    }),
    {
      manual: true
    }
  )
  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields()
      await createProject(values)
      setOpen(false)
      message.success('新增成功')
      onOk()
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
      // message.success('新增失败')
    }
  }, [createProject, form, onOk, setOpen])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [setOpen])
  return (
    <Modal title='创建应用' open={open} onOk={handleOk} confirmLoading={loading} onCancel={handleCancel}>
      <Form layout='vertical' form={form}>
        <Form.Item name='name' label='应用名称' rules={[{ required: true, message: '应用名称是必填字段' }]}>
          <Input placeholder='请输入' />
        </Form.Item>
        <Form.Item name='description' label='应用描述'>
          <Input.TextArea placeholder='请输入' maxLength={200} showCount />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddOrEditProjectDialog
