# 多 agent 审查报告（2026-07-26）

> **修复状态（同日）**：全部 28 条已修复并经独立验收 agent 逐条重跑复现确认（26 条经修复流水线 fixed-verified，`engines/xtb/contracts.py` 边界校验一条单独补齐，两条同根合并处理）。每条修复配有 `*.regression.test.ts` / `*_regression.py` 回归测试。最终状态：前端 vitest 717/717、后端 pytest 199 全绿，typecheck 与包边界检查通过，mol-viewer 已重新 build。

6 维度并行审查 + 逐条对抗性验证：**28 条站住**（confirmed 24 / plausible 4），2 条被证伪剔除。


## [CRITICAL / confirmed] 在凯库勒单键上并苯环产生五价碳：键级交替方向只看目标键键级，不看共享原子已有的双键

**位置**：`packages/mol-viewer/src/lib/builder/editing/fragment/ringFuseKekule.ts:23`（维度：ring-fuse）

**缺陷**：buildRingFuseOrderOverride 用 `let order: 1|2 = targetBondOrder === 2 ? 1 : 2` 决定新环路径的键级交替起点：目标键是单键时，紧邻两个共享原子的新键一律被赋为双键。但共享原子在原有芳环里已各有一个双键（凯库勒交替的必然结果），于是共享原子最终带两个双键 + 一个单键 = 键级和 5。整条防线全部漏过：(1) ringFuseRules.ts:53 的 validateRingFuseSharedValence 硬编码 `valenceUsed - removableHydrogen + 1`，假设新增连接是单键（实际 kekulé override 给的是双键，应 +2）；(2) ringFuseTopology.ts:165 的最终检查用 degree()（只数键的条数，3 ≤ maxBonds 4 通过），不算键级和；(3) ringFuse.ts:70 在 mergeCount>0（peri/bay 合并路径）时连 validateRingFuseSharedValence 都跳过。实测：苯环笔刷点苯环的凯库勒单键 → 萘中 2 个 C 键级和为 5；对萘的全部 6 条单键逐一并环 → 每次产生 2~3 个五价碳（含桥头碳）；苯环并到环己烷 C-C 单键同样产生 2 个五价碳。对照实验：只在双键上并环（含 peri/bay 合并拼芘路径）所有 C 键级和恒为 4，证明缺陷精确定位在单键目标的交替方向选择。这直接违反『画布上分子永远化学完整』的核心不变量。

**触发**：用户选苯环笔刷，在已有苯环上点击任意一条显示为单键的 C-C 键（凯库勒表示下占环内键的一半）→ 命令成功返回萘，无任何提示；但两个桥头碳的键级和为 5（两双键+一单键）。几何芳香判据（键长均匀 1.39Å）会把环画成芳香圈，画布上暂时看不出异常；一旦导出 SDF/MOL 得到五价碳的非法分子，Shift+点键循环键级、后续以该原子价态为依据的补 H/生长逻辑（剩余价位算出负数）全部基于坏数据。继续用蒽/菲路径铺环系时坏键级持续累积。

**证据**：ringFuseKekule.ts:23 `let order: 1 | 2 = targetBondOrder === 2 ? 1 : 2`（只依赖 targetBondOrder）→ 路径首尾键=2 → 共享原子已有的环内双键未被重排（remapAndMergeBonds 的 orderByExistingId 只改新环路径途经的旧键，不动旧环其余键）。校验链：ringFuseRules.ts:53 `valenceUsed - removableHydrogen + 1`（低估 1）→ ringFuseTopology.ts:165 `degree(finalBonds, atom.id) > maxBonds`（数条数不数键级）→ 全部放行。实测输出：`pentavalent C count: 2 [5, 5]`（苯+苯单键）；萘的 6 条单键 fuse 全部 ok 且各产生 2-3 个 valence-5 C。

**验证**：写了最小 vitest 复现（src/__reviewtmp__/verify_ring_fuse_0.test.ts，跑完已删）实测：苯环 fuse 到独立苯环的单键 → 命令 ok，两个桥头碳键级和均为 5；双键对照组 0 个五价碳；萘的 6 条单键逐一 fuse 全部 ok 且各产生 2~3 个五价碳；苯环 fuse 到环己烷 C-C 键产生 2 个五价碳。防线逐条核实：ringFuseKekule.ts:23 只看 targetBondOrder 定交替起点（单键→路径首尾键=2，旧环双键不重排，remapAndMergeBonds 的 orderByExistingId 只覆盖新环路径途经的旧键）；ringFuseRules.ts:53 finalValence = valenceUsed - removableH + 1 硬编码 +1（实际新增双键应 +2，苯桥头 2+1+1-1+1=4≤4 放行）；ringFuseTopology.ts:165 用 degree() 数键条数（3≤maxBonds 4 放行）；ringFuse.ts:70 mergeCount>0 时跳过 valence 检查。调用链 bondClickCommands.ts → fragmentCommands.ts runFuseFragmentOnBondCommand 原样接受结果，无键级前置过滤、无事后重凯库勒化；resolveRingFuseTarget 只挡 X-H 键，单键可点。valenceUsed（lib/builder/valence.ts:17）按键级求和，下游补 H/生长逻辑确实会读到 5。


## [CRITICAL / confirmed] STANDARD_BOND_LENGTHS 五个 X–H 键名未按字母序，查表永远 miss，全部 N–H/O–H/S–H/P–H/Si–H 键长退化为共价半径估算

**位置**：`packages/mol-viewer/src/config/geometry.config.ts:147`（维度：geometry-math）

**缺陷**：表注释约定 key 'A/B 按字母序排列'，两个查表点（geometry.config.ts:174 lookupBondLengthByOrder 与 vsepr.ts:29 calcBondLength）都先 [sym1,sym2].sort() 再拼 key，因此 O/H 生成 'H-O'、N/H 生成 'H-N'。但表里写的是 'N-H':1.010、'O-H':0.960、'S-H':1.340、'P-H':1.420、'Si-H':1.480（147/151/156/158/159 行）——'H' 字母序在 N/O/S/P/Si 之前，这五个 key 永远查不中，静默落入共价半径 fallback：O–H 得 (0.73+0.31)*1.08=1.1232Å（+17%），N–H 得 1.1448Å（+13%）。已运行时验证：lookupBondLengthByOrder('O','H',1) 返回 1.1232 而非 0.96，calcBondLength('N','H') 返回 1.1448 而非 1.01。污染面：所有自动补 H 落点（calcAddAtomOnExisting/autoAddHydrogens）、GeometryRelaxer 的键长约束目标、cycleBondLength 的档位键长、片段库中经此计算的 X–H。

**触发**：用户双击空白画布放一个 O（价态完整模型自动补成 H₂O）→ 两条 O–H 键按 1.123Å 放置；用测量工具量 O–H 显示 1.12 而非标准 0.96。画 NH₃ 同理 N–H=1.145。所有含 N–H/O–H/S–H 的分子（水、氨、胺、醇、酸、硫醇）键长系统性偏长 10~17%，且 2D→3D 展开动画的键长约束也收敛到这些错误值。

**证据**：geometry.config.ts:173-174 `const [a, b] = [sym1, sym2].sort(); const exact = STANDARD_BOND_LENGTHS[`${a}${ORDER_SEP[order]}${b}`]` vs 表项 `'O-H': 0.960`；vitest 实测 lookupBondLengthByOrder('O','H',1) === 1.1232000000000002

**验证**：Vitest 复现实测：lookupBondLengthByOrder('O','H',1)=1.1232（非 0.96）、('N','H',1)=1.1448（非 1.01）、('S','H',1)=1.4688、('P','H',1)=1.4904、('Si','H',1)=1.5336，对照组 ('C','H',1)=1.09 命中表。追了两个查表点：geometry.config.ts:173 与 vsepr.ts:29 都先 sort 再拼 key，['O','H'].sort()→'H-O'，表里写 'O-H'，五个 X–H key（H 字母序在 N/O/S/P/Si 前）永远 miss，静默走共价半径 fallback (r1+r2)*1.08。无任何上游 guard——表本身违反自己注释的字母序约定，所有调用方（calcAddAtomOnExisting/autoAddHydrogens/relax.ts resolveBondLength）都吃到错误值。

**验证补充**：证据链完整无懈可击。水/氨/醇/胺/硫醇等最常见分子的 X–H 键长系统性偏长 10~17% 且无报错，污染面覆盖自动补 H、松弛器键长目标、测量显示。修复即把五个 key 改成 'H-N'/'H-O'/'H-P'/'H-S'/'H-Si'。


## [MAJOR / confirmed] 缺电子元素（B/Al 等）设负电荷时价态公式反向，BH3 设 -1 变成 BH2⁻ 而非 BH4⁻

**位置**：`packages/mol-viewer/src/config/elements.config.ts:120`（维度：editing-ops）

**缺陷**：effectiveMaxBonds 用 `chargeShift = hasLonePair ? charge : -Math.abs(charge)` 计算带电价态。对无孤对电子的元素（valenceElectrons <= maxBonds，如 B、Al、C），任何符号的电荷都按 -|charge| 削减成键数。这对阳离子（C⁺→3）碰巧正确，但对阴离子完全错误：B⁻ 得到一个电子后应形成 4 键（硼氢阴离子 BH4⁻、硼酸酯 BR4⁻ 是标准化学），公式却给出 3-1=2。resaturateAtom（atomOps.ts:134）用 targetValence→maxValence→effectiveMaxBonds 读到 2，diff = 2-3 = -1，走删 H 分支。已用真实代码执行验证：BH3 设 charge=-1 后 resaturateAtom 返回 B,H,H（2 键），而化学正确结果是补 1 个 H 得 BH4⁻。Al⁻、Ga⁻ 同理。注意用户工作流大量涉及硼化合物（硼烷 UFF 优化管线），此 bug 命中高频场景。

**触发**：用户搭好 BH3（双击空白放 B 自动饱和成 3 个 H），右键 B 原子在上下文菜单里把电荷设为 -1（想得到硼氢阴离子 BH4⁻）→ 画布上反而被删掉一个 H，变成带 -1 电荷、只有 2 个 H 的 BH2⁻，且无任何提示。化学上完全错误的结构随后会被导出/送入计算任务。

**证据**：elements.config.ts:117-122: `const hasLonePair = el.valenceElectrons > el.maxBonds; const chargeShift = hasLonePair ? charge : -Math.abs(charge); return Math.max(0, el.maxBonds + chargeShift - Math.abs(radical))`。调用链：AtomContextMenu.tsx → commitContextAtomCharge → store.setAtomCharge → runSetAtomChargeCommand (atomPropertyCommands.ts:15) → resaturateAtom (atomOps.ts:134) → targetValence (valence.ts:43，charge≠0 时直接返回 maxValence) → effectiveMaxBonds。实测输出：`BH3 + charge -1 => B H count: 2 atoms: B,H,H`（对照 NH3 设 +1 正确得 NH4⁺）。

**验证**：写临时 vitest 复现并执行：runSetAtomChargeCommand(BH3, B, -1) 输出 atoms B,H,H（H 数 2），对照组 NH3 设 +1 正确得 4 个 H。代码路径核实：effectiveMaxBonds('B',-1) 中 hasLonePair=false（valenceElectrons 3 == maxBonds 3）→ chargeShift=-1 → 返回 2；targetValence 因 charge≠0 直接走 maxValence=2；resaturateAtom diff=2-3=-1 走删 H 分支。调用链 AtomContextMenu → commitContextAtomCharge（atomContextMenuEffects.ts:55-61）→ setAtomCharge → runSetAtomChargeCommand 无任何 guard 拦截。

**验证补充**：补充一点发现未提及的上下文：elements.config.ts:115 有作者留的注释，明确承认『硼负离子（BH₄⁻ 应为 4 键）等电子缺陷体系此启发式偏保守』——即这是文档化的已知局限。但实际行为比注释声称的更糟：『偏保守』暗示停在 3 键不补第 4 个 H，而实测是主动删掉一个 H 变成 2 键（BH2⁻），注释与行为不符。鉴于用户工作流重度涉及硼化合物（硼烷 UFF 优化管线），维持 major。


