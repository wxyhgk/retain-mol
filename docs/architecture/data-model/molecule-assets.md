# MoleculeAsset / MoleculeRevision 契约

本文定义分子资产的 service/API 契约，以及它与 `JobInputBinding(sourceKind = molecule_revision)` 的边界。这里记录 schema 6 的当前实现与编辑器接入规则。

## 实施状态

截至 2026-07-15，与分子资产直接相关的基线如下：

| 层 | 当前能力 | 后续工作 |
| --- | --- | --- |
| SQLite schema 6 | Asset head/version、Revision schema/双摘要和来源 metadata 已物化；触发器保护不可变 Revision 与 head 归属 | 增加迁移审计和 schema 签名 |
| 前端领域层 | DTO、规范哈希、API port/client、Query/mutation、编辑对象绑定、保存与冲突恢复 UI | 自动保存策略和显式分支/合并 |
| 后端 repository | create/list/get Asset、create/get/list Revision 和 expected head/version CAS | 后续分支/合并命令单独设计 |
| 后端 service/API | 服务端规范化、双摘要复算、错误映射和 HTTP 路由已测试 | 权限、分页和审计能力 |
| Job Binding | xTB 接受 `molecule_revision`，排队冻结摘要，runner 执行前复验 | 其他计算引擎逐个注册端口契约 |

编辑器现已把当前场景对象作为本地工作副本：首次保存创建 Asset 和首个 Revision，后续保存携带 head/version CAS。版本库可以载入 head，或把历史 Revision 恢复到工作副本后另存为新 head。发生并发冲突时，本地结构保持不变，用户只能选择载入服务器 head 或另存为独立 Asset，不提供静默强制覆盖。

## 编辑器会话边界

完整 `MoleculeAsset` 与 `MoleculeRevision` 由 TanStack Query 缓存；`mol-viewer` 的 Zustand 仍只保存分子工作副本。App 另有一个很小的会话绑定，以场景 `objectId` 为键保存：

```text
objectId -> assetId + headRevisionId + assetVersion + savedContentHash
```

这些字段是保存命令所需的本地游标，不是服务端实体副本。当前 Molecule 的规范内容摘要与 `savedContentHash` 不同即表示有未保存修改。切换场景对象时，每个对象使用自己的绑定，不能把一个 Asset 的保存游标误用于另一个分子。

保存步骤为：

1. 从当前 Molecule 快照同时计算内容摘要和拓扑摘要。
2. 摘要与已保存内容相同且没有待写入来源 metadata 时跳过网络写入；有新的计算来源时仍创建 Revision。
3. 未绑定对象先创建 Asset，再提交首个 Revision；已绑定对象使用本地 head/version 提交 CAS。
4. 保存成功后用 API 响应更新 Query cache，并只在会话 store 中推进不透明 ID、版本和摘要。
5. `409 molecule_head_conflict` 时缓存服务器最新 Asset 摘要并打开冲突处理，不修改画布工作副本。

当前“创建空 Asset + 首个 Revision”仍是两次 HTTP 调用；如果部署环境要求严格避免孤立空 Asset，应在后端增加事务化的一步创建命令，而不是在组件中补偿删除。

## schema 6 字段

schema 2 创建基础表，schema 5 完成 Revision 强约束，schema 6 追加来源 metadata：

```text
molecule_assets(
  asset_id, name, head_revision_id, version,
  metadata_json, created_at, updated_at
)

molecule_revisions(
  revision_id, asset_id, parent_revision_id,
  schema_version, structure_json, sha256,
  topology_fingerprint, metadata_json, created_at
)
```

新 Revision 的两个摘要均为必填，数据库触发器拒绝无效摘要，并禁止 Revision UPDATE/DELETE。DTO 映射为：

| API 字段 | SQLite 字段 | 状态 | 语义 |
| --- | --- | --- | --- |
| Asset `id` | `asset_id` | 已有 | 不透明且永不复用 |
| Asset `name` | `name` | 已有 | 可变显示名 |
| Asset `headRevisionId` | `head_revision_id` | schema 5 | 默认打开的 Revision；可为 `null`，必须属于本 Asset |
| Asset `version` | `version` | schema 5 | CAS 版本，每次 head 推进时递增 |
| Revision `id` | `revision_id` | 已有 | 不透明且永不复用 |
| Revision `assetId` | `asset_id` | 已有 | 所属 Asset，创建后不可变 |
| Revision `parentRevisionId` | `parent_revision_id` | 已有 | 可空，若有值必须属于同一 Asset |
| Revision `molecule` | `structure_json` | 已有 | 完整规范分子快照 |
| Revision `contentHash` | `sha256` | schema 5 强约束 | 规范分子 JSON 的 64 位小写 SHA-256 |
| Revision `topologyFingerprint` | `topology_fingerprint` | schema 5 | 忽略笛卡尔坐标后的规范拓扑 SHA-256 |
| Revision `schemaVersion` | `schema_version` | schema 5 | 内容契约版本，不等同于 SQLite `user_version` |
| Revision `metadata` | `metadata_json` | schema 6 | 不可变来源信息；不参与分子内容摘要 |

