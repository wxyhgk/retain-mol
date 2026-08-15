# RetainMol 三维几何形式化验证

这个目录使用 Lean 4 验证 AI 建模候选中的离散拓扑和关键三维不变量。它不是坐标生成器，
也不替代距离几何、MMFF/UFF、GFN2-xTB 或 `mol-viewer` 的 builder command。

## 为什么使用 Lean

多模态模型不需要在脑中一次性“看见”完整三维分子。更可靠的方法是把问题拆成可独立核验的
局部关系：

1. builder 批准的完整化学图与最终候选是否一致；
2. 指定母核或用户选中的锚点是否保持不动；
3. 连接键长、碰撞间距是否落在声明区间；
4. 四点有向体积的符号是否保持，从而避免手性或局部朝向被意外翻转；
5. 刚性片段变换是否保持内部距离。

AI 负责提出候选，数值算法负责生成或优化坐标，Lean 负责回答“这个候选是否满足我们明确
声明的约束”。因此，失败会变成具体的约束错误，而不是“看起来不像”的模糊判断。

## 当前可信边界

```text
图片/文本/选区
      |
      v
EditPlan -> schema -> builder dry-run -> 候选 Molecule
                                      |
                                      v
       ExpectedEffect 冻结 before / commands / expected
                                      |
                                      v
             生产 gate 生成严格 GeometryIntent schema v3
                                      |
                                      v
                  Lean 编译 policy + 内核求值
                                      |
                           通过 / 拒绝并重新规划
```

当前生产 schema v3 只接受固定 `coordinateScale = 1000`，即 1 个整数单位代表 0.001 Å。
请求中的 scale、policy、距离阈值和 Lean 源码都不能由 AI 提交。Python 只做严格结构投影和
证据绑定：原始冻结分子必须精确等于 `ExpectedEffect.baseSnapshot`，builder 快照必须精确等于
`ExpectedEffect.finalSnapshot`；比较发生在坐标量化之前，0.001 Å 以下的伪造也不能被舍入隐藏。

生产 gate 将七种 ExpectedEffect V1 基础命令连同稳定 `commandId` 投影成 GeometryIntent。
Lean 再从完整 expected 图编译全部成键距离约束、0.4 Å 成键硬下限、0.5 Å 非键碰撞下限、
朝向裕量和固定刚性容差。调用方只能声明保护锚点及原子组，不能声明数值阈值。严格 JSON
桥还限制命令数量、原子数量、坐标整数范围、电荷和自由基范围，避免把无界成本传给 Lean。

Lean 对受限有限请求执行 `#eval`，生产层记录完整请求 SHA-256。V4 发布回放会从归档的初始
分子、ExpectedEffect、enforced plan、builder 快照、最终快照和可选 run spec 重新生成同一个
GeometryIntent；任一摘要或重建结果不一致都不能发布。这是一种可复现的有限策略判定，不应
描述成对任意分子、任意刚体变换或数值优化器的通用数学证明。

已经形式化的内容：

- 原子 ID、键 ID 唯一，且不允许空 ID、空元素、自环和平行无向键；
- expected 与 candidate 的稳定 ID、元素、形式电荷、自由基、芳香状态、键端点和键级一致；
- 固定原子的完整身份字段和坐标完全不变；`GeometryIntent V1` 还禁止任何 atom 命令在中间步骤
  修改保护锚点，不能用“先移动、再移回”绕过；
- 指定原子对的距离位于闭区间；
- 指定四原子的有向体积达到最小裕量且符号保持；
- 刚性组全部原子对的平方距离漂移不超过可信策略给出的量化容差；
- 刚性组只保持内部度量，本身不能区分镜像；需要同时声明四点有向体积才能拒绝镜像翻转；
- 对候选中的全部非直接成键原子对检查 0.5 Å 硬下限，拒绝局部键长都正确但远端原子重叠的
  构型；该下限只排除不可能重叠，不是范德华模型；
- 所有直接成键原子对另有 0.4 Å 硬下限，旧 policy 也不能用零距离 bound 放行重合键；
- 返回结构化 `ValidationIssue`，空策略在要求几何约束时直接拒绝；
- 证明整体平移保持平方距离和有向体积。
- 七种 ExpectedEffect V1 基础命令的精确图效果，以及完整回执轨迹的 Prop 级 soundness；发布边界
  使用非空轨迹判定，内部允许的空 no-op 不能伪装成执行证据；
