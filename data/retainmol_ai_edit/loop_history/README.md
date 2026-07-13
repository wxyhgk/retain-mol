# AI 建模 Loop 历史

这里保存可检查、可版本管理的真实盲建模尝试。每个运行目录包含：

- `candidate.raw.sdf`：subagent 直接生成的结构（执行精修时）；
- `candidate.sdf`：实际参与最终评分的结构；
- `candidate.json`：builder、种子和锚点映射；
- `edit-plan.json`：建模步骤；
- `run.json`：原始/精修评分、环境指纹和优化阶段；
- `report.md`：便于人工阅读的结论。

`index.json` 是自动生成的运行索引。隐藏 SDF、参考 XYZ 和参考自检不会复制到这里。