## [MAJOR / confirmed] removeExcessHydrogens 对芳香键产生的 0.5 分数超额用 Math.ceil，Shift+点苯环键把两端的环 H 都删掉

**位置**：`packages/mol-viewer/src/lib/builder/editing/atomOps.ts:158`（维度：editing-ops）

**缺陷**：cycleBondLength 的环内分支（bondOps.ts:161-164）把被点的键升级键级并剥掉 aromatic 标记，然后对两端原子调 removeExcessHydrogens。SDF 导入的苯环每条环键都带 aromatic:true（molFormat.ts:43），bondValence 计为 1.5（valence.ts:5-7）。被点的键从 aromatic(1.5) 变成 order 2 后，环 C 的 valenceUsed = 2 + 1.5(另一条环键仍 aromatic) + 1(H) = 4.5，excess = 0.5。removeExcessHydrogens 用 `slice(0, Math.ceil(excess))` 把 0.5 向上取整为 1，删掉该 C 唯一的环 H；另一端同样。这个 0.5 纯粹是『局部化键与 aromatic 键混排』的簿记残差（与 autoAddHydrogens 用 floor(x+1e-6) 的保守取整不对称），据此删除整个 H 使碳变成 3.5 价的残缺原子。已执行验证：苯 H 数 6 → 4。

**触发**：用户导入苯的 SDF（所有环键带 aromatic 标记），Shift+点击任一环键想把它切成定域双键 → 除了键级变化外，该键两端的两个环氢被静默删除，苯变成 C6H4 残缺结构；hint 只显示『环内键：仅切换键级，几何不变』，与实际删原子的行为矛盾。

**证据**：atomOps.ts:156-158: `const excess = valenceUsed(mol, atomId) - targetValence(atom); if (excess <= 0) return mol; const hs = hNeighborsOf(mol, atomId).slice(0, Math.ceil(excess))`。触发链：Shift+点键 → bondClickRoute.ts:24-26 → runBondClickCommand → runCycleBondLengthCommand → cycleBondLength (bondOps.ts:163 环内分支 `removeExcessHydrogens(removeExcessHydrogens(withOrder, a1.id), a2.id)`)。实测输出：`order -> 2 moved false H before 6 H after 4`。

**验证**：写临时 vitest 复现并执行：构造 6C 六元环、每条环键 order 1 + aromatic:true、每个 C 带 1 个 H，调 cycleBondLength 于任一环键 → 输出 order->2, moved=false, H 6→4，两端环 H 均被删。机制核实：withOrder 剥掉 aromatic 设 order 2 后，环 C 的 valenceUsed = 2 + 1.5(另一条仍 aromatic 的环键) + 1(H) = 4.5，targetValence(C)=4，excess=0.5，removeExcessHydrogens 用 Math.ceil(0.5)=1 删掉唯一环 H（atomOps.ts:158）。并核实真实 UI 链无拦截：Shift+点键 → routeBondClickForIntent 返回 cycleLength（bondClickRoute.ts:24-26）→ runCycleBondLengthCommand（bondGeometryCommands.ts:6-13）是纯透传薄包装，无环级去芳香化预处理。molFormat.ts:39-43 确认 SDF 导入的芳香键带 aromatic:true，bondValence（valence.ts:5-7）对 aromatic 计 1.5。

**验证补充**：Kekulé 式导入（交替 1/2 键级 + aromatic 标记）同样命中：点 order-2 键升到 3 时 excess=1.5，ceil=2 但每个 C 只有 1 个 H，仍删光环 H。发现描述准确。


## [MAJOR / confirmed] sp3 环并 sp3 环几何崩坏：只尝试 ±axis2 四种镜像构型、不绕共享键滚转对齐四面体空位，保留的 H 嵌进新环（最近 0.80Å）

**位置**：`packages/mol-viewer/src/lib/builder/editing/fragment/ringFusePlacement.ts:49`（维度：ring-fuse）

**缺陷**：planRingFusePlacement 的方向探索只有 4 个候选：端点交换 × preferredTargetAxis2 取反（ringFusePlacement.ts:49-53），全部把模板环体放在目标键的平面内两侧，从不绕 axis1（共享键）滚转。这套构型对平面芳环正确，但对 sp3 目标原子（CH2）是错的：T1/T2 各删一个 H 后，新环邻位碳应落在被删 H 的四面体方向上；实际落点却在两个 H 方向的角平分线附近（实测 H-C(new)-H 夹角关系显示新碳与两个 H 各距 1.288Å，对应 C-C-H 夹角仅 ~57°，理想四面体应为 ~2.16Å/109.5°）。配套的 selectHydrogensToRemove（ringFuseTopology.ts:57-76）按『离新环质心最近』选 H 也无法补救——实测 T1 的两个 H 到最近新环碳的距离完全相同（1.288Å），删哪个都留下一个 H 卡在新环碳的成键半径内。四个候选按对称性得分相同，clash 评分无法区分，detectMergeAtoms 的 fuseClashEps=0.7Å 也拦不住（0.799 > 0.7 恰好漏过）。

**触发**：用户选环己烷笔刷，点击已有环己烷（或环戊烷）的任意 C-C 键想搭十氢萘/氢化茚满骨架 → 命令成功，但两个桥头碳上保留的 H 与新环碳仅相距 0.80~1.29Å：画布上氢球嵌在新环碳球内部/键穿模，肉眼可见的原子重叠。由于本项目『几何是真相』且拖原子不改拓扑，这个坏几何不会被任何后续簿记修正，用户必须手工逐原子拖开或撤销重来；若直接送 xtb/psi4 优化则以近重叠构型为初值。

**证据**：实测非成键最近距离：环己烷并环己烷（十氢萘）→ H(old)-C(new) 1.288Å ×2、H-H 1.412Å ×2；环戊烷并环戊烷 → H-C 1.310Å；环己烷并环戊烷 → H-C 0.799Å（氢几乎嵌在碳内部，正常非键 H···C ≥ 2.5Å）。对照：芳环-芳环全部组合最差仅 1.69Å（菲 bay 区 H-H，属正常）。调用链：buildRingFuseCandidate(ringFusePlacement.ts:67) → rotationBetweenOrthonormalBases 只做基变换无滚转采样 → selectHydrogensToRemove(ringFuseTopology.ts:69 `sub(newCentroid, [h.x,h.y,h.z])` 质心距离判据) → remapAndMergeBonds 的 clash 检查阈值 0.7Å 放行。

**验证**：同一复现文件实测非成键最近距离：环己烷并环己烷 → 3/6 条键为 H-C 1.288 Å（另 3 条为 H-H 1.780 Å）；环戊烷并环戊烷 → H-C 1.310 Å；环己烷并到环戊烷键 → H-C 0.799 Å（恰好高于 fuseClashEps=0.7 放行，与发现引用的 0.799 精确一致）；对照苯并苯 → 2.153 Å 正常。代码核实：planRingFusePlacement（ringFusePlacement.ts:43-53）只枚举端点交换 × ±preferredTargetAxis2 四个共面镜像候选，rotationBetweenOrthonormalBases 无绕共享键（axis1）的滚转采样，sp3 目标的四面体空位方向确实不在候选集内；selectHydrogensToRemove 按新环质心距离选 H，镜像对称下无法避开留下的 H。detectMergeAtoms:38 的 clash 检查直接跳过已有 H 原子，remapAndMergeBonds:112-116 新重原子对旧 H 的检查阈值 0.7 也拦不住 0.799/1.288。命令成功返回、无提示，坏几何不会被后续簿记修正——失败路径完整。

**验证补充**：证据中一处数字不准：环己烷并环己烷的 H-H 距离实测为 1.780 Å ×2（另 3 条键），不是 1.412 Å ×2；关键数字（H-C 1.288/1.310/0.799）与发现完全吻合，结论不受影响。另补充：H(old)-C(new) 1.288 Å 的组合能通过 clash 检查不只是阈值险胜——detectMergeAtoms 的碰撞检查根本跳过已有 H 原子，只有 remapAndMergeBonds 阶段新重原子对旧 H 有 0.7 阈值检查。


## [MAJOR / confirmed] setAtomCharge/setAtomRadical 删 H 后 selectedAtomIds 残留悬空 ID

**位置**：`packages/mol-viewer/src/store/slices/atomEditActions.ts:118`（维度：store-undo）

**缺陷**：setAtomCharge/setAtomRadical 经 applyActiveMoleculeEdit 落盘，而 applyActiveMoleculeEdit（helpers.ts:177-190）只 patch 分子、完全不同步选择集。但 runSetAtomChargeCommand（atomPropertyCommands.ts:26）会调 resaturateAtom（atomOps.ts:139-147），负电荷/自由基使目标价态下降时会真实删除 H 原子及其键。删原子的其他路径（removeAtom/removeAtoms/removeBond）都走 applyActiveMoleculeEditWithSelection 做选择剪枝，唯独这两条删 H 路径漏了。已用 vitest 实测证实：H2O 全选后 setAtomCharge(O,-1)，原子剩 2 个而 selectedAtomIds 中残留 1 个死 ID。

**触发**：1) 框选整个 H2O（O+2H 共 3 个原子入选）；2) 右键点 O——selectContextAtomIfNeeded（atomContextMenuEffects.ts:23-29）因 O 已在选择集中而保留整个多选；3) 菜单里把形式电荷设为 −1 → resaturateAtom 删掉一个 H；4) 屏幕上只剩 2 个原子高亮，但 selectedAtomIds 仍是 3 个 ID；此时按成键快捷键（appEditEffects.ts:44 bondSelectedAtoms）→ resolveBondSelectedAtomsDecision 收到 3 个 id，报『请先选中恰好两个原子』——用户明明只看到 2 个选中原子，操作被莫名拒绝。

**证据**：atomEditActions.ts:118-130 `setAtomCharge: … applyActiveMoleculeEdit(s, (mol) => runSetAtomChargeCommand(mol, atomId, charge))` → atomPropertyCommands.ts:26 `resaturateAtom(withCharge, atomId)` → atomOps.ts:143-147 `atoms: mol.atoms.filter(a => !remove.has(a.id))`。对照：removeAtoms 用 runRemoveAtomsCommand 内部过滤 selection（atomRemovalCommands.ts:32-40）。实测：dangling.length === 1（期望 0）。

**验证**：写临时 vitest 实测复现：H2O 全选后 setAtomCharge(O,-1) → atoms=2、selectedAtomIds=3、dangling=1，随后 bondSelectedAtoms() 返回 {ok:false, reason:'请先选中恰好两个原子'}；setAtomRadical 同路径 dangling=1。追完整调用链：AtomContextMenu.tsx:41 的 selectContextAtomIfNeeded 在点击原子已入选时保留多选，:108 commitContextAtomCharge 落到 store setAtomCharge → applyActiveMoleculeEdit（helpers.ts:177-190 不碰选择集）→ resaturateAtom（atomOps.ts:139-147 真删 H）。全库仅有的选择剪枝在 moleculeStore.ts afterTimeTravel（只在 undo/redo 触发）和各 *WithSelection 路径，这两条 action 都不走；integrity.ts 只清 editorStore。UI 场景真实可达，major 恰当。

**验证补充**：补充：SelectionInspector 面板用 orderedExisting 过滤后显示 2 个选中原子，与 store 里 3 个 ID 形成'面板显示与快捷键行为不一致'，与发现描述一致。


## [MAJOR / confirmed] InteractionHandler 完全不过滤 pointerId：第二根手指覆盖进行中手势，atom-drag 事务永久悬挂、undo 死亡、后续编辑连环抛异常

**位置**：`packages/mol-viewer/src/lib/molRenderer/InteractionHandler.ts:256`（维度：interaction）

