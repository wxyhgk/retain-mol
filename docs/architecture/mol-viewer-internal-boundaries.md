# mol-viewer 包内基础边界

第一批整理保持现有 npm 包、公开 API、JSON 格式和编辑行为，仅调整实现归属与依赖门禁。
第二批新增纯 `/headless` 子入口，迁出 hooks 中的编辑会话和 public 中的 runtime 提交实现；旧入口继续兼容。

## 当前目录

| 模块 | 责任 | 允许依赖 |
| --- | --- | --- |
| `src/lib/model/types.ts` | 原子、键、分子、配位位点、普通向量 DTO | model 内部 |
| `src/lib/model/identity.ts` | `genId`，保留非安全上下文兼容逻辑 | model 内部 |
| `src/lib/model/validation.ts` | 输入所有权、JSON 数据与结构引用校验 | model 内部 |
| `src/lib/model/clone.ts` | headless 与 viewer 上下文共用的分子快照复制 | model 内部 |
| `src/lib/model/elements.ts` | 元素名称、原子序数、质量、参考半径和分类 | model 内部 |
| `src/lib/chemistry/policies/elementDefaults.ts` | 编辑器价态、补氢、杂化默认值与有效成键数策略 | model |
| `src/lib/graph/queries.ts` | 邻居、键、连接数、氢宿主查询 | model、graph |
| `src/lib/graph/components.ts` | 连通片段与连通分量 | model、graph |
| `src/lib/presentation/types.ts` | 显示、测量样式、工具、预览 DTO 与默认值 | model、presentation |
| `src/lib/presentation/elementColors.ts`、`periodicTable.ts` | 默认元素色、常用元素与周期表排列 | model、presentation |
| `src/lib/builder/geometry/growPreview.ts` | 预览原子位置、候选环或点集 | 纯分子与几何模块 |
| `src/styles/growPreviewAppearance.ts` | 预览球半径与默认颜色 | 元素参考数据、默认色、render 配置 |
| `src/lib/clipboard.ts` | 可序列化片段剪贴板 DTO | model |
| `src/lib/utils.ts` | UI 的 `cn`；旧 `genId` 转发 | UI 工具库 |
| `src/application/editing/sessions.ts` | 通过窄回调组织编辑会话 | 纯分子命令与数据 |
| `src/runtime/editingSessions.ts` | 实例 store 与会话回调的绑定 | store、application/editing |
| `src/runtime/modelingApi.ts` | viewer 快照、revision 二次检查、整批提交 | runtime、纯 modeling 协议 |

model、graph 不依赖 Builder、IO、显示层、store 或 runtime，类型导入也受约束。
图查询保留原算法；化学规则与编辑命令仍在现有位置。
validation 只校验数据及引用，不承担完整化学可行性判断。

## 兼容

- `lib/types.ts`、`lib/moleculeValidation.ts`、`builder/graph.ts`、`builder/analysis/fragments.ts` 保留转发，新内部代码直接引用所属模块。
- `lib/molecule.ts` 仍提供原有分子工厂及类型转发；`lib/utils.ts` 保留 `genId` 转发。
- 原有 19 个公开入口不增删 API。第二批新增 `/headless`，共 20 个入口；`/modeling` 继续转发原有纯函数与 runtime 方法。
- `hooks/editSessionFactory.ts` 保留旧内部调用签名，新生产代码使用 `runtime/editingSessions.ts`。
- `/core` 的场景/显示兼容出口仍保留，不将目录整理当成破坏性 API 清理。
- 本轮不改变同位素、标签、手性、复制粘贴、图查询、撤销或事务的语义。

## 自动检查

包级 `check:boundaries` 使用 TypeScript AST 读取 import、export、import type、动态 import 和 require：

