# 实例级基础 API

`@retainmol/mol-viewer/runtime` 提供 `getViewerApi(runtime)`。它绑定明确的实例，
不暴露 Zustand store、Three renderer 或内部 services；UI 与 API 继续复用现有编辑命令。
同一个 runtime 重复获取得到同一个 API 对象。

```ts
import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { parseMol, exportMol } from '@retainmol/mol-viewer/io'

const runtime = createViewerRuntime()
const api = getViewerApi(runtime)
api.setMolecule(parseMol(molText))
api.history.clear() // 仅当宿主把此次导入定义为新会话
const stop = api.subscribe(() => {
  const snapshot = api.getSnapshot()
  console.log(snapshot.molecule.atoms.length, snapshot.history.canUndo)
})

// 将同一个 runtime 传给 <MolViewer runtime={runtime} />。
// 分子加载、编辑和订阅无需先挂载视口，普通 Node 也可以使用。
api.selection.set([atomId])
api.edit.replaceAtom(atomId, 'N')
api.history.undo()
const output = exportMol(api.getSnapshot().molecule)
stop()
runtime.dispose()
```

示例中的 `molText`、`atomId` 由宿主提供。浏览器/Node 的 IO 资源准备见
[独立宿主接入](./consumer-integration.md)。

## 接口职责

| 接口 | 行为 |
| --- | --- |
| `getSnapshot()` | 活跃分子、对象 ID、场景选择、历史状态、显示模式、标签开关、主题 ID |
| `subscribe(listener)` | 同时观察 API 与 UI 的修改；返回取消订阅函数 |
| `setMolecule(molecule)` | 替换活跃分子，保留历史并产生一个撤销步骤 |
| `edit` | 原子增删改、键增删/键级、电荷/自由基、氢、R/S、E/Z、键长/键角/二面角、删除选择 |
| `selection.set/clear` | 设置/清除选择，过滤不存在的 ID；不进入编辑历史 |
| `history.undo/redo/clear` | 只影响该实例；编辑手势/事务进行中拒绝调用 |
| `view.fit/focusSelection/reset` | 控制该实例的视口；没有挂载时返回 `false` |
| `view.setDisplayMode/setShowAtomLabels/setTheme` | 修改实例显示设置，不进入分子编辑历史 |
| `view.setAxesVisible/setGridVisible` | 操作当前视口；没有挂载时返回 `false` |
| `view.captureImage` | PNG data URL；没有挂载时返回 `null` |

## 快照与通知

- 快照只读；不得原地修改 `molecule`、原子或键。输入数据同样遵守不可变契约。
- 暴露的状态不变时 `getSnapshot()` 返回同一引用，可用于
  `useSyncExternalStore(api.subscribe, api.getSnapshot, api.getSnapshot)`。
- 通知合并到一个微任务，避免一次编辑中先读到新分子、后读到新历史的中间状态。
  同步执行多个修改可能只收到一次通知；它是状态变化通知，不是逐命令日志。
- 订阅不会立即调用 listener；订阅方先读快照。取消订阅/销毁 runtime 会取消待发通知。
- `history.clear()` 等只修改历史的操作也会通知。重复选择同一组 ID 不通知。
- `MolViewer` 的 `onMoleculeChange/onSelectionChange` 保留原有语义；
  宿主要观察完整状态或视口卸载期间的变化，应使用实例 API 的订阅。

## 生命周期和显示边界

宿主在 effect 中创建 runtime，在同一 effect 的 cleanup 中 dispose。
React StrictMode 重放时必须创建新的 runtime，不得重复使用已经释放的句柄。
仅卸载 `MolViewer` 时可保留 runtime，重新挂载后恢复分子、选择和历史。
真正结束会话时再 dispose；之后 API 的读取、编辑及订阅都会报错。

同一 runtime 的多个视口共享一个编辑会话，视口便捷命令指向最后注册的视口。
两个独立编辑器必须分别创建 runtime。`MolViewer` 显式的受控显示 props 优先于
实例显示设置；需要由 `api.view` 控制时不要同时传入相冲突的 props。

`interactionMode="read-only"` 限制鼠标交互，不是宿主 API 写入权限。示例也禁用
手动编辑按钮，但宿主仍能显式更新分子。

`/state`、全局 `fitViewport()` 等兼容入口仍指向默认实例；新接入应始终使用明确的 runtime。
纯分子处理仍使用 `/core`、`/graph`、`/geometry`、`/io`，无需绑定视口。

## 当前边界

此次收拢接口保持已有编辑语义：返回 `ViewerEditResult` 的操作会给出失败原因；
返回 `void` 的基础操作在门控拒绝时保持原状态，不代表化学验证一定成功。
统一错误码、通用批处理、完整场景管理和测量编辑门面未包含在本次接口中。
`setMolecule` 使用公共 `parseMolecule` 校验基础字段与引用并复制输入；无效输入在提交前抛错。
这不代表完整化学可行性验证。原生 JSON、同位素和文件往返边界见[基础字段保真](./field-fidelity.md)。

复杂环系样例验证导入、显示、H→Cl 修改和往返；它们不证明所有并环/桥连操作正确。
验证记录见[独立宿主接入](./consumer-integration.md)。