**缺陷**：handlePointerDown（L256）只检查 e.button!==0，既不检查 this._gesture 是否 idle，也不比对 _activePointerId；handlePointerMove（L305）和 handlePointerUp（L426）同样不过滤 pointerId。触摸屏上第二根手指的 pointerdown（touch 的 button=0）会直接执行 `this._gesture = beginBondPress/beginAtomPress(...)`（L264/L276/L288），把第一根手指正在进行的 atom-drag 手势无声覆盖——不会调用 onAtomDragEnd/onAtomDragCancel，也不走 resetInteractionGesture。此时 editSessionFactory.createAtomDragEditSession 已经 beginTransaction('atom-drag')（editSessionFactory.ts L33），zundo temporal 处于 paused；AtomDragCommandSession.start 的重入保护（moveCommands.ts L78 `if (this.snapshot) return`）使旧 snapshot 永远留存，end/cancel 再也没人调用。之后任何 builder 编辑命令走 EditUseCaseExecutor → runTransaction('builder:edit-command') → transactionController.begin（transactionController.ts L81-83）因 owner 不匹配抛出「事务已由 atom-drag 持有」。更糟的是该异常发生在 handlePointerUp 的 onBondDragEnd 回调内（L451），抛出后 resetInteractionGesture（L459）不再执行：gesture 卡在 bond-drag、ghost 线残留、controls.enabled 恒为 false（相机锁死）、光标卡在 crosshair，且每次后续 pointerup 都会重复抛异常。undo 历史从此不再记录（temporal 永久 paused），直到组件卸载或刷新页面。另一个轻量变体：第一根手指拖拽中，第二根手指在空白处轻点——pointerdown 因 hit 为空提前 return（L260），但它的 pointerup 仍进 handlePointerUp，把 gesture 判定为 atom-drag 并调用 onAtomDragEnd（L466），第一根手指的拖拽在半途被强制提交终止。

**触发**：触摸设备、构建态（brushArmed）：框选若干原子后用手指1按住一个选中原子拖动（atom-drag 事务开启）；手指2 按到任一未选中原子（canStartBondDrag 为 true）→ 手势被覆盖为 bond-press；手指2 移动后松开 → onBondDragEnd 内部 beginTransaction 抛「事务已由 atom-drag 持有」→ 键没建成、ghost 线永久残留、相机再也转不动、undo/redo 全部失效、之后每次点击生长/放置原子都静默失败（控制台连环报错），只能刷新页面恢复。

**证据**：L256 `private handlePointerDown = (e) => { if (e.button !== 0) return; ... }` 无 idle/pointerId 守卫；L276-281 无条件 `this._gesture = beginBondPress(...)`；moveCommands.ts L78 `start(){ if (this.snapshot) return; ... }`；transactionController.ts L81 `if (owner !== null && owner !== requestedOwner) throw new Error(...)`。触发链：atom-drag（owner='atom-drag' 事务开启）→ 手指2 pointerdown 覆盖 gesture → 手指2 松手 onBondDragEnd → runTransaction('builder:edit-command') → begin 抛异常 → resetInteractionGesture 永不执行。对照 MolControls.ts L121 `e.pointerId !== this.activePointerId` 有正确过滤，证明这是 InteractionHandler 独有的缺口。

**验证**：写了最小 vitest 复现（真 InteractionHandler + 真 createUndoTransactionController + 真 AtomDragCommandSession，FakeCanvas 沿用官方测试模式）并跑通，3 个测试全部按发现描述失败路径通过：(1) 手指1 在选中原子 a1 上 down+move 越过阈值 → owner='atom-drag' 事务开启、temporal.pause 调用；(2) 手指2 down 在未选中原子 b1 → handlePointerDown（L256）无 idle/pointerId 守卫，_gesture 被无声覆盖为 bond-press，onAtomDragEnd/onAtomDragCancel 均未调用；(3) move 越阈值成 bond-drag，pointerup → onBondDragEnd → controller.run('builder:edit-command') 抛「事务已由 atom-drag 持有」，异常发生在 L451 回调内，L459 resetInteractionGesture 被跳过：断言 gesture 仍为 bond-drag、controls.enabled===false、session.isActive===true、temporal.resume 从未调用、再次 pointerup 重复抛同一异常。轻量变体也复现：手指2 空白轻点的 pointerup 把手指1 的 atom-drag 判为结束，onAtomDragEnd('a1') 被强制调用、手势复位。调用链前提也核实：useRendererInteractionBinding L64-65 canDragAtom=选中集合、gestureIntentGates.ts L9-11 选中原子不允许 bond-drag（未选中允许），所以「手指1拖选中原子=atom-drag、手指2按未选中原子=bond-press」的场景成立；handleBuilderBondDragEnd → applyBondDragEndCommand → executor.execute({owner:'builder:edit-command'}) → runTransaction 的抛错链逐文件核实。对照 MolControls.ts L121/L154 确有 pointerId 过滤，InteractionHandler 独缺。

**验证补充**：两点修正：(1) 触发面仅限多指针输入（触摸/笔+触摸）——单鼠标在拖拽中按第二个键属 chorded buttons，按 Pointer Events 规范只派发 pointermove 不派发 pointerdown，桌面纯鼠标打不出第二次 handlePointerDown；(2)「只能刷新页面恢复」略夸大：同样因为 pointerdown 无守卫，之后任意新手势 down 会覆盖卡死的 bond-drag，其 pointerup 走 resetInteractionGesture 可恢复相机/光标/ghost（切工具的 cancelActiveInteraction 也能）；悬挂的 atom-drag 事务则可被下一次完整的选中原子拖拽的 session.end() 意外提交（transaction handle 仍存于闭包）。但在此之前 undo 死亡、所有 builder 编辑连环抛异常属实，恢复路径对用户完全不可见。触摸场景下仍是编辑器级故障，但因桌面鼠标免疫+存在非刷新恢复路径，critical 降为 major。


## [MAJOR / confirmed] bond-drag 松手时丢弃手势里已跟踪的 targetId、按 pointerup 坐标重新拾取：吸附预览显示成键，松手却什么都不发生

**位置**：`packages/mol-viewer/src/lib/molRenderer/InteractionHandler.ts:442`（维度：interaction）

**缺陷**：拖拽过程中 handlePointerMove 已把命中目标写入手势状态（L374-380 updateBondDragTarget(gesture, targetId, null)），并把 ghost 线吸附到目标原子、变成绿色（L379 endLocal=targetMesh.position，L410 updateLine(endLocal, true)）。注意此时 dropPosition 被清成 null。但 handlePointerUp（L442）不使用 gesture.targetId，而是用 pointerup 的 clientX/clientY 重新 pickAtomIdAt。pointerup 的坐标可以与最后一次送达的 pointermove 不同（浏览器合并 pointermove 事件后 up 携带更新的坐标；触摸抬指的 lift-jitter；快速甩动时 move 滞后于 up）。若重新拾取脱靶：validTarget=false → onBondDragEnd(sourceId, null, dropPosition=null)，resolveBondDragEndDecision（bondDragDecision.ts L46）对 dropLocal=null 返回 noop——用户明明看到绿色吸附线（拖 H 到 H 成键的预览），松手后键没有建立、也没有任何提示。反向风险同样存在：up 坐标命中一个从未在预览中出现过的原子时，会与预览不符地成键。修复方向应是提交 gesture.targetId（与预览一致），而不是在 up 时重新拾取。

**触发**：触摸屏/手写笔，构建态：从一个 H 拖出幽灵线到另一个分支的 H 上，ghost 线吸附到目标并变绿（预览「删两 H、父原子成键」）；抬起手指时指尖滚动几个像素（触摸抬指常态）使 pointerup 坐标偏出该 H 的球体 → 重新拾取为 null → 命令收到 (source, null, null) 判定 noop → 键没有建立，无任何反馈，用户以为操作成功。

**证据**：移动时 L374 `const targetId = hoveredId !== null && hoveredId !== sourceId ? hoveredId : null`、L380 `updateBondDragTarget(this._gesture, targetId, null)`（dropPosition 清空）；松手时 L442 `const targetId = this.pickAtomIdAt(e.clientX, e.clientY)` 完全无视 gesture.targetId；两者不一致时提交 (source, null, null) → bondDragDecision.ts L46 `if (!input.dropLocal) return { kind: 'noop' }`。

**验证**：写了最小 vitest 复现并跑通：真 InteractionHandler + 真实 atom meshes（src 在 (0,0,-5)、tgt 在 (1,0,-5)，保证 ghost lineStart/平面求交走完整代码路径）。拖拽中 picker.atomIdAt 返回 'tgt' → 断言 gesture.kind==='bond-drag' 且 gesture.targetId==='tgt'（L380 updateBondDragTarget 同时把 dropPosition 清为 null，已核实）；随后把 picker 切为返回 null 模拟抬指偏移 3px 脱靶，pointerup → 断言 onBondDragEnd 恰好收到 ('src', null, null)——L442 重新拾取完全无视 gesture.targetId 得到证实。再用真 resolveBondDragEndDecision 断言 (src,null,null) 返回 {kind:'noop'}（bondDragDecision.ts L46），即绿色吸附预览后静默什么都不发生。反向风险同样从代码坐实：L443 validTarget 只看重拾取结果，up 落在从未预览过的原子上会与预览不符地成键。环境前提（pointerup 坐标可晚于/异于最后送达的 pointermove：move 合并/rAF 节流、触摸抬指 jitter）是公认浏览器行为，触摸/手写笔下命中窗口真实存在。

**验证补充**：复现确认无误，修复方向（提交 gesture.targetId 与预览一致，而非 up 时重拾取）合理。severity 维持 major：桌面鼠标下悬停吸附时通常静止、脱靶窗口小，但触摸/手写笔（抬指滚动是常态）下这是高频静默失败，且存在与预览不符成键的正确性反向风险。


## [MAJOR / confirmed] _downClient 在 pointerdown 被上游路由拦截时不更新：move-object 模式下点空白清除选择永远失效

**位置**：`packages/mol-viewer/src/lib/molRenderer/InteractionHandler.ts:258`（维度：interaction）

**缺陷**：handleClick 用 movedSinceDown（L138-142，比较 click 坐标与 _downClient，≥4px 判为拖拽并吞掉 click）防止转视角误触点击。但 _downClient 只在 InteractionHandler.handlePointerDown（L258）里更新，而 useCanvasPointerRouter 的 onDown 在 container capture 阶段对 move-object 工具的所有 pointerdown、以及框选起始的 pointerdown 调用 stopImmediatePropagation（useCanvasPointerRouter.ts L211/L225），使 canvas capture 阶段的 handlePointerDown 根本收不到事件，_downClient 保持为上一次未被拦截按下时的旧坐标。click 事件本身不被路由层拦截，仍会到达 handleClick——于是 movedSinceDown 拿本次点击位置与一个无关的历史位置比较。在 move-object 模式下，routeBackgroundClickForIntent 明确规定点空白应 clearSelection（backgroundRoute.ts L15，intent.canBuild=false 且无修饰键），但只要点击位置距离陈旧 _downClient 超过 4px（几乎必然），click 就被 movedSinceDown 吞掉，clearSelection 永远不执行；且在 move-object 模式下 _downClient 永远无法更新（所有 pointerdown 都被拦截），无论重复点多少次都失效。

**触发**：选择工具下点击画布左侧一个原子（_downClient 记为该处）；切到 V（move-object）工具；在画布右侧空白处单击想清除选择 → 路由层拦截了 pointerdown，click 到达 handleClick 后与左侧旧坐标比较判为「拖拽」被吞 → 选择没有被清除；在 move-object 模式下继续点任何空白处都永远无效（除非恰好点在旧坐标 4px 内）。

**证据**：L138-142 `movedSinceDown` 依赖 `this._downClient`；L258 `this._downClient.set(e.clientX, e.clientY)` 是唯一写入点，位于会被 stopImmediatePropagation 短路的 canvas capture 监听器内；useCanvasPointerRouter.ts L211 `e.stopImmediatePropagation()`（move-object 分支，对所有 pointerdown）；backgroundRoute.ts L15 `if (!input.shiftKey && !input.altKey) return { kind: 'clearSelection' }`。

