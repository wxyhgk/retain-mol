# 基础字段与保真边界

本阶段完善现有 Molecule 的字段、复制、文件往返和保存恢复。编辑状态仍为单一 Molecule；
分区文档、通用扩展属性编辑、逐原子样式属于后续阶段。

## 字段支持矩阵

| 字段 | 原生 JSON / 本地保存恢复 | 内部复制粘贴 | MOL / SDF |
| --- | --- | --- | --- |
| 原子 / 键 ID、连接关系 | 原样保留 | 生成新 ID，同步重映射端点和配位引用 | 文件不保存内部 ID，导入生成新 ID |
| 元素、坐标、键级 | 保留 | 保留；粘贴整体平移 | 保留；V2000 坐标精度为 4 位小数 |
| 芳香标记 | 保留 | 保留 | 保留化学芳香性；单双键表示可被 OCL 规范化 |
| 原子形式电荷、自由基电子数 | 保留 | 保留 | 支持电荷及 0/1/2 个自由基电子；不可表示的状态明确失败 |
| `isotope` 同位素质量数 | 保留 | 保留 | 读写 V2000 ISO / V3000 MASS |
| 原子 `label` | 保留 | 保留 | 单行标签通过 OCL 自定义标签扩展往返；不保证其他软件识别 |
| R/S、楔形方向与窄端、E/Z | 保留指定值 | 完整结构保留；粘贴提交时重新校验已有 R/S | 按实际坐标与楔形感知，不能用字符串代替几何；楔形画法可能规范化 |
| 配位预设、方向、位点及归属 | 保留 | 深复制并重映射归属 | 当前未映射这些 RetainMol 属性，需使用原生 JSON 保存 |

`isotope` 是质量数，例如碳-13 为 `13`，不是质量值。移动、复制、保存保持它；
元素替换与 H 槽位生长会清除旧元素的同位素指定。CIP 感知使用同位素信息。
`calculateMolecularWeight` 仍只提供标准原子量之和；显式同位素返回 `null`，
不以质量数或天然丰度平均原子量冒充同位素精确质量。

MOL 的 singlet radical 标记无法由现有“未配对电子数”字段完整表达，单分子导入明确报错；
导出超过两个自由基电子同样报错。`parseSdf` 保持原有“返回合法记录、跳过失败记录”的批量语义，
需要逐条错误信息的宿主应逐记录调用 `parseMol`，不能把返回数量当作原文件记录数。
未知元素不再静默导出为碳。XYZ/GJF 仍是有限字段的交换格式，不是原生文档备份。

## 公开入口

```ts
import { parseMolecule, findElementConfig } from '@retainmol/mol-viewer/core'
import { parseMoleculeJson, exportMoleculeJson } from '@retainmol/mol-viewer/io'

const molecule = parseMolecule(externalValue)
const text = exportMoleculeJson(molecule)
const restored = parseMoleculeJson(text)
const element = findElementConfig('C') // 未配置的符号返回 undefined
```

原生 JSON 使用 `{ "schemaVersion": 1, "molecule": ... }`，保留当前 Molecule 形状。
未知版本拒绝读取，不自动猜测迁移。JSON 往返保留未知的合法 JSON 字段，但这不代表
已建立扩展属性的编辑、复制或失效规则；该机制留给后续文档阶段。

`parseMolecule` 校验原子/键 ID 唯一性、有限坐标、已定义属性类型、键端点、重复连接及配位引用，
并复制输入，避免宿主后续修改原始对象污染编辑状态。它不验证价态可行性或完整化学正确性。
循环、非 JSON 对象、函数及非有限数字不被接受。可选字段 `undefined` 按 JSON 规则省略。

实例 `api.setMolecule`、本地保存/崩溃恢复和资产响应解析共用该校验。
无效输入不得改变当前分子或历史；保存失败保留上次有效记录。
本地恢复从分子重新建立 dirty 比较基准，不信任单独存储的旧 canonical 文本。
`/state` 是兼容的底层入口，不承诺对任意直接 store 写入进行同样的输入校验。

严格元素查询 `findElementConfig` 与显示用 `getElementConfig` 分开；元素表尚不完整。
本阶段不添加同位素质量表，不把显示兜底参数当作元素事实，也没有改动自定义标签渲染。

## 兼容与验证

- 本地保存记录仍为 version 1；旧合法分子无需迁移。
- 新增 `Atom.isotope`，原子和键的其他字段保持原名。
- ExpectedEffect 规范摘要升级为 `canonical-v4-sha256-`，把同位素纳入比较；旧摘要不能作为新编辑的匹配凭据。
- 资产 contentHash/topologyFingerprint 的 v1 规范没有改变。拓扑摘要仍包含现有 label 等字段；
  分离标注与拓扑时必须另行版本化，不能静默重算旧版本。
- 针对性测试覆盖 JSON 往返、非法数据拒绝、离子/自由基/同位素 MOL 和 SDF 往返、V3000 属性、
  芳香环、同位素立体中心、剪贴板 ID 重映射、实例隔离和撤销重做、本地保存与恢复。
- 独立 tarball consumer 增加原生 JSON → 实例编辑 → undo → MOL 往返验证。
- 本阶段为数据与 API 改动，未进行新的浏览器可视化验收。

2026-09-21：根 `npm run verify` 全部通过，包含 1180 项 workspace 测试、9 项独立宿主测试、
类型检查、边界检查、生产构建、API 报告和 tarball 安装验证。lint 保留 15 条既有警告，无错误。
