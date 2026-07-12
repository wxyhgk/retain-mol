# Builder 导航：我想改某个编辑行为，应该看哪里？

`packages/mol-viewer/src/lib/builder` 是分子编辑内核。先不要按文件名硬记，按职责理解更稳：

```text
builder/
├── kernel/      公共底座：统一查图、价态、片段契约、结果类型
├── geometry/    几何计算：新原子长在哪、距离角度怎么算
├── analysis/    化学分析：芳香性、共轭、杂化、连通片段
├── editing/     真正修改 Molecule 的纯函数
├── commands/    按 atom/bond/fragment/scene 等领域聚合的用户意图层
├── graph.ts     旧的轻量图查询 helper
├── valence.ts   旧的价态 helper，逐步被 kernel/ValencePolicy 聚合
└── fragmentLibrary.ts  内置片段和环系模板数据
```

## 一句话原则

- `kernel` 回答“公共规则是什么”。
- `geometry` 回答“空间上怎么算”。
- `analysis` 回答“化学上怎么判断”。
- `editing` 回答“分子对象怎么变”。
- `commands` 应该回答“用户这个动作代表什么意图”。

## 常见问题入口

### 点 H 长出新原子 / 点 H 接基团

看这些文件：

```text
editing/atomOps.ts
editing/fragment/attach.ts
editing/fragment/valenceFit.ts
kernel/ValencePolicy.ts
```

逻辑大概是：

1. `useBuilder.ts` 暴露 handler，`builder*Handlers.ts` 判断当前是构建态。
2. 普通元素生长走 `growByReplacingH`。
3. 片段笔刷走 `attachFragmentToAtom`。
4. 需要删 H 腾价态时走 `removeHydrogensUntilValenceFits`。

### 替换原子

看：

```text
editing/atomOps.ts
```

当前语义是“纯替换”：只改元素符号，不自动增删 H，不按价态拒绝。这是计算化学建模更自然的手动编辑语义。异常价态应该交给检查器提示，而不是替换时偷偷修。

### 普通成键 / H 让位成键

看：

```text
editing/bondOps.ts
kernel/GraphIndex.ts
kernel/ValencePolicy.ts
```

其中：

- `canBond` 判断两个重原子能不能直接成键。
- `bondByReplacingH` 处理“拖 H 到原子 / H 到 H”的让位成键。
- `ValencePolicy` 统一处理重复键、自环、最大价态。

### 调整单双三键 / 键长

看：

```text
editing/bondOps.ts
```

核心函数是 `cycleBondLength`。非环键会平移一侧片段到标准键长；环内键只切换键级，不改几何。

### 放置苯环、环己烷、模板分子

看：

```text
fragmentLibrary.ts
editing/fragment/placement.ts
editing/fragment/instantiate.ts
kernel/FragmentValidator.ts
```

`fragmentLibrary.ts` 负责定义模板，`placement.ts` 负责把模板放到画布上，`instantiate.ts` 负责把模板原子/键变成真实 molecule 原子/键。

后续新增模板前，应该先保证能通过 `FragmentValidator`：

- `attachIndex` 必须是重原子。
- `attachHIndex` 必须是 H。
- `attachIndex` 和 `attachHIndex` 之间必须有键。
- `attachBond` 两端必须是重原子，而且模板里必须有这条键。

### 点键并环

看：

```text
editing/fragment/ringFuse.ts
editing/fragment/ringFuseTopology.ts
```

分工：

- `ringFuse.ts`：并环主流程，建立模板坐标系和目标键坐标系，选择放环方向。
- `ringFuseTopology.ts`：判断重原子合并、碰撞、删 H、重映射模板键、Kekulé 键级重排。

这块仍然是 builder 里算法最重的部分。后续如果要改并环，不建议直接在一个函数里堆逻辑，应继续拆小 helper。

### 新原子应该长在哪里

看：

```text
geometry/vsepr.ts
analysis/hybridization.ts
```

`vsepr.ts` 负责候选方向和吸附位置；`hybridization.ts` 负责从当前键环境推断 sp/sp2/sp3。后续这个文件也应该拆成：

- `bondLength`
- `neighborGeometry`
- `growPlacement`
- `growGuide`

### 芳香性、共轭、杂化

看：

```text
analysis/aromaticity.ts
analysis/conjugation.ts
analysis/hybridization.ts
```

注意：芳香键在价态里按 `1.5` 算，见 `valence.ts` / `ValencePolicy.ts`。如果导入结构带 `aromatic: true`，补 H 和成键容量都会受影响。

### 设置键长、键角、二面角

看：

```text
editing/geometryOps.ts
geometry/measure.ts
```

`geometryOps.ts` 负责真的移动原子；`measure.ts` 只负责计算距离、角度、二面角。

## 当前用户动作流

现在用户交互入口还在：

```text
hooks/useBuilder.ts
hooks/builderAtomHandlers.ts
hooks/builderBondHandlers.ts
hooks/builderBackgroundHandlers.ts
hooks/builderPreviewHandlers.ts
```

典型流程：

```text
用户点击/拖拽
  -> useBuilder.ts 暴露 handler
    -> builder*Handlers.ts 判断工具、笔刷、选区、Shift/Alt
      -> commands/* 解释用户意图
        -> editing/* 修改 molecule
          -> store action 提交结果
```

当前 `useBuilder.ts` 已经变成外壳，pointer adapter 也已经拆为 atom/bond/background/preview；放置已经通过 `PlacementCommandSession` 提交。renderer 内的 atom/bond 手势使用显式状态迁移：

```text
用户点击/拖拽
  -> useBuilder.ts 只暴露 handler
    -> atom/bond/background/preview adapter 只组装上下文
      -> InteractionHandler 做 raycast 与坐标转换
        -> interactionGestureState 在 idle / atom-press / atom-drag / bond-press / bond-drag 间迁移
          -> commands/* 解释用户意图
            -> editing/* 修改 molecule
```

## 改代码时的建议顺序

1. 先找对应的 `editing/*` 或 `editing/fragment/*` 文件。
2. 如果发现自己在重复 `atoms.find`、`bonds.filter`，优先考虑 `kernel/GraphIndex`。
3. 如果发现自己在判断最大价态、重复键、自环，优先考虑 `kernel/ValencePolicy`。
4. 如果新增片段或模板，必须给 `FragmentValidator` 加测试。
5. 改 builder 行为后，至少跑：

```bash
npx vitest run src/lib/builder --config vite.config.ts
npm run build --workspace @retainmol/mol-viewer
npm run check:boundaries --workspace retainmol
```
