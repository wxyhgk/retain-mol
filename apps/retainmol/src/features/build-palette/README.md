# 构建面板 Feature

构建面板负责工具模式、元素/杂化和统一模板入口。环系属于模板，不再拥有独立面板。

```text
build-palette/
├── application/  构建模式状态转换
├── components/   rail、drawer 与内容面板
├── domain/       元素、片段和模板目录
├── model/        editor/store 适配 controller
└── ToolStrip.tsx 纯组合组件
```

组件不得直接组合 editor store 的多个 setter；所有模式转换通过 application command，由 controller 绑定具体 store effects。
