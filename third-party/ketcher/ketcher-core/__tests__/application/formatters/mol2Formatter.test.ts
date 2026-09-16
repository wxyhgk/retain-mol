import { Mol2Formatter } from 'application/formatters/mol2Formatter';
import { Bond } from 'domain/entities';

const MOL2 = `@<TRIPOS>MOLECULE
charged aromatic fragment
4 3 1 0 0
SMALL
USER_CHARGES

@<TRIPOS>ATOM
10 C1  1.25  2.50  0.75 C.ar 1 RES1  0.125
20 C2  2.50  2.50  0.75 C.ar 1 RES1 -0.125
30 N1  3.00  1.25  0.00 N.4  1 RES1  0.500
40 D1  4.00  1.25  0.00 D    1 RES1  0.000
@<TRIPOS>UNITY_ATOM_ATTR
30 1
charge -1
@<TRIPOS>BOND
1 10 20 ar
2 20 30 2
3 30 40 am
@<TRIPOS>SUBSTRUCTURE
1 RES1 10
`;

describe('Mol2Formatter', () => {
  it('parses atoms, bonds, coordinates, isotopes, and formal UNITY charges', async () => {
    const struct = await new Mol2Formatter().getStructureFromStringAsync(MOL2);

    expect(struct.name).toBe('charged aromatic fragment');
    expect(struct.atoms.size).toBe(4);
    expect(struct.bonds.size).toBe(3);

    expect(struct.atoms.get(0)).toMatchObject({
      label: 'C',
      charge: null,
      pp: { x: 1.25, y: -2.5, z: 0.75 },
    });
    expect(struct.atoms.get(2)).toMatchObject({ label: 'N', charge: -1 });
    expect(struct.atoms.get(3)).toMatchObject({ label: 'H', isotope: 2 });

    expect(struct.bonds.get(0)).toMatchObject({
      begin: 0,
      end: 1,
      type: Bond.PATTERN.TYPE.AROMATIC,
    });
    expect(struct.bonds.get(1)?.type).toBe(Bond.PATTERN.TYPE.DOUBLE);
    expect(struct.bonds.get(2)?.type).toBe(Bond.PATTERN.TYPE.SINGLE);
  });

  it('uses the atom name to recover dummy-typed elements', async () => {
    const mol2 = `@<TRIPOS>MOLECULE
dummy atom types
2 1 0 0 0
SMALL
NO_CHARGES
@<TRIPOS>ATOM
1 CL1 0 0 0 Du
2 Br2 1 0 0 Xx
@<TRIPOS>BOND
1 1 2 1
`;

    const struct = await new Mol2Formatter().getStructureFromStringAsync(mol2);

    expect(struct.atoms.get(0)?.label).toBe('Cl');
    expect(struct.atoms.get(1)?.label).toBe('Br');
  });

  it('rejects bonds that reference missing atoms with a focused error', async () => {
    const mol2 = `@<TRIPOS>MOLECULE
invalid
1 1 0 0 0
SMALL
NO_CHARGES
@<TRIPOS>ATOM
1 C1 0 0 0 C.3
@<TRIPOS>BOND
1 1 2 1
`;

    await expect(
      new Mol2Formatter().getStructureFromStringAsync(mol2),
    ).rejects.toThrow('bond references unknown atom id 2');
  });

  it('does not expose unsupported MOL2 serialization', async () => {
    await expect(
      new Mol2Formatter().getStringFromStructureAsync(),
    ).rejects.toThrow('MOL2 export is not supported');
  });
});
