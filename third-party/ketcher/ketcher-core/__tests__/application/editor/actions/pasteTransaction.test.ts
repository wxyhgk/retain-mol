import { fromPaste } from 'application/editor/actions/paste';
import { fromTemplateOnCanvas } from 'application/editor/actions/template';
import { CalcImplicitH } from 'application/editor/operations';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Fragment, Struct, Vec2 } from 'domain/entities';

function buildReStruct() {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  return new ReStruct(new Struct(), render);
}

function buildSource() {
  const struct = new Struct();
  const fragment = struct.frags.add(new Fragment());
  const begin = struct.atoms.add(
    new Atom({ label: 'C', fragment, pp: new Vec2(0, 0) }),
  );
  const end = struct.atoms.add(
    new Atom({ label: 'O', fragment, pp: new Vec2(1, 0) }),
  );
  struct.bonds.add(new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }));
  return struct;
}

describe('paste transactions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rolls back pasted atoms and bonds when atom post-processing fails', () => {
    const restruct = buildReStruct();
    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('paste post-processing failed');
      });

    expect(() => fromPaste(restruct, buildSource(), new Vec2(0, 0))).toThrow(
      'paste post-processing failed',
    );
    expect(restruct.molecule.atoms.size).toBe(0);
    expect(restruct.molecule.bonds.size).toBe(0);
  });

  it('rolls back a completed paste when template post-processing fails', () => {
    const restruct = buildReStruct();
    const source = buildSource();
    const originalPerform = CalcImplicitH.prototype.perform;
    let callCount = 0;
    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementation(function (this: CalcImplicitH, currentReStruct) {
        callCount += 1;
        if (callCount === 3) {
          throw new Error('template post-processing failed');
        }
        return originalPerform.call(this, currentReStruct);
      });

    expect(() =>
      fromTemplateOnCanvas(restruct, { molecule: source }, new Vec2(0, 0)),
    ).toThrow('template post-processing failed');
    expect(restruct.molecule.atoms.size).toBe(0);
    expect(restruct.molecule.bonds.size).toBe(0);
  });
});
