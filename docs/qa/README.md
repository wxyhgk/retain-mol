# RetainMol 人工质量检查

这里记录无法仅靠单元测试判断的 3D 分子编辑体验。目标不是覆盖所有化学场景，
而是用一组短小、稳定的动作尽早发现阻塞、卡死和交互退化。

## 分工

- 自动化测试负责确定性约束：原子/键数量、重复键、自环、悬空引用、撤销历史、
  `NaN` 坐标、超时和 console error。
- 人工检查负责体验判断：是否容易点中、空间方向是否合理、结构是否明显碰撞、
  提示是否清楚、操作是否符合建模直觉。
- 人工检查发现问题后，先登记到 [known-issues.csv](./known-issues.csv)，再决定是否补
  自动化回归。能够稳定表达为输入与输出的问题，应补测试；纯视觉和手感问题保留人工验收。

## 最短工作流

1. 启动应用：`npm run dev --workspace retainmol -- --host 0.0.0.0`。
2. 固定打开 `http://127.0.0.1:5173/`。
3. 按 [编辑器冒烟检查表](./editor-smoke-checklist.md) 从上到下执行。
4. 每项只记录 `通过`、`阻塞` 或 `体验问题`。
5. 遇到问题立即登记，不继续堆叠操作；保存复现前的分子文件和截图。

一次完整检查应控制在 10 分钟内。若某项需要复杂分子或超过 1 分钟才能说明，
应拆成单独的问题复现，而不是继续扩大这张检查表。

## 目录

```text
docs/qa/
├── README.md
├── editor-smoke-checklist.md
├── known-issues.csv
└── test-molecules/
    └── README.md
```

技术层的 Chromium/WebGL 检查仍使用
[mol-viewer 浏览器 Smoke](../mol-viewer/testing/browser-smoke.md)，两者互不替代。
