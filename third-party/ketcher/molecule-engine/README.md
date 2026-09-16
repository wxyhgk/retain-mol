# molecule-engine

面向 AI 的小分子 JSON 编辑会话，第一批实现。使用 `molecule-contracts` 的版本化契约；运行时不依赖 Ketcher、DOM、React 或模型服务。当前仅处理 `basic-graph-v1`，尚未接入网页画布。

## 运行

在仓库根目录执行（Node ≥ 24.14.1）：

```sh
npm install
npm run test:molecule-api
node packages/molecule-engine/examples/create-and-edit.mjs
```

[完整示例](examples/create-and-edit.mjs) 从零创建 C–C–O，使用结果中的 ID 将 O 改为 N，再撤销、重做。它调用构建后的公开包入口，不需要浏览器或 jsdom。

```js
import { createMoleculeSession } from 'molecule-engine';
import { EDIT_SCHEMA } from 'molecule-contracts';

const opened = createMoleculeSession({ documentId: 'my-document' });
if (!opened.ok) throw new Error(opened.error.message);
const session = opened.value;
const current = session.getDocument();
const result = session.prepareEdit({
  schema: EDIT_SCHEMA,
  documentId: current.documentId,
  baseRevision: current.revision,
  requestId: 'add-carbon-1',
  commands: [{ op: 'atom.add', ref: 'carbon', element: 'C' }],
});

if (result.ok) {
  // 宿主可展示 result.value.candidate 与 changes，并在获得写入授权后提交。
  const committed = session.commitEdit({
    preparedId: result.value.preparedId,
    requestId: result.value.requestId,
  });
  // 业务方必须分别处理 committed.ok 和 committed.error。
}
```

## 文件职责

- `src/`：图编辑与会话、草稿、版本和历史；对外入口为 `src/index.ts`。
- `test/`：普通 Node 中通过公开构建入口验证行为。
- `examples/`：可直接执行的宿主使用示例。
- 共享字段、错误类型和 JSON Schema 归属相邻的 `molecule-contracts` 包。

## 行为约定

所有编辑方法同步返回 `{ ok: true, value }` 或 `{ ok: false, error }`。同步提交在同一个 JS 会话内检查版本并整体替换状态；多个进程或实例之间不共享锁、版本或去重记录，宿主必须让一份文档只有一个写入会话。

运行时需要标准 Web Crypto 的 `getRandomValues`，用于生成跨重启的随机会话标识；缺少该能力时创建会话返回 `unsupported-runtime`。它不依赖 Node 专有模块或 DOM 类型。

| 方法                                                      | 行为                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `getDocument()`                                           | 返回冻结的 JSON 快照，包含不透明 ID 与单调递增 revision                                 |
| `getCapabilities()`                                       | 返回当前支持的图命令、限制及未提供的化学能力                                            |
| `prepareEdit(unknown)`                                    | 校验输入，在隔离副本执行整批命令，返回固定候选、差异和 refs；候选 revision 仍为基准版本 |
| `commitEdit({preparedId, requestId})`                     | 再次检查版本，提交固定候选，整批进入一个历史单元                                        |
| `cancelEdit({preparedId, requestId})`                     | 释放未提交草稿，不改变文档和历史                                                        |
| `undo/redo({documentId, baseRevision, expectedCommitId})` | 检查当前版本与栈顶 commitId，恢复整批结构和原 ID，推进 revision                         |
| `getHistory()`                                            | 返回 undo/redo 栈中的 commitId，数组最后一项是下一次操作的目标                          |

请求内的 `{ref: 'name'}` 只能引用本批前面创建且尚未删除的实体；atom 与 bond 的 ref 名称也不能重复。已有实体使用 `{id: 'snapshot-returned-id'}`。不要把 ID 解析为数组索引，也不要跨文档使用。删除后不复用 ID，撤销/重做恢复原 ID。

`atom.remove` 必须声明 `incidentBonds: 'reject'` 或 `'remove'`。后者同时删除关联键。`atom.update.patch` 中的 `isotope: null` 和 `position: null` 明确清除可选属性；省略字段表示保持不变。元素、charge 与键级没有自动推断。无净变化的整批返回 `no-change`，不产生历史。

同一个 requestId 和相同 JSON 内容在去重记录保留期间返回原草稿/提交结果；对象键顺序不影响匹配，内容不同返回 `request-id-conflict`。**撤销后重试已提交请求只返回原 receipt，不重新应用编辑**，因此 receipt.revision 可能低于当前版本；最新状态请重新读取 `getDocument()`。去重记录只属于当前会话，默认保留最近 100 次提交，不承诺永久或跨重启去重。

默认最多 32 个待处理草稿、100 个历史单元，可在创建会话时用 `maxPreparedEdits`、`maxHistoryEntries`、`maxIdempotencyEntries` 配置。草稿过期后需取消或重新准备；preparedId 是会话内句柄，不是身份认证凭证。输入最多 1,000 条命令，图最多 10,000 原子/20,000 键。错误返回机器可读 code，并在适用时包含 commandIndex、path、references 或 currentRevision。

`createMoleculeSession({documentId, snapshot})` 可读取本契约的 JSON 快照，保留实体 ID 和 revision，开启新的独立会话；旧会话的草稿、历史和去重记录不随快照恢复。该入口会拒绝未知特性和破损图，不能用它加载 KET/SMILES/Molfile。

## 当前边界

首批支持元素、电荷、可选同位素和二维坐标，以及单/双/三键的增加、修改、删除。结构校验检查引用、重复边、自连边等图不变量。**不执行价态、芳香性、立体化学或坐标布局计算**，每次编辑返回 `chemistry-unchecked` 警告。合法 JSON 和完整图不代表化学合理。

本包不接受查询原子、芳香键、S-group、立体标记或其他 KET 扩展字段；不提供格式转换、图像识别或 AI 模型调用。现有 Ketcher 化学模型与画布仍独立运行，下一批 adapter 必须保留其未编辑特征，并验证人工编辑、预览确认和单次画布 Undo/Redo，不能把本包简单图测试作为画布或复杂化学验收。

迁移计划和验证记录见[架构说明](../../docs/architecture/molecule-editing-api.md)。
