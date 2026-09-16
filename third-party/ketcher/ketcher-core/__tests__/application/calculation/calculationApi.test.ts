import { setComputationalFormatMetadata } from 'application/formatters';
import { Ketcher } from 'application/ketcher';
import { Atom, Struct, Vec2 } from 'domain/entities';

function createKetcherWithStruct(struct: Struct): Ketcher {
  const ketcher = new Ketcher({} as never, {} as never);
  ketcher.addEditor({ struct: () => struct } as never);
  return ketcher;
}

describe('Ketcher calculation API', () => {
  it('uses imported charge and multiplicity metadata in a frozen snapshot', () => {
    const struct = new Struct();
    struct.atoms.add(
      new Atom({ label: 'O', pp: new Vec2(0, 0, 0), implicitH: 0 }),
    );
    struct.atoms.add(
      new Atom({ label: 'H', pp: new Vec2(0, 0, 1), implicitH: 0 }),
    );
    setComputationalFormatMetadata(struct, {
      molecularCharge: -1,
      molecularMultiplicity: 2,
    });

    const snapshot = createKetcherWithStruct(struct).getCalculationSnapshot();

    expect(snapshot.totalCharge).toBe(-1);
    expect(snapshot.multiplicity).toBe(2);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('persists validated calculation settings for later export', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'H', pp: new Vec2(0, 0, 0) }));
    const ketcher = createKetcherWithStruct(struct);

    ketcher.setCalculationSettings({ totalCharge: 0, multiplicity: 2 });

    expect(ketcher.getCalculationSnapshot()).toMatchObject({
      totalCharge: 0,
      multiplicity: 2,
    });
    expect(() =>
      ketcher.setCalculationSettings({ totalCharge: 0, multiplicity: 0 }),
    ).toThrow('multiplicity must be at least one');
  });

  it('reports electron and multiplicity incompatibility through the API', () => {
    const struct = new Struct();
    struct.atoms.add(new Atom({ label: 'H', pp: new Vec2(0, 0, 0) }));

    const result = createKetcherWithStruct(struct).checkCalculationReadiness({
      totalCharge: 0,
      multiplicity: 1,
    });

    expect(result.ready).toBe(false);
    expect(result.issues.map(({ code }) => code)).toContain(
      'ELECTRON_MULTIPLICITY_MISMATCH',
    );
  });
});
