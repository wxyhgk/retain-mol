# molecule-ketcher

通过 `ketcher.molecule` 读取当前画布，并在隔离预览后整批提交基础分子图。React 宿主在初始化时装配；独立引擎不持有第二份可写画布。

## 从读取到提交

```ts
// 在 Editor 的 onInit(ketcher) 中使用。
const canvas = ketcher.molecule;
if (!canvas || canvas.getCapabilities().edit !== 'supported') return;
const current = canvas.getDocument();
if (!current.ok) return; // 从 getState().issues 读取不支持的文档特征。

const prepared = canvas.prepareEdit({
  schema: 'retainmol.molecule-edit.v1',
  documentId: current.value.documentId,
  baseRevision: current.value.revision,
  requestId: crypto.randomUUID(),
  commands: [
    { op: 'atom.add', ref: 'carbon', element: 'C', position: { x: 0, y: 0 } },
    { op: 'atom.add', ref: 'oxygen', element: 'O', position: { x: 1, y: 0 } },
    {
      op: 'bond.add',
      ref: 'bond',
      begin: { ref: 'carbon' },
      end: { ref: 'oxygen' },
      order: 'single',
    },
  ],
});
if (!prepared.ok) return;
// 将 prepared.value.candidate、changes、warnings 展示在独立预览中。
// 宿主确认按钮的 handler 中调用：
const confirm = () =>
  canvas.commitEdit({
    preparedId: prepared.value.preparedId,
    requestId: prepared.value.requestId,
  });
// 宿主取消按钮的 handler 中调用：
const cancel = () =>
  canvas.cancelEdit({
    preparedId: prepared.value.preparedId,
    requestId: prepared.value.requestId,
  });
```

本例向画布添加独立 C–O，不清空现有分子。修改已有实体时，将 `getDocument()` 中的 ID 放入 `{ id }`；新实体的 `{ ref }` 仅在本次请求内有效。完整六类命令见 [contracts](../molecule-contracts/README.md)。

启动 standalone 后打开 `http://127.0.0.1:5273/?moleculeApiDemo=true`，可用演示侧栏填写 JSON、预览、确认或取消，以及载入 C–C–O、O→N、键级和删键示例。预览是基础图示意；默认编辑界面不显示该侧栏。

## 读取与身份

- `getDocument()` 返回冻结、脱离实时模型的 JSON Result。普通读取只返回上一次正式变更缓存；拖动预览不会泄露临时图。
- `getState()` 返回 `ready / unsupported / unavailable / disposed`、revision、原因和诊断。`subscribe()` 报告后续事件，不立即回放初始状态；监听异常不破坏编辑。
- 正式编辑、Undo/Redo、替换、旧无历史正式位置变更和可用性切换推进 revision。一次新 API commit 推进一次 revision；旧 API 的 revision 不能当成调用次数。
- documentId 属于当前 API 生命周期。新 API 创建/修改/删除后 Undo/Redo 保持实体 ID；整体格式导入得到新 ID，撤销导入恢复旧 ID。重挂载生成新 documentId，不承诺跨重载持久化。
- `basic-graph-v1` 只表达普通元素、电荷、质量数、二维坐标及单/双/三键。立体、查询、反应、S-group、单体、额外计算元数据等文档整体拒绝，不返回裁剪后的图。
- 大分子模式、单体向导及转换期间不可用。释放后旧 API 返回 `reader-disposed`。

## 提交保障与边界

- `prepareEdit` 复用独立 engine 生成冻结的候选，不修改画布、选择、历史或版本。忙碌期间也可以针对正式缓存准备；提交时必须完成当前交互。
- 画布候选每个原子必须有明确二维坐标。缺失或删除位置返回 `missing-coordinates`。坐标沿用当前画布的二维空间（x 向右、y 向下），不会自动布局或居中；化学有效性未检查；结果保留 `chemistry-unchecked`。
- `commitEdit` 检查基准版本，并比较真实图与缓存，拒绝 `revision-conflict` 或未发布图变化的 `canvas-changed`。候选被独立转换为 Struct 后同步安装和绘制，成功才写一条历史并发布 receipt/版本。
- 提交需默认矩形选择工具空闲、无按下/拖动/正在派发的画布事件、无弹窗或上下文菜单；只读画布和会改写坐标的 `downScale` 渲染配置也拒绝。返回 `canvas-busy` 后完成交互再重试，不自动取消用户工具。
- 提交保留幸存实体的选择、视口、当前高亮及未变化组件的显示位置。普通绘制失败恢复原图/选择/视口/历史，不发布版本；若恢复绘制本身也失败，返回 `canvas-rollback-failed` 并将 API 置为不可用，需要重建编辑器。
- 成功批次对应一次现有画布 Undo/Redo。新 API 尚未提供带 expectedCommitId 的画布 undo/redo，AI 不应借旧接口猜测撤销目标。
- 默认最多 32 个待处理草稿、100 次已提交请求记录，可由自定义宿主设置为 1–10000。待处理达到上限时应 commit/cancel；已提交记录按最早提交驱逐。去重窗口内重试返回原 receipt，即使其后用户已撤销；最新状态须重新读取。相同 requestId 的不同内容返回冲突。
- `cancelEdit` 只清除待处理候选。准备/取消不会产生 Action，图片识别仍要求独立预览和显式确认；本 API 未接模型或识别播放入口。

## 包边界与自定义宿主

运行时依赖 contracts、engine 与 core 的模型能力；没有 React、Redux、DOM 导入。三包 contracts/engine/adapter 均有真实 ESM/CJS 输出和对应声明。

`createMoleculeCanvasReader(source)` 保留只读宿主入口，其编辑方法返回 `editing-unavailable`。`createMoleculeCanvasEditor(source, options)` 还要求 `getEditBusyReason()` 与原子 `commit(candidate, expected, onCommitted)` 端口。宿主必须同步验证/安装/渲染，失败恢复；成功后调用一次 onCommitted，再发布一次正式 edit，且发布后不能返回失败。内置 React 端口实现该约定。第三方绕过事件直接修改 Struct 不在读取同步保障内，提交额外比较只能拒绝变化，不能替第三方补历史。

```sh
npm run build:molecule-ketcher
npm run test:molecule-ketcher
```

构建顺序为 contracts → engine → core → adapter；测试从 dist 公开入口运行。不要在消费 dist 的测试期间构建 core，其 prebuild 会删除 dist。新 checkout 启动 dev server 前先构建；修改新包源码后也需重建 dist。

当前验证记录见 [2B 任务](../../tasks/engineering/molecule-canvas-editing-20260914.md)，后续领域能力和模型接入见[架构计划](../../docs/architecture/molecule-editing-api.md)。
