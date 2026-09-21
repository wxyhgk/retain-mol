# 受约束的闭环几何编辑

入口 `/?demo=constraints`。这是复杂扭曲骨架基础能力的第一批：显式区域、可序列化约束、局部协同变形、独立诊断和一次撤销。演示使用程序生成的六碳闭环重原子骨架，不是经过化学验证的构象，也不是论文中莫比乌斯碳带的重建。

## 数据与公共 API

连接关系沿用现有 `Molecule` 和稳定原子 ID；`ConstrainedGeometryRequest` 独立表达几何要求；结果中的 `molecule` 和 `report` 分别表示坐标与诊断。没有新增 npm 包。

`@retainmol/mol-viewer/geometry` 和 `/headless` 都提供：

- `validateGeometryConstraints(molecule, constraints)`：纯只读校验；返回每条约束的实际值、单位、超出容差的误差、涉及原子和诊断。
- `solveConstrainedGeometry(molecule, request)`：有迭代上限的确定性局部求解；只改变 `movableAtomIds` 中的坐标，其余原子精确固定。
- `analyzeHelicalPath(molecule, atomIds, minTwistDegrees)`：分析明确指定的有序、成键开放路径，返回 `right / left / mixed / indeterminate / invalid`。

`/geometry` 无外部运行时依赖，可在浏览器或后端使用。`/headless` 额外提供 JSON schema 和 `previewConstrainedGeometry(context, { targetObjectId, request })`。已有 EditPlan 新增 `geometry.solveConstraints` 命令，预览与提交使用同一求解过程；浏览器宿主通过现有 `commitEditPlan` 提交，不直接修改 store。

```ts
import {
  createHeadlessModelingContext,
  previewConstrainedGeometry,
} from '@retainmol/mol-viewer/headless'

const context = createHeadlessModelingContext(molecule)
const target = context.objects[0]!
const preview = previewConstrainedGeometry(context, {
  targetObjectId: target.objectId,
  request: {
    movableAtomIds: regionAtomIds,
    constraints: [{
      id: 'lift-region', kind: 'position', strength: 'hard',
      atomId: selectedAtomId,
      target: { x: 1.2, y: 0.3, z: 0.5 }, tolerance: 0.03,
    }],
    maxIterations: 200,
  },
})
// preview.ok === true 后才能提供应用操作。
// 浏览器宿主提交 preview.plan；expectedRevision 防止应用过期预览。
```

## 约束语义

支持 `distance`、`minimum-distance`、`angle`、`dihedral`、`position`、`helicity`。距离单位 Å，角度单位度，坐标为分子局部坐标。

- `hard` 必须满足容差才能验收；`soft` 是偏好，用权重累计超出容差的平方误差。软约束不能授权硬约束失败。
- 二面角按周期比较，`179°` 与 `-179°` 相差 `2°`。
- 退化或无法测量的几何返回 `null` 和诊断；即使是软约束，也不能静默当作满足。
- 求解自动保留全部原始键长（默认容差 0.03 Å）和邻接键角（默认 10°），包括闭环的每条边。保留的是输入测量值，不是理想化学参数；不合理的初态不会因此被证明正确。
- 默认对图距离超过两键的原子对施加 0.8 Å 的几何最小距离，含不连通片段；`nonbondedMinimumDistance: 0` 显式关闭。这是防严重重叠的粗略下界，不是元素相关的范德华模型，也不等同于旧 `ch-contact-v1` 评分。
- 原子 ID、键 ID、连接、键级及其他属性保持不变。已有 R/S 和 E/Z 几何方向会在纯求解结果验收时检查；模型命令还复核指定 R/S 与感知结果。
- `maxIterations` 默认 200，范围 0–2000；0 只允许不迭代的校验。输入坐标和约束本身不会被修改。

路径方向是一项明确约定的局部几何判据：对连续四原子窗口测有符号偏离共面的角度，折叠到 `[-90°, 90°]`；正值对应按小于半圈步长采样的右手解析螺旋。反转整条路径不改变方向，镜像翻转方向，刚体运动不改变结果。`helicity` 测量值是朝要求方向计数的最弱窗口扭转量。

**路径方向不自动分配化学 P/M，也不证明整个闭合环带具有指定莫比乌斯拓扑。** 平面路径、共线窗口、混合方向和不足阈值分别有明确反馈。

## 失败、预览与历史

失败返回 `ok: false`，`molecule` 保留原输入，没有可提交的半成品。`report` 对应返回分子；可选 `attemptReport` 仅描述被拒绝的最后迭代，不能作为原结构的测量值。

`previewConstrainedGeometry` 验证目标、能力和 revision，返回独立候选及其 EditPlan。应用时重新求解并检查预览 revision；一次成功提交产生一次撤销。锁定冲突、过期计划、手性变化或未收敛的批次不会留下部分修改。

现有 ExpectedEffect 独立语义编译器尚未覆盖 `geometry.solveConstraints`，会明确返回 `unsupported-effect-semantics`；普通 dry-run/提交的成功不能冒充这一层的证明。

## 范围与后续

当前实现是稀疏数值求解的局部几何编辑，不是从任意 SMILES 生成三维构象的引擎。求解失败只表示这次有界局部搜索没有找到满足条件的结果，不证明不存在解。

第二批增加了显式 `motion` 选项，可检查原结构到候选之间的整段线性路径；还增加了环带区域与程序初态 guide，见[连续路径与环带 API](./geometry-paths.md)。未指定 `motion` 的请求仍只进行终点检查。

尚未实现多初态构象搜索、整体莫比乌斯带拓扑校验、自动绕行、任意曲线路径防穿透、力场或量子化学计算。同步纯函数适合当前小区域演示；较大结构的交互式求解仍需要宿主放入 Worker 或后端任务，不应在主线程无限增加迭代。

没有搜索或下载具体分子的现成坐标。

## 验证

2026-09-22：根 `npm run verify` 通过，包含边界、类型、1377 项 Vitest 测试、应用构建、20 个入口的 API 报告、打包与独立消费端检查。新增 115 项测试覆盖独立约束测量、周期角度、路径镜像/刚体不变性、闭环协同变形、固定原子、已有 R/S 与 E/Z 的几何保持、拒绝非法/不可满足输入、确定性重放、预览无副作用、提交/撤销/重做与过期拒绝。

Edge 实操：默认 0.5 Å 目标预览移动 3 个原子，6 次迭代，16 条约束通过；当前结构在预览阶段仍为 z = 0。应用后 C4 为 z = 0.477 Å（在 0.03 Å 容差内），一次撤销恢复 z = 0，重做恢复变形。全部固定时拒绝并禁用应用；改变目标高度会废弃旧预览。两侧 WebGL 视图、约束定位控件已实操。

另以程序生成的 100 原子、100 条单键闭环作规模检查：固定一个原子、抬升对面的原子，5 次迭代、7 个原子移动，4951 条约束全部满足；输入与固定原子保持不变。本机一次运行约 58 ms，仅为这一几何样例的观测，不是复杂化合物构象成功率或通用性能保证。
