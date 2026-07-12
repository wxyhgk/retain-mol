# 人工检查用分子

此目录只保存能够复现编辑问题的最小分子文件，支持 `SDF`、`MOL` 和 `XYZ`。

## 命名

```text
QA-编号-简短用途.扩展名
```

例如：

```text
QA-001-asymmetric-ring-fuse.sdf
QA-003-large-molecule.xyz
```

每个文件必须在 `../known-issues.csv` 中有对应记录。不要放仅用于展示、无法关联问题
或体积过大的计算结果；必要时保留生成输入和最小复现结构即可。
