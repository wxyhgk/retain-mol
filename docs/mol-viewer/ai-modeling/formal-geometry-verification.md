# 用数学证书约束 AI 三维建模

## 问题定义

AI 从二维图片生成三维分子时，真正困难的不是输出三个坐标，而是同时保持：

- 分子图正确；
- 母核、手性中心和刚性构象不被破坏；
- 模板连接、并环和旋转具有明确的几何语义；
- 每次局部修改都能解释、检查和回滚。

要求模型“想象完整三维空间”不可测试，也无法定位错误。RetainMol 改用“关系规划 + 数值求解
+ 形式化验证”：模型只选择锚点、模板、连接关系和允许变化的自由度，三维算法求坐标，
验证器检查结果。

## 五层表示

```mermaid
flowchart TD
    A["分子图层<br/>原子、键、键级、模板"] --> B["锚点层<br/>固定原子、固定键、局部坐标系"]
    B --> C["自由度层<br/>键长、键角、二面角、刚体变换"]
    C --> D["数值层<br/>距离几何、MMFF/UFF、xTB"]
    D --> E["证书层<br/>拓扑、距离、朝向、碰撞"]
    E -->|通过| F["提交 EditPlan"]
    E -->|拒绝| G["按失败约束局部重规划"]
    G --> B
```

这意味着模型无需记住某个片段旋转后所有原子的世界坐标。它只需说明：

- 哪些 B/N 原子必须固定；
- 新片段连接到哪个原子或哪条边；
- 哪个片段作为刚体；
- 哪些键长、角度和朝向必须满足区间；
- 哪些单键二面角允许搜索。

## 与现有 RetainMol 的分工

| 层 | 输入 | 输出 | 权威职责 |
| --- | --- | --- | --- |
| 多模态 provider | 图片、文本、当前选择 | 图提案与 `EditPlan` | 识别和规划 |
| `mol-viewer/modeling` | `EditPlan` | dry-run Molecule | 命令语义、价态和事务 |
| 几何/优化器 | 初始 Molecule、约束 | 候选坐标 | 连续数值求解 |
| Lean 验证器 | expected 快照、最终候选、可信 policy | issue 列表 | 精确离散与几何不变量 |
| xTB/Psi4 等 | 已验证结构 | 能量、力、波函数产物 | 计算化学结果 |

Lean 必须位于 builder dry-run 之后。它不允许绕过现有命令直接制造 SDF，也不把通用价态
判断复制成另一套规则。

## 意图与 Policy 分层

policy 不是“证明这个分子绝对正确”，而是 Lean 从可信 GeometryIntent 编译出的有限检查条件。
AI 不能提交或删减 policy，也不能给距离、刚性和朝向阈值。生产 loop 先冻结初始结构、
ExpectedEffect、enforced plan 和可选 `run-spec.json`，再生成 schema v3 GeometryIntent：

```json
{
  "schemaVersion": 3,
  "projectionVersion": "expected-effect-v1-to-lean-v1",
  "coordinateScale": 1000,
  "intent": {
    "before": { "atoms": [], "bonds": [] },
    "commands": [{ "commandId": "move-1", "kind": "atomMove" }],
    "expected": { "atoms": [], "bonds": [] },
    "protectedAnchorIds": ["B:core", "N:left", "N:right"],
    "orientationAtomGroups": [{
      "atomIds": ["B:core", "N:left", "N:right", "C:center"]
    }],
    "rigidAtomGroups": [{
      "atomIds": ["B:core", "N:left", "N:right", "C:center"]
    }]
  },
  "candidate": { "atoms": [], "bonds": [] }
}
```

完整命令和原子字段见严格 schema；示例省略了内容。全部成键距离区间由 Lean 根据 expected
快照生成。锚点坐标采用精确相等；连续量采用系统固定的闭区间；手性与局部朝向采用有向
体积符号。刚性组按全部原子对检查，桥接器限制列表大小，防止把验证成本无界放大。仅有
全部两两距离仍允许镜像，因此需要朝向检查表达不可翻转的局部构型。
未来键角可用点积区间，二面角可用两个平面法向量的点积与叉积符号，均无需直接求反三角函数。

## 失败反馈

验证失败后不能只返回 `invalid geometry`。执行层应产生机器可读问题：

```text
fixed-atom-moved(B:core)
distance-out-of-range(C:center, C:tail, actual², allowed²)
orientation-inverted(B:core, N:left, N:right, C:center)
missing-bond-endpoint(bond-42, atom-99)
```

规划器只修复失败的局部关系。连续三次产生相同失败时停止，交给用户或换模板，避免无限重试。

## 当前实现

第二版位于 `formal/geometry`，固定 Lean 4.33.0，并提供：

- 精确整数 `Vec3`；
- 平移保持距离和朝向的定理；
- 完整 canonical chemical graph、固定锚点、距离区间、刚性组和朝向验证；
- 受限 JSON 到 Lean 数据的桥接；
- 结构化 issue，以及删键、改电荷、平行键、空 policy、移动锚点和扭曲刚体反例。

当前 Lean 层只判定最终候选符合编码后的有限 policy，不证明图片识别正确，也不直接证明 builder
实现正确。第二轮已经增加独立 ExpectedEffect 和最终 artifact bridge，把最终产物、policy、计划、
执行回执、身份映射和 transport evidence 的 SHA-256 绑定到同一个 verification context。完整流程见
[最终产物验证 V2](./final-artifact-verification-v2.md)。

形式化层现已增加 `GeometryIntent V1`，并接入 V4 生产 gate。受信编排器表达起始快照、带稳定
ID 的基础命令、完整预期快照和系统约束原子组；Lean 编译器负责生成 policy，并证明成功编译
绑定了精确命令结果、锚点完整身份与坐标保持、中间命令不触碰锚点，以及策略自验证。
发布时会用归档证据完整重建请求，不能只相信旧 verdict。

运行时还必须分别提供可信 `lake` 启动器与实际 Lean 编译器的 SHA-256。当前自动 gate 的精确
十进制预检已经覆盖键长、固定原子、朝向和刚性组，并有小于整数坐标量化步长的攻击测试。
Lean 使用 `#eval` 对具体请求求值；这里的“形式化”来自受限数据桥、固定源码、可信编译器和
可复现判定，不等于已经证明任意三维编辑算法正确。

当前还会完备枚举候选中全部无序原子对：直接成键原子对排除，其余原子对必须至少相隔
0.5 Å。这个硬下限用来拒绝“不相邻原子占据同一点”一类不可能构型，不等价于元素相关的
范德华排斥。直接成键原子另有 0.4 Å 硬下限。为了把证明成本限制在 50,000 对内，严格桥
当前最多接受 316 个原子。

运行时同时要求原始 `Decimal` 坐标和 Lean 的 0.001 Å half-even 量化坐标通过检查。两者在
硬下限附近可能产生保守假拒绝，但只要任一层拒绝，最终结果就不会通过；这项取舍优先保证
“不错误放行”，后续再用共享精确有理数桥消除边界差异。

## 当前仍缺少的关键桥梁

V4 已把保护锚点同时约束在 `before -> expected` 和 `expected -> candidate` 两段，旧的“builder
可先移动锚点”缺口已封闭。下一步不是继续增加更多全局坐标，而是为高阶 builder command
建立关系级 expected geometry effect：

- 模板连接声明新键和可旋转自由度；
- 并环声明共享边、刚性组和不可镜像的朝向四元组；
- 刚性片段旋转声明组内距离保持、连接轴和允许变化的二面角；
- 最终候选只与这些声明比较，不与 AI 自己生成的阈值比较。
