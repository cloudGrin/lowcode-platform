import DescriptionTip from '@/components/descriptionTip'
import { strapiRequestInstance, useStrapiRequest } from '@/lib/request'
import { Button, Card, message, Modal, Table, Tabs, Tag, Tooltip } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SelectPeopleDialog from '@/pages/platform/components/selectPeopleDialog'
const { Meta } = Card

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
}

function getPlatformAdmins() {
  return strapiRequestInstance('/api/users/platformAdmin')
}

const CorpManager: React.FC = () => {
  const [applicationAdmins, setApplicationAdmins] = useState<ApiUsersApplicationAdminResponse['data']>([])
  const [platformAdmins, setPlatformAdmins] = useState<ApiUsersPlatformAdminResponse['data']>([])
  const [selectedRowKeysForApplicationAdmins, setSelectedRowKeysForApplicationAdmins] = useState<React.Key[]>([])
  const [open, setOpen] = useState(false)
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedRowKeysForApplicationAdmins,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys)
        setSelectedRowKeysForApplicationAdmins(newSelectedRowKeys)
      },
      columnWidth: 50,
      getCheckboxProps(record: any) {
        return {
          disabled: record.isPlatformAdmin
        }
      }
    }),
    [selectedRowKeysForApplicationAdmins]
  )

  const onChange = useCallback((key: any) => {
    if (key === 'application') {
      getApplicationAdmins().then((res) => {
        setApplicationAdmins(res.data)
      })
    } else if (key === 'platform') {
      getPlatformAdmins().then((res) => {
        setPlatformAdmins(res.data)
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
              if (type === 'ApplicationAdmin') {
                onChange('application')
              } else if (type === 'PlatformAdmin') {
                onChange('platform')
              }
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

  const removeApplicationAdmin = useCallback(
    (userIds: React.Key[]) => {
      if (userIds.length > 0) {
        removeUsersRole('Engineer', userIds)
          .then(() => {
            getApplicationAdmins().then((res) => {
              setApplicationAdmins(res.data)
            })
          })
          .catch((err) => {
            err
          })
      }
    },
    [removeUsersRole]
  )

  const applicationAdminsColumns = useMemo(() => {
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
                onClick={() => removeApplicationAdmin([record.id])}
              >
                移除成员
              </span>
            )
          }
        }
      }
    ]
  }, [removeApplicationAdmin])

  const {
    loading: usersOptionsLoading,
    data: usersOptionsRes,
    runAsync: getUsersForApplicationAdmin
  } = useStrapiRequest('/api/users/forApplicationAdmin', undefined, { manual: true })

  const toRole = useRef<ApiUsersRoleRequest['toRole']>()

  const openAddPeopleApplicationAdminDialog = useCallback(() => {
    toRole.current = 'ApplicationAdmin'
    getUsersForApplicationAdmin()
    setOpen(true)
  }, [])

  const addUsersRole = useCallback(
    (userIds: React.Key[]) => {
      if (userIds.length > 0) {
        strapiRequestInstance(
          '/api/users/role__PUT',
          {
            toRole: toRole.current!,
            userIds: userIds as number[]
          },
          {}
        ).then((res) => {
          if (res.success) {
            message.success('添加成功')
            setOpen(false)
            if (toRole.current === 'ApplicationAdmin') {
              onChange('application')
            } else if (toRole.current === 'PlatformAdmin') {
              onChange('platform')
            }
          } else {
            message.error(res.errorMessage)
          }
        })
      }
    },
    [onChange]
  )

  useEffect(() => {
    getApplicationAdmins().then((res) => {
      setApplicationAdmins(res.data)
    })
  }, [])

  return (
    <Card
      bordered={false}
      className='h-full corp-manager'
      bodyStyle={{ height: '100%', padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <Meta title='平台权限管理' description='平台应用管理员及平台管理员的管理和维护' />
      <Tabs
        className='mt-[16px] flex-auto'
        defaultActiveKey='application'
        onChange={onChange}
        items={[
          {
            label: `应用管理员`,
            key: 'application',
            children: (
              <>
                <DescriptionTip description='应用管理员具有创建应用的权限，仅可管理自己的应用' className='mb-[16px]' />
                <div className='flex items-center mb-[16px]'>
                  <Button
                    type='primary'
                    className='mr-[8px]'
                    size='large'
                    onClick={openAddPeopleApplicationAdminDialog}
                  >
                    添加成员
                  </Button>
                  <Button size='large' onClick={() => removeApplicationAdmin(selectedRowKeysForApplicationAdmins)}>
                    删除
                  </Button>
                </div>
                <Table
                  dataSource={applicationAdmins}
                  columns={applicationAdminsColumns}
                  rowKey='id'
                  pagination={false}
                  rowSelection={rowSelection}
                />
                <SelectPeopleDialog
                  open={open}
                  setOpen={setOpen}
                  onOk={addUsersRole}
                  userOptions={usersOptionsRes?.data}
                  optionsLoading={usersOptionsLoading}
                />
              </>
            )
          },
          {
            label: `平台管理员`,
            key: 'platform',
            children: `Content of Tab Pane 2`
          }
        ]}
      />
      <style jsx>{`
        :global(.corp-manager .ant-card-meta-title) {
          padding: 24px 24px 0;
          display: inline-block;
          max-width: calc(100% - 50px);
          color: #171a1d;
          font-size: 18px;
          line-height: 28px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: top;
          font-weight: 500;
        }
        :global(.corp-manager .ant-card-meta-description) {
          padding: 4px 24px;
          line-height: 20px;
          vertical-align: top;
          font-size: 14px;
          color: rgba(0, 0, 0, 0.3);
          line-height: 24px;
        }
        :global(.corp-manager .ant-tabs-nav) {
          margin-bottom: 0;
          padding: 0 24px;
        }
        :global(.corp-manager .ant-tabs-tab) {
          font-size: 16px;
          padding: 8px 12px;
        }
        :global(.corp-manager .ant-tabs-tab .ant-tabs-tab-btn) {
          color: #747677;
          font-weight: 400;
        }
        :global(.corp-manager .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
          color: #171a1d;
        }
        :global(.corp-manager .ant-tabs-content-holder) {
          background-color: #f1f2f3;
        }
        :global(.corp-manager .ant-tabs-content) {
          margin: 16px;
          background-color: #fff;
          padding: 24px;
          border-radius: 6px;
        }
        :global(.corp-manager .ant-table-thead .ant-table-cell) {
          font-size: 14px;
        }
      `}</style>
    </Card>
  )
}

export default CorpManager
