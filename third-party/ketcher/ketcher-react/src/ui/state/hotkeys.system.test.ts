import createStore from './';
import { initKeydownListener, removeKeydownListener } from './hotkeys';

type MockEditorOptions = {
  hoveredBondId?: number;
  selection?: Record<string, number[]> | null;
};

let listenerStore: ReturnType<typeof createStore> | null = null;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  listenerStore?.dispatch(removeKeydownListener(document));
  listenerStore = null;
});

function platformModifier() {
  return /Mac/.test(navigator.platform) ? { metaKey: true } : { ctrlKey: true };
}

function dispatchKey(
  code: string,
  key: string,
  modifiers: KeyboardEventInit = {},
) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code,
    key,
    ...modifiers,
  });
  document.dispatchEvent(event);
  return event;
}

function createMockStore(options: MockEditorOptions = {}) {
  let currentSelection = options.selection ?? null;
  const selection = jest.fn((nextSelection) => {
    if (nextSelection !== undefined) {
      currentSelection = nextSelection;
    }
    return currentSelection;
  });
  const molecule = {
    atoms: new Map([[0, { stereoLabel: null }]]),
    bonds: new Map(),
  };
  const hoveredBonds =
    options.hoveredBondId === undefined
      ? new Map()
      : new Map([
          [options.hoveredBondId, { hover: true, b: { type: 1, stereo: 0 } }],
        ]);
  const ctab = { molecule, bonds: hoveredBonds };
  const editor = {
    undo: jest.fn(),
    redo: jest.fn(),
    tool: jest.fn().mockReturnValue(true),
    historySize: () => ({ undo: 1, redo: 1 }),
    selection,
    struct: () => molecule,
    render: { ctab, options: { viewOnlyMode: false } },
    zoom: jest.fn(),
    _tool: { mode: '' },
    rotateController: { isRotating: false },
  };
  const store = createStore({}, {}, () => null);
  listenerStore = store;
  store.dispatch(initKeydownListener(document));
  store.dispatch({ type: 'INIT', editor });
  editor.tool.mockClear();
  selection.mockClear();
  return { editor, store };
}

describe('system hotkeys use the regular action dispatcher', () => {
  it('dispatches platform undo over bond id 0 without claiming z as a ring key', () => {
    const { editor } = createMockStore({ hoveredBondId: 0 });

    const event = dispatchKey('KeyZ', 'z', platformModifier());

    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it.each([
    ['KeyZ', 'z', { shiftKey: true }],
    ['KeyY', 'y', {}],
  ])('dispatches redo for %s', (code, key, extraModifiers) => {
    const { editor } = createMockStore({ hoveredBondId: 0 });

    const event = dispatchKey(code, key, {
      ...platformModifier(),
      ...extraModifiers,
    });

    expect(editor.redo).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('dispatches platform select-all over bond id 0 instead of attaching benzene', () => {
    const { editor } = createMockStore({ hoveredBondId: 0 });

    const event = dispatchKey('KeyA', 'a', platformModifier());

    expect(editor.selection).toHaveBeenCalledWith('all');
    expect(event.defaultPrevented).toBe(true);
  });

  it.each([
    ['Backspace', 'Backspace'],
    ['Delete', 'Delete'],
  ])('dispatches erase for %s', (code, key) => {
    const { editor } = createMockStore({ selection: { atoms: [0] } });

    const event = dispatchKey(code, key);

    expect(editor.tool).toHaveBeenCalledWith('eraser', 1);
    expect(event.defaultPrevented).toBe(true);
  });

  it.each([
    ['Equal', '=', 'charge', 1],
    ['Minus', '-', 'charge', -1],
  ])('dispatches charge shortcut %s', (code, key, tool, opts) => {
    const { editor } = createMockStore();

    const event = dispatchKey(code, key);

    expect(editor.tool).toHaveBeenCalledWith(tool, opts);
    expect(event.defaultPrevented).toBe(true);
  });
});
