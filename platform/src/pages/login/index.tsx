import { getLoginState, useStrapiRequest } from '@/lib/request'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { loading, run: goLogin } = useStrapiRequest(
    '/api/auth/local__POST',
    (payload: ApiTypes['/api/auth/local__POST']['request']) => ({
      payload,
      needAuth: false
    }),
    {
      manual: true,
      onSuccess: (data) => {
        getLoginState().setLoginToken(data.jwt)
        getLoginState().setUserInfo(data.user)
        navigate('/')
      }
    }
  )

  const onFinish = (values: any) => {
    goLogin({ identifier: values.username, password: values.password })
  }

  return (
    <div className='mt-[30vh]'>
      <Form
        name='normal_login'
        className='max-w-[300px] mx-auto'
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item name='username' rules={[{ required: true, message: 'Please input your Email!' }]}>
          <Input prefix={<UserOutlined className='site-form-item-icon' />} placeholder='邮箱' />
        </Form.Item>
        <Form.Item name='password' rules={[{ required: true, message: 'Please input your Password!' }]}>
          <Input prefix={<LockOutlined className='site-form-item-icon' />} type='password' placeholder='密码' />
        </Form.Item>
        <Form.Item>
          <Form.Item name='remember' valuePropName='checked' noStyle>
            <Checkbox>记住我</Checkbox>
          </Form.Item>
        </Form.Item>

        <Form.Item>
          <Button loading={loading} type='primary' htmlType='submit' className='w-full'>
            登录
          </Button>
          <div className='float-left'>
            <Link to='/register'>去注册</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Login
