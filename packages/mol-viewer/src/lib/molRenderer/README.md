# Renderer 分层

```text
React MolViewer
    ↓
useRendererBinding
    ↓
MolRenderer                 场景、相机、交互和渲染循环
    ↓
MoleculeSceneLayer          多对象 group 与 renderer 生命周期
    ↓
MoleculeRenderer            单分子编排与键渲染
    ├── MoleculeAtomRenderer       原子、选择、描边和 hover
    ├── moleculeObjectVisualState  active/inactive opacity
    └── moleculeStylePrimitives    profile 材质解析
```

- `MolRenderer` 不持有每个场景对象的 renderer/group map。
- `MoleculeRenderer` 不直接创建原子球体或 selection visual。
- 对象透明度必须通过 `moleculeObjectVisualState` 应用，不能在 scene orchestrator 中覆盖所有材质参数。
- atom、bond 和 decoration mesh 必须保留正确的 picking identity。
