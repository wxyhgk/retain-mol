import {
  executeAtomHotspotCommand,
  shouldAddConnectorBeforeRing,
} from './atomHotspot';
import type { IToolContext } from './IToolContext';
import { Action, fromBondAddition, fromTemplateOnAtom } from 'ketcher-core';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  fromBondAddition: jest.fn(),
  fromTemplateOnAtom: jest.fn(),
}));

const mockFromBondAddition = jest.mocked(fromBondAddition);
const mockFromTemplateOnAtom = jest.mocked(fromTemplateOnAtom);

function rollbackAction(name: string) {
  return {
    name,
    operations: [],
    perform: jest.fn(),
    mergeWith: jest.fn(function (this: { merged?: unknown }, action) {
      this.merged = action;
      return this;
    }),
  };
}

function contextWithDegree(degree: number) {
  return {
    render: {
      ctab: {
        atoms: new Map([
          [1, { a: { label: 'C', neighbors: Array(degree).fill({}) } }],
        ]),
      },
    },
    update: jest.fn(),
  } as unknown as IToolContext;
}

describe('Atom hotspot command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    [0, false],
    [1, false],
    [2, false],
    [3, true],
    [4, true],
  ])('chooses connector mode for atom degree %i', (degree, expected) => {
    expect(shouldAddConnectorBeforeRing(degree)).toBe(expected);
  });

  it('makes a secondary atom part of the requested ring', () => {
    const ctx = contextWithDegree(2);
    const action = rollbackAction('ring');
    mockFromTemplateOnAtom.mockReturnValueOnce([action, {}] as never);
    const struct = {
      atoms: new Map([
        [0, { pp: { x: 0, y: 0 } }],
        [1, { pp: { x: 1, y: 0 } }],
      ]),
      sgroups: new Map(),
    };

    executeAtomHotspotCommand(ctx, 1, {
      command: 'ring',
      struct,
    });

    expect(mockFromTemplateOnAtom).toHaveBeenCalledWith(
      ctx.render.ctab,
      expect.objectContaining({ molecule: struct, aid: 0 }),
      1,
      null,
      false,
    );
    expect(ctx.update).toHaveBeenCalledWith(action);
  });

  it('adds both plain methyl bonds in one history action for 9', () => {
    const ctx = contextWithDegree(2);
    const first = rollbackAction('first');
    const second = rollbackAction('second');
    mockFromBondAddition
      .mockReturnValueOnce([first] as never)
      .mockReturnValueOnce([second] as never);

    executeAtomHotspotCommand(ctx, 1, { command: 'gem-dimethyl' });

    expect(mockFromBondAddition).toHaveBeenNthCalledWith(
      1,
      ctx.render.ctab,
      { type: 1 },
      1,
      { label: 'C' },
    );
    expect(mockFromBondAddition).toHaveBeenNthCalledWith(
      2,
      ctx.render.ctab,
      { type: 1 },
      1,
      { label: 'C' },
    );
    expect(ctx.update).toHaveBeenCalledTimes(1);
    expect(ctx.update).toHaveBeenCalledWith(expect.any(Action));
  });

  it('uses opposing solid and hashed wedge bonds for Shift+K', () => {
    const ctx = contextWithDegree(2);
    const first = rollbackAction('first');
    const second = rollbackAction('second');
    mockFromBondAddition
      .mockReturnValueOnce([first] as never)
      .mockReturnValueOnce([second] as never);

    executeAtomHotspotCommand(ctx, 1, {
      command: 'stereo-gem-dimethyl',
    });

    expect(mockFromBondAddition).toHaveBeenNthCalledWith(
      1,
      ctx.render.ctab,
      { type: 1, stereo: 1 },
      1,
      { label: 'C' },
    );
    expect(mockFromBondAddition).toHaveBeenNthCalledWith(
      2,
      ctx.render.ctab,
      { type: 1, stereo: 6 },
      1,
      { label: 'C' },
    );
    expect(ctx.update).toHaveBeenCalledTimes(1);
  });

  it('rolls back the first methyl bond when the second addition fails', () => {
    const ctx = contextWithDegree(2);
    const first = rollbackAction('first');
    mockFromBondAddition
      .mockReturnValueOnce([first] as never)
      .mockImplementationOnce(() => {
        throw new Error('second bond failed');
      });

    expect(() =>
      executeAtomHotspotCommand(ctx, 1, { command: 'gem-dimethyl' }),
    ).toThrow('second bond failed');

    expect(first.perform).toHaveBeenCalledWith(ctx.render.ctab);
    expect(ctx.update).not.toHaveBeenCalled();
  });

  it('does not apply secondary-carbon commands to another atom degree', () => {
    const ctx = contextWithDegree(3);

    executeAtomHotspotCommand(ctx, 1, { command: 'gem-dimethyl' });

    expect(mockFromBondAddition).not.toHaveBeenCalled();
    expect(ctx.update).not.toHaveBeenCalled();
  });
});
