import { useDrawWorkspacePanelModel } from '../../model/useDrawWorkspacePanelModel'
import { BondWorkspacePanel } from './BondWorkspacePanel'
import { CoordinationSitePicker } from './CoordinationSitePicker'
import { ElementGeometrySection } from './ElementGeometrySection'
import { ElementPickerSection } from './ElementPickerSection'

export interface DrawWorkspacePanelProps {
  activeElement: string
  atomClickMode: 'grow' | 'replace'
  inspectedElement: string
  activeFragmentId: string | null
  onInspectElement: (symbol: string) => void
  onPickAtom: (symbol: string) => void
  onPickHydrogenGrow: () => void
  onPickFragment: (id: string) => void
  onBeginAttachmentSitePick: () => void
  onPickAttachmentSite: (fragmentId: string, siteId: string) => boolean
  selectedAtomCount: number
  selectedBond: { readonly id: string; readonly order: 1 | 2 | 3; readonly atomSymbols: readonly string[] } | null
  onConnectSelectedAtoms: () => void
  onSetBondOrder: (order: 1 | 2 | 3) => void
  onDeleteSelectedBond: () => void
}

export function DrawWorkspacePanel(props: DrawWorkspacePanelProps) {
  const model = useDrawWorkspacePanelModel({
    inspectedElement: props.inspectedElement,
    onBeginAttachmentSitePick: props.onBeginAttachmentSitePick,
    onPickAttachmentSite: props.onPickAttachmentSite,
    onPickFragment: props.onPickFragment,
  })

  if (model.attachment) {
    return (
      <CoordinationSitePicker
        model={model.attachment.model}
        siteOptions={model.attachment.siteOptions}
        selectedSiteId={model.selectedAttachmentSiteId}
        onSelect={model.chooseAttachmentSite}
        onBack={model.closeAttachmentPicker}
      />
    )
  }

  return (
    <div className="h-full space-y-3 overflow-y-auto [scrollbar-color:currentColor_transparent] [scrollbar-width:thin]">
      <ElementPickerSection
        inspectedElement={props.inspectedElement}
        elementName={model.element.name}
        onInspectElement={props.onInspectElement}
      />

      <ElementGeometrySection
        activeElement={props.activeElement}
        atomClickMode={props.atomClickMode}
        inspectedElement={props.inspectedElement}
        elementName={model.element.name}
        activeFragmentId={props.activeFragmentId}
        fragments={model.fragments}
        onPickAtom={props.onPickAtom}
        onPickHydrogenGrow={props.onPickHydrogenGrow}
        onChooseFragment={model.chooseFragment}
      />

      <section aria-label="键编辑" className="border-t border-border pt-3">
        <BondWorkspacePanel
          selectedAtomCount={props.selectedAtomCount}
          selectedBond={props.selectedBond}
          onConnectSelectedAtoms={props.onConnectSelectedAtoms}
          onSetBondOrder={props.onSetBondOrder}
          onDeleteSelectedBond={props.onDeleteSelectedBond}
        />
      </section>
    </div>
  )
}
