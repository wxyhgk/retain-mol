# RetainMol AI 建模框架

这套框架的目标不是让 AI 模拟鼠标，而是让 AI 提交一份可检查、可预览、可撤销的结构编辑计划。图片理解模型、对话模型和多人协作客户端都使用同一个协议，化学合法性仍由 `mol-viewer` 的 builder command 判断。

## 总体流程

```text
分子图片 / 文本指令 / 当前选区 / 指定位点
                    |
                    v
        App 或后端的多模态 provider
                    |
                    v
              EditPlan JSON
                    |
          schema 校验 + scope 校验
                    |
                    v
      在分子副本上执行 dry-run
                    |
         结构差异 + 警告 + 预览
                    |
          用户或策略层确认提交
                    |
                    v
        单个 undo transaction
                    |
          可选 MMFF94/UFF/xTB 优化
```

核心原则：

1. AI 只提出计划，不直接写 store，也不触发 pointer event。
2. 所有编辑仍走现有 builder command，禁止复制第二套化学规则。
3. 整份计划先 dry-run；任一命令失败时，真实分子保持不变。
4. 提交前再次校验 revision，防止 AI 基于旧结构覆盖用户的新编辑。
5. 一份计划只产生一个 undo 步骤。

## 公共入口

只从以下子路径接入：

```ts
import {
  commitEditPlan,
  createHeadlessModelingContext,
  dryRunEditPlan,
  getModelingContext,
  parseEditPlan,
  replayEditPlan,
  type EditPlan,
} from '@retainmol/mol-viewer/modeling'
```

不要从 App 深路径导入 `lib/modeling`、`lib/builder` 或 store slice。

无界面任务与浏览器共享同一执行器：

```ts
import { replayEditPlan } from '@retainmol/mol-viewer/modeling'
import { exportSdf } from '@retainmol/mol-viewer/io'

const result = replayEditPlan(initialMolecule, plan, {
  objectId: plan.targetObjectId,
})
if (!result.ok) throw new Error(result.issues.map(issue => issue.message).join('；'))
const sdf = exportSdf(result.molecule)
```

`createHeadlessModelingContext` 和 `replayEditPlan` 不创建 Zustand store、Three.js renderer
或 DOM。它们用于 AI loop、批处理与后端 worker，但执行的仍是生产 builder command。

## 三种建模范围

### 整分子

适合“根据图片重建完整分子”或“把当前结构改成目标结构”。

```ts
scope: { kind: 'molecule' }
```

### 当前选区

适合“只修改选中的苯环”或“在这个片段上加取代基”。计划只能访问声明的已选原子和键；计划中新建的原子、键可以被后续命令继续引用。

```ts
scope: {
  kind: 'selection',
  atomIds: ['atom-12', 'atom-13'],
  bondIds: ['bond-8'],
}
```

### 指定锚点

锚点描述用户意图落在哪里，当前支持原子、键和三维空间：

```ts
anchor: { kind: 'atom', atomId: 'atom-12' }
anchor: { kind: 'bond', bondId: 'bond-8' }
anchor: {
  kind: 'space',
  position: { x: 1.2, y: 0.4, z: -0.8 },
  normal: { x: 0, y: 0, z: 1 },
}
```

`anchor` 是定位和审计信息，真正的结构变化仍由 `commands` 明确表达。这样可以避免“点中了某处，但模型改了另一处”的隐式行为。

## 最小示例

下面的计划在当前活跃对象中增加一个 N，并与已有 C 建立单键：

```ts
const context = getModelingContext()
const target = context.objects.find(
  object => object.objectId === context.activeObjectId,
)

if (!target) throw new Error('没有活跃分子')

const plan: EditPlan = {
  schemaVersion: 1,
  planId: crypto.randomUUID(),
  source: 'ai',
  description: '在选中碳原子上连接一个氮原子',
  targetObjectId: target.objectId,
  expectedRevision: target.revision,
  scope: {
    kind: 'selection',
    atomIds: ['carbon-1'],
    bondIds: [],
  },
  anchor: { kind: 'atom', atomId: 'carbon-1' },
  commands: [
    {
      commandId: 'add-nitrogen',
      kind: 'atom.add',
      atomId: 'ai-nitrogen-1',
      symbol: 'N',
      position: { x: 1.45, y: 0, z: 0 },
    },
    {
      commandId: 'attach-nitrogen',
      kind: 'bond.add',
      bondId: 'ai-bond-1',
      atomId1: 'carbon-1',
      atomId2: 'ai-nitrogen-1',
      order: 1,
    },
  ],
}

const preview = dryRunEditPlan(context, plan)
if (!preview.ok) {
  console.error(preview.issues)
} else {
  // App 先用 preview.molecule 和 preview.changes 展示静态确认预览。
  const committed = commitEditPlan(plan)
  console.log(committed)
}
```

