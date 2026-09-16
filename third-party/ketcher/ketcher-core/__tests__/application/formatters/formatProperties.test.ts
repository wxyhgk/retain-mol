import {
  getFormatMimeTypeByFileName,
  getPropertiesByFormat,
  SupportedFormat,
} from 'application/formatters';
import { ChemicalMimeType } from 'domain/services';

describe('getFormatMimeTypeByFileName', () => {
  it.each(['molecule.mol2', 'molecule.MOL2', 'molecule.ml2', 'molecule.sy2'])(
    'maps %s to the Tripos MOL2 MIME type',
    (fileName) => {
      expect(getFormatMimeTypeByFileName(fileName)).toBe(ChemicalMimeType.Mol2);
    },
  );

  it.each([
    ['geometry.xyz', SupportedFormat.xyz, 'chemical/x-xyz'],
    ['geometry.extxyz', SupportedFormat.extendedXYZ, 'chemical/x-extxyz'],
    ['molecule.json', SupportedFormat.qcSchema, 'application/qcschema+json'],
  ])('maps %s to the local computational format', (fileName, format, mime) => {
    expect(getFormatMimeTypeByFileName(fileName)).toBe(mime);
    expect(getPropertiesByFormat(format)).toMatchObject({
      mime,
      supportsCoords: true,
    });
  });
});
