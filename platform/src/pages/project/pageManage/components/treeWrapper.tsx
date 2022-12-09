import Tree from '@atlaskit/tree'
import { FC, memo } from 'react'

const PADDING_PER_LEVEL = 22

const TreeWrapper: FC<Record<string, any>> = ({
  activeTree,
  renderItem,
  onExpand,
  onCollapse,
  onDragEnd,
  isDragEnabled
}) => {
  console.log(activeTree)
  return (
    <Tree
      tree={activeTree}
      renderItem={renderItem}
      onExpand={onExpand}
      onCollapse={onCollapse}
      onDragEnd={onDragEnd}
      offsetPerLevel={PADDING_PER_LEVEL}
      isDragEnabled={isDragEnabled}
      isNestingEnabled
    />
  )
}

export default memo(TreeWrapper)
