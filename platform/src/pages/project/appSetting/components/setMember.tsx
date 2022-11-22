import { useStrapiRequest } from '@/lib/request'
import { Checkbox, Modal, Tag } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

const SelectPeopleDialog: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (userIds: React.Key[]) => void
  confirmLoading?: boolean
  selectedUserIds?: number[]
}> = ({ open, setOpen, onOk, confirmLoading = false, selectedUserIds = [] }) => {
  const [curSelectedUserIds, setCurSelectedUserIds] = useState(selectedUserIds)

  const { data: allUsers, run } = useStrapiRequest('/api/users', undefined, { manual: true })

  const handleOk = useCallback(() => {
    onOk(curSelectedUserIds)
  }, [onOk, curSelectedUserIds])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const rightUsers = useMemo(() => {
    return allUsers?.data.filter((user) => curSelectedUserIds.includes(user.id))
  }, [curSelectedUserIds, allUsers])

  useEffect(() => {
    if (open) {
      run()
    }
  }, [open, run])

  useEffect(() => {
    setCurSelectedUserIds(selectedUserIds)
  }, [selectedUserIds])

  return (
    <Modal
      title='设置成员'
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width='730px'
      closable={false}
      className='set-member-wrap'
      maskClosable={false}
      confirmLoading={confirmLoading}
    >
      <div className='max-h-[50vh] overflow-y-auto'>
        <div className='flex min-h-[380px]'>
          <div className='border-r-[1px] border-[#eee] flex-[0_1_50%] pr-[24px] pt-[16px]'>
            <div className=''>
              <Checkbox
                indeterminate={!!curSelectedUserIds.length && curSelectedUserIds.length < (allUsers?.data?.length ?? 0)}
                onChange={() => {
                  if (curSelectedUserIds.length === allUsers?.data?.length) {
                    setCurSelectedUserIds([])
                  } else {
                    setCurSelectedUserIds(allUsers?.data?.map((i) => i.id) ?? [])
                  }
                }}
                checked={curSelectedUserIds.length === allUsers?.data?.length}
              >
                全选
              </Checkbox>
            </div>
            <Checkbox.Group
              value={curSelectedUserIds}
              onChange={(val: any) => {
                setCurSelectedUserIds(val)
              }}
            >
              {allUsers?.data?.map((user) => (
                <div className='flex items-center h-[34px]' key={user.id}>
                  <Checkbox value={user.id}>{user.username}</Checkbox>
                </div>
              ))}
            </Checkbox.Group>
          </div>
          <div className='flex-[0_1_50%] pl-[24px] pt-[16px]'>
            <div className='flex justify-between mb-[10px]'>
              <span className='text-[#747677]'>{`已选择 (${curSelectedUserIds.length})`}</span>
              <span
                className='cursor-pointer text-c_primary text-[14px]'
                onClick={() => {
                  setCurSelectedUserIds([])
                }}
              >
                清空
              </span>
            </div>
            {rightUsers?.map((user) => (
              <Tag
                closable
                key={user.id}
                onClose={() => setCurSelectedUserIds((prev) => prev.filter((item) => item !== user.id))}
              >
                {user.username}
              </Tag>
            ))}
          </div>
        </div>
      </div>
      <style jsx>
        {`
          :global(.set-member-wrap .ant-modal-header) {
            border-bottom: none;
          }
          :global(.set-member-wrap .ant-modal-body) {
            padding: 0 24px;
          }
          :global(.set-member-wrap .ant-modal-footer) {
            border-top: none;
          }
          :global(.set-member-wrap .ant-tag) {
            margin-bottom: 8px;
          }
          :global(.set-member-wrap .ant-tag > span) {
            vertical-align: middle;
          }
          :global(.set-member-wrap .ant-checkbox-group) {
            display: block;
          }
        `}
      </style>
    </Modal>
  )
}

export default React.memo(SelectPeopleDialog)
