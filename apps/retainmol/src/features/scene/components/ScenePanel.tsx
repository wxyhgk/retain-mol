import { useMoleculeStore } from '@/domain/viewer/moleculeState'
import { Eye, EyeOff, Lock, Unlock, Trash2, Scissors } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { selectScenePanelRows } from '@/domain/moleculePanelSelectors'

export default function ScenePanel() {
  const sceneObjects = useMoleculeStore(selectScenePanelRows)
  const activeObjectId = useMoleculeStore(state => state.activeObjectId)
  const setActiveObject = useMoleculeStore(state => state.setActiveObject)
  const removeSceneObject = useMoleculeStore(state => state.removeSceneObject)
  const splitSceneObject = useMoleculeStore(state => state.splitSceneObject)
  const setObjectVisible = useMoleculeStore(state => state.setObjectVisible)
  const setObjectLocked = useMoleculeStore(state => state.setObjectLocked)
  const renameObject = useMoleculeStore(state => state.renameObject)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleSplit = (e: React.MouseEvent, objId: string) => {
    e.stopPropagation()
    splitSceneObject(objId)
  }

  return (
    <div className="p-2 space-y-1 text-sm">
      {sceneObjects.length === 0 && (
        <div className="text-xs text-gray-400 text-center py-6 leading-relaxed">
          场景中无对象<br/>从导入或搜索添加分子
        </div>
      )}

      {sceneObjects.map(obj => {
        const isActive = obj.id === activeObjectId
        return (
          <div
            key={obj.id}
            onClick={() => setActiveObject(obj.id)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors group',
              isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {/* 活跃指示 */}
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isActive ? 'bg-gray-900' : 'bg-gray-300')} />

            {/* 名称（双击重命名） */}
            {editingId === obj.id ? (
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => { renameObject(obj.id, editName || obj.name); setEditingId(null) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { renameObject(obj.id, editName || obj.name); setEditingId(null) }
                  if (e.key === 'Escape') setEditingId(null)
                }}
                onClick={e => e.stopPropagation()}
                className="flex-1 text-xs bg-white border border-gray-400 rounded px-1 outline-none"
              />
            ) : (
              <span
                className="flex-1 text-xs truncate"
                onDoubleClick={e => { e.stopPropagation(); setEditingId(obj.id); setEditName(obj.name) }}
              >
                {obj.name}
              </span>
            )}

            {/* 控制按钮 */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {obj.componentCount > 1 && (
                <button
                  onClick={e => handleSplit(e, obj.id)}
                  title="分离为独立对象"
                  className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-900"
                >
                  <Scissors size={11} />
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); setObjectVisible(obj.id, !obj.visible) }}
                className={cn('w-5 h-5 rounded flex items-center justify-center', obj.visible ? 'text-gray-400 hover:text-gray-700' : 'text-gray-300 hover:text-gray-500')}
              >
                {obj.visible ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setObjectLocked(obj.id, !obj.locked) }}
                className={cn('w-5 h-5 rounded flex items-center justify-center', obj.locked ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700')}
              >
                {obj.locked ? <Lock size={11} /> : <Unlock size={11} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); if (confirm(`删除 ${obj.name}？`)) removeSceneObject(obj.id) }}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-foreground hover:text-background"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        )
      })}

      <div className="pt-1 border-t border-gray-100">
        <div className="text-[10px] text-gray-400 px-2 py-1">
          {sceneObjects.length} 个对象 · 点击行切换活跃对象
        </div>
      </div>
    </div>
  )
}
