## 变更范围

- 负责目录：
- 用户可见行为：
- 公共 API 或数据结构变化：

## 边界检查

- [ ] 跨 feature 引用只经过对应 `index.ts` facade
- [ ] App 只使用 `@retainmol/mol-viewer/*` 公共子路径
- [ ] 化学编辑规则没有进入 UI 或 renderer
- [ ] Three.js 细节没有进入 App 或 builder 领域模型
- [ ] 多步骤编辑具有明确的 transaction/undo 边界

## 验证

- [ ] `npm run verify`
- [ ] 涉及 3D 交互时完成对应人工冒烟流程
- [ ] 没有提交凭据、构建产物或无关格式化改动

## 协作说明

- 可能冲突的共享文件：
- 需要共同审查的 owner：
- Owner 与共享热点说明：`docs/architecture/collaboration-audit-2026-07-13.md`
