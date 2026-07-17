# @retainmol/jobs

任务管理能力包：任务查询/提交/管理、任务中心页面组件、3D 展柜（玻璃盒+工作流管道）。

## 铁律
* 依赖方向：可依赖 `@retainmol/molecule-assets`、`@retainmol/ui-kit`；`@retainmol/mol-viewer` 与 `three` 是 peerDependency。
* 不读 `import.meta.env`——后端地址由宿主经 `configureJobsApiBase()` 注入（vite 只在应用构建时替换 env，预构建包里的 env 表达式是死代码）。
* **词汇单源**：状态/类型文案只准来自 `domain/jobPresentation`（jobStatusLabel/calculationLabel/jobParameterRows）与 `domain/shelf/shelfNodeStyle`，任何组件不得自带第二套。
* 服务端状态只走 TanStack Query；缓存写经 `commitJob`；mutation 不要往 `jobUiStore` 写选中态（审查定论，逐步退役现存写点）。
* ID 一律 `genId()`，禁止 `crypto.randomUUID()`。

## 展柜（components/shelf/）
* 单 canvas 单场景（`ShelfSceneManager`），**绝不**每盒一个 canvas / 每卡一个 WebGL context。
* 相机固定；交互响应只作用于被悬停盒子（tilt+抬升），全局视差已被否决勿加回。
* `domain/shelf/` 零 three import（vitest 不吃 dedupe）；scene→domain 单向。
* 数据同步后必须 `renderOnce()` 兜底（嵌入式环境 IntersectionObserver/visibility 不可靠）。

## 命令
* 构建：`npm run build --workspace @retainmol/jobs`（改 src 后必须）
* 测试：`npx vitest run`（包内）；边界：`npm run check:boundaries --workspace @retainmol/jobs`；最后根 `npm run verify`