1. 校验上述基础模块的允许依赖，禁止内部消费者回流到旧混合入口。
2. 检查显式运行时导入图中的循环；类型引用不当成模块初始化循环。
3. 检查 `/core`、`/io`、`/geometry`、`/graph`、`/headless` 的传递运行时依赖，涵盖转发和字面量动态导入。
4. `/core` 与 `/io` 的外部依赖仅允许 OpenChemLib；`/geometry` 与 `/graph` 不允许外部依赖；`/headless` 允许 OpenChemLib/Zod。无法静态确定的动态加载在这些入口内报错。
5. 保留 Builder、Renderer、Style 的既有方向约束，并补 Builder 的 React/Zustand/CSS 工具禁用规则。
6. 检查 `lib/modeling`、`application/editing` 及 `/headless` 契约对 store/runtime/hooks 的反向依赖，包含 type-only 导入。
7. 元素混合配置仅允许现有兼容入口引用；化学、Builder、modeling 不得读取配色、主题、样式或 render 配置。`/headless` 的传递运行时依赖不得包含这些元素外观模块。

构建的 `check-dist` 对实际 JS chunk 再检查同一入口白名单，避免共享 chunk 合并重新带入 UI 依赖。
Vite 构建钩子还检查 `/headless` 实际可达 chunk 的源码归属，阻止默认配色、外观与混合元素配置通过共享 chunk 回流。
tarball 消费测试在五个独立 Node 进程中拒绝解析 React、Three、Zustand、zundo、clsx、tailwind-merge，执行分子校验/创建、JSON 往返、距离、连通分量查询和 headless 构建/修改/过期版本拒绝。
这验证运行时加载；npm peerDependencies 的安装契约仍保持不变。

根 `check:boundaries` 还运行 app 的脚本。命令领域矩阵、领域 facade、手势与事务路由检查目前由该脚本负责，本轮保留。

## 验证状态

第一批验收基线（`f60e183`）：

- 已通过严格类型检查、8 个依赖门禁回归测试、构建和 API 报告生成；19 个 API 报告未变化。
- 全量 `npm run verify` 通过：1180 项既有 workspace 单测、8 项门禁回归、9 项独立宿主行为测试，以及类型、正式构建、API 报告、打包消费检查均通过。lint 保留原有 15 条 warning，无 error。
- `/core`、`/io`、`/geometry`、`/graph` 的独立 Node tarball 加载与行为检查均通过；消费脚本兼容调整后已单独重跑通过。
- 额外比较迁移前后的语法树：94 个既有源码文件仅改变 import/export，5 组迁移模块的声明与函数体保持一致。
- 本轮没有改变 UI 行为，不包含新的浏览器/WebGL 验收。

第二批验收与剩余范围：

- 第二批已经接入纯 `/headless`、窄会话端口、runtime 提交适配与共享快照复制。验证状态见[无界面的分子编辑 API](../mol-viewer/headless-api.md)。
- 窄 Three 门面仍待后续整理；命令 no-op/CIP 收尾见下方第三批，元素与预览边界见第四批。
- topology/geometry/properties 分块 JSON 与新 `mol-core` 包尚未引入；编辑状态继续以现有 Molecule 为唯一来源。

第三批：编辑行为一致性

- 结果包装与分子收尾分开；无变化操作、计划净变化、连续会话历史共用数据比较规则。
- 几何命令补齐手性协调，纯推断键命令保留存续 ID，移除 store 中的补偿性拓扑比较。
- 没有新增或删除公开入口；行为与验证范围见[编辑命令的一致性](../mol-viewer/edit-command-semantics.md)。

第四批：元素数据、编辑策略与预览外观

- 元素配置拆到各自所属模块；`config/elements.config.ts` 保留组合兼容接口，内部消费者直接读取所需字段的 owner。
- 生长预览查询只产生空间几何，hooks 附加样式后交给 renderer；正式原子的主题配色与预览默认色保持现有规则。
- 数值、兼容范围与验证记录见[元素与预览边界](../mol-viewer/element-boundaries.md)。