**验证**：追完整链并跑通复现。链路：useCanvasPointerRouter.ts L210-212 对 move-object 工具的所有 pointerdown 无条件 stopImmediatePropagation（在 handleTransformDown 解析目标之前），canvas capture 的 handlePointerDown 收不到事件，_downClient（InteractionHandler.ts L258 唯一写入点）保持陈旧；toolCapabilities.config 中 move-object canEdit=false → builderIntent canBuild=false → backgroundRoute.ts L15 空白点击应 clearSelection；useRendererInteractionBinding.ts L59 在 move-object 模式（非 readOnly）仍挂 onBackgroundClick，行为确属设计内。空白按下时 resolveObjectTransformTarget(null, altKey=false) 返回 null，无变换手势消费事件，click 正常到达 handleClick。已写最小 vitest 复现（真实 InteractionHandler + 假 canvas，模拟 pointerdown 被吞=canvas 监听器不被调用）：control 组正常 pointerdown 后同点 click 触发 onBackgroundClick；bug 组吞掉 pointerdown 后，(300,100)/(310,110)/(50,350) 的 click 全部被 movedSinceDown 吞掉，仅点回陈旧坐标 4px 内 (201,201) 才触发——2 个用例全过，测试文件已删。

**验证补充**：严重度 major 成立。实际比描述更广：_downClient 初始为 (0,0)，无需先在 select 模式点过原子——全新会话直接进 move-object 模式，除视口左上角 4px 内外任何空白单击都失效；且 move-object 模式下原子/键的 click 同样被同一陈旧比较任意吞放。另注意 stopImmediatePropagation 在目标解析之前无条件调用，故点空白（无变换目标）时 pointerdown 也被吞。


## [MAJOR / confirmed] 终端元素中心的 'free' 几何把 bondAngle=360° 哨兵当真实键角，新原子沿已有键方向放置、嵌入邻居原子内部

**位置**：`packages/mol-viewer/src/lib/builder/geometry/vsepr.ts:98`（维度：geometry-math）

**缺陷**：inferGeometry 对 TERMINAL_ELEMENTS（H/F/Cl/Br/I）无条件返回 'free'（geometry.config.ts:113），GEOMETRY_RULES['free'].bondAngle=360 是哨兵值。findNextBondDir（vsepr.ts:98-113）不加区分地取 cosθ=cos360°=1、sinθ≈-2.4e-16，n=1 分支算出的新键方向 = cosθ*d0+sinθ*perp ≈ d0，即与已有键完全同向。candidateDirsForGrow 的 24 个圆锥候选同样全部塌缩到 d0（axis*cos2π+ring*sin2π），uniqueDirections 去重后只剩这一个方向，clash 择优无候选可救。已运行时验证：findNextBondDir('Cl', [[1,0,0]], 'sp3') 精确返回 [1,0,0]。触发链：runSetAtomChargeCommand（atomPropertyCommands.ts:16）→ resaturateAtom → autoAddHydrogens → calcAddAtomOnExisting → findNextBondDir；Cl 电荷 +1 后 effectiveMaxBonds=1+1=2（elements.config.ts:117-122，卤素有孤对，chargeShift=+1），diff=1 触发补 H。

**触发**：用户画 CH₃Cl（放 C 自动成 CH₄，点一个 H 替换为 Cl），选中 Cl 在属性面板设电荷 +1（做质子化/氯鎓中间体）→ 系统自动补的 H 被放在 Cl→C 连线上、距碳原子仅 0.33Å，两个原子球融合嵌套，且该 H 与 C 之间无键。对 F⁺/Br⁺/I⁺ 同理。

**证据**：vitest 实测 findNextBondDir('Cl', [[1,0,0]], 'sp3') === [1,0,0]；新 H 位置 = Cl + d0*calcBondLength('Cl','H')≈1.44Å，而 C 在同一射线 1.77Å 处 → H 距 C 仅 ~0.33Å

**验证**：Vitest 复现实测：findNextBondDir('Cl',[[1,0,0]],'sp3') 返回 [1,-2.45e-16,0]，与已有键方向 dot=1 完全同向；inferGeometry('Cl',1)='free'，bondAngle=360。触发链逐环核实：atomPropertyCommands.ts:26 runSetAtomChargeCommand→resaturateAtom；valence.ts:43 targetValence 在 charge≠0 时走 maxValence→effectiveMaxBonds；elements.config.ts:117-122 Cl valenceElectrons=7>maxBonds=1→hasLonePair→+1 电荷得 2；atomOps.ts:137 diff=1→autoAddHydrogens→calcAddAtomOnExisting。candidateDirsForGrow n=1 分支的 24 个圆锥候选 axis*cos2π+ring*sin2π 全部塌缩到 d0，uniqueDirections（dot>0.999 去重）后仅剩一个方向，clash 择优无第二候选。calcBondLength('Cl','H')=1.4364（'Cl-H' 也不在表中，走 fallback），H 落在 Cl→C 射线上距 C 约 0.33Å。

**验证补充**：复现值与发现描述完全一致。findSnapBondDir 的 primary 同样用 θ=360 塌缩，无任何路径能给出合法方向。F⁺/Br⁺/I⁺ 同理；radical 设置（runSetAtomRadicalCommand 同样走 resaturateAtom）不触发此路径（radical 只减不加价位）。


## [MAJOR / confirmed] 松弛器对桥氢/桥卤中心用 'free' 几何的 360° 哨兵角，1-3 目标距离算成 0，把两个桥头原子拉到重合

**位置**：`packages/mol-viewer/src/lib/geometry/relax.ts:167`（维度：geometry-math）

**缺陷**：relax.ts:166-167 对度数 2~4 的中心原子取 cosT=cos(GEOMETRY_RULES[geom].bondAngle*DEG)，无 'free' 排除。桥氢（B₂H₆）或桥氯（Al₂Cl₆）的 H/Cl 度数为 2，inferGeometry 返回 'free'，cosT=cos360°=1（node 实测精确为 1），d13=√(la²+lb²−2·la·lb)=|la−lb|；两条桥键长相等时 d13=0 → 生成把两个桥头 B/Al 原子拉向距离 0 的角约束（line 173）。更糟的是该原子对被记入 constrained 集合（line 174），被排除在非键斥力之外——没有任何力再把它们推开。bondOps.ts 的注释明确说明 inferBonds 按距离推键会对 B₂H₆ 产生桥氢多键，即该拓扑是本产品的真实输入。GeometryRelaxer 是公共 API（public/io.ts 导出），无 target 的自由松弛模式最终坐标直接写回分子。

**触发**：用户导入乙硼烷 B₂H₆ 的 2D 结构（推键产生 B–H–B 桥）→ 触发 2D→3D 展开动画 → 每帧角约束以 k=0.55 把两个硼原子拉向重合，动画全程可见两个 B 塌缩粘连、整个分子揉皱抖动；有 target 时中间帧持续畸形，走公共 API 自由松弛（无 target）时塌缩坐标即最终落盘结果。Al₂Cl₆ 等桥卤结构同理。

**证据**：relax.ts:166-173 `const geom = inferGeometry(centerSymbol, deg, hyb); const cosT = Math.cos(GEOMETRY_RULES[geom].bondAngle * DEG); ... d13 = Math.sqrt(na.len*na.len + nb.len*nb.len - 2*na.len*nb.len*cosT)`，'free'.bondAngle=360 → cosT=1 → d13=|la−lb|=0；line 174 `constrained.add(key(na.j, nb.j))` 同时豁免了斥力

**验证**：Vitest 复现实测：构造 B1–Hb–B2 桥氢分子（无 B–B 直接键）喂给 GeometryRelaxer，内部 angleCons 生成 {i:0,j:1,d:0,k:0.55}——d13 目标距离恰为 0（inferGeometry('H',2)='free'，cos(360°)=1，d13=|1.242-1.242|=0）；跑 300 步后 B–B 距离 = 4.3e-19，两个硼原子完全重合。relax.ts:174 同时把该原子对记入 constrained 集合，line 182 非键斥力循环跳过它们，确无任何力推开。前提拓扑核实：bondOps.ts:60 注释原文承认 'inferBonds 按距离推键，乙硼烷 B₂H₆ 这类结构就会产生' 桥氢多键，即真实产品输入；GeometryRelaxer 经 public/io.ts 导出且被 apps/retainmol moleculeAnimation.ts 消费。

**验证补充**：复现比发现描述更彻底——300 步后 B–B 塌缩到 4e-19（数值上完全重合）。真实 B₂H₆ 若 inferBonds 同时推出 B–B 键（1.77Å 在共价阈值内），bondK=1.0 会与两条 d=0 角约束（各 k=0.55）拔河，结果是 B–B 稳定在远短于正确值的畸形距离而非完全重合——两种情形都是几何严重错误，结论不变。


## [MAJOR / confirmed] connectionCount 语义错位：四配位磷（磷酸根/鏻盐）在松弛器里被判 octahedral，6 对 1-3 约束全按 90° 目标且几何上不可满足

**位置**：`packages/mol-viewer/src/lib/geometry/relax.ts:166`（维度：geometry-math）

**缺陷**：geometry.config.ts:120-121 `// 超价磷（5+ 键） if (symbol === 'P' && connectionCount >= 4) return 'octahedral'`——注释和 vsepr 调用语义都是『已有 4 个邻居、正在放第 5 个键』。但 relax.ts:166 传入的 deg 是原子的最终度数：一个普通四面体磷（PO₄³⁻、磷酸酯、PR₄⁺，deg=4）落进该分支，得 bondAngle=90°，其全部 C(4,2)=6 对邻居的 1-3 目标距离按 √2·d 计算（正确四面体应为 √(8/3)·d≈1.633d）。三维空间中 4 个方向两两 90° 不可能同时成立（至多 3 个正交向量），约束系统自相矛盾 → 残差无法降到收敛阈值。relax.ts:161 的注释明说 >4 度要跳过角约束正是为避免单一角不适用，deg=4 的 P 恰好漏网。

**触发**：用户搭磷酸根（P 上长 4 个 O）或任何磷酸酯 → 触发 2D→3D 展开/松弛动画 → P 中心的 O···O 距离被持续压向 90° 对应值，四面体被压扁扭动，maxResidual 不收敛，自由模式跑满 maxFramesFree 后落下畸形的磷中心；有 target 锚定时整段动画期间磷酸基团持续可见地抽搐变形。

**证据**：inferGeometry('P', 4, 'sp3') → 'octahedral'（geometry.config.ts:121 条件 >= 4），GEOMETRY_RULES.octahedral.bondAngle=90；relax.ts:159-177 对 deg=4 的中心为所有 6 个邻居对生成 d13=√(la²+lb²) 的约束

**验证**：跑通了最小复现（vitest，已删）：① inferGeometry('P',4,'sp3') 确实返回 'octahedral'（geometry.config.ts:121 条件 >=4 短路，杂化表根本没被查），bondAngle=90；relax.ts:162 的 deg>4 跳过条件放过了 deg=4。② 自由模式：给一个【已是理想四面体】的 PO4 跑 5000 步，maxResidual 卡在 0.286（阈值 1e-3），converged 永远 false，且把正确结构主动压坏——P–O 从 1.61 缩到 1.38–1.47，O–O 从理想 2.629 压到 2.25–2.38（被拉向 90° 目标 2.277）；对照组 C 中心（tetrahedral 规则）6 步收敛。约束系统自相矛盾（4 个方向两两 90° 在 R³ 不存在，且键长约束锁定半径后 4 点等距只能是 2.63 而非 2.28）的推理被数值证实。③ 真实 UI 路径（placementRuntime.animatePlacement → relaxAnimate 带 CG target，itersPerFrame=2 × maxFramesTargeted=110）：整段动画中 P 中心 O–O 被持续压短 ~0.23–0.33 Å（终帧 2.30–2.40 vs 2.63）。

**验证补充**：确认成立，但失败场景需两处修正：① 带 target 时终点不会畸形——moleculeAnimation.ts:84-86 在结束时显式 session.write(targetMap)，最终坐标精确落在 CG 结果上；用户看到的是动画全程磷中心被持续压扁（非『抽搐』振荡，是稳定压缩）+ 结束瞬间可见地弹回正确构型。② 『自由模式跑满 maxFramesFree』当前在 app 里无调用方——relaxAnimate 唯一调用点 placementRuntime.ts:70 总是带 target；但 GeometryRelaxer 是 /io 公共出口、free 模式是公开 API，其对 deg-4 P（磷酸根/磷酸酯/鏻盐，极常见）不收敛且把正确输入压坏是实打实的正确性缺陷。维持 major。


## [MAJOR / confirmed] worker 预检（jobType 版本校验）在领取前抛错会吞掉唯一 dispatch，Job 永久卡死在 queued 且无法重投

