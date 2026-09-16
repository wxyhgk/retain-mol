import { identifyStructFormat } from 'application/formatters/identifyStructFormat';
import { SupportedFormat } from 'application/formatters/structFormatter.types';

describe('identifyStructFormat', () => {
  describe('computational chemistry formats', () => {
    it('recognizes XYZ', () => {
      expect(identifyStructFormat('2\nwater\nO 0 0 0\nH 0 0 1')).toBe(
        SupportedFormat.xyz,
      );
    });

    it('recognizes extended XYZ with non-canonical property order', () => {
      expect(
        identifyStructFormat(
          '1\nProperties=tag:S:1:pos:R:3:species:S:1 charge=0 multiplicity=1\ncenter 0 0 0 C',
        ),
      ).toBe(SupportedFormat.extendedXYZ);
    });

    it('recognizes a QCSchema molecule before generic KET JSON', () => {
      expect(
        identifyStructFormat(
          JSON.stringify({
            schema_name: 'qcschema_molecule',
            symbols: ['He'],
            geometry: [0, 0, 0],
          }),
        ),
      ).toBe(SupportedFormat.qcSchema);
    });

    it('keeps non-QCSchema JSON on the KET path', () => {
      expect(identifyStructFormat('{"root":{"nodes":[]}}')).toBe(
        SupportedFormat.ket,
      );
    });
  });

  describe('MOL2 format detection', () => {
    it('recognizes a Tripos molecule header', () => {
      expect(
        identifyStructFormat(
          '@<TRIPOS>MOLECULE\nbenzene\n6 6 0 0 0\nSMALL\nNO_CHARGES',
        ),
      ).toBe(SupportedFormat.mol2);
    });

    it('recognizes a BOM-prefixed Tripos molecule header', () => {
      expect(
        identifyStructFormat('\uFEFF@<TRIPOS>MOLECULE\nwater\n3 2 0 0 0'),
      ).toBe(SupportedFormat.mol2);
    });
  });

  describe('IDT format detection', () => {
    it('recognizes phosphorothioate base sequence', () => {
      expect(
        identifyStructFormat('A*C*G*C*G*C*G*A*C*T*A*T*A*C*G*C*G*C*C*T'),
      ).toBe(SupportedFormat.idt);
    });

    it('recognizes IDT modification token', () => {
      expect(identifyStructFormat('/5FITC/AC')).toBe(SupportedFormat.idt);
      expect(identifyStructFormat('AC/3FAM/')).toBe(SupportedFormat.idt);
      expect(identifyStructFormat('A/iSp3/C')).toBe(SupportedFormat.idt);
    });

    it('does not misidentify plain SMILES as IDT', () => {
      expect(identifyStructFormat('CCO')).toBe(SupportedFormat.smiles);
      expect(identifyStructFormat('C1CCCCC1')).toBe(SupportedFormat.smiles);
    });

    it('does not misidentify single nucleotide as IDT (ambiguous)', () => {
      // Single letter — IDT base sequence requires at least two nucleotides with *
      expect(identifyStructFormat('A')).not.toBe(SupportedFormat.idt);
    });
  });
});
