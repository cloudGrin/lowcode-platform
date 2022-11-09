import { Card, Col, Row } from 'antd'
import React from 'react'
import newPageImg from '@/assets/image/newPage.png'
import linkPageImg from '@/assets/image/linkPage.png'

const Empty: React.FC = () => {
  return (
    <div className='p-[16px] bg-[#f1f2f3] empty-container'>
      <div className='text-[24px] text-[#171a1d] leading-[36px] pt-[60px] text-center'>
        从创建第一个页面开始，构建应用
      </div>
      <div className='w-[95%] max-w-[930px] mx-auto my-[30px]'>
        <Row className='' gutter={24}>
          <Col span='12'>
            <Card hoverable className='flex flex-col justify-center text-center h-[200px]' bodyStyle={{ padding: 0 }}>
              <img alt='customPage' src={newPageImg} className='w-[72px] mx-auto' />
              <div className='text-[18px] text-[#171a1d] mt-[20px]'>新建页面</div>
              <div className='text-[14px] text-[#a2a3a5] leading-[21px] mt-[8px]'>可视化搭建页面</div>
            </Card>
          </Col>
          <Col span='12'>
            <Card hoverable className='flex flex-col justify-center text-center h-[200px]' bodyStyle={{ padding: 0 }}>
              <img alt='customPage' src={linkPageImg} className='w-[72px] mx-auto' />
              <div className='text-[18px] text-[#171a1d] mt-[20px]'>添加外部链接</div>
              <div className='text-[14px] text-[#a2a3a5] leading-[21px] mt-[8px]'>从本站点链接到外部</div>
            </Card>
          </Col>
        </Row>
      </div>
      <style jsx>
        {`
          .empty-container {
            height: calc(100vh - theme(height.header));
          }
        `}
      </style>
    </div>
  )
}

export default Empty
