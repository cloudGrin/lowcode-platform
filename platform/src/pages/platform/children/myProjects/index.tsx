import { Button, Row, Col, Tooltip } from 'antd'
import React, { useMemo, useState } from 'react'
import { useRouteLoaderData, useLoaderData } from 'react-router-dom'
import { PlusOutlined } from '@ant-design/icons'
import AddOrEditProjectDialog from './components/addOrEditProjectDialog'
import { chunk } from 'lodash'
const MyProjects: React.FC = () => {
  const { userInfo } = (useRouteLoaderData('platform') as { userInfo: ApiTypes['/api/users/me']['response'] }) || {}
  const { allProjects } = useLoaderData() as { allProjects: ApiTypes['/api/projects']['response'] }
  const [open, setOpen] = useState(false)
  const formatAllProjects = useMemo(() => {
    return chunk(allProjects.data, 4)
  }, [allProjects])

  return (
    <>
      <div className='bg-white '>
        <div className='h-[80px] bg-[url("https://img.alicdn.com/imgextra/i4/O1CN01kaZkjR1n5uTZVwBR6_!!6000000005039-2-tps-5760-320.png")] bg-cover'>
          <div className='max-w-[1180px] flex mx-auto h-[80px] items-center justify-between py-[24px]'>
            <div className=''>
              <span className='text-[18px] text-[#171a1d] font-medium'> Hi {userInfo.username}</span>
              {userInfo.canCreateProject && (
                <span className='text-[14px] ml-[15px] text-[#111f2c8f]'>你可以从这里开始创建应用～</span>
              )}
            </div>
            <div className='flex'>
              <Tooltip placement='top' title='无权限创建应用' open={userInfo.canCreateProject ? false : undefined}>
                <Button
                  size='large'
                  icon={<PlusOutlined />}
                  className='flex items-center'
                  disabled={!userInfo.canCreateProject}
                  onClick={() => setOpen(true)}
                >
                  创建应用
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className='mt-[16px] max-w-[1180px] px-[24px] mx-auto'>
          {allProjects.data.length > 0 ? (
            formatAllProjects.map((row, rowIdx) => (
              <Row key={rowIdx} className='mx-[-8px]'>
                {row.map((col, colIdx) => (
                  <Col key={colIdx} span='6' className='px-[8px]'>
                    <div className='flex cursor-pointer rounded-[6px] mb-[16px] h-[156px] p-[16px] justify-between relative border-[1px] border-c-[#f1f2f3] '>
                      {col.attributes.name}
                    </div>
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
      <AddOrEditProjectDialog
        open={open}
        setOpen={setOpen}
        onOk={() => {
          console.log('ok')
        }}
      />
    </>
  )
}

export default MyProjects
