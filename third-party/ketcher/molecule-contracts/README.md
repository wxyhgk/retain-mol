# molecule-contracts

RetainMol 分子编辑的版本化 JSON 协议。该包不依赖 Ketcher、React 或 DOM；复用仓库已有的 `jsonschema` 校验器。公共 ESM/CJS 入口和导出的 JSON Schema 在真实 Node 进程中测试。

```js
import { EDIT_SCHEMA, validateEditRequest } from 'molecule-contracts';

const result = validateEditRequest({
  schema: EDIT_SCHEMA,
  documentId: 'document-1',
  baseRevision: 0,
  requestId: 'request-1',
  commands: [
    { op: 'atom.add', ref: 'carbon', element: 'C' },
    { op: 'atom.add', ref: 'oxygen', element: 'O' },
    {
      op: 'bond.add',
      ref: 'carbon-oxygen',
      begin: { ref: 'carbon' },
      end: { ref: 'oxygen' },
      order: 'single',
    },
  ],
});
// { ok: true, value: ... } or { ok: false, error: { code, message, path, commandIndex? } }
```

`validateEditRequest`、`validateCommitRequest`、`validateCancelRequest`、`validateHistoryRequest`、`validateDocumentSnapshot` 均接收 `unknown`，成功时返回与输入脱离的 JSON 副本，不执行编辑。提交和取消使用 `{ preparedId, requestId }`；撤销和重做使用 `{ documentId, baseRevision, expectedCommitId }`。`path` 是 JSON Pointer，`commandIndex` 从 0 起。

协议使用六种操作：`atom.add/update/remove`、`bond.add/update/remove`。`{ id }` 指向文档返回的稳定 ID，`{ ref }` 指向本请求声明的引用；两者不能同时提供。删除原子必须指定 `incidentBonds: 'reject' | 'remove'`。更新中 `isotope: null`、`position: null` 表示清除该字段。

`basic-graph-v1` 只表达真实元素、整数电荷、质量数、可选二维坐标和单/双/三键。电荷范围 −8…8，质量数范围 1…400，坐标范围 ±1,000,000；这些是协议范围，**不代表化学有效性**。电荷在原子快照中必填，添加命令中可省略（由引擎默认置 0）。不支持的芳香/立体/查询原子/S-group 等字段会被拒绝。图拓扑、价态与化学解释不由该包验证。

请求最多 1,000 条命令；ID/引用/请求 ID 是 1…128 个字符的字符串；版本号是非负安全整数。运行时入口另限制 JSON 最大深度 32、遍历节点 250,000，拒绝循环、稀疏数组、非有限数字、`undefined`、getter、隐藏字段、Symbol 和自定义对象实例，避免 JSON 序列化时含义变化。这些 JavaScript 输入检查不能表达在 JSON Schema 中。

JSON Schema 的唯一源码是 `src/schemas.ts`，运行时校验直接使用同一对象；build 导出可复制给工具或其他语言的 JSON 文件：

| 包导出                                            | 用途          |
| ------------------------------------------------- | ------------- |
| `molecule-contracts/schemas/edit-request.json`    | 六类编辑命令  |
| `molecule-contracts/schemas/document.json`        | 文档快照形状  |
| `molecule-contracts/schemas/commit-request.json`  | 提交/取消参数 |
| `molecule-contracts/schemas/history-request.json` | 撤销/重做参数 |

Schema 的 `.invalid` URL 是协议标识，不会请求网络。TypeScript 类型帮助编写调用，运行时仍必须校验外部 JSON；类型断言不会替代校验。

画布边界另导出 `MoleculeCanvasReader`、带 prepare/commit/cancel 的 `MoleculeCanvasApi`、`MoleculeCanvasState`、能力/诊断/事件原因类型及 `CANVAS_SCHEMA`。这些是宿主接口类型，尚无单独的画布状态 JSON Schema；其中的文档仍由上表 document schema 验证。实际 Ketcher 接入与生命周期见 [molecule-ketcher](../molecule-ketcher/README.md)。

从仓库根目录执行：

```sh
npm run build -w molecule-contracts
npm run test:types -w molecule-contracts
npm test -w molecule-contracts
```