**位置**：`software/backend/jobs/execution.py:48`（维度：backend-diff）

**缺陷**：run_persisted_job 在 claim_queued_job 之前做 jobType@version 一致性校验并 raise JobExecutionError（execution.py:41-52）。JobExecutor._run_dispatch 捕获后走 finally 的 service.finish_job_dispatch（executor.py:256）把该 Job 的 dispatch 标记为 finished，但 Job 状态从未被改成 failed。而 repository.request_job_dispatch（repository.py:583-588）发现该 job_id 已存在任意状态的 dispatch 行就直接 return False——job_dispatches 是每 Job 单行、一次性的。于是该 Job 永远停在 queued：没有 error_code、前端无任何失败迹象、重新 POST execute 也不会再创建 dispatch。submit() 的 ensure_supported_job 只校验类型是否注册，不校验版本，拦不住这条路径。同理，service.get_job_type_data 缺行抛出的 InvalidJobOperationError 也走同一条静默吞噬路径。

**触发**：部署把某 JobType 升到 @2（或新后端写库、旧 worker 消费）后，用户提交存量 xtb-optimization@1 任务并点击执行 → dispatch 被 worker 领取 → 预检抛 JobExecutionError（只进日志）→ dispatch 变 finished、Job 仍显示“排队中” → 用户再点执行返回“已受理”但永远不会跑，任务无错误信息地永久卡在 queued。

**证据**：execution.py: `if job_type_data.job_type != handler.job_type or job_type_data.job_type_version != handler.job_type_version: raise JobExecutionError(...)`（在 handler.run/claim 之前）→ executor.py:_run_dispatch `except (JobExecutionError, KeyError)` → finally `service.finish_job_dispatch(job_id, ...)` → repository.request_job_dispatch: `row = SELECT status FROM job_dispatches WHERE job_id = ?; if row is not None: return False`

**验证**：写了完整复现并跑通（scratchpad/repro_finding0.py）：创建 xtb-optimization 任务后把 job_type_data.job_type_version 改成 2 模拟版本偏差 → request_job_dispatch=True → claim 成功 → run_persisted_job 在 handler.run（即 claim_queued_job）之前抛 JobExecutionError → 模拟 executor.py:256 的 finally finish_job_dispatch → 任务状态仍为 queued、error_code=None → 再次 request_job_dispatch 返回 False、claim_next_dispatch 返回 None，任务永久卡死。逐条核实了链路上没有任何 guard：repository.request_job_dispatch:587 对任意状态（含 finished）的旧 dispatch 行直接 return False，且全仓库无 DELETE FROM job_dispatches；recover_expired_dispatches/_finish_dispatches_for_terminal_jobs 只处理 pending/leased 或终态任务，救不回 queued+finished 组合；routers/jobs.py:983-991 的 run_job 忽略 submit 的 False 返回值照常返回 202。发现中 InvalidJobOperationError 的旁路也成立（会被 executor.py:250 的 except Exception 捕获走同一 finally）。

**验证补充**：触发前提是部署版本偏差（存量任务版本≠worker 注册版本）或 job_type_data 行缺失，日常单进程部署下创建与执行用同一 registry 不会命中，故 major 而非 critical 恰当。附带确认：卡死后的任务连 error_code 都没有，前端完全无失败迹象，与描述一致。


## [MAJOR / confirmed] SSE 流式优化：客户端断开后 xtb 子进程无人终止成为孤儿，且流式路径完全没有超时

**位置**：`software/backend/engines/xtb/execution.py:124`（维度：backend-diff）

**缺陷**：stream_xtb_optimization_events 用 asyncio.create_subprocess_exec 启动 xtb（line 124），但整个生成器没有任何 process.terminate/kill 逻辑，也没有 run_xtb_optimization 同步路径那样的 timeout（同步路径 300s，process_runner 会 killpg）。当 SSE 客户端断开时，Starlette 对响应迭代器调用 aclose()，GeneratorExit 在轮询循环的 yield 处抛出，只会执行内层 finally 关闭日志句柄和外层 finally 的 temporary.cleanup()——工作目录被删掉，而 xtb 进程继续在已删除目录里跑到自然结束（max_steps 可达 1000，大分子可跑很久）。routers/optimize.py 的包装器只 `except Exception`，GeneratorExit 是 BaseException 同样不会触发清理。

**触发**：用户在前端打开 /optimize/stream 优化一个大分子，中途关闭页面/刷新重试若干次 → 每次断开都留下一个满核运行的 xtb 孤儿进程，反复操作后服务器 CPU 被无上限的 xtb 进程占满；单个恶意或异常客户端反复连接-断开即可造成资源耗尽。

**证据**：`process = await asyncio.create_subprocess_exec(*command, ...)` 后仅有 `while process.returncode is None: await asyncio.sleep(0.05); ... yield ...` 和 `finally: temporary.cleanup()`；全文件无 terminate/kill/timeout 对 process 的引用。对比同文件 run_xtb_optimization 走 run_xtb_process(timeout=timeout) 有 killpg 超时。

**验证**：写了机械复现并跑通（scratchpad/repro_finding1.py）：把 build_xtb_command 换成 sleep 30 模拟长时间 xtb，消费两个事件后对生成器调 aclose()（Starlette 在客户端断开时对响应迭代器做的正是 close/cancel，GeneratorExit/CancelledError 均为 BaseException）→ pgrep 显示子进程仍在运行，ORPHAN CONFIRMED。通读了 engines/xtb/execution.py 全文：流式路径对 process 全文无 terminate/kill/timeout 引用，仅有内层 finally 关日志句柄和外层 finally temporary.cleanup()（把工作目录删掉，xtb 靠已打开的 fd 继续算）；routers/optimize.py:60 包装器只 except Exception 拦不住 BaseException；对比同文件 run_xtb_optimization 走 run_xtb_process(timeout=300) 有超时保护，流式路径确实完全没有。

**验证补充**：两点小修正：(1) 断开时机需在首个 yield（status 事件）之后子进程才已启动，之前断开不产生孤儿——但 SSE 客户端总会收到首事件后才断，实际场景必命中；(2) 即使无人断开，流式路径也无超时，挂死的 xtb 会让连接和进程一起无限存活，这一点也核实为真。


## [MINOR / confirmed] setAtomCharge/setAtomRadical 经 resaturateAtom 删 H 后不清理选择集，selectedAtomIds 留下悬空 id

**位置**：`packages/mol-viewer/src/store/slices/helpers.ts:177`（维度：editing-ops）

**缺陷**：applyActiveMoleculeEdit（helpers.ts:177-190）只 patch 分子，完全不碰 selectedAtomIds/selectedBondIds。但它承载的 runSetAtomChargeCommand / runSetAtomRadicalCommand（atomPropertyCommands.ts:26/40）内部调 resaturateAtom，diff<0 时会删除 H 原子（atomOps.ts:139-148）。对比之下：removeAtoms 走 runRemoveAtomsCommand 自带选择同步（atomRemovalCommands.ts:32-40），bondViaHydrogen 走 runSyncSelectionToMoleculeCommand（bondEditActions.ts:38），undo/redo 有 afterTimeTravel 剪除（moleculeStore.ts:37-57），唯独属性编辑这条删原子路径漏了。同样漏的还有 store 公开的 cycleBondLength/setBondLength 等 geometry action（applyGeomEditWithMeta，helpers.ts:285，cycleBondLength 会删 H）。被删 H 的 id 长期滞留在选择集中：Set.size 仍计入死 id，依赖 size===2 的 BondLengthGizmo（BondLengthGizmo.tsx:15-17）保持 active 但 updateView 因 atoms.find 失败早退（useBondLengthGizmoController.ts:50-52），叠加层停在过期位置不再跟随相机/分子更新。

**触发**：用户点选水分子的 O 和一个 H（2 原子选中，键长 gizmo 出现并显示 O–H 距离），再右键 O 把电荷设为 -1 → resaturateAtom 删掉的恰是那个选中的 H（hNeighborsOf 取第一个）→ 选择集仍是 2 个 id（其一悬空），gizmo 保持挂载但画面冻结在删除前的位置，随相机旋转也不更新；后续对该选择执行的批量操作（如 replaceAtoms）静默跳过死 id，选中计数与高亮数不一致。

**证据**：helpers.ts:177-190 applyActiveMoleculeEdit 返回值只含 patchActiveMol(...)，无 selection 字段；atomEditActions.ts:118-130 setAtomCharge/setAtomRadical 直接走它；resaturateAtom 删 H 分支 atomOps.ts:140-147 `atoms: mol.atoms.filter(a => !remove.has(a.id))`。对照组：atomRemovalCommands.ts:36 `[...selection.selectedAtomIds].filter(id => validAtomIds.has(id))`。

**验证**：用 createMoleculeStore 写店级复现并执行：水分子 setMolecule → selectAtom(O) + selectAtom(H1, multi) → setAtomCharge(O, -1)。输出：H count 1（resaturateAtom 删了一个 H）、selection size 仍为 2、dangling ids = 1，且被删的恰是选中的 h1（hNeighborsOf 按键序取第一个，正是发现所述场景）。代码面核实：applyActiveMoleculeEdit（helpers.ts:177-190）返回值只含 patchActiveMol，无 selection 字段；全仓 grep runPruneSelectionCommand 仅 moleculeStore.ts afterTimeTravel（undo/redo 后处理）一处调用，属性编辑路径确实无人剪除。BondLengthGizmo.tsx:15 以 size===2 判定 active、useBondLengthGizmoController.ts:50-52 atoms.find 失败即 return（不清帧），冻结机制成立。

**验证补充**：确认成立但降为 minor：后果限于 UI 状态不一致——gizmo 叠加层冻结在旧位置、选中计数虚高、批量操作静默跳过死 id——无数据损坏、无崩溃。对冻结 gizmo 的拖拽会被 createBondLengthEditPlan 的 guard 挡下并 flashHint 优雅失败（useBondLengthGizmoController.ts:108-111）；用户下一次任何选择操作或 undo/redo（afterTimeTravel 剪除）即自愈。与 finding 0/1 那种静默产出错误化学结构并流入导出/计算的级别不同。发现本身的机制描述全部准确。


## [MINOR / confirmed] setDihedralAngle 在 A 与 B–C 轴共线（炔/腈）时静默施加反向旋转并报成功

**位置**：`packages/mol-viewer/src/lib/builder/editing/geometryOps.ts:174`（维度：editing-ops）

**缺陷**：setDihedralAngle 对『A 在旋转侧』『D 不在 C 侧』『B、C 重合』都有守卫，但漏了 A–B–C 共线这一退化：此时 calcDihedral 的 n1 = cross(b1,b2) 为零向量，atan2(0,0) 返回 0（measure.ts:26-34），current 被当成 0 计算 delta 并旋转；旋转后复测仍是退化 0，diff > 0.1 触发『符号保险』改施 -delta（geometryOps.ts:181-184），最终对 C 端片段施加了一次目标值相反的任意旋转，且返回 ok:true。正确行为应像其他退化 case 一样拒绝（二面角在 A-B-C 共线时数学上未定义）。已执行验证：A(-1,0,0)-B(0,0,0)-C(1,0,0)-D(2,1,0) 请求 60°，D 实际被绕轴旋转 -60° 到 (2, 0.5, -0.866)，结果报成功。

**触发**：用户对丙炔 H–C≡C–CH3 按顺序选 4 个原子：炔端 H(A)、两个 sp 碳(B、C)、甲基 H(D)——A-B-C 因三键线形而共线——在几何参数面板输入二面角 60° → 甲基被绕 C–C 轴旋转了 -60°（方向还与请求相反），面板显示操作成功，但复测二面角仍是无意义的退化值，用户得到一次不可解释的静默几何改动而非明确拒绝。

**证据**：geometryOps.ts:174-185: `const current = calcDihedral(a, b, c, d); const delta = ((targetDeg - current) * Math.PI) / 180; let result = rotate(...); ... if (diff > 0.1) { result = rotate(mol, side, b, axis, -delta) } return { ok: true, molecule: result }` —— 反向重试后未再校验就返回 ok。measure.ts calcDihedral 对共线输入返回 0 而非 NaN，绕过了所有数值守卫。