## v1 已支持的命令

- 原子：添加、替换、删除、移动、设置形式电荷、设置自由基、增加一个 H。
- 键：添加、删除、设置单/双/三键。
- 模板：在原子上连接模板、用两个锚点桥接刚性模板、把环模板并到目标键。
- 几何：设置键长、键角、二面角，以及绕指定轴刚性旋转一组原子。
- 安全：严格 JSON schema、稳定调用方 ID、选区限制、锁定对象检查、revision 并发保护、原子化失败、单步 undo。

高阶命令示例：

```ts
commands: [
  {
    commandId: 'attach-phenyl',
    kind: 'fragment.attach',
    atomId: 'host-c',
    fragmentId: 'benzene',
    torsionAngleDegrees: 35,
  },
  {
    commandId: 'bridge-fluorene',
    kind: 'fragment.bridge',
    atomId1: 'left-leaving-h',
    atomId2: 'right-leaving-h',
    fragmentId: 'fluorene-9h-site-a',
  },
  {
    commandId: 'fuse-benzene',
    kind: 'fragment.fuse',
    bondId: 'host-edge',
    fragmentId: 'benzene',
  },
  {
    commandId: 'rotate-rigid-spiro',
    kind: 'geometry.rotateGroup',
    atomIds: ['spiro-1', 'spiro-2', 'spiro-3'],
    axisAtomId1: 'axis-a',
    axisAtomId2: 'axis-b',
    angleDegrees: 42,
  },
]
```

模板必须先进入 fragment registry。普通多位点模板应把每个位点注册为独立、稳定的模板
ID；同一中心的双锚点模板还必须声明 `bridgeAttachment`，不能按原子数组顺序猜第二位点。
模板命令产生的新
原子和键会按 `commandId:atom:N` / `commandId:bond:N` 确定性命名，后续命令可引用。

## 暂不包含

下面这些能力故意不放进第一版，以免把协议、识别和 UI 再次耦合：

- 图片到分子图的识别 provider。
- 从屏幕像素到三维原子/键/空间坐标的 grounding adapter。
- 歧义候选、置信度和多方案比较 UI。
- 自动调用 MMFF94/UFF 或 GFN2-xTB 的任务编排。

## 多人协作分工

| 区域 | 负责内容 | 不应修改 |
| --- | --- | --- |
| `lib/modeling` | 协议、schema、纯执行器、差异计算 | React、Three.js、provider SDK |
| `public/modeling.ts` | runtime 快照和事务提交 | 化学算法、模型提示词 |
| `lib/builder/commands` | 化学编辑语义与合法性 | AI provider、App 面板 |
| App AI feature | 图片上传、模型调用、候选预览、用户确认 | store slice、内部 builder 文件 |
| 后端 | 模型代理、审计记录、计算任务 | 浏览器 viewer 状态 |

新增命令时必须同时更新：协议类型、Zod schema、执行器映射、聚焦测试和本文命令清单。

## 推荐的下一步

1. 在 App 做一个开发者面板，用固定 `EditPlan` 构建苯环，验证完整预览和确认流程。
2. 扩充刚性模板库。首个 `9H-芴` 已提供稳定的 A/B 两个 C9-H 位点；后续模板沿用同一
   规则，不向 planner 泄漏隐藏参考坐标。
3. 定义图片识别中间结果 `MolecularGraphProposal`，保留候选键级、置信度和歧义，不直接等同于 `EditPlan`。
4. 增加屏幕选区到 atom/bond/space anchor 的 grounding adapter。
5. 最后接入具体多模态模型；provider 只负责把输入转成协议，不进入核心包。
