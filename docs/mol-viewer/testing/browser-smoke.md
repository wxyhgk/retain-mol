# mol-viewer 浏览器 Smoke

> 本文用于技术层 Chromium/WebGL 检查。建模手感与化学结构的人工验收见
> [编辑器人工冒烟检查表](../../qa/editor-smoke-checklist.md)。

这套检查覆盖 Node 单元测试无法触达的真实 DOM、Chromium、WebGL、pointer、
`ResizeObserver` 和 `readOnly` 链路。涉及 renderer、picking、pointer router、undo、
overlay 或 `MolViewer` props 的改动，都应执行一次。

## 启动

```bash
npm run build --workspace @retainmol/mol-viewer
npm run dev --workspace retainmol -- --host 0.0.0.0
```

固定使用 `http://127.0.0.1:5173/`。如果 5173 被占用，应先处理占用进程，
不要把临时端口写入验证记录。

## 主应用工作流

1. 打开 `/`，确认主 WebGL canvas 的 CSS 尺寸和 drawing buffer 都非零，页面不是空白。
2. 默认 `C · sp3` 构建笔刷下点击画布中心，左上角分子式应变为 `CH4`。
3. 按 `S` 切到选择模式，点击中心碳原子，应出现 `1 已选`。这一步必须经过真实 raycast，不能直接写 store。
4. 按 `Delete` 删除选中原子，再点击工具栏撤销，分子式应恢复为 `CH4`。
5. 把视口从默认尺寸改为 `900 × 700` 再恢复。WebGL、测量、原子标签、框选四层 canvas 的 backing store 应与当前 DPR 一致，画面保持非空。
6. 检查本次页面加载之后的 console error/page error，应为 0。

## readOnly 工作流

打开隔离用例：

```text
http://127.0.0.1:5173/?test=readonly
```

API 测试页一次只挂载一个 `MolViewer`，避免多个实例争用全局 store。验证：

1. 初始“触发次数”为 `0`，状态为“只读正常”。
2. 点击原子、点击空白并拖动画布。
3. 操作后“触发次数”仍为 `0`，没有 context menu、box select 或编辑提示。
4. 检查本次页面加载之后的 console error/page error，应为 0。

其他受控 API 可分别使用 `?test=molecule`、`?test=selection` 和
`?test=display`。测试页采用单用例挂载，不应恢复为四个 viewer 同时挂载。