**验证**：写了最小 vitest 复现并跑通（已删除）：A(-1,0,0)-B(0,0,0)-C(1,0,0)-D(2,1,0)、键 A-B/B≡C/C-D，请求 60° → 返回 ok:true 且 D 落在 (2, 0.5, -0.866)，即被施加了 -60° 旋转，方向与请求相反。追了完整链路：calcDihedral（src/lib/geometry/measure.ts:26-34）对共线输入 n1=0 走 atan2(0,0)=0，不产生 NaN，绕过一切数值守卫；geometryOps.ts:181-184 复测仍是退化 0，diff=60>0.1 触发反向重试后未再校验直接 ok:true。上游无守卫：app 面板 SelectionInspectorViews.tsx:143 把 4 个选中 id 原样透传 store→command→setDihedralAngle，无共线检查；selectionInspectorModel.ts:195 还会把退化的 0° 当作当前值显示。同函数对 A 在旋转侧、B=C 重合都显式拒绝，setBondAngle 对共线也有兜底轴，唯独漏了这个退化，确系遗漏。


## [MINOR / confirmed] autoInferBonds 全量重建键 ID：selectedBondIds 悬空且无变化也压一步 undo

**位置**：`packages/mol-viewer/src/store/slices/moleculeEditActions.ts:109`（维度：store-undo）

**缺陷**：runAutoInferBondsCommand（bondInferenceCommands.ts:5-7）无条件返回 editChanged({...molecule, bonds: inferBonds(molecule.atoms)})：inferBonds 每次都用 genId 生成全新 bond 对象，所有旧键 ID 全部作废；而落盘走 applyActiveMoleculeEdit，不同步 selectedBondIds。两个后果都已实测证实：(a) 选中的键在推断后变成悬空 ID（dangling=1）；(b) 拓扑毫无变化时 objectsById 引用照样翻新，zundo equality 判不等，pastStates 净增 1——每点一次『推断键』都白吃一步 undo 预算。

**触发**：1) 乙烷中点选 C–C 键（高亮）；2) 点多选面板『推断键』按钮（SelectionInspectorViews.tsx:49）；3) 键以新 ID 重建，高亮消失但 selectedBondIds 仍持死 ID；4) 用户按 Delete 想删这条键 → removeSelected 里 removeBondIds 全是死 ID，什么都没删（只把选择清空）；另外拓扑没变时按『推断键』后按 Ctrl+Z，撤销的是一次视觉上什么都没发生的操作，用户觉得 undo 失灵。

**证据**：bondInferenceCommands.ts:6 `return editChanged({ ...molecule, bonds: inferBonds(molecule.atoms) })`（无 changed 判定）；moleculeEditActions.ts:109-110 `autoInferBonds: () => set((s) => applyActiveMoleculeEdit(s, runAutoInferBondsCommand))`。实测：选中键后 autoInferBonds → 悬空键选择 1；连续两次 autoInferBonds（拓扑不变）→ 历史增量 1。

**验证**：两个 store 层效果均实测复现：选中键后 autoInferBonds → 悬空键选择 dangling=1；拓扑不变的第二次 autoInferBonds → pastStates 3→4（净增 1 步 undo）。但失败场景的主路径被 UI 挡死：『推断键』按钮只在 MoleculeInspector（mode 'molecule'）渲染，而 buildSelectionInspectorModel（selectionInspectorModel.ts:93）只在有效选中原子数和键数均为 0 时才返回 'molecule' 模式——选中 C–C 键时面板是 BondInspector，根本没有该按钮；全库 grep 确认 autoInferBonds 无其他调用方。所以'选中键悬空→Delete 失灵'在现有 UI 不可达。

**验证补充**：失败场景修正：可达的实际危害只剩(1)无选择时点『推断键』（哪怕拓扑不变）每次白吃一步 undo、Ctrl+Z 看似无效；(2)作为 EditSlice 公共 API 对未来直接调用方的潜在悬空选择隐患（与发现 2 同性质）。以此危害面评 major 过高，降 minor。


## [MINOR / confirmed] cycleBondLength（公共 EditSlice API）升键级删 H 不清理选择集

**位置**：`packages/mol-viewer/src/store/slices/geometryEditActions.ts:26`（维度：store-undo）

**缺陷**：store action cycleBondLength 经 applyGeomEditWithMeta（helpers.ts:285-309）落盘，该 helper 只 patch 分子 + bump atomPositionVersion，不做选择剪枝；但 cycleBondLength 的实现（bondOps.ts:163、188）在升键级时调 removeExcessHydrogens 真实删除两端多余的 H 原子。实测：C2H6 全选（8 原子）后对 C–C 调 cycleBondLength → 变 C2H4（6 原子），selectedAtomIds 残留 2 个死 ID。交互层 Shift+点键之所以没事，是因为它绕开这个 action、走 EditUseCaseExecutor 且 selectionPolicy 'clear' 把选择整个清掉（builderHandlerContext.ts:77）；但 cycleBondLength 是 EditSlice 导出的公共 API（types.ts:70），任何直接调用方（脚本/新面板）都会踩中。

**触发**：调用方（如未来的键级面板或外部脚本）在存在原子选择时调 useMoleculeStore.getState().cycleBondLength(bondId)：被删的 H 的 ID 永久留在 selectedAtomIds 中，后续 bondSelectedAtoms 报『原子不存在』（已实测），几何面板按选中数展示的编辑项对死原子求值失败。

**证据**：geometryEditActions.ts:26-33 `cycleBondLength: (id) => applyGeomEditWithMeta(get, set, (mol) => runCycleBondLengthCommand(mol, id), …)`；bondOps.ts:163 `removeExcessHydrogens(removeExcessHydrogens(withOrder, a1.id), a2.id)`、:188 同；helpers.ts:300-307 的 set 回调只含 patchActiveMol + atomPositionVersion。实测 dangling.length === 2（期望 0）。

**验证**：实测复现：C2H6（8 原子）全选后对 C–C 调 store cycleBondLength → C2H4（6 原子），selectedAtomIds 残留 dangling=2。核实其自述的限定条件均属实：(a) 交互层 Shift+点键确实绕开该 action——builderBondEffects.ts runBondClickCommand 走 runEditCommand → builderHandlerContext.ts:75-78 executor selectionPolicy 'clear'，commitEditResult 里 runSetMoleculeInSceneCommand 返回 clearSelection:true（sceneStoreCommands.ts:241），选择整个清空；(b) 全库 grep 确认 store cycleBondLength 除 types.ts 声明外无任何现有调用方。属公共 API 潜在隐患而非现网可达缺陷，minor 评级恰当。

**验证补充**：复现用 applyGeomEditWithMeta 路径（helpers.ts:300-307 只 patch 分子 + bump atomPositionVersion），与发现引用一致。


## [MINOR / confirmed] 纯激活切换（点另一分子的原子仅为选中）被记为 undo 历史条目

**位置**：`packages/mol-viewer/src/store/slices/sceneSlice.ts:52`（维度：store-undo）

**缺陷**：partializeForUndo（undoConfig.ts:17-23）把 activeObjectId 纳入快照，undoSnapshotEqual 比较它；而多分子场景下任何原子点击（包括纯选择态的点击）都会先 ensureEditableAtomObject → activateObjectContainingAtom → setActiveObject（builderAtomHandlers.ts:28 → helpers.ts:325 → sceneSlice.ts:52）。于是一次不改任何分子数据的『点击选中另一个分子的原子』就产生一条 undo 记录。这与 undoConfig.ts:4-5 自己写明的意图（『选择、版本号等 UI 状态不进，否则每次点选都会产生一条历史记录，把 limit 吃光』）直接冲突——现在每次跨分子点选恰恰产生一条历史记录。实测：clear 后连续 3 次 setActiveObject，pastStates 长度 3；undo 只把 activeObjectId 切回，objectsById 毫无变化。

**触发**：场景里放两个分子 A、B，用户在选择模式下交替点 A、B 的原子查看属性（每次点击都切激活对象）：每次点击吃掉一步 undo（limit=50 很快耗尽，真正的编辑历史被 shift 掉）；随后按 Ctrl+Z，屏幕上没有任何分子变化（只有激活高亮换了对象），用户连按多次才『穿透』这些空步骤回到上一次真实编辑——表现为『撤销没反应』。

**证据**：实测输出：『三次切换后 pastStates: 3』『undo 后 activeObjectId 变化: 660d2470 -> 9f4b9541 分子数据未变』。调用链：handleBuilderAtomClick（任何 intent 下第 28 行先激活）→ activateObjectWhere → s.setActiveObject(oid) → set 经 zundo 包装的 setState → equality 因 activeObjectId 不同判 false → _handleSet 入栈。

**验证**：追全调用链：handleBuilderAtomClick:28（任何 intent 前置）→ ensureEditableAtomObject → activateObjectContainingAtom → activateObjectWhere（helpers.ts:316，activeObjectId 不同时调 setActiveObject）→ runSetActiveSceneObjectCommand 返回 changed:true → set 经 zundo 包装；partializeForUndo（undoConfig.ts:17-23）含 activeObjectId，undoSnapshotEqual 比较它 → 入栈。全链无 isTracking pause/guard。写临时 vitest 复现并跑通（后已删）：clear 后 3 次 setActiveObject → pastStates.length===3，undo 后 activeObjectId 回退而 objectsById 引用完全不变；模拟真实点击路径 activateObjectContainingAtom 单独调用 → pastStates.length===1。与 undoConfig.ts:4-5 注释声明的意图直接冲突。

**验证补充**：补充：activeObjectId 留在快照里对场景图操作（removeSceneObject/split 等）的 undo 是必要的——修复方向应是纯激活变更不入栈（如 pause/resume 包住 setActiveObject 或 equality 特判），而非直接把 activeObjectId 移出快照。


## [MINOR / confirmed] 删原子后 undo 恢复原子，但测量被级联清除且永不恢复

**位置**：`packages/mol-viewer/src/store/integrity.ts:34`（维度：store-undo）

**缺陷**：跨 store 完整性订阅在 objectsById 变化时立即把引用被删原子的 measurements 从 editorStore 剔除（integrity.ts:34），这是破坏性同步删除；而 measurements 不进 undo（editorStore 无 zundo），afterTimeTravel（moleculeStore.ts:37-57）也只恢复选择相关字段。于是『删原子 → Ctrl+Z』这对本应互逆的操作净效果是：原子回来了，测量永久蒸发。已实测：测 C1–C2 距离 → removeAtom(C2) → measurements 变 0 → undo 后原子恢复为 true、measurements 仍为 0。

**触发**：用户给分子标了若干键长/键角测量，误删一个相关原子后立刻 Ctrl+Z：分子完整回来了，但所有涉及该原子的测量标注消失且无法找回（redo/undo 都不恢复），用户需要逐个重新点原子重建测量。

**证据**：integrity.ts:34 `es.measurements.filter(m => m.atomIds.every(id => valid.has(id)))`；afterTimeTravel（moleculeStore.ts:38-56）只写 atomPositionVersion/selection*，无测量恢复通道。实测输出：『删除后测量数: 0』『undo 后原子恢复: true 测量数: 0』。

**验证**：integrity.ts:26-44 订阅 objectsById，同步 filter 掉引用失效原子的 measurements（editorStore.ts:223 注册，生效于所有实例）；editorStore 无 temporal/zundo，afterTimeTravel（moleculeStore.ts:37-57）只 bump atomPositionVersion 和剪枝 selection，无任何测量恢复通道。写临时 vitest 复现并跑通（后已删）：建两原子 + distance 测量 → removeAtom(a2) → measurements 变 0 → temporal.undo() → 原子恢复为 true，measurements 仍为 0，redo/undo 均无法找回。删原子→Ctrl+Z 这对操作净效果为测量永久蒸发，失败路径完整。

**验证补充**：严重度 minor 合理：丢的是测量注记（用户可手工重建），不是分子数据；但属于静默数据丢失，若测量是用户核心工作流可升 major。


## [MINOR / confirmed] 隐藏场景对象后其测量线/标签仍悬浮渲染

**位置**：`packages/mol-viewer/src/hooks/useRendererMeasurementBinding.ts:19`（维度：store-undo）

