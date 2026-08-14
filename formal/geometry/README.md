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
                   trusted orchestrator 冻结 GeometryPolicySpec
                                      |
                                      v
                    Decimal 预检 + Lean 内核求值
                                      |
                           通过 / 拒绝并重新规划
```

当前 schema v2 只接受固定 `coordinateScale = 1000`，即 1 个整数单位代表 0.001 Å。
请求中的 scale、policy 和 Lean 源码都不能由 AI 提交。生产 loop 在运行前把策略写入
`run-spec.json` schema v2，并由 `run-manifest.json` 的 `runSpecSha256` 冻结。距离使用平方距离，避免平方根；朝向
使用四点行列式。十进制坐标采用明确的 half-even 量化，物理距离区间向内取整，避免把声明
范围偷偷放宽。

验证分成两道门：Python `Decimal` 预检先检查原始十进制坐标，阻止小于 0.001 Å 的变化在
整数化时消失；之后 Lean 对量化后的有限请求执行 `#eval`。这是一种可复现的策略判定，不应
描述成对任意分子或任意刚体变换的通用数学证明。

已经形式化的内容：

- 原子 ID、键 ID 唯一，且不允许空 ID、空元素、自环和平行无向键；
- expected 与 candidate 的稳定 ID、元素、形式电荷、自由基、芳香状态、键端点和键级一致；
- 固定原子的元素和坐标完全不变；
- 指定原子对的距离位于闭区间；
- 指定四原子的有向体积达到最小裕量且符号保持；
- 刚性组全部原子对的平方距离漂移不超过可信策略给出的量化容差；
- 刚性组只保持内部度量，本身不能区分镜像；需要同时声明四点有向体积才能拒绝镜像翻转；
- 返回结构化 `ValidationIssue`，空策略在要求几何约束时直接拒绝；
- 证明整体平移保持平方距离和有向体积。

未形式化的内容：

- 元素价态和构键规则，仍由生产 builder command 负责；
- 图片所表达的目标分子是否被 AI 正确识别；
- builder 是否正确实现了 `EditPlan` 语义；
- 连续浮点优化过程；
- 量子化学能量、力和收敛性；
- 同位素、完整立体标记和金属配位位点语义；
- “所有可能原子对都不碰撞”等尚未由策略生成器完备枚举的全局性质。

因此当前结论只能表述为“最终候选满足该版本化 GeometryPolicy”，不能表述为“Lean 已证明
图片中的分子绝对正确”。最终候选经过 xTB 等任何坐标修改后必须重新验证，旧 verdict 失效。

## 运行

先按 Lean 官方方式安装 `elan`。项目通过 `lean-toolchain` 固定 Lean 版本。

```bash
source "$HOME/.elan/env"
npm run verify:formal-geometry
```

该命令会：

1. 编译 `RetainMolGeometry`；
2. 检查内置的通过与拒绝示例；
3. 对重复字段、未知字段、非法 scale 和数值边界运行 fail-closed 测试；
4. 把 `examples/anchored-core.json` 安全转换成 Lean 数据；
5. 由 Lean 内核检查生成的候选策略。

JSON 转换器不接收任何原始 Lean 源码，只序列化 expected、candidate 和 trusted policy。
它拒绝重复键、未知字段、缺失字段和超限数据，避免拼错字段后静默少做检查。

## 目录

```text
formal/geometry/
├── lean-toolchain
├── lakefile.toml
├── RetainMolGeometry/
│   ├── Vec3.lean          # 精确三维向量与刚体不变量证明
│   ├── Molecule.lean      # 分子快照与通用图不变量
│   ├── Certificate.lean   # policy、结构化问题与几何判定
│   └── Examples.lean      # 正例与反例
├── examples/
│   └── anchored-core.json # B/N 固定母核示例
├── tools/
│   └── json_to_lean.py    # 受限数据桥接器
└── verify.sh
```

## 后续扩展顺序

1. 由候选图完备枚举所有成键距离和非键碰撞 pair；
2. 从高阶 builder command 独立生成刚性组、朝向与自由度策略；
3. 补充配位、同位素和立体语义的 canonical projection；
4. 用点积和有符号三重积增加键角、二面角 postcondition；
5. 把结构化失败映射为局部重规划提示。
