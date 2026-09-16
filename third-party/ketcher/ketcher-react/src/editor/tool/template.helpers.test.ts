import { Atom, Bond, Loop, Struct, Vec2 } from 'ketcher-core';
import { getBondFlipSign } from './template.helpers';

describe('getBondFlipSign', () => {
  it('uses loop id 0 and includes atom id 0 when calculating the loop center', () => {
    const struct = new Struct();
    const loopTop = struct.atoms.add(
      new Atom({ label: 'C', fragment: 0, pp: new Vec2(0.5, 2) }),
    );
    const targetBegin = struct.atoms.add(
      new Atom({ label: 'C', fragment: 0, pp: new Vec2(0, 0) }),
    );
    const targetEnd = struct.atoms.add(
      new Atom({ label: 'C', fragment: 0, pp: new Vec2(1, 0) }),
    );
    // This atom is in the same fragment but outside the ring. Falling back to
    // the fragment center would put the center on the opposite side of the
    // target bond and therefore return the opposite flip sign.
    struct.atoms.add(
      new Atom({ label: 'C', fragment: 0, pp: new Vec2(0.5, -10) }),
    );

    const targetBondId = struct.bonds.add(
      new Bond({
        begin: targetBegin,
        end: targetEnd,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const rightBondId = struct.bonds.add(
      new Bond({
        begin: targetEnd,
        end: loopTop,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const leftBondId = struct.bonds.add(
      new Bond({
        begin: loopTop,
        end: targetBegin,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    struct.initHalfBonds();

    const loopHalfBondIds = [
      struct.bonds.get(targetBondId)?.hb1,
      struct.bonds.get(rightBondId)?.hb1,
      struct.bonds.get(leftBondId)?.hb1,
    ] as number[];
    loopHalfBondIds.forEach((halfBondId) => {
      const halfBond = struct.halfBonds.get(halfBondId);
      if (halfBond) {
        halfBond.loop = 0;
      }
    });
    struct.loops.set(0, new Loop(loopHalfBondIds, struct, true));

    const targetBond = struct.bonds.get(targetBondId) as Bond;
    expect(targetBondId).toBe(0);
    expect(loopTop).toBe(0);
    expect(getBondFlipSign(struct, targetBond)).toBe(-1);
  });
});
