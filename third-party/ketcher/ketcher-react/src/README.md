# 小分子编辑器源码导航

第一次看本包，按 `Editor.tsx → MicromoleculesEditor.tsx → bootstrap/index.ts` 阅读启动流程，再按要修改的功能进入 `ui/` 或 `editor/`。整个仓库的调用关系见[目录导航](../../../docs/repository-layout.md)。

## 目录职责

```text
src/
├── index.tsx                 包的公共导出
├── Editor.tsx                对外 React 组件，组装小分子与大分子模式
├── MicromoleculesEditor.tsx   小分子编辑器的挂载与清理
├── bootstrap/                初始化 API、服务 provider 和 UI
│   ├── builders/             KetcherBuilder 及其构建步骤
│   ├── attachMoleculeReader.ts 正式画布 API 的宿主装配与生命周期
│   └── providers/            化学服务 provider 的封装
├── editor/                   小分子编辑控制
│   ├── Editor.ts             协调工具、历史、选择、结构和视图
│   ├── core/                 各 Manager 与工具上下文接口
│   ├── tool/                 画键、模板、选择、粘贴等交互工具
│   ├── bus/                  编辑事件
│   └── view/                 画布视图控制
├── ui/                       小分子界面及其状态
│   ├── App/                  Redux 与界面初始化
│   ├── views/                编辑器页面和剪贴板区域的组装
│   ├── toolbars/             顶栏、左栏、右栏和浮动工具
│   ├── dialogs/              弹窗容器、文档操作、设置和工具表单
│   │   └── legacy/           仍在使用的旧弹窗注册与表单
│   ├── components/           右键菜单、结构编辑区域等功能组件
│   ├── primitives/           表单、菜单、剪贴板等基础控件
│   ├── state/                Redux 状态、快捷键与 action 接入
│   ├── action/               界面 action 定义
│   └── data/                 模板、配置、格式转换等界面数据
├── components/               共享 UI 和对外导出的基础组件
├── contexts/、hooks/          React 上下文与 hooks
└── assets/、style/、templates/  静态资源、公共样式与模板素材
```

`components/` 的部分实现由顶层 `Editor.tsx` 注入大分子包；`ui/components/` 服务小分子界面。`ui/primitives/` 与 `ui/dialogs/legacy/` 中仍有历史实现，目录归类不表示组件已经统一或废弃。新组件放到对应职责目录；合并重复实现需要另外验证使用方。

跨组件共用的 UI 标识放在 `constants.ts`。例如 Dialog 和剪贴板区域共同引用 `CLIP_AREA_BASE_CLASS`，Dialog 无需导入剪贴板组件即可找到关闭弹窗后的焦点目标。

`ketcher.molecule` 的图投影、稳定 ID 与版本缓存归 `packages/molecule-ketcher`；本包通过 `bootstrap/attachMoleculeReader.ts` 注入当前 editor、正式变更事件、可用性以及 `MoleculeCommitManager` 的同步安装/渲染/历史端口。隔离候选由 engine 计算，实际画布提交由本包完成。详见 [adapter 用法](../../molecule-ketcher/README.md)。

## Input 与 SchemaInput 怎么选

| 组件          | 路径                                                                             | 使用方式                                                                                                               |
| ------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Input`       | [components/Input](components/Input/Input.tsx)                                   | 带共享样式的普通输入框，接收原生 input props，`onChange` 收到输入事件；由包公开导出，也通过 UI bridge 提供给大分子界面 |
| `SchemaInput` | [ui/primitives/form/SchemaInput](ui/primitives/form/SchemaInput/SchemaInput.tsx) | 根据 schema 选择文本框、下拉框、复选框等控件，适配字段值后调用 `onChange(value)`；用于小分子表单                       |

`Form/Field`、`MeasureInput`、`SelectCheckbox`、模板库搜索和识别版本选择使用 `SchemaInput`。周期表的类型选择复用同一模块中的 `GenericInput`，它是底层输入控件。旧 `ui/primitives/form/Input/` 目录及其中的组件、样式、测试文件现已改名为 `SchemaInput`。

## 两个 Editor 不要混淆

- `Editor.tsx` 是宿主使用的 React 组件，公共导出路径保持不变。
- `editor/Editor.ts` 是小分子控制器，其导出入口为 `editor/index.ts`。导入目录入口时明确写 `src/editor/index` 或相对路径 `…/editor/index`，避免 macOS 将无后缀的 `editor` 解析到 `Editor.tsx`。

这次整理将旧 `script/` 中的运行代码分成 `bootstrap/`、`editor/`、`ui/`，并把 `ui/views/` 下的功能目录移到 `ui/`。查看上游资料或旧工程记录时，使用[迁移映射](../../../tasks/engineering/source-organization-20260914.md) 对照路径。
