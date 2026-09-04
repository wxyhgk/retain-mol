# GeometryIntent：让 AI 用关系构造三维分子

## 目标

AI 不应直接猜整分子的世界坐标。更稳定的做法是让它描述离散拓扑和局部空间关系，由数值
算法产生坐标，再由形式化验证器判断结果是否遵守这些关系。

```text
AI 识别与规划
    -> EditPlan
    -> ExpectedEffect（独立语义编译）
    -> builder 实际执行
    -> 距离几何 / 力场 / xTB 候选
    -> GeometryIntent + Lean
    -> PASS / REJECT / INDETERMINATE
```

## V4 证据链

生产 gate 同时冻结五类证据：

1. `inputs/initial-molecule.json`：本轮编辑前的真实结构；
2. `expected-effect.json`：基础命令的独立预期 before、轨迹和 expected；
3. `enforced-plan.json`：实际允许执行的命令与约束；
4. `builder-snapshot.json`：生产 builder 的实际结果；
5. `final-snapshot.json`：坐标生成或优化后的最终候选。

桥接器在坐标量化前要求初始结构精确等于 ExpectedEffect before，并要求 builder 快照精确等于
ExpectedEffect expected。随后才把坐标转换为 0.001 Å 整数单位。这样，即使两个不同坐标会
舍入到同一个整数，也不能伪造前两段证据。

发布回放不会只读取 PASS 结果。它重新核对每个文件摘要，并从上述归档证据重建完整
GeometryIntent；重建结果、run spec 或 manifest 任一不一致都会阻止发布。

## 调用方可以表达什么

调用方只能提供：

- 七种 ExpectedEffect V1 基础命令及稳定 `commandId`；
- 完整 before 和 expected 图；
- 保护锚点 ID；
- 四原子朝向组；
- 刚性原子组；
- 最终 candidate 图和坐标。

调用方不能提供：

- 任意 Lean 源码；
- distance bound；
- 朝向最小体积；
- 刚性误差；
- 绕过 schema 的额外字段。

数值 policy 由 Lean 根据 expected 和固定版本配置编译。未知命令、重复命令 ID、无约束孤立
原子、超限列表、超大整数、保护锚点中途修改和 expected 不等于命令结果都会 fail-closed。

## 当前证明了什么

`compileGeometryPolicy_self_check_sound` 证明：只要意图成功编译，expected 就是基础命令序列的
精确结果；命令 ID 合法；保护锚点未被命令触碰且身份和坐标保持；生成的 policy 唯一、合法，
并可在 expected 上自验证。

`validateGeometryIntentCandidate_sound` 证明：Boolean PASS 必然对应一个成功编译的 policy，且
完整 issue 列表为空。最终候选还必须保持完整化学图、保护锚点、全部成键距离、非键碰撞、
声明朝向及刚性组。

## 当前没有证明什么

- 图片识别出的分子就是用户目标；
- production builder 的所有实现都等价于 ExpectedEffect；
- 高阶模板连接、并环和旋转命令的关系语义；
- MMFF、xTB 等浮点优化过程正确；
- 当前固定容差是所有元素和化学环境的最佳物理模型。

因此当前 PASS 的含义是“这个有限候选满足 V4 绑定的 GeometryIntent”，不是“Lean 证明了
图片中的化学分子绝对正确”。

## 下一代三维方法

多代理评审后，后续空间表示应由五类关系组成：

1. **分子图原语**：原子、键、共享原子和共享边；
2. **局部端口坐标系**：连接点的位置、出键方向和绕轴参考方向；
3. **刚性区域**：母核、螺芴、稠环等只允许整体刚体运动的原子集合；
4. **可旋转关节**：明确旋转轴、移动侧和允许的二面角范围；
5. **关系命令**：`freeze`、`rigid`、`mate`、`rotateJoint`、`satisfy`。

世界坐标只作为求解器产生的 witness，不作为 AI 的主要输出。模板连接应表达“两个 port 对接”；
并环应表达“共享边 + 局部 frame 对齐”；单键构象应表达“绕 joint 搜索”。这样 AI 需要推理的
是有限关系，而不是一次性想象所有原子的三维位置。

实施顺序：

1. V4 基础命令信任桥（当前已完成）；
2. 局部端口 frame 和刚性区域数据结构；
3. `rotateJoint` 的 frame condition 与二面角 postcondition；
4. 原子、边两种 `mate` 语义；
5. 数值求解 witness 与 Lean 关系证书闭环。
