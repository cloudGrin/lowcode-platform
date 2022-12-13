import { strapiRequestInstance } from '@/lib/request'
import { usePagination } from 'ahooks'
import { Modal, Table } from 'antd'
import React, { useCallback } from 'react'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '描述',
    dataIndex: 'description'
  },
  {
    title: '操作人',
    dataIndex: ['operator', 'username'],
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    render: (_: any, record: any) => <>{dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}</>,
    width: 130
  }
]

const SelectPeopleDialog: React.FC<{
  navUuid: string
  open: boolean
  setOpen: (val: boolean) => void
  onOk: () => void
}> = ({ navUuid, open, setOpen, onOk }) => {
  const getVersionsApi = useCallback(
    async ({ current, pageSize }: { current: number; pageSize: number }) => {
      const result = await strapiRequestInstance(
        '/api/page-versions',
        {
          navUuid,
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
    [navUuid]
  )

  const {
    data: versionResult,
    loading: versionLoading,
    pagination: versionPagination
  } = usePagination(getVersionsApi, {
    defaultPageSize: 10
  })

  return (
    <Modal
      title='历史记录'
      open={open}
      width='60vw'
      onCancel={() => {
        setOpen(false)
      }}
    >
      <Table
        size='small'
        dataSource={versionResult?.list}
        columns={columns}
        rowKey='id'
        pagination={versionPagination}
        loading={versionLoading}
      />
    </Modal>
  )
}

export default React.memo(SelectPeopleDialog)