schema 5 会把短期 schema 4 中合法的 `metadata_json.headRevisionId` 迁移到独立列。repository 在 `BEGIN IMMEDIATE` 内读取并比较 `head_revision_id/version`，再插入 Revision 和推进 head，从而完成原子 CAS。

迁移会为可验证的旧结构按规范算法回填摘要；不可解析的旧结构只获得迁移完整性摘要以保持可读，不能通过 service 校验进入新的 Revision Job 主路径。

## 不可变快照

`MoleculeAsset` 是可变聚合根，只保存名称、head 等资产级信息；原子、键、坐标、电荷及其他化学内容只保存在 `MoleculeRevision`。保存请求显式提供 `parentRevisionId`、`expectedHeadRevisionId` 和 `expectedVersion`，避免把父链语义与并发前置条件混在一起。

`MoleculeRevision` 一经提交即为 INSERT-only 快照：

- `structure_json` 保存完整 Molecule，而不是相对某个父版本的 patch；读取任一 Revision 不需要重放历史。
- `parent_revision_id` 只表达版本来源，不授权修改父版本，也不要求全局单链；同一父版本可以产生多个分支。
- 服务端按版本化规范规则序列化 `molecule`，并自行计算 `contentHash` 与 `topologyFingerprint`。客户端计算值可用于提前反馈，但不能作为持久化真值直接信任。
- 修改任意结构字段、坐标或化学属性都创建新 Revision。重命名 Asset 不创建 Revision，也不改变历史摘要。
- Revision ID 是业务身份，摘要是内容完整性标识。两个 Revision 即使内容相同，也可以有不同 ID 和不同 parent/provenance。
- `metadata_json` 与 Revision 一起不可修改，可记录 `derivedFromJobId`、`derivedFromArtifactId` 和 `sourceRevisionId`；它不改变结构内容摘要。
- SDF、XYZ 等格式化文件属于导出 Artifact；文件格式和字节摘要不能替代规范 Revision。

repository 不提供通用 `update_revision` 或 `delete_revision`，数据库也会拒绝直接改写。如需归档，只修改 Asset 或追加独立审计记录；已被 Job 绑定的 Revision 必须长期可读。

## Service

service port 提供以下命令，避免让路由或 React 组件自行拼接事务：

```text
list_assets() -> list[MoleculeAsset]
create_asset(name) -> MoleculeAsset
get_asset(asset_id) -> MoleculeAsset
list_revisions(asset_id) -> list[MoleculeRevision]
get_revision(revision_id) -> MoleculeRevision

create_revision(
  asset_id,
  molecule,
  parent_revision_id,
  expected_head_revision_id,
  expected_version,
  client_content_hash,
  client_topology_fingerprint,
  metadata
) -> MoleculeRevision
```

`create_asset` 创建一个 `headRevisionId = null` 的 Asset。首个保存调用 `create_revision`，其 `parentRevisionId` 为 `null`。这样创建空 Asset 与提交不可变内容是两个清晰命令；若产品需要“一步导入”，应由 service 在同一事务中组合这两个命令，而不是让客户端串行调用后假装原子。

`create_revision` 必须执行：

1. 校验 Asset 存在，且 `parentRevisionId` 为 `null` 或指向同一 Asset。
2. 要求 `parentRevisionId` 与 `expectedHeadRevisionId` 一致。常规保存只从调用方实际打开的 head 派生；显式分支/合并不在本阶段 API 内。
3. 在服务端规范化 Molecule，校验稳定原子/键 ID 和引用完整性，计算两个摘要，并与客户端预计算值比较；不匹配时拒绝保存。
4. repository 在一个 `BEGIN IMMEDIATE` 事务中比较 `head_revision_id/version`、插入 Revision 并推进 Asset head/version。
5. 当前 head 或 version 与 expected 值不一致时回滚整个事务并返回并发冲突；不能留下客户端误以为已保存的游离 Revision。

目标 CAS 的事务语义等价于：

```text
BEGIN IMMEDIATE
currentHead, currentVersion = molecule_assets.head_revision_id, molecule_assets.version
require currentHead == request.expectedHeadRevisionId
require currentVersion == request.expectedVersion
require request.parentRevisionId == request.expectedHeadRevisionId
INSERT molecule_revisions(...)
UPDATE molecule_assets
SET head_revision_id = newRevisionId, version = version + 1, updated_at = ...
COMMIT
```

服务端必须比较 head，防止两个客户端基于同一 Revision 保存时后提交者静默覆盖先提交者。冲突后客户端保留本地工作副本，刷新 Asset 列表并读取最新 head Revision，再由用户选择重放编辑；不得静默覆盖最新 head。若以后需要显式分支或对 Asset 元数据做统一并发控制，应增加独立命令并提升 DTO schema，不能在不改契约版本时暗加请求前置条件。

## HTTP API

字段使用 camelCase，并与前端领域类型的 `id`、`assetId` 命名保持一致。当前路由为：

