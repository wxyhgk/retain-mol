# 几何优化 Feature

这个目录集中管理用户主动触发的分子几何优化。距离几何生成初始 3D 坐标属于分子放置流程，由 `features/molecule-placement` 管理，不放在这里。

## 目录职责

```text
geometry-optimization/
├── application/     任务编排、目标 revision 校验、轨迹写回
├── components/      可复用的优化控件
├── domain/          与界面和网络无关的算法选择规则
├── infrastructure/ OpenBabel Worker、xTB HTTP/SSE 客户端
├── model/           当前优化任务的唯一状态源
└── index.ts         对 feature 外公开的入口
```

## 依赖方向

```text
components -> application -> domain
                         -> infrastructure
                         -> model
```

- `infrastructure` 不得依赖 React、Zustand、viewer store 或应用界面。
- feature 外部只能从 `index.ts` 使用运行命令、任务状态和控件。
- `RightPanel` 与 `GeometryPanel` 不得直接调用 MMFF、UFF 或 xTB 客户端。
- 同一时刻只允许一个优化任务；进度和完成消息由 `optimizationTaskStore` 统一保存。

## 扩展新的优化器

1. 在 `infrastructure/` 增加只处理传输和结果解析的 client。
2. 在 `domain/` 增加纯选择规则或能力判断。
3. 在 `application/geometryOptimizationService.ts` 处理分子 revision、undo transaction 和坐标写回。
4. 在 `runGeometryOptimization.ts` 接入任务状态与全局 busy 提示。
5. 只从 `index.ts` 暴露界面真正需要的窄 API。
