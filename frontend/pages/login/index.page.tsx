import { Button, Checkbox, Form, Input } from 'antd'
import type { NextPage } from 'next'
import { useStrapiRequest } from '@/lib/request'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import Link from 'next/link'

const Login: NextPage = () => {
  const router = useRouter()
  const { loading, run: goLogin } = useStrapiRequest(
    '/api/auth/local',
    (payload: ApiTypes['/api/auth/local']['request']) => ({
      data: payload,
      method: 'POST'
    }),
    {
      manual: true,
      onSuccess: (data) => {
        Cookies.set('jwtToken', data.jwt, {
          expires: 7 // 7 day
        })
        Cookies.set('userInfo', JSON.stringify(data.user), {
          expires: 7 // 7 day
        })
        router.push('/')
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
            <Link href='/register'>去注册</Link>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Login
