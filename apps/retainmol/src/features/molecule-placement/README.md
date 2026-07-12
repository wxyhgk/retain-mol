# 分子放置 Feature

这个 feature 管理“把外部结构放进当前三维场景”的完整流程，包括文件导入、PubChem、模板分子和剪贴板粘贴。

```text
molecule-placement/
├── application/
│   ├── placeMoleculeInViewer.ts  距离几何与提交工作流
│   ├── placementRuntime.ts       scene revision、动画中止与坐标写回
│   └── pasteMoleculeText.ts      剪贴板结构入口
├── domain/
│   └── moleculePlacementRequestGate.ts  并发请求新鲜度规则
└── index.ts                      feature 外唯一入口
```

## 约束

- UI、hooks 和其他 feature 只能从 `index.ts` 调用。
- request gate 不依赖 React、store、Worker 或 three.js。
- runtime 不负责解析文件，也不决定是否需要距离几何。
- workflow 不直接维护动画控制器或全局 busy 字符串。
- 每次距离几何请求必须持有独立的 app task token，并在 `finally` 中结束。
