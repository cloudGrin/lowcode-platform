import { strapiRequestInstance, useStrapiRequest } from '@/lib/request'
import { usePagination } from 'ahooks'
import { Button, Card, Form, Input, message, Modal, Table } from 'antd'
import dayjs from 'dayjs'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import semver from 'semver'
import { VersionsContext } from '../projectInfoVersionsContext'

const columns = [
  {
    title: '版本号',
    dataIndex: 'version'
  },
  {
    title: '版本描述',
    dataIndex: 'description'
  },
  {
    title: '发布时间',
    dataIndex: 'createdAt',
    render: (_: any, record: any) => (
      <>
        <span className=''>{dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
      </>
    )
  }
]

const Publish: React.FC = () => {
  const { id } = useParams()
  const [open, setOpen] = useState(false)

  const [versions, getVersions] = useContext(VersionsContext)

  const [form] = Form.useForm()

  const getVersionsApi = useCallback(
    async ({ current, pageSize }: { current: number; pageSize: number }) => {
      const result = await strapiRequestInstance(
        '/api/project-versions',
        {
          projectId: id!,
          pagination: {
            page: current,
            pageSize: pageSize
          }
        },
        {}
      )
      return {
        list: result.data,
        total: result.meta.pagination.total
      }
    },
    [id]
  )

  const {
    data: versionResult,
    loading: versionLoading,
    pagination: versionPagination
  } = usePagination(getVersionsApi, {
    defaultPageSize: 20
  })

  const { runAsync: publish, loading: publishLoading } = useStrapiRequest(
    '/api/project-versions__POST',
    (payload: ApiProjectVersionsRequest__POST) => ({
      payload
    }),
    {
      manual: true
    }
  )

  const refresh = useCallback(() => {
    versionPagination.onChange(1, 20)
    getVersions()
  }, [getVersions, versionPagination])

  const handleOk = useCallback(async () => {
    try {
      await form.validateFields()
      await publish({
        ...form.getFieldsValue(),
        projectId: id!
      })
      message.success('发布成功')
      setOpen(false)
      refresh()
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
      // message.success('新增失败')
    }
  }, [form, id, publish, refresh])

  const setInitForm = useCallback(() => {
    form.setFieldsValue({
      version: semver.inc(versions?.[0]?.version ?? '0.0.0', 'patch'),
      description: ''
    })
  }, [form, versions])

  useEffect(() => {
    setInitForm()
  }, [setInitForm])

  return (
    <div className='max-w-[1140px] mx-auto mt-[20px]'>
      <Card className=''>
        <div className='flex items-center justify-between'>
          <Button className='' onClick={refresh}>
            刷新
          </Button>
          <Button type='primary' className='' onClick={() => setOpen(true)}>
            发布新版本
          </Button>
        </div>
        <Table
          className='mt-[20px]'
          dataSource={versionResult?.list}
          columns={columns}
          rowKey='id'
          pagination={versionPagination}
          loading={versionLoading}
        />
      </Card>

      <Modal title='发布' open={open} onOk={handleOk} confirmLoading={publishLoading} onCancel={() => setOpen(false)}>
        <Form layout='vertical' form={form}>
          <Form.Item
            name='version'
            label='版本号'
            rules={[
              { required: true, message: '版本号是必填字段' },
              {
                pattern: /^([0-9]+).([0-9]+).([0-9]+)$/,
                message: '版本号不符合规则'
              }
            ]}
          >
            <Input placeholder='请输入' />
          </Form.Item>
          <Form.Item
            name='description'
            label='版本描述'
            rules={[{ required: true, message: '为方便版本控制，请填写描述' }]}
          >
            <Input.TextArea placeholder='请输入' maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Publish
