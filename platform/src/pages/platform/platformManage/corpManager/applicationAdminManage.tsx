import DescriptionTip from '@/components/descriptionTip'
import { strapiRequestInstance, useStrapiRequest } from '@/lib/request'
import SelectPeopleDialog from '@/pages/platform/components/selectPeopleDialog'
import { Button, Table, Tag, Tooltip } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useUserRole } from './hooks'
const commonColumns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    render: (_: any, record: any) => (
      <>
        <span className='mr-[6px] text-[14px]'>{record.username}</span>
        {record.isPlatformAdmin && (
          <Tooltip placement='right' title='如要操作，请移除该用户平台管理员角色'>
            <Tag color='blue'>平台管理员</Tag>
          </Tooltip>
        )}
      </>
    )
  }
]

function getApplicationAdmins() {
  return strapiRequestInstance('/api/users/applicationAdmin')
    .then((res) => res.data)
    .catch((error) => {
      console.log(error)
      return []
    })
}

const ApplicationAdminManage: React.FC<{ tabType: 'application' | 'platform' }> = ({ tabType }) => {
  const [admins, setAdmins] = useState<ApiUsersApplicationAdminResponse['data']>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [open, setOpen] = useState(false)

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
      },
      columnWidth: 50,
      getCheckboxProps(record: any) {
        return {
          disabled: record.isPlatformAdmin
        }
      }
    }),
    [selectedRowKeys]
  )

  const [addUsersRole, removeUsersRole] = useUserRole({
    addSuccessCb: () => {
      setOpen(false)
      getApplicationAdmins().then((data) => {
        setAdmins(data)
      })
    },
    removeSuccessCb: () => {
      getApplicationAdmins().then((data) => {
        setAdmins(data)
      })
    }
  })

  const columns = useMemo(() => {
    return [
      ...commonColumns,
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => {
          // 当前行不是平台管理员，可以被移除应用管理员
          if (!record.isPlatformAdmin) {
            return (
              <span
                className='cursor-pointer text-c_primary text-[14px]'
                onClick={() => removeUsersRole('Engineer', [record.id])}
              >
                移除成员
              </span>
            )
          }
        }
      }
    ]
  }, [removeUsersRole])

  const {
    loading: usersOptionsLoading,
    data,
    runAsync: getUsersForAdmin
  } = useStrapiRequest('/api/users/forApplicationAdmin', () => ({}), {
    manual: true
  })

  const usersOptionsRes = useMemo(() => {
    return data?.data ?? []
  }, [data])

  const openAddPeopleDialog = useCallback(() => {
    getUsersForAdmin().catch(() => {})
    setOpen(true)
  }, [getUsersForAdmin])

  const onOk = useCallback(
    (userIds: React.Key[]) => {
      addUsersRole('ApplicationAdmin', userIds)
    },
    [addUsersRole]
  )

  useEffect(() => {
    if (tabType === 'application') {
      getApplicationAdmins().then((data) => {
        setAdmins(data)
      })
    }
  }, [tabType])

  useEffect(() => {
    setSelectedRowKeys([])
  }, [admins])

  return (
    <div className=''>
      <DescriptionTip
        description='应用管理员具有创建应用的权限，仅可管理自己的应用。其中，平台管理员已自动同步为应用管理员'
        className='mb-[16px]'
      />
      <div className='flex items-center mb-[16px]'>
        <Button type='primary' className='mr-[8px]' size='large' onClick={openAddPeopleDialog}>
          添加成员
        </Button>
        <Button size='large' onClick={() => removeUsersRole('Engineer', selectedRowKeys)}>
          删除
        </Button>
      </div>
      <Table dataSource={admins} columns={columns} rowKey='id' pagination={false} rowSelection={rowSelection} />
      <SelectPeopleDialog
        open={open}
        setOpen={setOpen}
        onOk={onOk}
        userOptions={usersOptionsRes}
        optionsLoading={usersOptionsLoading}
      />

      <style jsx>{`
        div :global(.ant-table-thead .ant-table-cell) {
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

export default React.memo(ApplicationAdminManage)
