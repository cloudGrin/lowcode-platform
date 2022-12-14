import { plugins } from '@alilc/lowcode-engine'
import CodeEditorPlugin from '@alilc/lowcode-plugin-code-editor'
import DataSourcePanePlugin from '@alilc/lowcode-plugin-datasource-pane'
import Inject from '@alilc/lowcode-plugin-inject'
import SchemaPlugin from '@alilc/lowcode-plugin-schema'
import UndoRedoPlugin from '@alilc/lowcode-plugin-undo-redo'
// import EditorInitPlugin from './plugins/plugin-editor-init'
import SetRefPropPlugin from '@alilc/lowcode-plugin-set-ref-prop'
import ComponentPanelPlugin from './plugins/plugin-component-panel'
import DefaultSettersRegistryPlugin from './plugins/plugin-default-setters-registry'
import PreviewSamplePlugin from './plugins/plugin-preview-sample'
import SaveSamplePlugin from './plugins/plugin-save-sample'
import TopAreaLeftPlugin from './plugins/plugin-topArea-left'
import CloudSyncPlugin from './plugins/plugin-cloud-sync'
import Emittery from 'emittery'

export default async function registerPlugins({
  project,
  pageVersion,
  route
}: {
  project: ApiProjectsIdResponse['data']
  pageVersion: ApiPageVersionsLatestResponse['data']
  route: ApiProjectRoutesFindByUuidResponse['data']
}) {
  const emitter = new Emittery()

  // await plugins.register(EditorInitPlugin, {
  //   schema: pageVersion.schema
  // })

  // 设置内置 setter 和事件绑定、插件绑定面板
  await plugins.register(DefaultSettersRegistryPlugin)

  await plugins.register(ComponentPanelPlugin)

  await plugins.register(SchemaPlugin)

  // 注意 Inject 插件必须在其他插件前注册，且所有插件的注册必须 await
  await plugins.register(Inject)

  await plugins.register(SetRefPropPlugin)

  await plugins.register(DataSourcePanePlugin, {
    importPlugins: [],
    dataSourceTypes: [
      {
        type: 'axios'
      }
    ]
  })

  await plugins.register(CodeEditorPlugin)

  await plugins.register(CloudSyncPlugin, { route, pageVersion, emitter })

  // 注册回退/前进
  await plugins.register(UndoRedoPlugin)

  await plugins.register(SaveSamplePlugin, { route, emitter })

  await plugins.register(PreviewSamplePlugin, { route, pageVersion })

  await plugins.register(TopAreaLeftPlugin, { project, route })
}
