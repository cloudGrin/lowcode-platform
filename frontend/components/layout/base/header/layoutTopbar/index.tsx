import UserInfo from './userInfo'
import classnames from 'classnames'
export default function LayoutTopbar() {
  return (
    <div className={classnames('bg-c_bg_2 h-header')}>
      <div className='flex items-center justify-between h-full m-auto w-page_content'>
        <div className='flex items-center'>
          <div className='text-c_level_3'>欢迎您</div>
          <UserInfo />
        </div>
        <div className='flex items-center'></div>
      </div>
    </div>
  )
}
