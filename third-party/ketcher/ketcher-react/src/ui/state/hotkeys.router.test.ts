import {
  CHEMDRAW_ATOM_RING_TEMPLATE_INDEX,
  CHEMDRAW_BOND_RING_TEMPLATE_INDEX,
  resolveChemDrawHotspotShortcut,
  resolveSelectedAtomSproutShortcut,
} from './hotkeys';

const keyEvent = (
  key: string,
  modifiers: Partial<
    Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'altKey'>
  > = {},
) =>
  ({
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    ...modifiers,
  } as KeyboardEvent);

describe('ChemDraw hotspot shortcut routing', () => {
  it.each([0, 1])('recognizes atom id %d as a hotspot', (atomId) => {
    expect(
      resolveChemDrawHotspotShortcut({ atoms: atomId }, keyEvent('1')),
    ).toEqual({
      target: 'atom',
      tool: 'atom-hotspot',
      command: 'single-bond',
    });
  });

  it.each([0, 1])('recognizes bond id %d as a hotspot', (bondId) => {
    expect(
      resolveChemDrawHotspotShortcut({ bonds: bondId }, keyEvent('2')),
    ).toEqual({ target: 'bond', tool: 'bond', opts: { type: 2 } });
  });

  it('recognizes s-group id 0 as an atom-like hotspot', () => {
    expect(
      resolveChemDrawHotspotShortcut({ sgroups: 0 }, keyEvent('3')),
    ).toEqual({
      target: 'atom',
      tool: 'atom-hotspot',
      command: 'ring',
      templateIndex: 0,
    });
  });

  it.each([
    [
      '0',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'single-bond',
      },
    ],
    [
      '1',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'single-bond',
      },
    ],
    [
      '2',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'carbonyl',
      },
    ],
    [
      '3',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'ring',
        templateIndex: 0,
      },
    ],
  ])('routes atom number key %s', (key, expected) => {
    expect(
      resolveChemDrawHotspotShortcut({ atoms: 0 }, keyEvent(key as string)),
    ).toEqual(expected);
  });

  it.each([
    ['2', { type: 2 }],
    ['3', { type: 3 }],
  ])('routes bond type key %s', (key, opts) => {
    expect(
      resolveChemDrawHotspotShortcut({ bonds: 0 }, keyEvent(key as string)),
    ).toEqual({ target: 'bond', tool: 'bond', opts });
  });

  it.each([
    ['w', { type: 1, stereo: 1 }],
    ['W', { type: 1, stereo: 6 }],
    ['d', { type: 1, stereo: 4 }],
    ['D', { type: 1, stereo: 4 }],
    ['h', { type: 1, stereo: 0 }],
    ['H', { type: 1, stereo: 0 }],
    ['b', { type: 1, stereo: 4 }],
    ['B', { type: 1, stereo: 4 }],
  ])('routes bond stereo key %s', (key, opts) => {
    expect(
      resolveChemDrawHotspotShortcut({ bonds: 1 }, keyEvent(key as string)),
    ).toEqual({ target: 'bond', tool: 'bond', opts });
  });

  it.each(Object.entries(CHEMDRAW_ATOM_RING_TEMPLATE_INDEX))(
    'routes atom ring key %s to template %d',
    (key, templateIndex) => {
      expect(
        resolveChemDrawHotspotShortcut({ atoms: 0 }, keyEvent(key)),
      ).toEqual({
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'ring',
        templateIndex,
      });
    },
  );

  it.each(Object.entries(CHEMDRAW_BOND_RING_TEMPLATE_INDEX))(
    'routes bond ring key %s to template %d',
    (key, templateIndex) => {
      expect(
        resolveChemDrawHotspotShortcut({ bonds: 0 }, keyEvent(key)),
      ).toEqual({ target: 'bond', tool: 'template', templateIndex });
    },
  );

  it('keeps Atom and Bond 7 semantics independent', () => {
    expect(
      resolveChemDrawHotspotShortcut({ atoms: 0 }, keyEvent('7')),
    ).toMatchObject({ target: 'atom', templateIndex: 3 });
    expect(
      resolveChemDrawHotspotShortcut({ bonds: 0 }, keyEvent('7')),
    ).toMatchObject({ target: 'bond', templateIndex: 6 });
  });

  it.each([
    ['9', 'gem-dimethyl'],
    ['K', 'stereo-gem-dimethyl'],
  ])('routes secondary-carbon growth key %s', (key, command) => {
    expect(resolveChemDrawHotspotShortcut({ atoms: 0 }, keyEvent(key))).toEqual(
      { target: 'atom', tool: 'atom-hotspot', command },
    );
  });

  it('does not confuse lowercase k with Shift+K', () => {
    expect(
      resolveChemDrawHotspotShortcut({ atoms: 0 }, keyEvent('k')),
    ).toBeNull();
  });

  it.each([
    ['a', { metaKey: true }],
    ['a', { ctrlKey: true }],
    ['z', { metaKey: true }],
    ['z', { ctrlKey: true }],
    ['A', { metaKey: true }],
    ['Z', { ctrlKey: true }],
    ['2', { altKey: true }],
    ['w', { metaKey: true }],
  ])('does not claim modified bond shortcut %s', (key, modifiers) => {
    expect(
      resolveChemDrawHotspotShortcut(
        { bonds: 0 },
        keyEvent(key as string, modifiers),
      ),
    ).toBeNull();
  });

  it.each([
    [
      '0',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'single-bond',
      },
    ],
    [
      '1',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'single-bond',
      },
    ],
    [
      '2',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'carbonyl',
      },
    ],
    [
      '3',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'ring',
        templateIndex: 0,
      },
    ],
    [
      'a',
      {
        target: 'atom',
        tool: 'atom-hotspot',
        command: 'ring',
        templateIndex: 0,
      },
    ],
  ])('provides a direct selected-atom sprout route for %s', (key, expected) => {
    expect(resolveSelectedAtomSproutShortcut(keyEvent(key as string))).toEqual(
      expected,
    );
  });

  it('keeps unassigned and modified selected-atom keys out of the direct route', () => {
    expect(resolveSelectedAtomSproutShortcut(keyEvent('z'))).toBeNull();
    expect(
      resolveSelectedAtomSproutShortcut(keyEvent('a', { metaKey: true })),
    ).toBeNull();
  });
});
