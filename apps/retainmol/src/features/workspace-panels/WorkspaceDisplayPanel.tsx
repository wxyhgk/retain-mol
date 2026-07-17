import type { ComponentType, ReactNode } from 'react'
import {
  listRenderProfiles,
  listStylePresets,
  listThemes,
  resolveTheme,
  type RenderStyle,
} from '@retainmol/mol-viewer/styles'
import type { DisplayMode } from '@retainmol/mol-viewer/core'
import { Atom, Box, CircleDot, Hash, Minus, StretchHorizontal, Torus } from 'lucide-react'
import { useEditorStore } from '@/domain/viewer/editorState'
import { cn } from '@/lib/utils'

type Icon = ComponentType<{ size?: number; strokeWidth?: number }>
const DISPLAY_MODES: { id: DisplayMode; label: string; icon: Icon }[] = [
  { id: 'ball-stick', label: '球棍', icon: Atom },
  { id: 'spacefill', label: '空填', icon: CircleDot },
  { id: 'stick', label: '棍棒', icon: Minus },
  { id: 'tube', label: '管状', icon: Torus },
  { id: 'mtube', label: '团簇', icon: Box },
  { id: 'wireframe', label: '线框', icon: StretchHorizontal },
]

export function WorkspaceDisplayPanel() {
  const stylePresetId = useEditorStore(state => state.stylePresetId)
  const setStylePreset = useEditorStore(state => state.setStylePreset)
  const displayMode = useEditorStore(state => state.displayMode)
  const setDisplayMode = useEditorStore(state => state.setDisplayMode)
  const renderStyle = useEditorStore(state => state.renderStyle)
  const setRenderStyle = useEditorStore(state => state.setRenderStyle)
  const themeId = useEditorStore(state => state.themeId)
  const setTheme = useEditorStore(state => state.setTheme)
  const showAtomLabels = useEditorStore(state => state.showAtomLabels)
  const toggleAtomLabels = useEditorStore(state => state.toggleAtomLabels)
  const presets = listStylePresets()
  const profiles = listRenderProfiles()
  const themes = listThemes()

  return (
    <div className="space-y-5 p-3 text-foreground">
      <WorkspaceSection title="软件风格">
        <div className="grid grid-cols-2 gap-2">
          {presets.map(preset => (
            <OptionButton key={preset.id} active={stylePresetId === preset.id} title={preset.description} onClick={() => setStylePreset(preset.id)}>
              <span className="block truncate text-[11px] font-semibold">{preset.name}</span>
              <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">完整 preset</span>
            </OptionButton>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="显示模式">
        <div className="grid grid-cols-3 gap-2">
          {DISPLAY_MODES.map(mode => {
            const ModeIcon = mode.icon
            return (
              <OptionButton key={mode.id} active={displayMode === mode.id} onClick={() => setDisplayMode(mode.id)} className="flex h-12 flex-col items-center justify-center gap-1 p-1 text-center">
                <ModeIcon size={14} strokeWidth={2.2} />
                <span className="text-[10px] font-medium">{mode.label}</span>
              </OptionButton>
            )
          })}
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="渲染器">
        <div className="grid grid-cols-3 gap-2">
          {profiles.map(profile => (
            <OptionButton key={profile.id} active={renderStyle === profile.id} title={profile.description} onClick={() => setRenderStyle(profile.id as RenderStyle)} className="h-9 px-2 text-center text-[10px] font-semibold">
              <span className="block truncate">{profile.name}</span>
            </OptionButton>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="配色">
        <div className="grid grid-cols-6 gap-2">
          {themes.map(theme => (
            <button
              key={theme.id}
              type="button"
              title={theme.name}
              aria-label={theme.name}
              aria-pressed={themeId === theme.id}
              onClick={() => setTheme(theme.id)}
              className={cn(
                'flex h-10 items-center justify-center rounded-md border transition-colors',
                themeId === theme.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-foreground',
              )}
            >
              <ThemeSwatch themeId={theme.id} active={themeId === theme.id} />
            </button>
          ))}
        </div>
      </WorkspaceSection>

      <WorkspaceSection title="标注">
        <OptionButton active={showAtomLabels} onClick={toggleAtomLabels} className="flex h-10 w-full items-center gap-2 px-3">
          <Hash size={14} /><span className="text-[11px] font-medium">显示原子编号</span>
          <span className="ml-auto text-[9px]">{showAtomLabels ? '开' : '关'}</span>
        </OptionButton>
      </WorkspaceSection>
    </div>
  )
}

function WorkspaceSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-2"><h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>{children}</section>
}

function OptionButton({ active, title, className, onClick, children }: { active: boolean; title?: string; className?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'min-h-11 min-w-0 rounded-md border p-2 text-left transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-card-foreground hover:border-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

function ThemeSwatch({ themeId, active }: { themeId: string; active: boolean }) {
  const theme = resolveTheme(themeId)
  const colors = [theme.scene.backgroundColor, theme.elements.C?.color ?? theme.fallbackColor, theme.elements.N?.color ?? theme.fallbackColor, theme.elements.O?.color ?? theme.fallbackColor]
  return (
    <span className={cn('relative block size-6 overflow-hidden rounded-md border shadow-inner', active ? 'border-primary-foreground' : 'border-border')} style={{ backgroundColor: colors[0] }}>
      {colors.slice(1).map((color, index) => (
        <span key={`${color}-${index}`} className={cn('absolute size-3 rounded-full border border-white/70', index === 0 && 'left-1 top-1', index === 1 && 'right-1 top-1', index === 2 && 'bottom-1 left-1/2 -translate-x-1/2')} style={{ backgroundColor: color }} />
      ))}
    </span>
  )
}
