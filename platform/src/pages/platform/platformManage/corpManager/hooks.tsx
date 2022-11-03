import { strapiRequestInstance } from '@/lib/request'
import { message, Modal } from 'antd'
import React, { useCallback } from 'react'

export function useUserRole({
  addSuccessCb,
  removeSuccessCb
}: {
  addSuccessCb?: () => void
  removeSuccessCb?: () => void
}) {
  const addUsersRole = useCallback((type: ApiUsersRoleRequest['toRole'], userIds: React.Key[]) => {
    if (userIds.length > 0) {
      strapiRequestInstance(
        '/api/users/role__PUT',
        {
          toRole: type,
          userIds: userIds as number[]
        },
        {}
      ).then((res) => {
        if (res.success) {
          message.success('添加成功')
          addSuccessCb && addSuccessCb()
        } else {
          message.error(res.errorMessage)
        }
      })
    }
  }, [])

  const removeUsersRole = useCallback((type: ApiUsersRoleRequest['toRole'], userIds: React.Key[]) => {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        width: 350,
        title: <span className='text-[16px] font-normal'>确定要移除成员吗？</span>,
        onOk: () => {
          strapiRequestInstance(
            '/api/users/role__PUT',
            {
              toRole: type,
              userIds: userIds as number[]
            },
            {}
          ).then((res) => {
            if (res.success) {
              message.success('移除成功')
              resolve('')
              removeSuccessCb && removeSuccessCb()
            } else {
              message.error(res.errorMessage)
              reject(res.errorMessage)
            }
          })
        },
        onCancel: () => {
          reject()
        }
      })
    })
  }, [])

  return [addUsersRole, removeUsersRole]
}
