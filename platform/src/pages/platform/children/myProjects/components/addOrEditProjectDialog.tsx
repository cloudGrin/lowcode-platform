import { Button, Modal } from 'antd'
import React, { useState } from 'react'

const AddOrEditProjectDialog: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (e: React.MouseEvent<HTMLElement>) => void
}> = ({ open, setOpen, onOk }) => {
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleOk = () => {
    setConfirmLoading(true)
    setTimeout(() => {
      setOpen(false)
      setConfirmLoading(false)
    }, 2000)
  }

  const handleCancel = () => {
    console.log('Clicked cancel button')
    setOpen(false)
  }

  return (
    <Modal title='创建应用' open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>
      <p>modalText</p>
    </Modal>
  )
}

export default AddOrEditProjectDialog
