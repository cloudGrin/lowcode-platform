import { material, project } from '@alilc/lowcode-engine'
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { Message, Dialog } from '@alifd/next'
import { TransformStage } from '@alilc/lowcode-types'

export const preview = (scenarioName = 'index') => {
  saveSchema(scenarioName)
  setTimeout(() => {
    const search = location.search ? `${location.search}&scenarioName=${scenarioName}` : `?scenarioName=${scenarioName}`
    window.open(`/pagePreview${search}`)
  }, 500)
}

export const saveSchema = async (scenarioName = 'index') => {
  setProjectSchemaToLocalStorage(scenarioName)

  await setPackgesToLocalStorage(scenarioName)
  // window.localStorage.setItem(
  //   'projectSchema',
  //   JSON.stringify(project.exportSchema(TransformStage.Save))
  // );
  // const packages = await filterPackages(material.getAssets().packages);
  // window.localStorage.setItem(
  //   'packages',
  //   JSON.stringify(packages)
  // );
  Message.success('成功保存到本地')
}

export const resetSchema = async (scenarioName = 'index') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '确定要重置吗？您所有的修改都将消失！',
        onOk: () => {
          resolve()
        },
        onCancel: () => {
          reject()
        }
      })
    })
  } catch (err) {
    return
  }

  // 除了「综合场景」，其他场景没有默认 schema.json，这里构造空页面
  if (scenarioName !== 'index') {
    window.localStorage.setItem(
      getLSName(scenarioName),
      JSON.stringify({
        componentsTree: [{ componentName: 'Page', fileName: 'sample' }],
        componentsMap: material.componentsMap,
        version: '1.0.0',
        i18n: {}
      })
    )
    project.getCurrentDocument()?.importSchema({ componentName: 'Page', fileName: 'sample' })
    project.simulatorHost?.rerender()
    Message.success('成功重置页面')
    return
  }

  let schema
  try {
    schema = await request('./schema.json')
  } catch (err) {
    schema = {
      componentName: 'Page',
      fileName: 'sample'
    }
  }

  window.localStorage.setItem(
    getLSName('index'),
    JSON.stringify({
      componentsTree: [schema],
      componentsMap: material.componentsMap,
      version: '1.0.0',
      i18n: {}
    })
  )

  project.getCurrentDocument()?.importSchema(schema)
  project.simulatorHost?.rerender()
  Message.success('成功重置页面')
}

const getLSName = (scenarioName: string, ns = 'projectSchema') => `${scenarioName}:${ns}`

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!')
    return
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName)) || '{}')
}

const setProjectSchemaToLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!')
    return
  }
  window.localStorage.setItem(getLSName(scenarioName), JSON.stringify(project.exportSchema(TransformStage.Save)))
}

const setPackgesToLocalStorage = async (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!')
    return
  }
  const packages = await filterPackages(material.getAssets().packages)
  window.localStorage.setItem(getLSName(scenarioName, 'packages'), JSON.stringify(packages))
}

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!')
    return
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '{}')
}

export const getPageSchema = async (scenarioName = 'index') => {
  const pageSchema = getProjectSchemaFromLocalStorage(scenarioName).componentsTree?.[0]

  if (pageSchema) {
    return pageSchema
  }

  return await request('./schema.json')
}

function request(
  dataAPI: string,
  method = 'GET',
  data?: object | string,
  headers?: object,
  otherProps?: any
): Promise<any> {
  return new Promise((resolve, reject): void => {
    if (otherProps && otherProps.timeout) {
      setTimeout((): void => {
        reject(new Error('timeout'))
      }, otherProps.timeout)
    }
    fetch(dataAPI, {
      method,
      credentials: 'include',
      headers,
      body: data,
      ...otherProps
    })
      .then((response: Response): any => {
        switch (response.status) {
          case 200:
          case 201:
          case 202:
            return response.json()
          case 204:
            if (method === 'DELETE') {
              return {
                success: true
              }
            } else {
              return {
                __success: false,
                code: response.status
              }
            }
          case 400:
          case 401:
          case 403:
          case 404:
          case 406:
          case 410:
          case 422:
          case 500:
            return response
              .json()
              .then((res: object): any => {
                return {
                  __success: false,
                  code: response.status,
                  data: res
                }
              })
              .catch((): object => {
                return {
                  __success: false,
                  code: response.status
                }
              })
          default:
            return null
        }
      })
      .then((json: any): void => {
        if (json && json.__success !== false) {
          resolve(json)
        } else {
          delete json.__success
          reject(json)
        }
      })
      .catch((err: Error): void => {
        reject(err)
      })
  })
}
