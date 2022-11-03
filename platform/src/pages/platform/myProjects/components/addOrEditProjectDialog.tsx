import { useStrapiRequest } from '@/lib/request'
import { Button, Modal, Form, Input, message } from 'antd'
import React, { useCallback, useState } from 'react'

const AddOrEditProjectDialog: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: () => void
}> = ({ open, setOpen, onOk }) => {
  const [form] = Form.useForm()
  const { runAsync: createProject, loading } = useStrapiRequest(
    '/api/projects__POST',
    (projectInfo: ApiTypes['/api/projects__POST']['request']) => ({
      payload: projectInfo
    }),
    {
      manual: true
    }
  )
  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields()
      await createProject({
        data: values
      })
      setOpen(false)
      message.success('新增成功')
      onOk()
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
    }
  }, [])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [])
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
