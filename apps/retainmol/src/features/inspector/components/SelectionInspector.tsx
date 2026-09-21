import { useMemo, useRef } from 'react'
import { useInspectorContext } from '../model/useInspectorContext'
import { buildInspectorModel } from '../model/inspectorModel'
import {
  AtomInspector,
  BondInspector,
  MoleculeInspector,
  MultiSelectionInspector,
} from './SelectionInspectorViews'

export function SelectionInspector() {
  const detailsRef = useRef<HTMLElement>(null)
  const { molecule, object, revision, selectedAtomIds, selectedBondIds, editReason } = useInspectorContext()
  const model = useMemo(
    () => buildInspectorModel(molecule, selectedAtomIds, selectedBondIds),
    [molecule, selectedAtomIds, selectedBondIds],
  )

  const content = (() => {
    switch (model.mode) {
      case 'molecule': return <MoleculeInspector model={model} />
      case 'atom': return object && <AtomInspector key={`${object.id}:${model.atom.atom.id}`} model={model} onNavigate={() => detailsRef.current?.focus()} target={{ objectId: object.id, kind: 'atom', id: model.atom.atom.id, revision, label: `${model.atom.atom.symbol} #${model.atom.number}` }} />
      case 'bond': return object && <BondInspector key={`${object.id}:${model.bond.id}`} model={model} target={{ objectId: object.id, kind: 'bond', id: model.bond.id, revision, label: `${model.first.atom.symbol} #${model.first.number}—${model.second.atom.symbol} #${model.second.number}` }} />
      case 'multi': return <MultiSelectionInspector model={model} />
    }
  })()
  return <section ref={detailsRef} tabIndex={-1} aria-label="选中对象详情" className="focus-visible:outline-2 focus-visible:outline-ring">
    {editReason && <p className="px-3 pt-3 text-xs text-muted-foreground">编辑不可用：{editReason}</p>}
    <fieldset disabled={!!editReason} className="min-w-0">{content}</fieldset>
  </section>
}