**缺陷**：resolveMeasurementAtoms 构建 atomMap 时遍历所有 sceneObjects、不检查 object.visible（useRendererMeasurementBinding.ts:19-21），committed 测量只要原子存在就交给 renderer.updateMeasureVisuals 绘制；而分子本体在 MoleculeSceneLayer.ts:45-46 按 visible 隐藏。integrity（integrity.ts）也只按『原子是否存在』剪枝，不看可见性——两层都放行，隐藏对象的测量注记就成了孤儿图元。

**触发**：用户给分子 A 测了一个键长，然后在场景面板把 A 点为不可见：分子消失，但那条测量线和数值标签仍然悬浮在空无一物的位置；旋转视角它还跟着空气动。

**证据**：useRendererMeasurementBinding.ts:18-21 `for (const object of sceneObjects) { for (const atom of object.molecule.atoms) atomMap.set(atom.id, atom) }`（无 visible 过滤）；对照 MoleculeSceneLayer.ts:45 `group.visible = object.visible`、:46 `if (!object.visible) continue`。

**验证**：代码层复现跑通（临时 vitest，后已删）：visible:false 的 SceneObject 传入 resolveMeasurementAtoms，其测量照样进 committed（无 visible 过滤，useRendererMeasurementBinding.ts:18-21）。上下游全链核实：MolViewer.tsx:105-110 的 sceneObjects 按 objectOrder 全量映射、不滤可见性；committed 直接交 renderer.updateMeasureVisuals（MolRenderer.ts:365），测量图元挂在独立的 _measureGroup（与 MoleculeSceneLayer 按 object.visible 隐藏的 per-object group 平行，dispose 处可见 modelGroup.remove(_measureGroup)），分子隐藏不联动测量；integrity.ts 只按原子存在性剪枝。隐藏入口真实存在：apps/retainmol ScenePanel.tsx 调 setObjectVisible。activateObjectWhere 会拒绝在隐藏对象上新建测量，但『先测量后隐藏』不受任何 guard 拦截，孤儿图元场景成立。

**验证补充**：失败场景准确。measurements 创建被激活守卫挡住（隐藏对象上点不出新测量），问题只出现在测量先建、对象后隐藏的顺序——与发现描述一致。


## [MINOR / plausible] move-object 路由不检查按键/pointerId/是否已在拖拽：拖拽中第二次按下把变换目标重置，导致拖拽冻结或整个分子瞬移

**位置**：`packages/mol-viewer/src/hooks/useCanvasPointerRouter.ts:210`（维度：interaction）

**缺陷**：onDown 的第一分支（L210-214）对任何按键（含右键、第二根触摸手指）都无条件 stopImmediatePropagation 并调用 handleTransformDown；handleTransformDown（L49-78）入口先把 state.fragmentIds/targetObjectId 置 null 再重新拾取。若此时 state.dragging 已为 true（左键拖拽进行中）：(a) 第二次按下落在空白且无 Alt → resolveObjectTransformTarget 返回 null → L69 提前 return，留下 dragging=true 但 fragmentIds=null 的状态，handleTransformMove（L86）从此全部 no-op——拖拽在半途冻结，直到任一 pointerup 触发 finishObjectTransform 提交事务；(b) 第二次按下落在另一个分子的原子上 → activateObjectContainingAtom 切换活动对象、fragmentIds 换成另一个分子，且 lastX/lastY 被重置为第二个按下点（L74-75）——接下来第一根手指的下一次 move 计算 dx = 手指1位置 - 手指2位置，可达数百像素，另一个分子被一次性平移出画面；多指持续移动时 onMove（L242）不过滤 pointerId，两根手指的事件交替驱动 handleTransformMove，dx 在两指坐标差之间来回震荡，分子几何被反复大幅平移（虽可 undo 一步恢复，但用户看到分子疯狂抖动/飞出视野）。onUp（L265）同样不过滤：任一指/任一键的抬起都会 finishObjectTransform 提前提交并终止拖拽。

**触发**：桌面：V（move-object）工具左键拖动分子途中误按右键（落在空白处）→ 分子立刻停止跟随鼠标，左键继续拖完全无效，松开后本次移动被截断提交。触摸：move-object 模式用一根手指拖分子 A，第二根手指碰到分子 B 的原子 → 活动对象被切到 B 且下一帧 B 被瞬移一大段距离，随后两指事件交替驱动，B 在两指位置间来回大幅跳动。

**证据**：L210 `if (toolCan(tool, 'transformsObject')) { e.stopImmediatePropagation(); handleTransformDown(...) }` 无 e.button、无 state.dragging 检查；L57-58 `state.fragmentIds = null; state.targetObjectId = null`；L69 `if (!target) return`（dragging 未复位）；L86 `if (!state.dragging || !state.fragmentIds ...) return`；L88-91 dx 基于被重置的 lastX/lastY。

**验证**：逐行核实 useCanvasPointerRouter.ts：onDown L210-213 对 move-object 工具确实无 e.button、无 state.dragging、无 pointerId 检查即 stopImmediatePropagation+handleTransformDown；handleTransformDown L57-58 先置空 fragmentIds/targetObjectId，L69 空拾取提前 return 时 dragging 仍为 true（冻结路径成立，handleTransformMove L86 从此 no-op）；命中另一分子时 activateObjectContainingAtom 切换目标且 L74-75 重置 lastX/lastY 到第二指针位置（瞬移/两指震荡路径成立）；onMove L242/onUp L265 均不过滤 pointerId。事务安全性也核实：ObjectTransformCommandSession.start 幂等（moveCommands.ts L126-127 if(active) return），任一 pointerup 走 finishObjectTransform 正常提交，无悬挂。未做运行复现：handleTransformDown/Move 是模块私有函数且嵌在 React hook 里，node 测试环境下无法低成本驱动真实 DOM 事件流，故纸面成立记 plausible。

**验证补充**：失败场景需重大修正：桌面变体（左键拖拽中误按右键）不成立——鼠标是单一 pointer，拖拽中追加按键属 chorded buttons，按 Pointer Events 规范只产生 pointermove（button 字段标记变化的键），不会派发第二次 pointerdown，onDown 根本不会重入。真实触发面只剩多指针输入（触摸第二指、笔+触摸）：冻结变体和目标切换+瞬移/震荡变体在代码上都成立。且后果有限：事务不悬挂（start 幂等、任一 up 即提交）、几何损坏一步 undo 可恢复、冻结在任一抬指后自然解除。另有副产品：无 button 检查意味着 move-object 模式下右键单按也会开启一次变换拖拽（独立小怪癖）。触摸设备上双指误触（如本能的捏合缩放）会触发，值得修，但降为 minor。


## [MINOR / plausible] handleTransformMove 在阈值判定前就更新 lastX/lastY：亚阈值位移被永久丢弃，慢速精调时对象不跟手

**位置**：`packages/mol-viewer/src/hooks/useCanvasPointerRouter.ts:91`（维度：interaction）

**缺陷**：handleTransformMove 先计算 dx/dy、立即把 lastX/lastY 更新为当前坐标（L90-91），然后才做 `Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5` 的忽略判断（L92）并 return。被忽略的位移不会累积——基准点已经前移，这部分位移永久丢失。当指针事件携带小数坐标（浏览器缩放、hi-DPI、手写笔、高回报率鼠标的高频细分事件）且每个事件的位移都低于 0.5px 时，无论用户缓慢移动多远，每一步都被丢弃，对象完全不动或以远低于光标的速度爬行；正常速度拖拽时也会系统性欠移。正确做法是仅在超过阈值时才推进 lastX/lastY（让小位移累积），或对累积位移做阈值。

**触发**：浏览器缩放 125%/150%（clientX 出现小数）或使用手写笔/高回报率鼠标，V 工具下非常缓慢地拖动分子做精细对位：每个 pointermove 位移 <0.5px，全部被丢弃 → 光标移过去了，分子纹丝不动（或明显滞后欠移），用户必须加快手速才能让对象移动。

**证据**：L88-92：`const dx = e.clientX - state.lastX; const dy = e.clientY - state.lastY; state.lastX = e.clientX; state.lastY = e.clientY; if (Math.abs(dx) < INTERACTION.transformMinDisplacement && Math.abs(dy) < INTERACTION.transformMinDisplacement) return`（interaction.config.ts L7 阈值 0.5px）——先推进基准再丢弃，位移不可累积。

**验证**：读码可证算术缺陷：useCanvasPointerRouter.ts L88-92 先把 lastX/lastY 推进到当前坐标、再做 <0.5px 判断并 return，被丢弃的位移基准已前移、永久丢失不可累积；且 useCanvasPointerRouterEffects.ts runObjectPointerTransformCommand L212-217 用同一 minDisplacement 再挡一次（双重门），确认设计意图是抖动死区但实现破坏了累积。未能跑浏览器级复现（handleTransformMove 是模块私有函数，且本包 vitest 为 node 环境无 jsdom），真实指针流是否持续产生亚 0.5px 位移依赖环境，故按规则计 plausible。

**验证补充**：两处修正：(1) 丢弃条件是 Math.abs(dx)<0.5 && Math.abs(dy)<0.5——两轴同时亚阈值才丢，斜向移动只要一轴 ≥0.5 即通过；(2) 触发面比描述窄：整数像素鼠标 dx 只会是 0 或 ≥1，完全无损失；125%/150% 缩放的坐标步进为 0.8/0.667px ≥0.5 也通过；真正持续丢弃需手写笔/触控等真分数坐标或 ≥~250% 缩放（0.4px 步进）。'正常速度拖拽系统性欠移'言过其实——每次至多损失 <0.5px 且仅在偶发亚阈值事件上。严重度 minor 成立。


## [MINOR / plausible] ringPlaneIntersection 在 ratio≈−1 的相切侧返回两个重合交点（去重只覆盖了 ratio≈+1 侧）

**位置**：`packages/mol-viewer/src/lib/builder/geometry/plane.ts:83`（维度：geometry-math）

**缺陷**：解 A·cos t+B·sin t=D 时 dt=acos(ratio)，代码只对 dt<1e-6（ratio≈+1，切点在 phi 处）做单点去重；当 ratio≈−1 时 dt≈π，phi+dt 与 phi−dt 相差 2π，是同一个切点，却按两个交点返回（plane.ts:83 `ts = dt < 1e-6 ? [phi] : [phi + dt, phi - dt]`）。消费方 getGrowGuideCommand（growPreviewCommands.ts:82-93）把结果映射成 kind:'points' 的 ghost 槽位，产生两个完全重叠的候选点。

**触发**：草图平面模式激活，用户从只有一个邻居的原子拖拽生长，VSEPR 候选圆环恰好在背离平面法向一侧与草图平面相切 → 生长参考显示两个完全重叠的 ghost 槽位点（视觉重影/双重高亮），而几何上只存在一个合法落点。

**证据**：plane.ts:82-83 `const dt = Math.acos(Math.max(-1, Math.min(1, ratio))); const ts = dt < 1e-6 ? [phi] : [phi + dt, phi - dt]`——dt≈π 时 cos(phi+π)=cos(phi−π)、sin(phi+π)=sin(phi−π)，两点坐标相同

**验证**：函数级数学复现成功（vitest，已删）：ringPlaneIntersection(center=[0,0,0], axis=z, R=1, plane{origin:[-1,0,0], normal:x}) 即 ratio=−1 时返回两个点 [[-1,2.45e-16,0],[-1,0,0]]，间距 2.4e-16——确为重复点；+1 侧同构造正确去重为单点。plane.ts:83 的不对称容差属实。但完整 UI 失败路径无法坐实：触发需 D/amp 在双精度下【恰好】等于 −1（草图平面来自 fitPlane 的 48 轮幂迭代 + 原子交互坐标，法向量连精确 [0,0,1] 都收敛不到，精确相切是测度零事件）；而近相切（ratio ∈ (−1,−1+ε)）返回的是两个合法且几乎重合的交点——这在 +1 侧超出 1e-6 容差窗口时同样发生（dt<1e-6 对应 ratio>1−5e-13，窗口本身近乎无效），视觉上与所述『重影』无法区分且并非此 bug 特有。消费方 growPreviewCommands.ts:82-93 确无去重，但实际可观测影响趋近于零。

