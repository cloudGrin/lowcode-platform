import { IPublicModelPluginContext } from '@alilc/lowcode-types';

import { Button } from 'antd'
import { preview } from '../../../helper'

// 保存功能示例
const PreviewSamplePlugin = (
  ctx: IPublicModelPluginContext,
  options: {
    route: ApiProjectRoutesFindByUuidResponse['data']
    pageVersion: ApiPageVersionsLatestResponse['data']
  }
) => {
  return {
    async init() {
      const { skeleton, config } = ctx
      const { route, pageVersion } = options
      let lastPageVerisonId = pageVersion.id
      skeleton.add({
        name: 'previewSample',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right'
        },
        content: (
          <Button
            type='primary'
            onClick={() =>
              preview({
                navUuid: route.navUuid,
                versionId: lastPageVerisonId
              })
            }
          >
            预览
          </Button>
        )
      })

      // 页面保存到云端，刷新pageVersion
      config.onGot('pageVersion', (data: ApiPageVersionsResponse__POST['data']['version']) => {
        lastPageVerisonId = data.id
      })
    }
  }
}
PreviewSamplePlugin.pluginName = 'PreviewSamplePlugin'
PreviewSamplePlugin.meta = {
  dependencies: ['CloudSyncPlugin'],
  preferenceDeclaration: {
    title: '插件配置',
    properties: [
      {
        key: 'route',
        type: 'object',
        description: '页面信息'
      },
      {
        key: 'pageVersion',
        type: 'object',
        description: '页面版本信息'
      }
    ]
  }
}
export default PreviewSamplePlugin
