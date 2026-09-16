import { Atom, Bond, KetSerializer, Struct } from 'ketcher-core';
import type { AnyAction } from 'redux';
import type { TemplatesState } from '../store.types';
import { openDialog } from '../modal';
import { storage } from '../../storage-ext';
import reducer, { editTmpl, initTmplsState } from './index';

jest.mock('./init-lib', () => ({
  initLib: jest.fn(),
  default: jest.fn(),
}));
jest.mock('../modal', () => ({ openDialog: jest.fn() }));
jest.mock('../../storage-ext', () => ({ storage: { setItem: jest.fn() } }));

type Template = TemplatesState['lib'][number];

function createTemplate(name: string, group = 'User Templates'): Template {
  const struct = new Struct();
  struct.name = name;
  struct.atoms.add(new Atom({ label: 'C' }));
  struct.atoms.add(new Atom({ label: 'N' }));
  struct.bonds.add(new Bond({ begin: 0, end: 1, type: 1 }));
  return {
    struct,
    props: { group, atomid: 1, bondid: 0, description: 'Retained metadata' },
  };
}

function createState(lib: Template[], selected: Template | null = null) {
  return { ...initTmplsState, lib, selected };
}

function freezeTemplate(tmpl: Template) {
  Object.freeze(tmpl.struct);
  Object.freeze(tmpl.props);
  Object.freeze(tmpl);
}

function startEdit(tmpl: Template, lib: Template[]) {
  let state = createState(lib, tmpl);
  const dispatch = jest.fn((action: AnyAction) => {
    state = reducer(state, action);
    return action;
  });
  let submit: (result: unknown) => void = jest.fn();
  let cancel: () => void = jest.fn();
  let reopened: () => void = jest.fn();
  const libraryOpened = new Promise<void>((resolve) => {
    reopened = resolve;
  });
  jest.mocked(openDialog).mockImplementation((_dispatch, name) => {
    if (name === 'attach') {
      return new Promise((resolve, reject) => {
        submit = resolve;
        cancel = () => reject(new Error('Cancelled'));
      });
    }
    reopened();
    return Promise.resolve(null);
  });
  editTmpl(tmpl)(dispatch, () => ({ templates: state }));
  return {
    dispatch,
    submit,
    cancel,
    libraryOpened,
    getState: () => state,
  };
}

describe('template editing reducer', () => {
  it('replaces a frozen selected template while preserving the graph and other entries', () => {
    const tmpl = createTemplate('Original');
    tmpl.struct.atoms.set(7, new Atom({ label: 'O' }));
    const other = createTemplate('Other');
    const state = createState([tmpl, other], tmpl);
    freezeTemplate(tmpl);
    Object.freeze(state.lib);
    Object.freeze(state);

    const next = reducer(state, {
      type: 'TMPL_EDIT',
      data: { tmpl, name: ' Renamed ', attach: { atomid: 0, bondid: 0 } },
    });
    const updated = next.lib[0];

    expect(next).not.toBe(state);
    expect(next.lib).not.toBe(state.lib);
    expect(updated).not.toBe(tmpl);
    expect(updated.struct).not.toBe(tmpl.struct);
    expect(updated.struct).toBeInstanceOf(Struct);
    expect(updated.struct.name).toBe('Renamed');
    expect(updated.struct.atoms).toBe(tmpl.struct.atoms);
    expect(updated.struct.bonds).toBe(tmpl.struct.bonds);
    expect(Array.from(updated.struct.atoms.keys())).toEqual([0, 1, 7]);
    expect(updated.props).toEqual({ ...tmpl.props, atomid: 0, bondid: 0 });
    expect(tmpl.struct.name).toBe('Original');
    expect(tmpl.props.atomid).toBe(1);
    expect(next.lib[1]).toBe(other);
    expect(next.selected).toBe(updated);
  });

  it('changes attachment point zero without replacing or mutating the structure', () => {
    const tmpl = createTemplate('Original');
    freezeTemplate(tmpl);
    const state = createState([tmpl], tmpl);

    const next = reducer(state, {
      type: 'TMPL_EDIT',
      data: { tmpl, name: 'Original', attach: { atomid: 0, bondid: 0 } },
    });

    expect(next.lib[0].struct).toBe(tmpl.struct);
    expect(next.lib[0].props).toEqual({ ...tmpl.props, atomid: 0 });
    expect(tmpl.props.atomid).toBe(1);
    expect(next.selected).toBe(next.lib[0]);
  });

  it('retains state identity for unchanged values and missing templates', () => {
    const tmpl = createTemplate('Original');
    const state = createState([tmpl], tmpl);

    expect(
      reducer(state, {
        type: 'TMPL_EDIT',
        data: { tmpl, name: ' Original ', attach: { atomid: 1, bondid: 0 } },
      }),
    ).toBe(state);
    expect(
      reducer(state, {
        type: 'TMPL_EDIT',
        data: { tmpl: createTemplate('Missing'), name: 'Renamed' },
      }),
    ).toBe(state);
  });

  it('keeps the current selection and attachment metadata when only another name changes', () => {
    const tmpl = createTemplate('Original');
    const selected = createTemplate('Selected');
    const state = createState([tmpl, selected], selected);

    const next = reducer(state, {
      type: 'TMPL_EDIT',
      data: { tmpl, name: 'Renamed' },
    });

    expect(next.lib[0].struct.name).toBe('Renamed');
    expect(next.lib[0].props).toEqual(tmpl.props);
    expect(next.selected).toBe(selected);
  });
});

