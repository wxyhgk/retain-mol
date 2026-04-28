我看完了。你现在的核心问题不是功能少，而是 **RetainMol 已经从“单分子编辑器”变成了“多对象 3D 化学场景编辑器”**，但底层数据模型和交互模型还停留在单分子时代。

你现在已经有 3D 编辑、PubChem/文件导入、xTB 优化、Gaussian 输入生成、右侧面板、多分子场景等功能；但架构里 `molecule` 是当前活跃对象镜像，`sceneObjects[]` 又是真实数据，导致同一份分子数据被维护两遍，这是最危险的混乱源头。

## 最关键的判断

你现在不要急着继续加功能，应该先把概念拆清楚：

```txt
Workspace / Project
└── Scene
    ├── SceneObject 1: molecule
    ├── SceneObject 2: molecule
    ├── SceneObject 3: curve / result / annotation
    └── ...
```

也就是说：

* **molecule 不应该是全局核心状态**
* **sceneObjects 才应该是唯一真实数据源**
* 当前正在编辑哪个分子，应该只是一个 `activeObjectId`
* 当前选中哪些原子/键，应该带上 `objectId`

## 我建议你立刻改成这个模型

```ts
type MoleculeData = {
  atoms: Atom[];
  bonds: Bond[];
};

type SceneObject = {
  id: string;
  type: "molecule";
  name: string;
  molecule: MoleculeData;

  visible: boolean;
  locked: boolean;
  opacity?: number;

  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
};

type SelectionState = {
  objectId: string | null;
  atomIds: string[];
  bondIds: string[];
};

type SceneState = {
  objectsById: Record<string, SceneObject>;
  objectOrder: string[];
  activeObjectId: string | null;
  selection: SelectionState;
};
```

然后彻底取消这个东西：

```ts
molecule: Molecule
```

不要再让它和 `sceneObjects[]` 同步。

需要当前分子的时候，用 selector 派生：

```ts
const activeMolecule = useMoleculeStore(state => {
  const id = state.activeObjectId;
  if (!id) return null;
  return state.objectsById[id]?.molecule ?? null;
});
```

这样你的状态从：

```txt
sceneObjects 是真的
molecule 也是一份镜像
每次改原子要同步两边
```

变成：

```txt
sceneObjects 是唯一真相
activeObjectId 只是指针
activeMolecule 是派生结果
```

这一步会直接解决你现在 50% 的混乱。

## 多分子交互应该这样定规则

你现在用户感觉乱，是因为没有明确告诉用户：

> 我现在是在编辑整个场景，还是在编辑某一个分子？

我建议设计成类似 Blender / Figma 的两层模式：

```txt
场景模式：选择、移动、隐藏、锁定、重命名整个分子对象
编辑模式：编辑当前活跃分子的原子、键、角度、二面角
```

用户体验可以这样：

```txt
单击分子对象      → 选中这个分子对象
双击分子对象      → 进入该分子的编辑模式
Esc              → 回到场景模式
右侧 Scene Tab    → 管理所有对象
右侧 Geometry Tab → 只显示当前活跃分子的几何信息
```

视觉上：

```txt
活跃分子：正常显示
非活跃分子：半透明
锁定分子：灰色 / 不可点选
隐藏分子：不渲染
```

这样用户会马上明白：
**我不是在一个巨大混乱分子里编辑，而是在一个场景里编辑某个对象。**

## Zustand 不一定要拆成多个 store，但要拆 slice

你现在单 `moleculeStore` 太臃肿，不一定马上拆成很多 store。更稳妥的是先拆 slice：

```txt
moleculeStore
├── sceneSlice        场景对象、activeObjectId
├── selectionSlice    原子/键/对象选择
├── toolSlice         当前工具、工具参数
├── measurementSlice  测量状态
├── calculationSlice  xTB / Gaussian / 结果
├── uiSlice           面板、主题、弹窗
└── historySlice      Undo / Redo
```

外面仍然可以是一个 Zustand store，但内部逻辑分区清楚。

最重要的是：
**场景数据、选择状态、工具状态、UI 状态、计算任务状态不要混在同一堆 action 里。**

## 渲染层也要遵守一个规则

Three.js 里面的 `MoleculeRenderer` 不应该拥有真实数据。

它只应该是：

```txt
Zustand 状态变化
        ↓
MolRenderer 同步 sceneObjects
        ↓
每个 MoleculeRenderer 更新自己的 mesh / line / label
```

也就是：

```txt
数据真相：Zustand
渲染缓存：Three.js
```

不要反过来让 Three.js 影响业务状态，除非是交互事件，比如点击、拖拽、旋转 gizmo，这些事件最终也应该变成 store action。

## 我建议你的重构顺序

第一步，先做这个：

```txt
删除 molecule 镜像
改成 activeObjectId + selector
```

第二步，把所有 action 改成显式带 `objectId`：

```ts
addAtom(objectId, atom)
updateAtomPosition(objectId, atomId, position)
deleteBond(objectId, bondId)
replaceElement(objectId, atomId, element)
```

第三步，统一 selection：

```ts
selection = {
  objectId,
  atomIds,
  bondIds
}
```

第四步，再整理 UI：

```txt
Scene Tab：管对象
Geometry Tab：管当前活跃分子
Calculation Tab：默认作用于当前活跃分子
```

第五步，最后再考虑更复杂的东西，比如多分子一起优化、多对象编组、轨迹对象、计算结果对象。

## 一句话总结

你现在不要把 RetainMol 继续当成“分子编辑器”来设计了。

它应该被设计成：

```txt
一个 3D 化学场景编辑器
其中 molecule 只是 scene object 的一种
```

只要你把这个概念立住，`molecule` / `sceneObjects` 双状态、store 臃肿、多分子体验混乱这三个问题会同时变得清楚。
