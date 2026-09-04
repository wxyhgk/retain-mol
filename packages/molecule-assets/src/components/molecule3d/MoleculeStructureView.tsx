import { useEffect, useId, useState } from 'react'
import { Button, cn } from '@retainmol/ui-kit'
import type { Molecule } from '@retainmol/mol-viewer/core'
import { Molecule2D } from '../Molecule2D'
import { Molecule3D } from './Molecule3D'
import { acquire3DSlot, release3DSlot, use3DSlotActive } from './molecule3dPool'

export interface MoleculeStructureViewProps {
  molecule: Molecule
  /** 已有 3D 截图（preview 产物）时优先作为 2D 态展示 */
  posterUrl?: string
  themeId?: string
  label?: string
  className?: string
  /** 隐藏 2D/3D 切换（如仅静态展示） */
  toggleable?: boolean
}

/**
 * 2D/3D 可切换的分子结构视图。
 * 默认 2D（poster 截图或骨架式）；切 3D 时向池申请席位，
 * 池满逐出最早者——被逐出的实例自动退回 2D。
 */
export function MoleculeStructureView({
  molecule,
  posterUrl,
  themeId,
  label,
  className,
  toggleable = true,
}: MoleculeStructureViewProps) {
  const slotId = useId()
  const holdsSlot = use3DSlotActive(slotId)
  const [want3D, setWant3D] = useState(false)
  const show3D = want3D && holdsSlot

  // 被池逐出 → 同步退回 2D（按钮状态跟着回位）
  useEffect(() => {
    if (want3D && !holdsSlot) setWant3D(false)
  }, [want3D, holdsSlot])

  // 卸载归还席位
  useEffect(() => () => release3DSlot(slotId), [slotId])

  function toggle(mode: '2d' | '3d') {
    if (mode === '3d') {
      acquire3DSlot(slotId)
      setWant3D(true)
    } else {
      release3DSlot(slotId)
      setWant3D(false)
    }
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {show3D ? (
        <Molecule3D
          molecule={molecule}
          {...(themeId !== undefined ? { themeId } : {})}
          onUnavailable={() => toggle('2d')}
        />
      ) : posterUrl ? (
        <img src={posterUrl} alt={label ?? molecule.name ?? '分子结构'} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <Molecule2D molecule={molecule} {...(label !== undefined ? { label } : {})} className="h-full w-full text-foreground [&_svg]:h-full [&_svg]:w-full" />
      )}
      {toggleable && (
        <div className="absolute right-1 top-1 flex items-center" role="group" aria-label="结构视图切换">
          <Button variant={show3D ? 'ghost' : 'default'} size="sm" className="h-5 px-1.5 text-[10px]" aria-pressed={!show3D} onClick={() => toggle('2d')}>2D</Button>
          <Button variant={show3D ? 'default' : 'ghost'} size="sm" className="h-5 px-1.5 text-[10px]" aria-pressed={show3D} onClick={() => toggle('3d')}>3D</Button>
        </div>
      )}
    </div>
  )
}
