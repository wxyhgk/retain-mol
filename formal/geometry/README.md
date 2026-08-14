# RetainMol 三维几何形式化验证

这个目录使用 Lean 4 验证 AI 建模候选中的离散拓扑和关键三维不变量。它不是坐标生成器，
也不替代距离几何、MMFF/UFF、GFN2-xTB 或 `mol-viewer` 的 builder command。

## 为什么使用 Lean

多模态模型不需要在脑中一次性“看见”完整三维分子。更可靠的方法是把问题拆成可独立核验的
局部关系：

1. 分子图中的原子、键和稳定 ID 是否一致；
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
                            受限 JSON 几何证书
                                      |
                                      v
                              Lean 精确验证
                                      |
                           通过 / 拒绝并重新规划
```

当前验证器只接受缩放后的整数坐标。默认 `coordinateScale = 1000`，即 1 个整数单位代表
0.001 Å。距离使用平方距离，避免平方根和浮点误差；朝向使用四点行列式，也只涉及整数运算。

已经形式化的内容：

- 原子 ID、键 ID 唯一；
- 键端点存在且不存在自环；
- 固定原子的元素和坐标完全不变；
- 指定原子对的距离位于闭区间；
- 指定四原子的有向体积非零且符号保持；
- 证明整体平移保持平方距离和有向体积。

未形式化的内容：

- 元素价态和构键规则，仍由生产 builder command 负责；
- 连续浮点优化过程；
- 量子化学能量、力和收敛性；
- “所有可能原子对都不碰撞”等未在证书中显式声明的全局性质。

## 运行

先按 Lean 官方方式安装 `elan`。项目通过 `lean-toolchain` 固定 Lean 版本。

```bash
source "$HOME/.elan/env"
npm run verify:formal-geometry
```

该命令会：

1. 编译 `RetainMolGeometry`；
2. 检查内置的通过与拒绝示例；
3. 把 `examples/anchored-core.json` 安全转换成 Lean 数据；
4. 由 Lean 内核检查生成的候选证书。

JSON 转换器不接收任何原始 Lean 源码，只序列化原子、键、坐标和约束字段，避免 AI 通过
生成“自己的证明”绕过验证器。

## 目录

```text
formal/geometry/
├── lean-toolchain
├── lakefile.toml
├── RetainMolGeometry/
│   ├── Vec3.lean          # 精确三维向量与刚体不变量证明
│   ├── Molecule.lean      # 分子快照与通用图不变量
│   ├── Certificate.lean   # 锚点、距离、朝向证书
│   └── Examples.lean      # 正例与反例
├── examples/
│   └── anchored-core.json # B/N 固定母核示例
├── tools/
│   └── json_to_lean.py    # 受限数据桥接器
└── verify.sh
```

## 后续扩展顺序

1. 从 `EditPlan` dry-run 结果自动生成证书 JSON；
2. 用稳定局部坐标系表达模板连接和并环，而不是让 AI 猜世界坐标；
3. 证明旋转矩阵/四元数保持刚性片段内部距离；
4. 增加键角、二面角和非键碰撞证书；
5. 把失败约束映射为重新规划提示，而不是直接让模型重建整分子。