- 移动原子不改变键表、增加键不改变原子表的 frame condition。
- `GeometryIntent V1` 只接收起始快照、基础命令、完整预期快照和保护锚点；policy 由 Lean
  侧编译，成功时证明命令结果精确、锚点保持、生成策略合法且可自验证。
- 实验性的 `SpatialRelation V1` 定义局部端口坐标系、跨快照的有向线段对齐、带有向体积见证的
  proper rigid region，以及删除轴键后由精确连通分量确定移动侧的 rotatable joint；方向和角度
  通过点积、叉积和有理闭区间转换为整数多项式不等式，不依赖 Lean 内的浮点三角函数。
- `SpatialRelation V1` 的严格 JSON 桥固定坐标尺度与所有裕量，当前只接受系统生成的离散角集合
  `0/30/45/60/90/120/135/150/180` 度及其符号；调用方不能注入阈值。
- `GraphRewrite` 显式声明删除和增加的原子/键，要求离去原子的全部关联键都被声明删除，并禁止
  新 ID 与参考图中的任何 ID 冲突；候选图必须与改写后的完整预期图逐字段一致。
- 第一版 `AtomPortMate` 在 `GraphRewrite` 之上验证一个原子位点连接：宿主保留原子完全不动，
  客体内部图与稳定 ID 映射精确一致，客体保持 proper rigid（包括拒绝镜像），连接键端点、键级、
  距离和相对被替换 H 的出键方向满足系统证书，并重新检查完整候选的成键硬下限与非键碰撞。
  可信 policy 还绑定具体 command ID、被替换的终端 H/键和重原子连接端点，防止同一宿主上的
  目标混淆。
- `RelationTrace` 将受信 plan 身份、精确命令回执列表、逐步完整 before/after 快照和封闭的
  `rotateGroup`/`AtomPortMate` witness 绑定在一起。Lean 递归证明每一步快照连续且 witness
  成立，并拒绝空轨迹、摘要回显、断链快照和 command ID 重绑定。

未形式化的内容：

- 元素价态和构键规则，仍由生产 builder command 负责；
- 图片所表达的目标分子是否被 AI 正确识别；
- builder 是否正确实现了 `EditPlan` 语义；
- runtime receipt 到 Lean 命令轨迹的字段投影等价；
- runtime canonical JSON 的 SHA-256 与 Lean `MoleculeSnapshot` 的序列化等价；当前摘要由受信
  projector 重新计算，Lean 证明摘要身份和完整快照连续性，但不在内核中重新实现 SHA-256；
- 连续浮点优化过程；
- 量子化学能量、力和收敛性；
- 同位素、完整立体标记和金属配位位点语义；
- 通用键角、任意十进制二面角、平面性和已接入生产命令的完整 attachment local frame；
- atom-port 的完整扭转角/端口径向对齐；当前第一版证明客体 proper rigid、宿主固定、连接距离和
  离去键方向对齐，仍不能声称已证明用户期望的唯一绕键构象；
- 元素相关的范德华半径和周期边界条件。

因此当前结论只能表述为“最终候选满足该版本化 GeometryPolicy”，不能表述为“Lean 已证明
图片中的分子绝对正确”。最终候选经过 xTB 等任何坐标修改后必须重新验证，旧 verdict 失效。

`SpatialRelation V1` 同样不能表述为“Lean 证明了连续实数空间中恰好旋转任意角度”。它证明的
是量化分子快照满足系统生成的有限关系证书。退化坐标、无法观察角度、当前离散角集合之外的
请求以及证据落在数值灰区时，运行时必须返回 `indeterminate`，不能降级为通过。

## 空间关系执行架构

```text
AI / 人类意图
      |
      v
高层命令（连接、并环、旋转）
      |
      v
关系编译器 ---- 从完整化学图推导端口、固定侧与移动侧
      |
      +---- 结构非法：reject
      +---- 证据不足：indeterminate
      v
数值算法生成坐标候选
      |
      v
TypeScript 运行时验证器 ---- 浮点快检、系统容差、独立 Rodrigues 复算
      |
      v
严格关系 JSON ---- 固定 scale / 固定 policy / 禁止原始 Lean 注入
      |
      v
Lean 内核 ---- 有限图、刚体、方向和角度区间判定
```

