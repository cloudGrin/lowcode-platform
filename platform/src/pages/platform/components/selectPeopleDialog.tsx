import { Modal, Table } from 'antd'
import React, { useCallback, useMemo, useState } from 'react'

const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    render: (_: any, record: any) => (
      <>
        <span className='mr-[6px] text-[14px]'>{record.username}</span>
      </>
    )
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (_: any, record: any) => (
      <>
        <span className='mr-[6px] text-[14px]'>{record.email}</span>
      </>
    )
  }
]

const SelectPeopleDialog: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (userIds: React.Key[]) => void
  userOptions?: { id: number; username: string; email: string }[]
  optionsLoading?: boolean
}> = ({ open, setOpen, onOk, userOptions = [], optionsLoading = false }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys)
        setSelectedRowKeys(newSelectedRowKeys)
      },
      columnWidth: 50
    }),
    [selectedRowKeys]
  )

  const handleOk = useCallback(() => {
    try {
      onOk(selectedRowKeys)
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
    }
  }, [selectedRowKeys])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [])
  return (
    <Modal title='选择人员' open={open} onOk={handleOk} onCancel={handleCancel} width='600px'>
      <Table
        dataSource={userOptions}
        columns={columns}
        rowKey='id'
        pagination={false}
        rowSelection={rowSelection}
        loading={optionsLoading}
      />
    </Modal>
  )
}

export default SelectPeopleDialog
