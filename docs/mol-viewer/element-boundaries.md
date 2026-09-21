# 元素与预览边界

本轮在现有 mol-viewer 包内分开元素参考数据、编辑默认策略与显示外观。没有新增 npm 包或公开入口，Molecule 与 JSON 格式保持原样。

## 元素字段归属

| 文件（相对 `packages/mol-viewer/src`） | 内容 | 典型消费者 |
| --- | --- | --- |
| `lib/model/elements.ts` | symbol、名称、原子序数、原子质量、共价/CPK 参考半径、分类 | 分子量、工厂、碰撞/键长计算、渲染半径 |
| `lib/chemistry/policies/elementDefaults.ts` | 价电子参数、最大成键数、补氢默认价态、默认杂化、`effectiveMaxBonds` | 价态检查、补氢、VSEPR 与编辑命令 |
| `lib/presentation/elementColors.ts` | 默认元素色 | 预览与兼容元素配置 |
| `lib/presentation/periodicTable.ts` | 常用元素列表、周期表排列 | 兼容出口与元素选择 UI |
| `config/elements.config.ts` | 组合以上信息的旧接口 | `/core` 与根入口的兼容消费者 |

当前仍配置原来的 60 个元素，不代表完整周期表。保留原有数值；本轮没有重新核定质量、半径或价态模型的科学适用范围。价电子数在本库中参与编辑策略，过渡金属的成键数等默认值不能当作普适化学限制。

参考半径与画面中的球大小分开：前者供几何计算或作为显示输入，后者由样式缩放。

## 兼容与未知元素

- `ElementConfig`、`ELEMENT_CONFIGS`、`getElementConfig`、`findElementConfig`、`effectiveMaxBonds` 等既有公开接口保留。
- 兼容表在加载时组合一次；已知元素的查找仍返回稳定对象引用，字段值和原来一致。
- `findElementData` / `findElementConfig` 对未知符号返回 `undefined`；质量计算继续返回 `null`，不会拿几何 fallback 当作真实元素。
- `getElementData` 保留宽松几何 fallback，兼容 `getElementConfig` 再组合原有默认价态与粉色。包括 `__proto__`、`constructor` 在内的属性名不会被误判为元素。
- 兼容表是读取视图，不是运行时元素注册接口。直接修改旧表不会更新内部参考数据或编辑策略；项目现有调用均为读取。主题扩展继续使用 `/styles` 的注册接口。

新包内代码必须直接读取所属模块，不能重新通过混合配置取得所有字段。包外仍使用已有公开入口，不依赖这些内部路径。

## 生长预览

调用链：

```text
builder/geometry/growPreview
  → 元素符号 + 原子位置 / 候选环 / 候选点
hooks/builderPreviewEffects
  + styles/growPreviewAppearance
  → 带颜色和球半径的预览 DTO
renderer
```

几何查询保留氢槽生长、自由方向、VSEPR 和草图平面交点规则。候选环的 radius 是空间放置距离；ghostRadius 是画面上的预览球半径，不能互换。
预览球仍使用 `covalentRadius × growGhostRadiusFactor`（当前 0.45）与默认元素色。正式原子继续通过主题读取颜色；这轮没有改变预览随主题变化的规则。

## 自动检查与验证

- 源码门禁阻止内部消费者引用旧混合元素入口，阻止化学/Builder/modeling 读取外观模块，类型导入同样检查。
- `/headless` 的传递依赖禁止元素外观；构建钩子检查实际可达 JS chunk 的模块来源，覆盖共享 chunk 与动态导入。
- 迁移前后逐项对照通过：60 条完整元素配置、常用元素/周期表数组、66 个已知与未知查找符号，以及 2,970 组电荷/自由基输入。
- 回归覆盖 H 槽预览与提交坐标一致、C/N/O/F/Fe 的默认预览色和半径、候选环与草图平面点集的外观组合、严格查找与未知元素质量。

全量 `npm run verify` 通过：

- 1,214 项 workspace 单测（mol-viewer 947 项）、15 项依赖门禁回归、9 项独立宿主行为测试。
- 常规/严格类型检查、正式构建、五个纯入口 tarball 消费和独立宿主 TypeScript/Vite 构建通过；20 个公开 API 报告无变化。lint 保留原有 15 条 warning，没有 error。

2026-09-21 在 Edge 对本工作树的正式构建（临时端口 `5302`）做真实鼠标与键盘验收：

- 双击选择分子片段、删除后，从空场景创建甲烷。Inspector 显示 `CH4`、5 原子/4 键、`16.043 g/mol`。
- 从元素面板选择 O，拖动甲烷的一个 H 槽生长为甲醇。显示红色氧，Inspector 变为 `CH4O`、6 原子/5 键、`32.042 g/mol`。
- 撤销恢复甲烷，重做恢复甲醇；正式构建此次操作未观察到新增 console error。
- 浏览器验收覆盖拖动提交后的结果，没有截取按住鼠标时的幽灵预览中间帧：当前浏览器工具拒绝该阶段的原始 CDP 操作。预览位置、默认颜色/半径及 guide 组合由上述回归覆盖，不能将其当作完整视觉验收。主题切换、触屏与所有元素的交互未逐项验证。

开发模式尝试中遇到热更新重置场景，以及 vendored Ketcher 的 `server` reducer key 和 `emitter.off` 日志；本批未修改这些链路。正式构建验收用于排除热更新干扰，不替代开发模式问题的后续排查。
