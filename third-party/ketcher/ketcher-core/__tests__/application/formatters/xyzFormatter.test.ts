import {
  ExtendedXYZFormatter,
  XYZFormatter,
} from 'application/formatters/xyzFormatter';
import { getComputationalFormatMetadata } from 'application/formatters/computationalFormatMetadata';

describe('XYZFormatter', () => {
  it('imports and exports a single XYZ frame without changing coordinates', async () => {
    const xyz = `3
water geometry
O 0.000000 0.000000 0.117790
H 0.000000 0.755453 -0.471161
1 0.000000 -0.755453 -0.471161`;
    const formatter = new XYZFormatter();
    const struct = await formatter.getStructureFromStringAsync(xyz);

    expect(struct.name).toBe('water geometry');
    expect(struct.atoms.get(0)).toMatchObject({
      label: 'O',
      pp: { x: 0, y: 0, z: 0.11779 },
    });
    expect(struct.atoms.get(1)).toMatchObject({
      label: 'H',
      pp: { x: 0, y: -0.755453, z: -0.471161 },
    });

    const exported = await formatter.getStringFromStructureAsync(struct);
    expect(exported).toContain('O 0 0 0.11779');
    expect(exported).toContain('H 0 0.755453 -0.471161');
    expect(
      (await formatter.getStructureFromStringAsync(exported)).atoms.size,
    ).toBe(3);
  });

  it('rejects multiple frames instead of silently discarding them', async () => {
    const multipleFrames = `1
first
H 0 0 0
1
second
H 1 0 0`;

    await expect(
      new XYZFormatter().getStructureFromStringAsync(multipleFrames),
    ).rejects.toThrow('multiple XYZ frames are not supported');
  });
});

describe('ExtendedXYZFormatter', () => {
  it('uses the Properties descriptor and preserves metadata and extra atom columns', async () => {
    const extXYZ = `2
Properties=tag:S:1:pos:R:3:species:S:1:partial_charge:R:1 charge=-1 multiplicity=2 name="hydroxyl radical"
center 0.1 0.2 0.3 O -0.4
edge 1.1 1.2 1.3 H 0.4`;
    const formatter = new ExtendedXYZFormatter();
    const struct = await formatter.getStructureFromStringAsync(extXYZ);
    const metadata = getComputationalFormatMetadata(struct);

    expect(struct.name).toBe('hydroxyl radical');
    expect(struct.atoms.get(0)).toMatchObject({
      label: 'O',
      pp: { x: 0.1, y: -0.2, z: 0.3 },
    });
    expect(metadata).toMatchObject({
      molecularCharge: -1,
      molecularMultiplicity: 2,
      sourceGeometryUnits: 'angstrom',
    });

    const exported = await formatter.getStringFromStructureAsync(struct);
    expect(exported).toContain(
      'Properties=tag:S:1:pos:R:3:species:S:1:partial_charge:R:1',
    );
    expect(exported).toContain('charge=-1');
    expect(exported).toContain('multiplicity=2');
    expect(exported).toContain('center 0.1 0.2 0.3 O -0.4');
  });

  it('exports canonical Properties, charge, and multiplicity for an XYZ struct', async () => {
    const struct = await new XYZFormatter().getStructureFromStringAsync(
      `1
hydrogen
H 0 0 0`,
    );
    const exported =
      await new ExtendedXYZFormatter().getStringFromStructureAsync(struct);

    expect(exported.split('\n')[1]).toBe(
      'Properties=species:S:1:pos:R:3 charge=0',
    );
    expect(exported.split('\n')[2]).toBe('H 0 0 0');
  });
});
