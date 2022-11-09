import { useStrapiRequest } from '@/lib/request'
import { getLoginState } from '@/lib/request/utils'
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { loading, run: goRegister } = useStrapiRequest(
    '/api/auth/local/register__POST',
    (payload: ApiTypes['/api/auth/local/register__POST']['request']) => ({
      payload,
      needAuth: false
    }),
    {
      manual: true,
      onSuccess: (data) => {
        getLoginState().setLoginToken(data.data.jwt)
        getLoginState().setUserInfo(data.data.user)
        navigate('/')
      }
    }
  )

  const onFinish = (values: any) => {
    goRegister({ username: values.username, password: values.password, email: values.email })
  }

  return (
    <div className='mt-[20vh]'>
      <Form
        name='normal_login'
        className='max-w-[300px] mx-auto'
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item name='username' hasFeedback rules={[{ required: true, message: '请填写用户名!' }]}>
          <Input prefix={<UserOutlined className='site-form-item-icon' />} placeholder='用户名' />
        </Form.Item>
        <Form.Item
          name='email'
          hasFeedback
          rules={[
            {
              type: 'email',
              message: '请填写正确的邮箱格式!'
            },
            { required: true, message: '请填写邮箱!' }
          ]}
        >
          <Input prefix={<MailOutlined className='site-form-item-icon' />} placeholder='邮箱' />
        </Form.Item>
        <Form.Item name='password' hasFeedback rules={[{ required: true, message: '请填写密码!' }]}>
          <Input prefix={<LockOutlined className='site-form-item-icon' />} type='password' placeholder='密码' />
        </Form.Item>
        <Form.Item
          name='confirmPassword'
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请确认密码!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入密码不一致，请重新输入!'))
              }
            })
          ]}
        >
          <Input prefix={<LockOutlined className='site-form-item-icon' />} type='password' placeholder='确认您的密码' />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' className='w-full' loading={loading}>
            注册
          </Button>
          <div className='float-left'>
            <Link to='/login'>已有账号去登录</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Register
