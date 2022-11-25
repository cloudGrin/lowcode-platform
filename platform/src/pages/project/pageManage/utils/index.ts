import { ItemId, TreeData, TreeItem } from '@atlaskit/tree'

export function getAncestorIds(items: TreeData['items'], ids: ItemId[]): ItemId[] {
  for (const [id, config] of Object.entries(items)) {
    if (!ids.includes(id)) {
      if (config.children.includes(ids[ids.length - 1])) {
        return getAncestorIds(items, [...ids, id])
      }
    }
  }
  return ids
}

export function findFirstPage(tree: TreeData): TreeItem | undefined {
  for (const uuid of tree?.items?.[tree.rootId]?.children ?? []) {
    const item = tree.items[uuid]
    if (item && item?.data?.type !== 'NAV') {
      return item
    } else if (item && !!item.children?.length) {
      const result = findFirstPage({
        rootId: item.id,
        items: tree.items
      })
      if (result) {
        return result
      }
    }
  }
}
