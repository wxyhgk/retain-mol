# 无界面的分子编辑 API

`@retainmol/mol-viewer/headless` 在 Node、后端或浏览器中执行同一套确定性编辑命令，
不创建 viewer、默认 store、React context 或撤销栈。它是现有包的新子入口，不是新增 npm 包。
模型识别、计算软件和 AI provider 不属于这条入口。

## 从零构建，再修改

```ts
import {
  HEADLESS_MODELING_OBJECT_ID,
  computeMoleculeRevision,
  replayEditPlan,
  type Molecule,
} from '@retainmol/mol-viewer/headless'

const empty: Molecule = { atoms: [], bonds: [] }
const built = replayEditPlan(empty, {
  schemaVersion: 1,
  planId: 'create-carbon-oxygen',
  source: 'human',
  targetObjectId: HEADLESS_MODELING_OBJECT_ID,
  commands: [
    { commandId: 'c', kind: 'atom.add', atomId: 'c', symbol: 'C', position: { x: 0, y: 0, z: 0 } },
    { commandId: 'o', kind: 'atom.add', atomId: 'o', symbol: 'O', position: { x: 1.4, y: 0, z: 0 } },
    { commandId: 'co', kind: 'bond.add', bondId: 'co', atomId1: 'c', atomId2: 'o', order: 1 },
  ],
})
if (!built.ok) throw new Error(built.issues.map(issue => issue.message).join('\n'))

const edited = replayEditPlan(built.molecule, {
  schemaVersion: 1,
  planId: 'replace-oxygen',
  source: 'human',
  targetObjectId: HEADLESS_MODELING_OBJECT_ID,
  expectedRevision: computeMoleculeRevision(built.molecule),
  commands: [{ commandId: 'replace-o', kind: 'atom.replace', atomId: 'o', symbol: 'N' }],
})
if (!edited.ok) throw new Error(edited.issues.map(issue => issue.message).join('\n'))

// edited.molecule 是结果；empty 和 built.molecule 均保持原内容。
console.log(edited.molecule)
```

原生 JSON / MOL / SDF 等文件操作继续从 `/io` 使用。
分子输入沿用 `Molecule` 契约；来源不可信的对象先用 `/core` 的 `parseMolecule` 校验，计划 schema 校验不替代分子导入校验。
命令字段、作用域、约束与诊断沿用现有 [EditPlan 协议](./ai-modeling/README.md)，未增加另一套编辑内核。

## 入口选择

| 需求 | 入口 |
| --- | --- |
| 无界面校验计划、创建上下文、执行计划、比较结果 | `/headless`：`parseEditPlan`、`createHeadlessModelingContext`、`replayEditPlan`、`dryRunEditPlan` |
| 向已有 viewer 提交计划，形成一次撤销记录 | `/modeling`：`getModelingContext(runtime)`、`commitEditPlan(plan, runtime)` |
| 原子拖动、坐标动画、连续数值编辑的会话 | `/editing`，显式传入对应 runtime |

旧 `/modeling` 中的纯函数出口继续兼容，原有 API 签名保持不变；
该混合入口仍会加载 runtime/store，服务端只执行计划时应改用 `/headless`。

`replayEditPlan` 无状态；调用方决定何时保存返回的分子。它不提供 undo/redo，不会自动写回数据库或画布。
`expectedRevision` 校验传入分子的版本，不代替数据库并发控制。
viewer 提交继续执行 revision 二次检查、事务冲突保护与整批写入。

## 包内边界

- `lib/modeling`：普通数据契约、校验、纯执行器和上下文转换，禁止导入 store/runtime/hooks，包括类型。
- `lib/model/clone.ts`：两种上下文共用的分子快照复制，保持当前字段语义。
- `application/editing/sessions.ts`：通过少量读写与事务回调组织会话，不依赖 Zustand 或 React。
- `runtime/editingSessions.ts`：把 store 绑定到会话回调，保留默认实例兼容。
- `runtime/modelingApi.ts`：读取 viewer 状态并提交计划；公开入口只转发。
- `hooks/editSessionFactory.ts`：旧内部路径转发，生产调用方已迁移到 runtime adapter。

目前仍使用同一个 Molecule 状态、命令内核和历史系统。
第二批没有调整 no-op、ID 保留、手性收尾策略；第三批的行为修复见[编辑命令的一致性](./edit-command-semantics.md)。属性与 JSON schema 保持不变。

## 验证范围

- 新入口纳入源码及构建后 JS 依赖白名单，只允许 OpenChemLib 与 Zod 外部依赖。
- 源码检查还遍历 `/headless` 的类型依赖，阻止 store/React 类型回流。
- 独立 tarball Node 进程拒绝加载 React、Three、Zustand、zundo 与 CSS 工具，执行从零构建、修改和过期版本拒绝。
- 既有 19 个 API 报告保持不变，新增第 20 个 `/headless` API 报告。
- 全量 `npm run verify` 通过：1186 项 workspace 单测、11 项依赖门禁回归、9 项独立宿主行为测试，类型检查、应用构建、API 报告和打包消费均通过。lint 保留原有 15 条 warning，无 error。
- 五个纯入口的独立 Node 加载检查全部通过；headless 与 viewer 结果一致、单次撤销、重做、取消恢复旧 redo 分支、失败批次、事务冲突与多实例隔离均有回归覆盖。
- 本轮不包含新的浏览器/WebGL 验收。
