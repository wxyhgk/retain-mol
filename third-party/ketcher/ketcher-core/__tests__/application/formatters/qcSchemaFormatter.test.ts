import { getComputationalFormatMetadata } from 'application/formatters/computationalFormatMetadata';
import { QCSchemaFormatter } from 'application/formatters/qcSchemaFormatter';
import { Bond } from 'domain/entities';

const BOHR_TO_ANGSTROM = 0.529177210903;

describe('QCSchemaFormatter', () => {
  it('imports bohr geometry, charge, multiplicity, and connectivity', async () => {
    const formatter = new QCSchemaFormatter();
    const struct = await formatter.getStructureFromStringAsync(
      JSON.stringify({
        schema_name: 'qcschema_molecule',
        schema_version: 2,
        name: 'hydroxyl',
        symbols: ['O', 'H'],
        geometry: [0, 0, 0, 0, 0, 2],
        molecular_charge: -1,
        molecular_multiplicity: 2,
        connectivity: [[0, 1, 1]],
      }),
    );

    expect(struct.name).toBe('hydroxyl');
    expect(struct.atoms.get(1)?.pp.z).toBeCloseTo(2 * BOHR_TO_ANGSTROM);
    expect(struct.bonds.get(0)).toMatchObject({
      begin: 0,
      end: 1,
      type: Bond.PATTERN.TYPE.SINGLE,
    });
    expect(getComputationalFormatMetadata(struct)).toMatchObject({
      molecularCharge: -1,
      molecularMultiplicity: 2,
      sourceGeometryUnits: 'bohr',
    });

    const exported = JSON.parse(
      await formatter.getStringFromStructureAsync(struct),
    );
    expect(exported).toMatchObject({
      schema_name: 'qcschema_molecule',
      schema_version: 2,
      symbols: ['O', 'H'],
      molecular_charge: -1,
      molecular_multiplicity: 2,
      connectivity: [[0, 1, 1]],
    });
    expect(exported.geometry[5]).toBeCloseTo(2);
  });

  it('accepts explicitly angstrom geometry and always exports QCSchema bohr', async () => {
    const formatter = new QCSchemaFormatter();
    const struct = await formatter.getStructureFromStringAsync(
      JSON.stringify({
        schema_name: 'qcschema_molecule',
        symbols: ['H'],
        geometry: [[1, 2, 3]],
        geometry_units: 'angstrom',
      }),
    );

    expect(struct.atoms.get(0)?.pp).toMatchObject({ x: 1, y: -2, z: 3 });
    const exported = JSON.parse(
      await formatter.getStringFromStructureAsync(struct),
    );
    expect(exported.geometry[0]).toBeCloseTo(1 / BOHR_TO_ANGSTROM);
    expect(exported.geometry[1]).toBeCloseTo(2 / BOHR_TO_ANGSTROM);
    expect(exported.geometry[2]).toBeCloseTo(3 / BOHR_TO_ANGSTROM);
  });

  it('rejects connectivity that references a missing atom', async () => {
    await expect(
      new QCSchemaFormatter().getStructureFromStringAsync(
        JSON.stringify({
          schema_name: 'qcschema_molecule',
          symbols: ['H'],
          geometry: [0, 0, 0],
          connectivity: [[0, 1, 1]],
        }),
      ),
    ).rejects.toThrow('connectivity index out of range');
  });
});
