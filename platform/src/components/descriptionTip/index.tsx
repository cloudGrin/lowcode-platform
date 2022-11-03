import classNames from 'classnames'
import React from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
export interface IPropsType {
  description: string
  className?: string
  knowMoreLinkUrl?: string
}

const DescriptionTip: React.FC<IPropsType> = ({ description, knowMoreLinkUrl, className }) => {
  return (
    <div className={classNames(className)}>
      <span className=''>
        <InfoCircleOutlined className='text-[16px] mr-[8px]' />
        {description}
        {knowMoreLinkUrl && (
          <a href={knowMoreLinkUrl} target='_blank' rel='noreferrer'>
            了解更多
          </a>
        )}
      </span>
      <style jsx>
        {`
          div {
            background-color: #f1f2f3;
            border-radius: 6px;
            font-size: 14px;
          }
          div > span {
            display: flex;
            align-items: center;
            padding: 8px 16px;
          }
          div a {
            margin-left: 8px;
            color: #0089ff;
          }
        `}
      </style>
    </div>
  )
}

export default DescriptionTip