第一条生产前纵向切片是内部 `geometry.rotateGroup` 关系验证器。它要求旋转轴为真实的非芳香
单键，删除该键后必须断开图，调用命令中的原子集合必须恰好等于其中一个完整分量。固定侧、
两个轴端点、全部移动侧原子对距离、同一有符号角度和完整非坐标字段都必须保持相应关系。
这套验证器目前没有接入 `ExpectedEffect V1` 或执行器，因此不会改变现有用户交互。

模板连接已有一条固定 registry 驱动的 `AtomPortMate` JSON -> Lean 投影切片，但尚未成为发布
gate。当前只注册 c-sp3 客体连接碳与 C 宿主替换 H 的单键场景，并验证新键沿被替换 H 的方向
接入。边并环仍未激活，因为它需要
显式端点映射、原子合并和允许的键级改写，不能复用保持完整图不变的旋转关系，也不能直接
信任 AI 给出的世界坐标。三类结果的含义固定为：

- `pass`：当前证据在该版本策略内充分；
- `reject`：已发现明确的拓扑或几何违反；
- `indeterminate`：证据、数值稳定性或当前关系语言能力不足，必须重规划或升级证书。

内部 TypeScript 编译器、Lean 关系求值器和生成文档均执行三态规则。Lean 对完整图或关系
契约的明确矛盾返回 `reject`，参考几何低于系统数值裕量时返回 `indeterminate`。该桥仍是
实验性证明切片：空关系列表在 Lean 核心内直接 `reject`，聚合 `pass` 已证明关系非空且每条
关系语义成立；精确角度集合仍是有限的，更细的 pass/possible 双层数值带尚未实现。

`AtomPortMatePolicy` 由仓库内固定注册表按 `policyId` 解析。外部请求只允许提交 schema/
projection/scale、`policyId`、`evidenceId` 和对应 SHA-256，不能提交 policy body、reference、
candidate、rewrite 或任何阈值。投影器同时校验请求摘要、代码固定摘要与 registry 文件实际
摘要；任一不一致都在生成 Lean 前拒绝。固定 evidence registry 只用于这条可回放切片，未来
动态生产证据必须进入同等可信、不可由请求内联覆盖的内容寻址存储。AtomPortMate 的 Lean
evaluation value 和输出 envelope 会保留命令 ID、投影版本及上述 registry 身份与摘要，避免
匿名 PASS 跨证据串线。实验性的 `RelationTrace` 已给出正式 gate 所需的封闭 witness、精确
receipt 顺序和完整快照链语义。当前已有一条只接受非空、纯 `geometry.rotateGroup` 计划的
运行时 projector：它从冻结的 initial、enforced plan 和 execution receipt 独立重放，不接受
调用方内联 witness，并把每一步完整 canonical before/after、重新计算的摘要和固定 V1 几何
策略投影给严格 JSON -> Lean 转换器。转换器再次核对运行时快照摘要、整数坐标投影、回执
顺序、完整快照链及固定阈值，生成 `RelationTraceSemantics` 证明。转换器内部按信任边界拆成
四层：`relation_trace_io.py` 负责受限文件读取与原子写入，
`relation_trace_runtime.py` 负责 canonical runtime 快照、摘要与整数坐标投影，
`relation_trace_contract.py` 负责 receipt/witness/trace 连续性，入口
`relation_trace_json_to_lean.py` 只负责编排验证并生成 Lean 文本。

该切片仍未接入最终 publication gate，也不会把 executor 当前的 `indeterminate` 自动升级成
生产 `pass`；`fragment.attach` 仍不在这条 projector 能力内。开发验证命令：

```bash
node tools/ai_modeling_loop/relation_trace_projector.mjs \
  --initial initial.json \
  --enforced-plan enforced-plan.json \
  --execution-receipt execution.json \
  --output relation-trace.json

python3 formal/geometry/tools/relation_trace_json_to_lean.py \
  relation-trace.json GeneratedRelationTrace.lean

cd formal/geometry
lake env lean GeneratedRelationTrace.lean
```

## 运行

先按 Lean 官方方式安装 `elan`。项目通过 `lean-toolchain` 固定 Lean 版本。`verify.sh` 会在
非交互 shell 找不到 `lake` 时自动加载 `~/.elan/env`，不会依赖当前终端是否已经执行过
`source`。

```bash
npm run verify:formal-geometry
```

