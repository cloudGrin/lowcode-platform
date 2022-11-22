import { Card, Tabs } from 'antd'
import React, { useCallback, useState } from 'react'
import ApplicationAdminManage from './applicationAdminManage'
import PlatformAdminManage from './platformAdminManage'
const { Meta } = Card

const CorpManager: React.FC = () => {
  const [activeKey, setActiveKey] = useState<'application' | 'platform'>('application')
  const onChange = useCallback((val: any) => {
    setActiveKey(val)
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
        activeKey={activeKey}
        onChange={onChange}
        items={[
          {
            label: `应用管理员`,
            key: 'application',
            children: <ApplicationAdminManage tabType={activeKey} />
          },
          {
            label: `平台管理员`,
            key: 'platform',
            children: <PlatformAdminManage tabType={activeKey} />
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
          padding: 16px;
        }

        :global(.corp-manager .ant-tabs-content) {
          background-color: #fff;
          padding: 24px;
          border-radius: 6px;
        }
      `}</style>
    </Card>
  )
}

export default CorpManager
