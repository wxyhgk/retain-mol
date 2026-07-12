import { describe, expect, it, vi } from 'vitest'
import { activateToolRailItem, type ToolRailCommandDependencies } from './toolRailCommands'

function createDependencies(overrides: Partial<ToolRailCommandDependencies> = {}): ToolRailCommandDependencies {
  return {
    activeElement: 'N',
    selectionCount: 0,
    activateTool: vi.fn(),
    inspectElement: vi.fn(),
    removeSelected: vi.fn(),
    flashHint: vi.fn(),
    toggleInspector: vi.fn(),
    ...overrides,
  }
}

describe('activateToolRailItem', () => {
  it('routes workspace items directly to the palette controller', () => {
    const dependencies = createDependencies()

    activateToolRailItem({ id: 'ring', workspaceTool: 'template' }, dependencies)

    expect(dependencies.activateTool).toHaveBeenCalledWith('template')
    expect(dependencies.flashHint).not.toHaveBeenCalled()
  })

  it('removes a selection or explains why erase cannot run', () => {
    const selected = createDependencies({ selectionCount: 2 })
    const empty = createDependencies()

    activateToolRailItem({ id: 'erase' }, selected)
    activateToolRailItem({ id: 'erase' }, empty)

    expect(selected.removeSelected).toHaveBeenCalledOnce()
    expect(empty.removeSelected).not.toHaveBeenCalled()
    expect(empty.flashHint).toHaveBeenCalledWith('先选择需要删除的原子或键')
  })

  it('activates atom drawing with the current element', () => {
    const dependencies = createDependencies()

    activateToolRailItem({ id: 'atom' }, dependencies)

    expect(dependencies.inspectElement).toHaveBeenCalledWith('N')
    expect(dependencies.activateTool).toHaveBeenCalledWith('draw')
  })

  it('opens charge editing through selection and the inspector', () => {
    const dependencies = createDependencies()

    activateToolRailItem({ id: 'charge' }, dependencies)

    expect(dependencies.activateTool).toHaveBeenCalledWith('select')
    expect(dependencies.toggleInspector).toHaveBeenCalledOnce()
    expect(dependencies.flashHint).toHaveBeenCalledWith('选择原子后，在 Inspector 中修改形式电荷')
  })

  it('keeps placeholder tool hints distinct', () => {
    const dependencies = createDependencies()

    activateToolRailItem({ id: 'text' }, dependencies)
    activateToolRailItem({ id: 'more' }, dependencies)

    expect(dependencies.flashHint).toHaveBeenNthCalledWith(1, '文本工具为后续工作区占位')
    expect(dependencies.flashHint).toHaveBeenNthCalledWith(2, '更多工具为后续工作区占位')
  })
})
