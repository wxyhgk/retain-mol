import { useShallow } from 'zustand/react/shallow'
import { Atom as AtomIcon, Eraser, FlaskConical, Link2, Plus, Trash2 } from 'lucide-react'
import { COMMON_ELEMENT_SYMBOLS, getElementConfig } from '@retainmol/mol-viewer/core'
import { useEditorStore } from '@/domain/viewer/editorState'
import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { OptimizationControls } from '@/features/geometry-optimization'
import { cn } from '@/lib/utils'
import type { EditableGeometry, SelectionInspectorModel } from '../model/selectionInspectorModel'
import { bondOrderLabel, formatCharge } from '../model/inspectorFormatters'
import {
  ActionButton,
  CountTile,
  ElementSwatch,
  EndpointBadge,
  InspectorLayout,
  InspectorSection,
  IntegerStepper,
  LabeledNumberInput,
  PropertyControlRow,
  PropertyList,
  PropertyRow,
} from './InspectorPrimitives'

type AtomModel = Extract<SelectionInspectorModel, { mode: 'atom' }>
type BondModel = Extract<SelectionInspectorModel, { mode: 'bond' }>
type MultiModel = Extract<SelectionInspectorModel, { mode: 'multi' }>

export function MoleculeInspector({ model }: {
  model: Extract<SelectionInspectorModel, { mode: 'molecule' }>
}) {
  const { autoInferBonds, addHydrogens, clearMolecule } = useMoleculeStore(useShallow(state => ({
    autoInferBonds: state.autoInferBonds,
    addHydrogens: state.addHydrogens,
    clearMolecule: state.clearMolecule,
  })))
  const isEmpty = model.atomCount === 0
  return (
    <InspectorLayout>
      <InspectorSection title="分子">
        <PropertyList>
          <PropertyRow label="分子式" value={model.formula || '—'} />
          <PropertyRow label="质量" value={model.molecularWeight === null ? '未知' : model.molecularWeight > 0 ? `${model.molecularWeight.toFixed(3)} g/mol` : '—'} />
          <PropertyRow label="原子" value={String(model.atomCount)} />
          <PropertyRow label="键" value={String(model.bondCount)} />
        </PropertyList>
      </InspectorSection>
      <InspectorSection title="结构">
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <ActionButton icon={<Link2 />} label="推断键" disabled={model.atomCount < 2} onClick={autoInferBonds} />
          <ActionButton icon={<FlaskConical />} label="补氢" disabled={isEmpty} onClick={() => addHydrogens()} />
          <ActionButton danger icon={<Eraser />} label="清空" disabled={isEmpty} className="col-span-2" onClick={() => { if (confirm('清空所有原子和键？')) clearMolecule() }} />
        </div>
      </InspectorSection>
      <OptimizationControls atomCount={model.atomCount} bondCount={model.bondCount} />
    </InspectorLayout>
  )
}

export function AtomInspector({ model }: { model: AtomModel }) {
  const { atom, number } = model.atom
  const element = getElementConfig(atom.symbol)
  const actions = useMoleculeStore(useShallow(state => ({
    addOneHydrogen: state.addOneHydrogen,
    canAddOneHydrogen: state.canAddOneHydrogen,
    moveAtom: state.moveAtom,
    removeAtom: state.removeAtom,
    replaceAtom: state.replaceAtom,
    setAtomCharge: state.setAtomCharge,
    setAtomRadical: state.setAtomRadical,
  })))
  const addHydrogenAvailability = actions.canAddOneHydrogen(atom.id)
  const elementOptions = atom.symbol === '' || COMMON_ELEMENT_SYMBOLS.includes(atom.symbol) ? COMMON_ELEMENT_SYMBOLS : [atom.symbol, ...COMMON_ELEMENT_SYMBOLS]
  return (
    <InspectorLayout>
      <div className="flex min-w-0 items-center gap-2.5">
        <ElementSwatch symbol={atom.symbol} size="lg" />
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-foreground">{element.name}</div><div className="truncate text-[11px] text-muted-foreground">原子 #{number}</div></div>
        <select aria-label="替换元素" title="替换元素" value={atom.symbol} onChange={event => actions.replaceAtom(atom.id, event.target.value)} className="h-8 min-w-0 max-w-24 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring">
          {elementOptions.map(symbol => <option key={symbol} value={symbol}>{symbol}</option>)}
        </select>
      </div>
      <InspectorSection title="属性"><PropertyList>
        <PropertyRow label="元素" value={`${atom.symbol} · Z=${element.atomicNumber || '—'}`} />
        <PropertyRow label="编号" value={`#${number}`} />
        <PropertyRow label="推断杂化" value={model.hybridization} />
        <PropertyControlRow label="形式电荷"><IntegerStepper value={atom.charge ?? 0} min={-4} max={4} format={formatCharge} onChange={value => actions.setAtomCharge(atom.id, value)} /></PropertyControlRow>
        <PropertyControlRow label="自由基"><IntegerStepper value={atom.radical ?? 0} min={0} max={3} format={value => value === 0 ? '无' : String(value)} onChange={value => actions.setAtomRadical(atom.id, value)} /></PropertyControlRow>
      </PropertyList></InspectorSection>
      <InspectorSection title="坐标"><div className="grid min-w-0 grid-cols-3 gap-2">
        <LabeledNumberInput label="X" value={atom.x} decimals={4} onCommit={value => actions.moveAtom(atom.id, value, atom.y, atom.z)} />
        <LabeledNumberInput label="Y" value={atom.y} decimals={4} onCommit={value => actions.moveAtom(atom.id, atom.x, value, atom.z)} />
        <LabeledNumberInput label="Z" value={atom.z} decimals={4} onCommit={value => actions.moveAtom(atom.id, atom.x, atom.y, value)} />
      </div></InspectorSection>
      <InspectorSection title={`邻接键 · ${model.neighbors.length}`}>
        {model.neighbors.length === 0 ? <div className="rounded-md border border-dashed border-border px-2.5 py-3 text-center text-xs text-muted-foreground">无邻接键</div> : (
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted">{model.neighbors.map(neighbor => (
            <div key={neighbor.bond.id} className="flex min-w-0 items-center gap-2 px-2.5 py-2"><ElementSwatch symbol={neighbor.atom.symbol} /><span className="min-w-0 flex-1 truncate text-xs text-foreground">{neighbor.atom.symbol} #{neighbor.atomNumber}</span><span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">{neighbor.length.toFixed(3)} Å</span></div>
          ))}</div>
        )}
      </InspectorSection>
      <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-border pt-3">
        <ActionButton icon={<Plus />} label="加 H" disabled={!addHydrogenAvailability.ok} title={addHydrogenAvailability.reason} onClick={() => actions.addOneHydrogen(atom.id)} />
        <ActionButton danger icon={<Trash2 />} label="删除原子" onClick={() => actions.removeAtom(atom.id)} />
      </div>
    </InspectorLayout>
  )
}

