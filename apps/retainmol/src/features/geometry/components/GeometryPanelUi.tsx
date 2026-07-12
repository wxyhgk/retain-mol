import { useState } from 'react'
import { getElementConfig } from '@retainmol/mol-viewer/core'
import type { Atom } from '@retainmol/mol-viewer/core'

function colorHexToCss(hex: number) {
  return `#${hex.toString(16).padStart(6, '0')}`
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-mono text-xs text-gray-800">{value}</span>
    </div>
  )
}

export function ElementBadge({ atom, size = 'small' }: { atom: Atom; size?: 'small' | 'large' }) {
  const element = getElementConfig(atom.symbol)
  return (
    <span
      className={`${size === 'large' ? 'h-7 w-7 text-xs' : 'h-5 w-5 text-[10px]'} flex items-center justify-center rounded-full font-bold text-white`}
      style={{ backgroundColor: colorHexToCss(element.color) }}
    >
      {atom.symbol}
    </span>
  )
}

export function GeometryValueInput({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const commit = () => {
    const parsed = parseFloat(draft)
    if (!Number.isNaN(parsed) && parsed !== value) onCommit(parsed)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div
        className="-mx-1 cursor-text rounded px-1 transition-colors hover:bg-gray-100"
        onClick={() => { setDraft(value.toFixed(4)); setEditing(true) }}
        title="点击编辑"
      >
        <span className="mr-1 text-gray-400">{label}</span>{value.toFixed(4)}
      </div>
    )
  }

  return (
    <div className="-mx-1 flex items-center gap-1 px-1">
      <span className="text-gray-400">{label}</span>
      <input
        type="text"
        value={draft}
        autoFocus
        onChange={event => setDraft(event.target.value)}
        onBlur={commit}
        onFocus={event => event.target.select()}
        onKeyDown={event => {
          if (event.key === 'Enter') (event.target as HTMLInputElement).blur()
          else if (event.key === 'Escape') setEditing(false)
        }}
        className="flex-1 rounded border border-gray-300 bg-white px-1 font-mono text-xs outline-none focus:border-gray-500"
      />
    </div>
  )
}
