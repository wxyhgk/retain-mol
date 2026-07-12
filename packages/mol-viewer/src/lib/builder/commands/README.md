# Builder commands 领域导航

`commands` 按编辑领域组织。目录本身就是边界；hooks、store、public API 只能从领域 `index.ts` 导入，不应直接依赖领域内部文件。

```text
commands/
├── atom/         原子创建、替换、生长、补 H、grow preview
├── bond/         键创建、键级、成键规则和 drag-start 判定
├── fragment/     片段接枝、并环和片段 placement 原语
├── scene/        整分子、场景对象、坐标变换和优化写回
├── selection/    选择集合变换、失效 ID 同步和连通片段查询
├── geometry/     原子坐标、键长、键角、二面角和几何清理
├── clipboard/    复制和粘贴分子片段
├── interaction/  点击/拖拽/背景 placement 等跨领域用例与手势 gate
└── shared/       command result 与跨领域结果类型
```

规则：

- 包内消费者使用 `commands/atom`、`commands/bond` 等领域入口。
- `*Decision.ts` 是领域内部实现，不从领域 `index.ts` 导出。
- `commands` 不提供根聚合入口；调用方必须明确选择所属领域。
- 已移除旧的混合命令与兼容转发文件，禁止恢复这些历史入口。
- 新行为先选择所属领域；跨多个领域的用户手势由 `interaction` 或上层 effect 编排。
- command 保持纯函数，不导入 React、Zustand、renderer 或 App 代码。
- atom/bond/fragment/geometry 等领域只暴露原语；跨领域流程归 interaction。
- 领域间只能依赖对方 `index.ts` facade；boundary check 会校验依赖矩阵和 SCC。

领域内部继续按行为拆分，例如：

- `atom`: creation、property、removal、topology。
- `bond`: inference、removal、topology、click/drag。
- `geometry`: atom position、bond geometry、cleanup。
- `scene`: molecule、scene object、object transform。
