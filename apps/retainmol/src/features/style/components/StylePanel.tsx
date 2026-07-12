import {
  listStylePresets,
  listRenderProfiles,
  listThemes,
  resolveTheme,
} from '@retainmol/mol-viewer/styles'
import { useEditorStore } from '@/domain/viewer/editorState'
import type { DisplayMode } from '@retainmol/mol-viewer/core'
import type { RenderStyle } from '@retainmol/mol-viewer/styles'
import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'
import {
  Atom,
  Box,
  CircleDot,
  Hash,
  Minus,
  SlidersHorizontal,
  StretchHorizontal,
  Torus,
} from 'lucide-react'

type IconComponent = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

const DISPLAY_MODES: { id: DisplayMode; label: string; desc: string; icon: IconComponent }[] = [
  { id: 'ball-stick', label: '球棍', desc: 'Ball & Stick', icon: Atom },
  { id: 'spacefill', label: '空填', desc: 'Space Fill', icon: CircleDot },
  { id: 'stick', label: '棍棒', desc: 'Stick', icon: Minus },
  { id: 'tube', label: '管状', desc: 'Tube', icon: Torus },
  { id: 'mtube', label: '团簇', desc: 'Big Balls', icon: Box },
  { id: 'wireframe', label: '线框', desc: 'Wireframe', icon: StretchHorizontal },
]

export default function StylePanel() {
  const {
    stylePresetId, setStylePreset,
    displayMode, setDisplayMode,
    renderStyle, setRenderStyle,
    showAtomLabels, toggleAtomLabels,
    themeId, setTheme,
  } = useEditorStore()

  const stylePresets = listStylePresets()
  const renderProfiles = listRenderProfiles()
  const themes = listThemes()
  const currentPreset = stylePresets.find(preset => preset.id === stylePresetId)
  const isCustomStyle = !currentPreset

  return (
    <div className="p-3 space-y-4">
      <PanelSection title="渲染风格">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            {stylePresets.map(preset => (
              <PresetOption
                key={preset.id}
                active={stylePresetId === preset.id}
                label={preset.name}
                title={preset.description}
                onClick={() => setStylePreset(preset.id)}
              />
            ))}
          </div>

          <div
            className={cn(
              'flex min-h-8 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px]',
              isCustomStyle
                ? 'border-foreground bg-foreground text-background'
                : 'border-gray-200 bg-gray-50 text-gray-500'
            )}
          >
            <SlidersHorizontal size={13} />
            <span className="font-semibold">{isCustomStyle ? '自定义' : currentPreset.name}</span>
            <span className="min-w-0 flex-1 truncate">
              {isCustomStyle ? '已覆盖软件 preset 的底层参数' : currentPreset.description}
            </span>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="高级覆盖">
        <div className="space-y-3">
          <SubSectionTitle>显示模式</SubSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {DISPLAY_MODES.map(mode => (
              <IconOption
                key={mode.id}
                icon={mode.icon}
                active={displayMode === mode.id}
                label={mode.label}
                title={mode.desc}
                onClick={() => setDisplayMode(mode.id)}
              />
            ))}
          </div>

          <SubSectionTitle>渲染器</SubSectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {renderProfiles.map(profile => (
              <TextOption
                key={profile.id}
                active={renderStyle === profile.id}
                label={profile.name}
                title={profile.description}
                onClick={() => setRenderStyle(profile.id as RenderStyle)}
              />
            ))}
          </div>

          <SubSectionTitle>配色</SubSectionTitle>
          <ThemeIconGrid
            themes={themes}
            selectedId={themeId}
            onSelect={setTheme}
          />
        </div>
      </PanelSection>

      <PanelSection title="标注">
        <button
          onClick={toggleAtomLabels}
          className={cn(
            'w-full h-10 flex items-center gap-2 px-3 rounded-lg border text-xs transition-all',
            showAtomLabels
              ? 'bg-gray-900 border-gray-900 text-white'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
          )}
        >
          <Hash size={14} />
          <span className="font-medium">显示原子编号</span>
          <span className={cn(
            'ml-auto text-[10px] px-1.5 py-0.5 rounded font-semibold',
            showAtomLabels ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
          )}>
            {showAtomLabels ? '开' : '关'}
          </span>
        </button>
      </PanelSection>
    </div>
  )
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{title}</div>
      {children}
    </section>
  )
}

function SubSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-400">{children}</div>
  )
}

function PresetOption({
  active,
  label,
  title,
  onClick,
}: {
  active: boolean
  label: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'min-h-11 rounded-lg border px-2.5 text-left text-xs transition-all',
        active
          ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <span className="block truncate font-semibold leading-tight">{label}</span>
      <span className={cn(
        'mt-0.5 block truncate text-[10px] leading-tight',
        active ? 'text-white/65' : 'text-gray-400'
      )}>
        软件 preset
      </span>
    </button>
  )
}

function ThemeIconGrid({
  themes,
  selectedId,
  onSelect,
}: {
  themes: { id: string; name: string }[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {themes.map(theme => {
        const active = theme.id === selectedId
        return (
          <button
            key={theme.id}
            type="button"
            title={theme.name}
            aria-label={theme.name}
            aria-pressed={active}
            onClick={() => onSelect(theme.id)}
            className={cn(
              'flex h-10 items-center justify-center rounded-lg border transition-all',
              active
                ? 'border-gray-900 bg-gray-900 shadow-sm'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
            )}
          >
            <ThemeIcon themeId={theme.id} active={active} />
          </button>
        )
      })}
    </div>
  )
}

function IconOption({
  icon: Icon,
  active,
  label,
  title,
  onClick,
}: {
  icon: IconComponent
  active: boolean
  label: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'h-12 rounded-lg border text-xs transition-all flex flex-col items-center justify-center gap-1',
        active
          ? 'bg-gray-900 border-gray-900 text-white'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800'
      )}
    >
      <Icon size={14} strokeWidth={2.2} />
      <span className="font-medium leading-none">{label}</span>
    </button>
  )
}

function TextOption({
  active,
  label,
  title,
  onClick,
}: {
  active: boolean
  label: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'h-9 rounded-lg border px-2 text-xs font-semibold transition-all',
        active
          ? 'bg-gray-900 border-gray-900 text-white'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800'
      )}
    >
      <span className="block truncate">{label}</span>
    </button>
  )
}

function ThemeIcon({ themeId, active = false }: { themeId: string; active?: boolean }) {
  const theme = resolveTheme(themeId)
  const colors = [
    theme.scene.backgroundColor,
    theme.elements.C?.color ?? theme.fallbackColor,
    theme.elements.N?.color ?? theme.fallbackColor,
    theme.elements.O?.color ?? theme.fallbackColor,
  ]
  return (
    <span
      className={cn(
        'relative block h-6 w-6 overflow-hidden rounded-md border shadow-inner',
        active ? 'border-white/70' : 'border-gray-200'
      )}
      style={{ backgroundColor: colors[0] }}
    >
      {colors.slice(1).map((color, index) => (
        <span
          key={`${color}-${index}`}
          className={cn(
            'absolute h-3 w-3 rounded-full border shadow-sm',
            active ? 'border-gray-900/30' : 'border-white',
            index === 0 && 'left-1 top-1',
            index === 1 && 'right-1 top-1',
            index === 2 && 'bottom-1 left-1/2 -translate-x-1/2'
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}