describe('template editing workflow', () => {
  it('dispatches the edit and stores the latest library before reopening it', async () => {
    const tmpl = createTemplate('Original');
    const other = createTemplate('Other');
    const builtIn = createTemplate('Built-in', 'Amino Acids');
    freezeTemplate(tmpl);
    const edit = startEdit(tmpl, [tmpl, other, builtIn]);
    const addedWhileEditing = createTemplate('Added while editing');
    edit.dispatch({
      type: 'TMPL_INIT',
      data: { lib: [...edit.getState().lib, addedWhileEditing] },
    });

    edit.submit({ name: ' Renamed ', attach: { atomid: 0, bondid: 0 } });
    await edit.libraryOpened;

    expect(edit.dispatch).toHaveBeenCalledWith({
      type: 'TMPL_EDIT',
      data: { tmpl, name: ' Renamed ', attach: { atomid: 0, bondid: 0 } },
    });
    expect(tmpl.struct.name).toBe('Original');
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    const stored = jest.mocked(storage.setItem).mock.calls[0][1] as Array<{
      struct: string;
      props: Template['props'];
    }>;
    expect(stored).toHaveLength(3);
    expect(stored[0].struct).toBe(
      new KetSerializer().serialize(edit.getState().lib[0].struct),
    );
    expect(new KetSerializer().deserialize(stored[0].struct).name).toBe(
      'Renamed',
    );
    expect(stored[0].props).toEqual({
      atomid: 0,
      bondid: 0,
      description: 'Retained metadata',
    });
    expect(stored[2].struct).toBe(
      new KetSerializer().serialize(addedWhileEditing.struct),
    );
    expect(openDialog).toHaveBeenLastCalledWith(edit.dispatch, 'templates');
  });

  it.each(['cancel', 'null', 'unchanged'])(
    'reopens the library without editing or storing after %s',
    async (outcome) => {
      const tmpl = createTemplate('Original');
      freezeTemplate(tmpl);
      const edit = startEdit(tmpl, [tmpl]);
      const initial = edit.getState();

      if (outcome === 'cancel') edit.cancel();
      else if (outcome === 'null') edit.submit(null);
      else
        edit.submit({ name: ' Original ', attach: { atomid: 1, bondid: 0 } });
      await edit.libraryOpened;

      expect(edit.getState()).toBe(initial);
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(tmpl.struct.name).toBe('Original');
      expect(tmpl.props.atomid).toBe(1);
      expect(openDialog).toHaveBeenLastCalledWith(edit.dispatch, 'templates');
    },
  );

  it('does not persist edits to built-in templates', async () => {
    const tmpl = createTemplate('Built-in', 'Amino Acids');
    freezeTemplate(tmpl);
    const edit = startEdit(tmpl, [tmpl]);

    edit.submit({ name: 'Renamed' });
    await edit.libraryOpened;

    expect(edit.getState().lib[0].struct.name).toBe('Renamed');
    expect(tmpl.struct.name).toBe('Built-in');
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
