# @retainmol/molecule-assets

分子资产与版本能力：不可变 Revision、乐观并发（CAS）、分子文档绑定。规划中：分子展示组件（MoleculeCard/Molecule2D/Molecule3D）也落在这里。

## 铁律
* 依赖方向：只可依赖 `@retainmol/ui-kit`；`@retainmol/mol-viewer` 是 peerDependency（经公共子入口 import）。
* 不读 `import.meta.env`——后端地址由宿主经 `configureMoleculeAssetsApiBase()` 注入。
* Revision 不可变：任何"修改"都是新 Revision；冲突只有「加载服务端头」或「另存新资产」两条路，无静默覆盖。
* 服务端状态只走 TanStack Query（`moleculeAssetQueries`），禁止复制进 zustand。

## 结构
四层：`domain/`（纯函数+类型+测试）→ `application/`（react-query hooks）→ `infrastructure/`（api client + wire projector）→ `components/`。依赖方向只准朝左。

## 命令
* 构建：`npm run build --workspace @retainmol/molecule-assets`（改 src 后必须）
* 边界：`npm run check:boundaries --workspace @retainmol/molecule-assets`；最后根 `npm run verify`
