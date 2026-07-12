import { ToolbarView, type ToolbarProps } from './ToolbarView'
import { useToolbarModel } from './useToolbarModel'

export default function Toolbar(props: ToolbarProps) {
  const model = useToolbarModel()

  return <ToolbarView {...props} {...model} />
}
