# 模板工作台 Feature

模板工作台只负责创建、导入、编辑、校验和保存分子模板。连接原子或并环边不写入模板，而是在主编辑器使用模板时动态选择。

```text
template-studio/
├── components/       页面区域组件
├── domain/           模板标识等纯规则
├── infrastructure/   文件解析与本地模板仓库
├── model/            工作台 controller
├── TemplateStudioPage.tsx
└── index.ts
```

依赖方向为 `components -> model -> domain/infrastructure`。`TemplateStudioPage` 只负责布局，不得直接访问 localStorage 或解析结构文件。

运行时位点选择属于 `features/build-palette`：

- 点击 H 或重原子，动态编译原子连接 brush。
- 点击键，动态编译并环 brush。
- 翻转只影响当前放置会话，不修改模板数据。
