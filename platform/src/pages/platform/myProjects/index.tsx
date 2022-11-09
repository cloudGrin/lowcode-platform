import { useStrapiRequest } from '@/lib/request'
import {
  CodeOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  EyeOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { Button, Card, Col, Input, message, Modal, Popover, Row, Tooltip } from 'antd'
import { chunk } from 'lodash'
import React, { useMemo, useRef, useState } from 'react'
import { useRouteLoaderData, useNavigate } from 'react-router-dom'
import AddOrEditProjectDialog from './components/addOrEditProjectDialog'

const MyProjects: React.FC = () => {
  const navigate = useNavigate()
  const { userInfo } =
    (useRouteLoaderData('userAuth') as { userInfo: ApiTypes['/api/users/me']['response']['data'] }) || {}

  const { runAsync: getMyProjects, data: allProjects } = useStrapiRequest('/api/projects', () => ({
    payload: {
      pagination: {
        page: 1,
        pageSize: 100
      }
    }
  }))

  const [open, setOpen] = useState(false)
  const formatAllProjects = useMemo(() => {
    return chunk(allProjects?.data ?? [], 4)
  }, [allProjects])
  const inputValue = useRef('')
  const { runAsync: deleteProject, loading: deleteProjectLoading } = useStrapiRequest(
    '/api/projects/${id}__DELETE',
    (id: number) => ({
      urlValue: {
        id
      },
      hideErrorMessage: true
    }),
    { manual: true }
  )
  return (
    <>
      <div className='bg-white '>
        <div className='h-[80px] bg-cover bg-[url("@/assets/image/myAppBg.png")]'>
          <div className='max-w-[1180px] flex mx-auto h-[80px] items-center justify-between py-[24px]'>
            <div className=''>
              <span className='text-[18px] text-[#171a1d] font-medium'> Hi {userInfo.username}</span>
              {userInfo.isApplicationAdmin && (
                <span className='text-[14px] ml-[15px] text-[#111f2c8f]'>你可以从这里开始创建应用～</span>
              )}
            </div>
            <div className='flex'>
              <Tooltip
                placement='top'
                title='无权限创建应用，请联系管理员'
                open={userInfo.isApplicationAdmin ? false : undefined}
              >
                <Button
                  size='large'
                  icon={<PlusOutlined />}
                  className='flex items-center'
                  disabled={!userInfo.isApplicationAdmin}
                  onClick={() => setOpen(true)}
                >
                  创建应用
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className='mt-[16px] max-w-[1180px] px-[24px] mx-auto'>
          {formatAllProjects.length > 0 ? (
            formatAllProjects.map((row, rowIdx) => (
              <Row key={rowIdx} className='mx-[-8px]'>
                {row.map((col, colIdx) => (
                  <Col key={colIdx} xs={24} sm={12} md={8} lg={6} xl={6} xxl={6} className='px-[8px]'>
                    <Card
                      className='cursor-pointer mb-[16px] border-[#f1f2f3]]'
                      bodyStyle={{
                        height: '156px',
                        padding: '16px'
                      }}
                      onClick={() => {
                        navigate(`${col.id}/admin`)
                      }}
                    >
                      <div className='flex flex-col justify-between h-full'>
                        <div className='flex items-center'>
                          <div className='w-[40px] h-[40px] bg-[#0089ff] mr-[10px] rounded-[6px] justify-center flex items-center'>
                            <CodeOutlined className='text-[26px] text-white' />
                          </div>
                          <div className='w-[80%] overflow-hidden whitespace-nowrap text-ellipsis font-medium text-[#171a1d] text-[16px]'>
                            {col.name}
                          </div>
                        </div>
                        <div className='text-[12px] text-[#a2a3a5] overflow-hidden'>{col.description}</div>
                        <div className='flex justify-end'>
                          <Popover
                            placement='bottom'
                            overlayInnerStyle={{ padding: '10px 6px' }}
                            content={
                              <div className='w-[110px]'>
                                <div
                                  className='option'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`${col.id}/admin/appSetting/basicSetting`)
                                  }}
                                >
                                  <SettingOutlined className='align-middle text-[18px]' />
                                  <span className='ml-[6px]'>应用设置</span>
                                </div>
                                <div className='option'>
                                  <EyeOutlined className='align-middle text-[18px]' />
                                  <span className='ml-[6px]'>访问应用</span>
                                </div>
                                <div
                                  className='option !text-c_error'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    Modal.confirm({
                                      width: 525,
                                      content: (
                                        <>
                                          <div className='text-[#747677] text-[14px] my-[10px]'>
                                            如确定删除，请输入应用名称：{col.name}
                                          </div>
                                          <Input
                                            placeholder='请输入'
                                            onChange={(e) => (inputValue.current = e.target.value)}
                                          />
                                          <div className='text-[#ff5219] leading-[20px] text-[14px] mt-[20px]'>
                                            应用删除后无法还原，请谨慎操作！
                                          </div>
                                        </>
                                      ),
                                      title: <span className='text-[18px] leading-[22px]'>你确定要删除应用么？</span>,
                                      onOk: () => {
                                        if (inputValue.current === col.name) {
                                          return deleteProject(col.id)
                                            .then((res) => {
                                              if (res.data.success) {
                                                message.success('删除成功')
                                              } else {
                                                message.error('删除失败')
                                              }
                                              getMyProjects()
                                            })
                                            .catch((error) => {
                                              if (error.response.status === 403) {
                                                message.error('只有平台管理员且是该应用master角色才允许删除应用！', 2)
                                              } else {
                                                message.error(error.response.data.error.message || '错误')
                                              }
                                            })
                                        }
                                        message.error('请输入要删除的应用名称')
                                        return Promise.reject('请输入要删除的应用名称')
                                      },
                                      okButtonProps: {
                                        loading: deleteProjectLoading
                                      }
                                    })
                                  }}
                                >
                                  <DeleteOutlined className='align-middle text-[18px]' />
                                  <span className='ml-[6px]'>删除应用</span>
                                </div>
                                <style jsx>{`
                                  .option {
                                    @apply cursor-pointer hover:bg-[#f1f2f3] rounded-[6px] flex items-center text-zinc-500 text-[14px] h-[36px] pl-[8px] transition-all;
                                  }
                                `}</style>
                              </div>
                            }
                          >
                            <button
                              className='w-[32px] h-[32px] rounded-[6px] hover:bg-[#f1f2f3] text-center transition-all'
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <EllipsisOutlined className='text-[26px] text-[#878f95]' />
                            </button>
                          </Popover>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ))
          ) : (
            <div className='bg-[#f6f6f6] rounded-[6px] flex items-center justify-center'>
              <img
                className='h-[220px]'
                src='https://img.alicdn.com/imgextra/i1/O1CN01FkaGTw29YEVudU3X2_!!6000000008079-2-tps-360-360.png'
              />
              <style jsx>{`
                div {
                  height: calc(100vh - 200px);
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
      <AddOrEditProjectDialog open={open} setOpen={setOpen} onOk={getMyProjects} />
    </>
  )
}

export default MyProjects