export function BondInspector({ model }: { model: BondModel }) {
  const { removeBond, setBondLength, setBondOrder } = useMoleculeStore(useShallow(state => ({ removeBond: state.removeBond, setBondLength: state.setBondLength, setBondOrder: state.setBondOrder })))
  const flashHint = useEditorStore(state => state.flashHint)
  return (
    <InspectorLayout>
      <div className="flex min-w-0 items-center gap-2"><EndpointBadge atom={model.first.atom} number={model.first.number} /><span className="shrink-0 text-muted-foreground">—</span><EndpointBadge atom={model.second.atom} number={model.second.number} /></div>
      <InspectorSection title="键属性"><PropertyList>
        <PropertyRow label="两端" value={`${model.first.atom.symbol} #${model.first.number} · ${model.second.atom.symbol} #${model.second.number}`} />
        <PropertyRow label="键级" value={bondOrderLabel(model.bond.order)} /><PropertyRow label="芳香" value={model.bond.aromatic ? '是' : '否'} />
      </PropertyList></InspectorSection>
      <InspectorSection title="键级"><div className="grid grid-cols-3 overflow-hidden rounded-md border border-border bg-muted p-1">{([1, 2, 3] as const).map(order => (
        <button key={order} type="button" aria-pressed={model.bond.order === order} onClick={() => setBondOrder(model.bond.id, order)} className={cn('h-8 rounded text-xs font-medium transition-colors', model.bond.order === order ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>{bondOrderLabel(order)}</button>
      ))}</div></InspectorSection>
      <InspectorSection title="长度"><LabeledNumberInput label="键长" value={model.length} decimals={4} min={0.1} unit="Å" onCommit={value => { const result = setBondLength(model.first.atom.id, model.second.atom.id, value); if (!result.ok) flashHint(result.reason ?? '无法修改键长') }} /></InspectorSection>
      <div className="border-t border-border pt-3"><ActionButton danger icon={<Trash2 />} label="删除键" className="w-full" onClick={() => removeBond(model.bond.id)} /></div>
    </InspectorLayout>
  )
}

export function MultiSelectionInspector({ model }: { model: MultiModel }) {
  return (
    <InspectorLayout>
      <InspectorSection title="选择"><div className="grid grid-cols-2 gap-2"><CountTile icon={<AtomIcon />} label="原子" value={model.selectedAtomCount} /><CountTile icon={<Link2 />} label="键" value={model.selectedBondCount} /></div></InspectorSection>
      {model.geometry && <EditableGeometryPanel geometry={model.geometry} />}
    </InspectorLayout>
  )
}

function EditableGeometryPanel({ geometry }: { geometry: EditableGeometry }) {
  const { setBondAngle, setBondLength, setDihedralAngle } = useMoleculeStore(useShallow(state => ({ setBondAngle: state.setBondAngle, setBondLength: state.setBondLength, setDihedralAngle: state.setDihedralAngle })))
  const flashHint = useEditorStore(state => state.flashHint)
  const label = geometry.kind === 'distance' ? '距离' : geometry.kind === 'angle' ? '键角' : '二面角'
  const commit = (value: number) => {
    const ids = geometry.atomIds
    const result = geometry.kind === 'distance' ? setBondLength(ids[0], ids[1], value) : geometry.kind === 'angle' ? setBondAngle(ids[0], ids[1], ids[2], value) : setDihedralAngle(ids[0], ids[1], ids[2], ids[3], value)
    if (!result.ok) flashHint(result.reason ?? `无法修改${label}`)
  }
  return (
    <InspectorSection title={label}><div className="space-y-2 rounded-md border border-border bg-muted p-2.5">
      <div className="flex min-w-0 flex-wrap items-center gap-1">{geometry.atoms.map(({ atom, number }, index) => <div key={atom.id} className="contents">{index > 0 && <span className="text-[11px] text-muted-foreground">—</span>}<EndpointBadge atom={atom} number={number} compact /></div>)}</div>
      <LabeledNumberInput label={label} value={geometry.value} decimals={geometry.kind === 'distance' ? 4 : 3} min={geometry.kind === 'distance' ? 0.1 : undefined} max={geometry.kind === 'angle' ? 180 : undefined} unit={geometry.unit} onCommit={commit} />
    </div></InspectorSection>
  )
}
