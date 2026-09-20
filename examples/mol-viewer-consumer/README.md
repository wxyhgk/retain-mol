# mol-viewer 独立消费者示例

React + TypeScript + Vite 宿主，只从 `@retainmol/mol-viewer/*` 公共入口导入。
本目录不属于 npm workspaces；运行脚本把它复制到仓库外的临时目录，安装实际
`npm pack` 产物，避免源码 alias 或 workspace 链接掩盖包集成问题。

在 RetainMol 根目录执行（先安装根依赖；Node 版本须满足仓库 Vite 要求）：

```sh
npm run example:viewer
```

脚本构建包、打包、创建独立项目、安装依赖、执行 Node 回归、严格类型检查和
生产构建，然后启动 `http://127.0.0.1:5273`。端口占用时直接失败，不自动改端口，
也不结束其他进程。Ctrl+C 停止预览；输出中的临时目录保留，便于查看产物与 lockfile。

自动检查（不打开浏览器、不启动服务，成功后清理临时目录）：

```sh
npm run verify:viewer-consumer
```

根 `npm run verify` 已包含这个检查。它不等价于 WebGL/交互验收。

如果复制本目录到另一个项目，可先在包目录执行 `npm pack`，然后在复制后的目录执行：

```sh
npm install /absolute/path/to/retainmol-mol-viewer-0.1.29.tgz
npm run dev
```

本仓库的 runner 总是使用当前打包产物，不依赖这个版本已发布到 registry。

## 示例覆盖

- 输入 MOL → 注册本地 MMFF94 资源 → 生成 3D。
- 修改单个四面体中心的 R/S 指定、清除指定；H 替换为 Cl。
- 撤销/重做，导出 MOL，再直接载入导出坐标。
- 默认编辑实例 + `createViewerRuntime()` 隔离的只读副本。
- 点击选中、独立相机适配、卸载/重新挂载视口。
- 显示实际实例数据、回调次数和键长，辅助人工核对。

详细接入说明、限制和人工验收步骤见
[独立宿主接入](../../docs/mol-viewer/consumer-integration.md)。

## 文件

| 文件 | 用途 |
| --- | --- |
| `src/main.tsx` | React 宿主、状态订阅、编辑按钮、runtime 生命周期 |
| `src/moleculeSummary.ts` | 只读手性和键长展示 |
| `src/style.css` | 扫描已安装包的 Tailwind class，宿主布局 |
| `scripts/copy-resources.mjs` | 从消费者安装的 OpenChemLib 复制力场资源 |
| `scripts/consumer.test.mjs` | 通过打包产物执行公共 API 行为回归 |
| `public/fixture.mol` | 无指定手性的 `CC(F)(Br)I` 测试分子 |