**验证补充**：失败场景修正：『恰好相切』在交互几何下是浮点测度零事件，实际用户几乎不可能观测到『两个完全重叠的 ghost』与近相切的正常近重合有何区别。作为代码对称性瑕疵成立（−1 侧应与 +1 侧同样去重，如 Math.PI − dt < 1e-6 时取 [phi+Math.PI]），严重度不高于 minor。


## [MINOR / confirmed] IRC 双向计算改为“先跑完两支再统一收集”，后向失败会丢弃前向已算出的全部结果和诊断日志

**位置**：`software/backend/jobs/job_types/psi4/executor.py:100`（维度：backend-diff）

**缺陷**：旧实现（psi4_runner._execute_claimed_psi4_job）在 forward 分支跑完后立即 _publish_irc_branch 登记结构/JSON/日志，再跑 backward。新的 Psi4IrcExecutor.execute 把两支的 run_psi4_operation 都跑完才调 collector.collect；backward 抛 Psi4ExecutionError 时直接进入 run_psi4_job 的 except → Job failed，forward 分支的 endpoint 结构、psi4-result.json、psi4.log、trajectory 全部不会登记为 Artifact。这也违背架构文档“结果不完整时发布诊断日志再标记 failed”的收集顺序要求——失败路径现在一个诊断产物都不发布。

**触发**：用户提交 psi4-irc direction=both 的任务：forward 分支算 2 小时成功，backward 分支因 SCF 不收敛崩溃 → Job 直接 failed，任务详情里 0 个 Artifact；forward 的结果文件只留在磁盘工作目录中不可通过 API 访问，用户须整单重算。旧版本至少能拿到 forward 的端点结构和日志。

**证据**：executor.py: `for direction in directions: result = run_psi4_operation(...); outputs.append(...)` 循环结束后才 `collector.collect(...)`；irc_collector.py 的 publish_* 全部在 collect 内。对比 git diff 中被删除的旧代码：每个 direction 循环内即 `_publish_irc_branch(service, job, request, direction, branch, result)`。

**验证**：写了复现并跑通（scratchpad/repro_finding2.py）：monkeypatch run_psi4_operation 令 forward 成功写出 psi4-result.json/psi4.log、backward 抛 Psi4ExecutionError → run_psi4_job 走 psi4_runner.py:74 的 except → 任务 failed(psi4_execution_failed)，registered artifacts=[]，而 irc-forward/ 目录里 psi4-result.json、psi4.log 完好躺在磁盘上不可经 API 访问。对照 git diff 确认旧代码在 direction 循环内每支跑完立即 _publish_irc_branch（forward 产物在 backward 开跑前已登记）；新 Psi4IrcExecutor.execute（executor.py:100-125）两支全跑完才 collector.collect，irc_collector 的全部 publish_* 都在 collect 内。架构文档 job-kernel-and-job-types.md:288-289 的流程图明确要求'结果不完整→发布诊断日志→标记 failed'，而失败路径（psi4_runner.py 三个 except 分支）现在零产物发布，文档违背属实。另核实 task_directory 只在显式 delete_job 时 rmtree（service.py:637），失败任务的磁盘文件不会被清，与'只留在磁盘不可经 API 访问'的描述一致。

**验证补充**：严重度 minor 可维持：数据未从磁盘丢失、是诊断/部分结果登记的回归而非损坏；但若 forward 分支耗时数小时，用户整单重算的代价不小，处于 minor/major 边界，倾向保守维持原评级。


## [MINOR / confirmed] xTB 超时错误信息硬编码“5 minutes”，与新的可配置 timeoutSeconds（5–86400s）矛盾

**位置**：`software/backend/jobs/xtb_runner.py:68`（维度：backend-diff）

**缺陷**：XtbOptimizationExecutor.execute 现在用 prepared.job_data.timeout_seconds（XtbOptimizationParametersV1 允许 5–86400 秒，默认 300）作为 run_xtb_process 的超时，但 run_xtb_optimization_job 捕获 subprocess.TimeoutExpired 时写入 Job 的错误信息和抛出的 JobExecutionError 都是固定文案 'xTB job timed out after 5 minutes'。重构前超时确实固定 300s，文案成立；重构后参数化了超时却没有同步文案。

**触发**：用户创建 xtb-optimization 任务并设置 timeoutSeconds=3600，任务在 1 小时后真实超时 → 任务详情与 JobRun 的 error 显示“xTB job timed out after 5 minutes”，用户误以为自己设置的超时没有生效并按 5 分钟去排查。

**证据**：executor.py:47 `timeout=prepared.job_data.timeout_seconds`；xtb_runner.py:64-71 `except subprocess.TimeoutExpired: service.update_status(job_id, "failed", error="xTB job timed out after 5 minutes", error_code="timeout")`

**验证**：跑通最小复现：用 JobService 创建 metadata.request.timeoutSeconds=3600 的 xtb-optimization 任务，注入抛 subprocess.TimeoutExpired 的 execution_adapter 调 run_xtb_optimization_job，最终 job.error 与抛出的 JobExecutionError 均为固定文案 'xTB job timed out after 5 minutes'（xtb_runner.py:64-71）。同时确认超时确实参数化：job_types/xtb/executor.py:47 传 prepared.job_data.timeout_seconds，request.py:73-78 允许 5–86400s；engines/process_runner.py:52 在超时抛的正是 subprocess.TimeoutExpired，调用链无任何中间层改写该异常。

**验证补充**：补充：非持久路径 engines/xtb/execution.py:62-67 已经根据实际 timeout 动态生成文案（timeout==300 时才写 '> 5 min'），说明只有 durable runner 这一处文案在重构后遗漏同步。修复时顺带注意 xtb_runner 拿不到 timeout_seconds（在 executor 内部 prepare），可改为通用文案或让 executor 抛带时长的异常。


## [MINOR / confirmed] /optimize 公共契约缺少 Job 路径已有的边界校验：multiplicity 可为 0/负数变成 --uhf -1，symbol 未校验可写坏 XYZ

**位置**：`software/backend/engines/xtb/contracts.py:22`（维度：backend-diff）

**缺陷**：XtbOptimizationRequest 现在直接作为 /optimize 与 /optimize/stream 的公共请求模型（routers/optimize.py `XtbOptimizationRequest as OptimizeRequest`），但 multiplicity: int = 1 无 ge=1 约束（charge 亦无界），build_xtb_command 里 `str(request.multiplicity - 1)` 会生成 `--uhf -1`；XtbAtom.symbol 是任意字符串，write_xyz 用 `atom.symbol.capitalize():4s` 原样写入，含空白/换行的 symbol 会破坏 XYZ 行结构导致 xtb 解析错乱。持久任务路径的 XtbOptimizationParametersV1 有 multiplicity ge=1，两套校验强度不一致，HTTP 快捷路径成了绕过面（命令以 argv 列表执行，无 shell 注入，但畸形输入直达引擎）。

**触发**：客户端 POST /optimize 传 {"multiplicity": 0} 或 symbol 带换行的原子 → xtb 收到 `--uhf -1` 或错行的 input.xyz，以引擎自身报错告终，接口返回 500/XtbMissingOutputError 并把 xtb 日志尾部回显给用户；相同参数走持久任务路径则在创建时就被 422 拒绝，两条路径行为不一致。

**证据**：contracts.py: `charge: int = 0` / `multiplicity: int = 1`（无约束）；command.py:28-29 `"--uhf", str(request.multiplicity - 1)`；geometry.py:13-20 write_xyz 未过滤 symbol。对比 job_types/xtb/request.py:57 `multiplicity: int = Field(default=1, ge=1)`。

**验证**：三层复现全部跑通：(1) XtbOptimizationRequest 接受 multiplicity=0、charge=-999、symbol='H\nfoo bar'（pydantic 无约束）；(2) build_xtb_command 生成 ['--uhf', '-1']，write_xyz 输出声明 2 原子却含 3 行数据的坏 XYZ（换行 symbol 断行）；(3) FastAPI TestClient POST /optimize {multiplicity: 0} 通过校验直达引擎启动（本机无 xtb 返回 503 而非 422，证明无任何校验拦截）；对照 normalize_xtb_optimization_type_data_v1 对同样输入抛 ValidationError（ge=1）。routers/optimize.py 直接 `XtbOptimizationRequest as OptimizeRequest`，链上唯一 guard 是 _validate_structure 的原子数>=2，挡不住此类输入。

**验证补充**：失败场景微修正：本环境无 xtb 二进制，畸形输入到达引擎后 xtb 自身的具体报错形态（500/XtbMissingOutputError 回显日志尾部）未实测，但『HTTP 快捷路径成为绕过面、两条路径校验强度不一致』已完整实证。argv 列表执行、无 shell 注入的判断也正确。


## [MINOR / plausible] (run_id, name) 幂等键只比较文件字节身份，忽略 metadata/media_type，重放时语义结果差异被静默吞掉

**位置**：`software/backend/jobs/repository.py:966`（维度：backend-diff）

**缺陷**：add_artifact 的幂等分支只比较 sha256/storage_key/path 三项，相同则返回旧记录。但 xTB/Psi4 collector 把核心科学结果（structure、molecule、energy、converged、frameCount 等）放在 metadata_json 里，而不是文件字节中；media_type 同样不参与比较。同一 run 重放时若文件字节相同但 metadata 语义不同（例如修复 collector 解析 bug 后 converged/energy 计算结果变化，或调用方换了 media_type），会静默返回携带旧 metadata 的 Artifact，与文档“相同内容重放返回已有 Artifact，不同内容则拒绝覆盖”中“内容”的语义只覆盖了字节层。另外当 _artifact_identity 因文件缺失返回空（sha256 双方均为 None）时，仅凭 path 相等即判定为同一 Artifact。

**触发**：worker 恢复后对同一 run 重放收集：xtbopt.xyz 字节未变但修复后的 parse_energy_steps 得出不同 energy/converged → add_artifact 返回旧 metadata 的 Artifact，API/前端继续展示错误的能量与收敛标志，且无任何冲突报错提示数据未更新。

**证据**：repository.py:966-974 `if (persisted.sha256 != artifact.sha256 or persisted.storage_key != artifact.storage_key or persisted.path != artifact.path): raise ...; return persisted`——无 metadata_json/media_type 比较；collector.py:106-126 optimized.xyz 的 energy/converged/structure 全在 metadata 里。

**验证**：代码层行为复现成功：对同一 (run_id, name) 先后 add_artifact，文件字节不变但 metadata（energy -5.07→-5.10, converged False→True）和 media_type（chemical/x-xyz→text/plain）不同，第二次静默返回旧记录旧 metadata，无冲突报错——repository.py:966-974 确实只比较 sha256/storage_key/path。但沿真实调用链追，finding 描述的触发场景当前不可达：_ALLOWED_TRANSITIONS（service.py:96-104）中 interrupted/failed/succeeded 均为终态，worker 重启只会把 running 标成 interrupted 且无法重新入队；claim_queued_job 每次 claim 生成全新 run_id（service.py:1144-1145）；retry_job 创建全新 Job。即现有代码没有任何路径会对同一 run_id 二次执行 collect，幂等分支在生产中只会遇到字节与 metadata 都相同的重放。

**验证补充**：失败场景需修正：『worker 恢复后对同一 run 重放收集』在当前生命周期下不可能发生（interrupted 是终态，重跑走新 Job/新 run）。这是针对文档设计意图（job-kernel-and-job-types.md:267 幂等重放、:297 修复 Collector 后重新收集）的潜在契约缺口——若未来实现同 run 重放，metadata 语义差异确会被静默吞掉；sha256 双 None 时仅凭 path 判同的子问题同样属于该未来路径。作为当下缺陷不成立，作为幂等键语义不完整的隐患成立。


## 被证伪的发现（勿修）

- [editing-ops] cycleBondLength 升键级删 H、降键级不补 H，循环一整圈把乙烷永久变成 HC–CH，违反价态完整不变式

- [geometry-math] cycleBondLength/runCycleBondOrderCommand 对表外元素对的已有双/三键直接拒绝，键级被永久卡死无法降回单键