| 方法 | 路径 | 语义 | 状态 |
| --- | --- | --- | --- |
| `GET` | `/molecule-assets` | 列出 Asset 摘要 | 已实现 |
| `POST` | `/molecule-assets` | 创建空 Asset | 已实现 |
| `GET` | `/molecule-assets/{assetId}` | 读取 Asset 摘要 | 已实现 |
| `GET` | `/molecule-assets/{assetId}/revisions` | 列出历史 Revision | 已实现 |
| `GET` | `/molecule-revisions/{revisionId}` | 读取一个完整不可变快照 | 已实现 |
| `POST` | `/molecule-assets/{assetId}/revisions` | 保存新 Revision，并做 head/version CAS | 已实现 |

创建 Asset 请求：

```json
{
  "name": "Water"
}
```

保存 Revision 请求：

```json
{
  "parentRevisionId": "rev_previous",
  "expectedHeadRevisionId": "rev_previous",
  "expectedVersion": 2,
  "molecule": {
    "atoms": [],
    "bonds": []
  },
  "contentHash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "topologyFingerprint": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
  "metadata": {
    "derivedFromJobId": "job_01...",
    "derivedFromArtifactId": "artifact_01..."
  }
}
```

成功返回 `MoleculeRevisionV1`。客户端提交的摘要用于尽早发现序列化漂移，服务端必须复算；响应中的摘要才是权威值。刷新 `/molecule-assets` 后可观察推进后的 `headRevisionId`。错误语义至少包括：

- `404`：Asset 或指定 Revision 不存在；
- `409 head_conflict`：当前 head/version 与 expected 值不同；响应携带当前 Asset 摘要，但不回显未授权结构；
- `422 invalid_molecule`：结构、稳定 ID、父版本归属或客户端摘要无效；
- `500`：事务失败，客户端不得把本地工作副本标为已保存。

## Job 排队冻结

从已保存分子启动计算时，客户端提交 Revision ID，而不是提交 Asset ID 或“当前 head”：

```json
{
  "inputName": "structure",
  "sourceKind": "molecule_revision",
  "moleculeRevisionId": "rev_01..."
}
```

排队 service 在 create → bind → queue 的同一事务中：

1. 按 ID 读取 Revision，不再解析 Asset 的当前 head。
2. 要求 Revision 有服务端生成的 `contentHash`，并复算或按完整性策略验证 `structure_json` 与摘要一致。
3. 校验目标端口接受 `molecule_revision` 和 RetainMol 规范结构格式。
4. 写入 `JobInputBinding` 的 `moleculeRevisionId` 与 `contentSha256`，再将 Job 转为 `queued`。

Job 进入 `queued` 后，Asset 改名、head 前进、工作副本继续编辑或 Workflow 改线，都不能改变该 Job 的输入。runner 只按 Binding 的 Revision ID 读取快照，并在执行前比对摘要；不得回退解析 Asset head，也不得把 Revision 原地转换成另一个 Revision。

当前 xTB 端口契约已接受 literal/Revision/Artifact；Revision 路径会在排队时冻结摘要，并由 runner 在执行前重新校验结构内容。

## 兼容边界

兼容只保证旧数据可读和旧请求有明确退场路径，不允许 legacy 语义污染新写路径：

| 边界 | 兼容规则 |
| --- | --- |
| schema 2 Asset/Revision 行 | schema 5 保留 ID 和原始 JSON并物化 head；schema 6 为 Revision metadata 补 `{}`；旧结构按迁移规则回填摘要 |
| `metadata.request.molecule` | 仅供历史 Job 重放/查看；不自动合并为 Asset，不反向覆盖 Revision |
| literal molecule Binding | 兼容既有 Job；新 UI 从已保存分子提交时优先使用 `molecule_revision` |
| Artifact 结构 | 仍可作为计算输入或导入来源；导入为可编辑分子时显式创建新 Asset/Revision，并记录来源 Artifact ID |
| API DTO | 接受既定 camelCase；SQLite 列名和本机路径不暴露给客户端 |
| 摘要算法 | 算法或规范化规则变化必须提升内容 schema 版本；不能用新算法重写旧 Revision 的摘要 |

legacy literal/metadata 回退仍存在，但读取优先级必须是“已冻结 Binding 优先，legacy 仅在 Binding 缺失时使用”。移除回退需要独立发布说明、历史数据测试和使用量证据。

## 本阶段验收

- schema 6 物化 head/version、双摘要和来源 metadata，service 对新 Revision 强制规范化与摘要校验，既有 migration 不重写。
- 服务端与前端对同一规范化测试向量计算出相同 `contentHash` 和 `topologyFingerprint`。
- 保存成功时 Revision 插入与 head CAS 同时提交；冲突时两者都不提交。
- 已保存 Revision 的结构、摘要、父版本和归属不能通过公开 repository/service/API 修改。
- `molecule_revision` Binding 在 Job 排队前冻结 ID 和摘要，排队后切换 Asset head 不改变 runner 输入。
- schema 2 来源数据、历史 metadata Job 和 Artifact 输入仍可按兼容规则读取；迁移只追加 schema 5/6 字段和保护约束，不重写既有迁移脚本。
