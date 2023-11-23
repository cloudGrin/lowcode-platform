import { useStrapiRequest } from '@/lib/request'
import { Checkbox, Form, Input, message, Modal, TreeSelect } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
import type { ItemId, TreeData } from '@atlaskit/tree'
import { useParams } from 'react-router-dom'

const AddRouteDialog: React.FC<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (val: any) => void
  type: ApiProjectRouteType
  tree?: TreeData
  actionType?: 'add' | 'edit'
}> = ({ open, setOpen, onOk, type, actionType = 'add', tree }) => {
  const { id } = useParams()

  const [form] = Form.useForm()

  const { runAsync: createRouteApi, loading } = useStrapiRequest(
    '/api/project-routes__POST',
    (payload: Omit<ApiProjectRoutesRequest__POST, 'projectId' | 'type'>) => ({
      payload: {
        ...payload,
        type,
        projectId: id!
      }
    }),
    {
      manual: true
    }
  )
  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields()
      const createResult = await createRouteApi(values)
      setOpen(false)
      message.success('新增成功')
      onOk(createResult)
    } catch (errorInfo) {
      console.log('Failed:', errorInfo)
      // message.success('新增失败')
    }
  }, [createRouteApi, form, onOk, setOpen])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const getTitle = () => {
    return {
      PAGE: {
        title: {
          add: '新建页面'
        },
        nameLabel: '页面名称',
        defaultTitle: '未命名页面'
      },
      LINK: {
        title: {
          add: '新建外链页面',
          edit: '外链设置'
        },
        nameLabel: '页面名称',
        defaultTitle: '未命名外链页面'
      },
      NAV: {
        title: {
          add: '新建分组'
        },
        nameLabel: '分组名称',
        defaultTitle: '未命名分组'
      }
    }[type]
  }

  const groupData = useMemo(() => {
    if (tree) {
      const result = flattenTree(tree)
      if (type === 'NAV') {
        return result.map(({ children, ...rest }) => rest)
      }
      return result
    } else {
      return []
    }
  }, [tree, type])

  const resetForm = useCallback(() => {
    form.resetFields()
  }, [form])

  useEffect(() => {
    if (open) {
      // 延迟重置，不然表单初始化值不能准确更新
      Promise.resolve().then(() => {
        resetForm()
      })
    }
  }, [open, resetForm])

  return (
    <Modal
      title={getTitle().title[actionType]}
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={handleCancel}
    >
      <Form layout='vertical' form={form}>
        <Form.Item
          name='title'
          label={getTitle().nameLabel}
          rules={[{ required: true, message: '必填字段' }]}
          initialValue={getTitle().defaultTitle}
        >
          <Input placeholder='请输入' />
        </Form.Item>
        {type === 'LINK' && (
          <Form.Item
            name='url'
            label='链接地址'
            rules={[
              { required: true, message: '必填字段' },
              { type: 'url', message: '不是一个有效的链接' }
            ]}
          >
            <Input placeholder='请输入' />
          </Form.Item>
        )}
        <Form.Item name='parentNavUuid' label='选择分组'>
          <TreeSelect
            showSearch
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder='请选择'
            allowClear
            treeDefaultExpandAll
            treeData={groupData}
          />
        </Form.Item>
        {type === 'LINK' && (
          <Form.Item name='isNewPage' label='' valuePropName='checked'>
            <Checkbox>打开方式-新开页面</Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default AddRouteDialog

type FlattenTree = {
  value: ItemId
  title: string
  children: FlattenTree
}[]

function flattenTree(tree: TreeData): FlattenTree {
  return tree.items[tree.rootId]
    ? tree.items[tree.rootId].children.reduce((accum, itemId) => {
        const nav = tree.items[itemId]
        const isNav = nav.data.type === 'NAV'
        if (isNav) {
          accum.push({
            value: nav.id,
            title: nav.data.title,
            children: flattenTree({
              rootId: nav.id,
              items: tree.items
            })
          })
        }
        return accum
      }, [] as FlattenTree)
    : []
}
