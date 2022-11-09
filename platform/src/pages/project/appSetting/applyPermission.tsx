import { useStrapiRequest } from '@/lib/request'
import { message, Spin } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouteLoaderData } from 'react-router-dom'
import SetMember from './components/setMember'

const ApplyPermission: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'master' | 'developer'>('master')

  const { projectInfo } =
    (useRouteLoaderData('project') as {
      projectInfo: ApiProjectsIdResponse['data']
    }) || {}

  const {
    run: getUsers,
    loading,
    data
  } = useStrapiRequest(
    '/api/projects/${id}/users',
    () => ({
      urlValue: {
        id: projectInfo.id
      }
    }),
    { manual: true }
  )

  const selectedUserIds = useMemo(() => {
    return data?.data?.[type].map((i) => i.id)
  }, [data?.data, type])

  const { run: setMembersApi, loading: setMembersApiLoading } = useStrapiRequest(
    '/api/projects/${id}/setMembers__PUT',
    (userIds) => ({
      urlValue: {
        id: projectInfo.id
      },
      payload: {
        memberIds: userIds,
        toRole: type
      }
    }),
    {
      manual: true,
      onSuccess(res) {
        if (res.data.success) {
          message.success('设置成功')
          setOpen(false)
          getUsers()
        }
      }
    }
  )

  const setMembers = useCallback(
    (userIds) => {
      setMembersApi(userIds)
    },
    [setMembersApi]
  )

  useEffect(() => {
    getUsers()
  }, [getUsers])

  return (
    <div className='h-full overflow-y-auto rounded-[6px]'>
      <Spin spinning={loading}>
        <div className='bg-white rounded-[6px] p-[24px_24px] h-full'>
          <div className='text-[18px] leading-[28px] font-medium'>应用管理员设置</div>
          <div className='py-[4px] text-[14px] font-medium leading-[24px] text-[color:#0000004d]'>
            为该应用配置管理员，应用管理员可以对应用进行编辑和设置。
          </div>
          <div className='p-[10px_20px] border-[1px] border-[#e2e2ea] rounded-[8px] min-h-[152px] mt-[16px]'>
            <div className='h-[70px]'>
              <div className='text-[16px] text-[#000000cc]'>应用主管理员</div>
              <div className='mt-[5px] text-[14px] text-[color:#0000004d]'>
                应用主管理员拥有应用管理后台的全部权限，可进行应用搭建、编辑以及设置
              </div>
            </div>
            <div className='h-[1px] bg-[#f1f2f3]'></div>
            <div className='min-h-[80px] flex items-center'>
              <div className='text-[14px] text-[#111f2c] flex-[0_1_120px]'>权限成员</div>
              <div className='flex items-center flex-auto'>
                <button
                  className='mr-[8px] text-[14px] text-c_primary'
                  onClick={() => {
                    setType('master')
                    setOpen(true)
                  }}
                >
                  设置成员
                </button>
                <div className='flex items-center flex-auto'>
                  {data?.data?.master?.map((user) => (
                    <div className='h-[28px] m-[4px] inline-block rounded-[4px] bg-[#7e868e29]' key={user.id}>
                      <span className='text-[14px] text-center leading-[28px] px-[5px]'>{user.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='p-[10px_20px] border-[1px] border-[#e2e2ea] rounded-[8px] min-h-[152px] mt-[20px]'>
            <div className='h-[70px]'>
              <div className='text-[16px] text-[#000000cc]'>开发成员</div>
              <div className='mt-[5px] text-[14px] text-[color:#0000004d]'>
                开发管理员拥有应用开发权限，无应用管理员设置等权限
              </div>
            </div>
            <div className='h-[1px] bg-[#f1f2f3]'></div>
            <div className='min-h-[80px] flex items-center'>
              <div className='text-[14px] text-[#111f2c] flex-[0_1_120px]'>权限成员</div>
              <div className='flex items-center flex-auto'>
                <button
                  className='mr-[8px] text-[14px] text-c_primary'
                  onClick={() => {
                    setType('developer')
                    setOpen(true)
                  }}
                >
                  设置成员
                </button>
                <div className='flex items-center flex-auto'>
                  {data?.data?.developer?.map((user) => (
                    <div className='h-[28px] m-[4px] inline-block rounded-[4px] bg-[#7e868e29]' key={user.id}>
                      <span className='text-[14px] text-center leading-[28px] px-[5px]'>{user.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
      <SetMember
        open={open}
        setOpen={setOpen}
        selectedUserIds={selectedUserIds}
        onOk={setMembers}
        confirmLoading={setMembersApiLoading}
      />
    </div>
  )
}

export default ApplyPermission
