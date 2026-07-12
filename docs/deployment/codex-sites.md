# Codex Sites 部署说明

RetainMol 保留现有 Vite + React 本地开发方式，同时在生产构建中额外生成 Codex Sites 所需的 Cloudflare Worker 入口。

## 构建

在仓库根目录执行：

```bash
npm run build --workspace retainmol
```

构建完成后的关键结构：

```text
apps/retainmol/dist/
├── server/
│   └── index.js
├── assets/
├── openbabel/
├── ocl/
├── openbabel-worker.js
├── index.html
└── .openai/
    └── hosting.json    仅在真实 Sites 元数据存在时生成
```

`postbuild` 会自动执行 `scripts/check-sites-build.mjs`，验证：

- Worker 入口存在并导出 `fetch`。
- React 客户端入口存在。
- OpenBabel、OCL 和 Web Worker 资源已进入产物。
- 前端路由会回退到 `index.html`。
- 缺失的 JS、WASM、data、`/assets/*`、`/openbabel/*`、`/ocl/*` 不会错误返回 HTML。

也可以单独检查已有产物：

```bash
npm run check:sites-build --workspace retainmol
```

## Worker 路由规则

Worker 首先通过 Sites 注入的 `ASSETS` binding 请求静态资源：

1. 资源存在时直接返回。
2. `/assets/*`、`/openbabel/*`、`/ocl/*` 或带扩展名的资源缺失时保留 `404`。
3. 仅对 `GET`、`HEAD` 的前端页面路由回退到 `/index.html`。
4. `POST` 等非导航请求不会回退到 SPA。

## 本地开发

本地开发流程不变：

```bash
npm run dev --workspace retainmol
```

Sites 元数据插件只在生产构建时执行，不参与 Vite dev server。

## Sites 元数据

不要手工创建虚假的 `project_id`。首次部署必须在具备完整 Sites 发布工具的 Codex 环境中：

1. 调用 `create_site`。
2. 将返回的真实 `project_id` 写入 `apps/retainmol/.openai/hosting.json`。
3. 重新执行生产构建；构建插件会把该文件复制到 `dist/.openai/hosting.json`。
4. 使用 Sites 的 `package-site.sh` 打包。
5. 调用 `save_site_version` 和 `deploy_private_site_version`。
6. 轮询 `get_deployment_status` 直到成功或失败。

当前仓库没有持久化、D1 或 R2 需求，因此元数据只应包含 Sites 返回的真实项目标识；不要添加占位 ID。
