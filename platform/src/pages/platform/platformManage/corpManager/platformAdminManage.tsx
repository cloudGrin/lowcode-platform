import DescriptionTip from '@/components/descriptionTip'
import { strapiRequestInstance, useStrapiRequest } from '@/lib/request'
import SelectPeopleDialog from '@/pages/platform/components/selectPeopleDialog'
import { Button, Modal, Table, Tag, Tooltip } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useRouteLoaderData, useRevalidator } from 'react-router-dom'
import { useUserRole } from './hooks'

const commonColumns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    render: (_: any, record: any) => (
      <>
        <span className='mr-[6px] text-[14px]'>{record.username}</span>
        {record.isSuperAdmin && (
          <Tooltip placement='right' title='超级管理员权限仅可以在后台修改'>
            <Tag color='blue'>超级管理员</Tag>
          </Tooltip>
        )}
      </>
    )
  }
]

function getPlatformAdmins() {
  return strapiRequestInstance('/api/users/platformAdmin')
    .then((res) => res.data)
    .catch((error) => {
      console.log(error)
      return []
    })
}

const PlatformAdminManage: React.FC<{ tabType: 'application' | 'platform' }> = ({ tabType }) => {
  const [admins, setAdmins] = useState<ApiUsersPlatformAdminResponse['data']>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const { userInfo } =
    (useRouteLoaderData('userAuth') as { userInfo: ApiTypes['/api/users/me']['response']['data'] }) || {}
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
      },
      columnWidth: 50,
      getCheckboxProps(record: any) {
        return {
          disabled: record.isSuperAdmin
        }
      }
    }),
    [selectedRowKeys]
  )

  const [addUsersRole, removeUsersRole] = useUserRole({
    addSuccessCb: () => {
      setOpen(false)
      getPlatformAdmins().then((data) => {
        setAdmins(data)
      })
    },
    isNeedRemoveConfirm: false
  })

  const removeUsersRolePre = useCallback(
    (...rest: Parameters<typeof removeUsersRole>) => {
      if (!!rest[1].length) {
        const isIncludMe = rest[1].includes(userInfo.id)
        Modal.confirm({
          width: 350,
          title: (
            <span className='font-normal'>{isIncludMe ? '确定要移除包含自己的成员吗？' : '确定要移除成员吗？'}</span>
          ),
          onOk: () => {
            removeUsersRole(...rest).then(() => {
              if (isIncludMe) {
                navigate('/')
                revalidator.revalidate()
              } else {
                getPlatformAdmins().then((data) => {
                  setAdmins(data)
                })
              }
            })
          }
        })
      }
    },
    [navigate, removeUsersRole, revalidator, userInfo]
  )

  const columns = useMemo(() => {
    return [
      ...commonColumns,
      {
        title: '操作',
        key: 'action',
        render: (_: any, record: any) => {
          // 当前行不是超级管理员，可以被移除平台管理员
          if (!record.isSuperAdmin) {
            return (
              <span
                className='cursor-pointer text-c_primary text-[14px]'
                onClick={() => removeUsersRolePre('ApplicationAdmin', [record.id])}
              >
                移除成员
              </span>
            )
          }
        }
      }
    ]
  }, [removeUsersRolePre])

  const {
    loading: usersOptionsLoading,
    data,
    runAsync: getUsersForAdmin
  } = useStrapiRequest('/api/users/forPlatformAdmin', undefined, { manual: true })

  const usersOptionsRes = useMemo(() => {
    return data?.data ?? []
  }, [data])

  const openAddPeopleDialog = useCallback(() => {
    getUsersForAdmin()
    setOpen(true)
  }, [getUsersForAdmin])

  const onOk = useCallback(
    (userIds: React.Key[]) => {
      addUsersRole('PlatformAdmin', userIds)
    },
    [addUsersRole]
  )

  useEffect(() => {
    if (tabType === 'platform') {
      getPlatformAdmins().then((data) => {
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
        description='平台管理员具有管理所有应用的权限。其中，后台赋予的超级管理员已自动同步为平台管理员，如需调整可至后台调整'
        className='mb-[16px]'
      />
      <div className='flex items-center mb-[16px]'>
        <Button type='primary' className='mr-[8px]' size='large' onClick={openAddPeopleDialog}>
          添加成员
        </Button>
        <Button size='large' onClick={() => removeUsersRolePre('ApplicationAdmin', selectedRowKeys)}>
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

export default React.memo(PlatformAdminManage)
