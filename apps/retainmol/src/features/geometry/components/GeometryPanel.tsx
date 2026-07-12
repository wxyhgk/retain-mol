import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useEditorStore } from '@/domain/viewer/editorState'
import { calcAngle, calcDihedral, calcDistance } from '@/domain/viewer/geometry'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { getElementConfig as getElement } from '@retainmol/mol-viewer/core'
import { useMoleculeInfo } from '@/hooks/useMoleculeInfo'
import { Button } from '@/components/ui/button'
import { Trash2, ArrowUpDown, Link, FlaskRound } from 'lucide-react'
import { connectSelectedAtoms } from '@/domain/editorCommands'
import { OptimizationControls } from '@/features/geometry-optimization'

function colorHexToCss(hex: number) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-2.5 py-1.5">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-800 font-mono text-xs">{value}</span>
    </div>
  )
}

function CoordInput({ label, value, onCommit }: { label: string; value: number; onCommit: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const commit = () => {
    const n = parseFloat(draft)
    if (!isNaN(n) && n !== value) onCommit(n)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div
        className="cursor-text rounded px-1 -mx-1 hover:bg-gray-100 transition-colors"
        onClick={() => { setDraft(value.toFixed(4)); setEditing(true) }}
        title="点击编辑"
      >
        <span className="text-gray-400 mr-1">{label}</span>{value.toFixed(4)}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 -mx-1 px-1">
      <span className="text-gray-400">{label}</span>
      <input
        type="text"
        value={draft}
        autoFocus
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onFocus={e => e.target.select()}
        onKeyDown={e => {
          if (e.key === 'Enter') { (e.target as HTMLInputElement).blur() }
          else if (e.key === 'Escape') { setEditing(false) }
        }}
        className="flex-1 font-mono text-xs bg-white border border-gray-300 rounded px-1 outline-none focus:border-gray-500"
      />
    </div>
  )
}

export default function GeometryPanel() {
  const {
    selectedAtomIds, selectedBondIds, removeAtoms, removeBond,
    cycleBondOrder, addHydrogens, moveAtom,
    setBondLength, setBondAngle, setDihedralAngle,
  } = useMoleculeStore(useShallow(state => ({
    selectedAtomIds: state.selectedAtomIds,
    selectedBondIds: state.selectedBondIds,
    removeAtoms: state.removeAtoms,
    removeBond: state.removeBond,
    cycleBondOrder: state.cycleBondOrder,
    addHydrogens: state.addHydrogens,
    moveAtom: state.moveAtom,
    setBondLength: state.setBondLength,
    setBondAngle: state.setBondAngle,
    setDihedralAngle: state.setDihedralAngle,
  })))
  const flashHint = useEditorStore(s => s.flashHint)
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const { formula, molecularWeight: MW } = useMoleculeInfo()

  const atomById = new Map(molecule.atoms.map(a => [a.id, a]))
  const selectedAtoms = molecule.atoms.filter(a => selectedAtomIds.has(a.id))
  const selectedBonds = molecule.bonds.filter(b => selectedBondIds.has(b.id))

  // Section B: 2/3/4 个选中原子的几何参数（GaussView 式：点击数值直接修改）
  // 顺序 = 选择顺序（Set 保持插入序）：3 原子的顶点是第 2 个，4 原子绕 2–3 轴旋转
  const renderLiveGeometry = () => {
    const sel = [...selectedAtomIds]
      .map(id => atomById.get(id))
      .filter((a): a is NonNullable<typeof a> => !!a)
    if (sel.length < 2 || sel.length > 4) return null

    const label = sel.map(a => a.symbol).join('—')
    let value = 0
    let unit = ''
    let editHint = ''
    let commit: (v: number) => { ok: boolean; reason?: string }

    if (sel.length === 2) {
      value = calcDistance(sel[0], sel[1])
      unit = 'Å'
      editHint = '修改距离将平移后选原子一侧'
      commit = v => setBondLength(sel[0].id, sel[1].id, v)
    } else if (sel.length === 3) {
      value = calcAngle(sel[0], sel[1], sel[2])
      unit = '°'
      editHint = '键角顶点 = 第 2 个选中原子 · 转动末端一侧'
      commit = v => setBondAngle(sel[0].id, sel[1].id, sel[2].id, v)
    } else {
      value = calcDihedral(sel[0], sel[1], sel[2], sel[3])
      unit = '°'
      editHint = '二面角绕 2–3 号原子轴转动末端一侧'
      commit = v => setDihedralAngle(sel[0].id, sel[1].id, sel[2].id, sel[3].id, v)
    }

    return (
      <section>
        <div className="text-xs font-medium text-gray-700 mb-2">
          {sel.length === 2 ? '距离' : sel.length === 3 ? '键角' : '二面角'}
          <span className="text-gray-400 font-normal ml-1">· 点击数值修改</span>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {sel.map((a, i) => {
                const el = getElement(a.symbol)
                return (
                  <span key={a.id} className="flex items-center gap-0.5">
                    {i > 0 && <span className="text-gray-400 text-xs">—</span>}
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: colorHexToCss(el.color) }}
                    >
                      {a.symbol}
                    </span>
                  </span>
                )
              })}
            </div>
            <div className="flex items-center gap-1 font-mono text-xs text-gray-800 shrink-0">
              <CoordInput
                label=""
                value={value}
                onCommit={v => {
                  const r = commit(v)
                  if (!r.ok) flashHint(r.reason ?? '无法调整')
                }}
              />
              <span className="text-gray-400">{unit}</span>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-mono">{label}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{editHint}</div>
        </div>
      </section>
    )
  }

  return (
    <div className="p-3 space-y-4 text-sm text-gray-800">
      {/* Section A: 分子摘要 */}
      <section>
        <div className="text-xs font-medium text-gray-700 mb-2">分子摘要</div>
        <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
          <Row label="名称" value={molecule.name ?? '—'} />
          <Row label="分子式" value={formula || '—'} />
          <Row
            label="分子量"
            value={MW === null ? '质量未知' : MW > 0 ? `${MW.toFixed(3)} g/mol` : '—'}
          />
          <Row label="原子数" value={String(molecule.atoms.length)} />
          <Row label="键数" value={String(molecule.bonds.length)} />
        </div>
      </section>

      <OptimizationControls atomCount={molecule.atoms.length} bondCount={molecule.bonds.length} />

      {/* Section B: 实时几何关系 */}
      {renderLiveGeometry()}

      {/* 恰好选中两原子时：快速成键 (Section D helper) */}
      {selectedAtoms.length === 2 && (
        <section>
          <button
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-xs font-semibold hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={connectSelectedAtoms}
          >
            <Link size={13} />
            连接两原子
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-1">或按 B 键</p>
        </section>
      )}

      {/* Section C: 选中原子 */}
      {selectedAtoms.length > 0 && (
        <section>
          <div className="text-xs font-medium text-gray-700 mb-2">
            选中原子 ({selectedAtoms.length})
          </div>
          <div className="space-y-2">
            {selectedAtoms.map(a => {
              const el = getElement(a.symbol)
              return (
                <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: colorHexToCss(el.color) }}
                      >
                        {a.symbol}
                      </span>
                      <span className="font-semibold text-gray-800">{el.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => addHydrogens(a.id)} title="补氢">
                        <FlaskRound size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => removeAtoms([a.id])}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5 font-mono bg-gray-50 rounded p-1.5">
                    <CoordInput label="x" value={a.x} onCommit={v => moveAtom(a.id, v, a.y, a.z)} />
                    <CoordInput label="y" value={a.y} onCommit={v => moveAtom(a.id, a.x, v, a.z)} />
                    <CoordInput label="z" value={a.z} onCommit={v => moveAtom(a.id, a.x, a.y, v)} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1.5">
                    Z={el.atomicNumber || '—'}  M={el.atomicMass !== null && el.atomicMass > 0 ? el.atomicMass : '未知'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Section D: 选中键 */}
      {selectedBonds.length > 0 && (
        <section>
          <div className="text-xs font-medium text-gray-700 mb-2">
            选中键 ({selectedBonds.length})
          </div>
          <div className="space-y-2">
            {selectedBonds.map(b => {
              const a1 = atomById.get(b.atomId1)
              const a2 = atomById.get(b.atomId2)
              if (!a1 || !a2) return null
              const dx = a1.x - a2.x, dy = a1.y - a2.y, dz = a1.z - a2.z
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
              const orderLabel = b.order === 1 ? '单键' : b.order === 2 ? '双键' : '三键'
              return (
                <div key={b.id} className="rounded-lg border border-gray-200 bg-white p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-gray-800">{a1.symbol} — {a2.symbol}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => cycleBondOrder(b.id)} title="切换键级">
                        <ArrowUpDown size={12} />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => removeBond(b.id)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex gap-3">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">{orderLabel}</span>
                    <span className="font-mono">{dist.toFixed(3)} Å</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Section E: Empty state */}
      {selectedAtoms.length === 0 && selectedBonds.length === 0 && (
        <div className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
          点击原子或键以查看属性
        </div>
      )}
    </div>
  )
}