该命令会：

1. 编译 `RetainMolGeometry`；
2. 检查内置的通过与拒绝示例；
3. 对重复字段、未知字段、非法 scale 和数值边界运行 fail-closed 测试；
4. 把 `examples/anchored-core.json` 安全转换成 Lean 数据；
5. 从固定 registry 投影 c-sp3/C 单键 AtomPortMate，并由 Lean 内核检查正确候选以及“距离正确、
   客体刚性正确、但连接方向横置”的 reject 候选；结果同时回传经过 Lean value 绑定的 registry
   身份与摘要。

JSON 转换器不接收任何原始 Lean 源码，只序列化 before、identified commands、expected、
系统拥有的原子组和 candidate。
它拒绝重复键、未知字段、缺失字段和超限数据，避免拼错字段后静默少做检查。当前全原子对
碰撞枚举把单次请求限制为 316 个原子，使无序原子对保持在 50,000 的证明预算内；更大分子
必须先采用可证明完备的空间分桶，而不是静默跳过原子对。

AtomPortMate 请求是更窄的 capability schema，不接受上述分子正文。内置示例只引用固定
policy/evidence registry 条目及摘要；registry 自身同样使用重复键检测、精确字段白名单、固定
版本和整数 `positionUnits`。错误版本、未知字段、非整数坐标或摘要不匹配均 fail closed。

## 目录

```text
formal/geometry/
├── lean-toolchain
├── lakefile.toml
├── RetainMolGeometry/
│   ├── Vec3.lean          # 精确三维向量与刚体不变量证明
│   ├── Molecule.lean      # 分子快照与通用图不变量
│   ├── Command.lean       # 基础命令、精确回执轨迹与 soundness 定理
│   ├── Certificate.lean   # policy、结构化问题与几何判定
│   ├── Intent.lean        # GeometryIntent V1 policy 编译器与 soundness
│   ├── SpatialRelation.lean # 端口、proper rigid region 与可旋转关节
│   ├── GraphRewrite.lean  # 显式原子/键增删及完整预期图
│   ├── AtomPortMate.lean  # 图改写后的原子端口连接关系
│   ├── RelationTrace.lean # 高阶关系回执、完整快照链与 soundness
│   ├── RelationEvaluation.lean # pass/reject/indeterminate 关系求值
│   └── Examples.lean      # 正例与反例
├── examples/
│   ├── anchored-core.json # B/N 固定母核示例
│   ├── primitive-command-trace.json # 基础命令回执示例
│   ├── primitive-intent.json # 严格意图桥示例
│   ├── quarter-turn-relation.json # 90 度关节关系示例
│   └── atom-port-mate-request.json # 仅含 registry ID 与摘要的连接请求
├── registry/atom-port-mate-v1/
│   ├── policies/          # 固定可信 AtomPortMatePolicy
│   └── evidence/          # 固定 reference/candidate/mate 回放证据
├── tools/
│   ├── json_to_lean.py    # 最终几何策略桥接器
│   ├── command_trace_to_lean.py # 命令回执桥接器
│   ├── intent_json_to_lean.py # 生产 GeometryIntent 严格桥
│   ├── relation_json_to_lean.py # SpatialRelation V1 严格桥
│   └── atom_port_mate_json_to_lean.py # 固定 registry AtomPortMate 投影器
└── verify.sh
```

## 后续扩展顺序

1. 把现有 runtime receipt 的 `preDigest/postDigest` 接到逐命令关系证书，并证明其投影与 Lean
   基础命令轨迹逐字段等价；
2. 为刚性和角度证据增加系统控制的 pass/possible 双层数值带；
3. 为 `fragment.attach` 补齐端口径向参考和显式扭转角，再把动态生产证据接入不可内联覆盖的
   内容寻址 registry，扩展当前固定 c-sp3/C 单键 `GraphRewrite + AtomPortMate` gate；
4. 为 exact edge fuse 单独定义“恰好合并两个端点”的改写关系；一般原子合并和芳香/Kekule
   改写继续保持独立证书，不能藏在距离阈值中；
5. 补充配位、同位素和完整立体语义的 canonical projection；
6. 用点积和有符号三重积增加键角、二面角 postcondition；
7. 为大于 316 原子的结构实现可证明完备的空间分桶碰撞枚举；
8. 把结构化失败映射为局部重规划提示。
