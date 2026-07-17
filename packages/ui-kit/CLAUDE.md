# @retainmol/ui-kit

无业务语义的共享 UI 层。这里的组件不知道"分子""任务""工作流"是什么。

## 铁律
* **禁止**依赖任何业务包（jobs/molecule-assets）和 mol-viewer；禁止出现化学/任务词汇的 props 或文案。
* 不读 `import.meta.env`；不发网络请求；不持久化。
* 第三方库单入口：`@tanstack/react-table` 只经 `data/DataTable`，`react-virtuoso` 只经 `data/VirtualList`。
* 样式走 Tailwind token（`--border`/`--muted` 等），禁止字面色。

## 结构
* `ui/`：shadcn 原子（Button/Input/Dialog/NativeSelect/Field/Textarea…）
* `data/`：数据展示适配器（DataTable/VirtualList/FileDropzone/AsyncBoundary）
* `hooks/`：通用 hooks

## 命令
* 构建：`npm run build --workspace @retainmol/ui-kit`（改 src 后必须，否则消费方用旧产物）
* 边界：`npm run check:boundaries --workspace @retainmol/ui-kit`
* 跨包改动最后回根目录 `npm run verify`
