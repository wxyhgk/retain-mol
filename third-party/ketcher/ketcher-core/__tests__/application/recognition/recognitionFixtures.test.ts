import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface RecognitionFixture {
  id: string;
  atomCount: number;
  bondCount: number;
  imageFile: string;
  molFile: string;
  sdfFile: string;
}

interface RecognitionFixtureManifest {
  schemaVersion: string;
  fixtures: RecognitionFixture[];
}

const fixtureDirectory = resolve(
  __dirname,
  '../../fixtures/recognition/simple-v1',
);
const manifestPath = resolve(fixtureDirectory, 'manifest.json');
const manifest = JSON.parse(
  readFileSync(manifestPath, 'utf8'),
) as RecognitionFixtureManifest;

function readV2000Counts(molFile: string) {
  const contents = readFileSync(resolve(fixtureDirectory, molFile), 'utf8');
  const countsLine = contents.match(/^\s*(\d+)\s+(\d+).*V2000\s*$/m);

  if (!countsLine) {
    throw new Error(`${molFile} does not contain a V2000 counts line`);
  }

  return {
    atomCount: Number(countsLine[1]),
    bondCount: Number(countsLine[2]),
  };
}

describe('simple-v1 recognition fixtures', () => {
  it('contains the complete ten-entry blind fixture manifest', () => {
    expect(manifest.schemaVersion).toBe('recognition-fixtures.v1');
    expect(manifest.fixtures).toHaveLength(10);
    expect(manifest.fixtures.map(({ id }) => id)).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `blind-${String(index + 1).padStart(3, '0')}`,
      ),
    );
    expect(new Set(manifest.fixtures.map(({ id }) => id))).toHaveProperty(
      'size',
      10,
    );
  });

  it.each(manifest.fixtures)(
    'keeps $id files and MOL counts consistent with the manifest',
    (fixture) => {
      expect(fixture.atomCount).toBeLessThan(50);
      expect(fixture.imageFile).toBe(`${fixture.id}.png`);
      expect(fixture.molFile).toBe(`${fixture.id}.mol`);
      expect(fixture.sdfFile).toBe(`${fixture.id}.sdf`);

      for (const file of [
        fixture.imageFile,
        fixture.molFile,
        fixture.sdfFile,
      ]) {
        expect(existsSync(resolve(fixtureDirectory, file))).toBe(true);
      }

      expect(readV2000Counts(fixture.molFile)).toEqual({
        atomCount: fixture.atomCount,
        bondCount: fixture.bondCount,
      });
    },
  );
});
