/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { StructFormatter } from './structFormatter.types';
import {
  getComputationalFormatMetadata,
  setComputationalFormatMetadata,
} from './computationalFormatMetadata';
import { Elements } from 'domain/constants';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

const BOHR_TO_ANGSTROM = 0.529177210903;

type QCSchemaMolecule = {
  schema_name?: string;
  schema_version?: number;
  name?: string;
  symbols: unknown;
  geometry: unknown;
  geometry_units?: unknown;
  units?: unknown;
  molecular_charge?: unknown;
  molecular_multiplicity?: unknown;
  connectivity?: unknown;
};

function parseError(message: string): Error {
  return new Error(`QCSchema parse error: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseJSON(content: string): QCSchemaMolecule {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw parseError('invalid JSON');
  }
  if (!isRecord(parsed)) throw parseError('expected a molecule object');
  return parsed as QCSchemaMolecule;
}

function parseSymbols(value: unknown): string[] {
  if (!Array.isArray(value) || !value.length) {
    throw parseError('symbols must be a non-empty array');
  }
  return value.map((symbol, index) => {
    if (typeof symbol !== 'string' || !Elements.get(symbol)) {
      throw parseError(`unsupported symbol at index ${index}`);
    }
    return symbol;
  });
}

function parseGeometry(value: unknown, atomCount: number): number[] {
  const flattened =
    Array.isArray(value) && value.every((item) => Array.isArray(item))
      ? value.flat()
      : value;
  if (
    !Array.isArray(flattened) ||
    flattened.length !== atomCount * 3 ||
    !flattened.every((coordinate) =>
      Number.isFinite(typeof coordinate === 'number' ? coordinate : NaN),
    )
  ) {
    throw parseError(`geometry must contain ${atomCount * 3} finite numbers`);
  }
  return flattened as number[];
}

function parseCharge(value: unknown): number {
  if (value === undefined) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw parseError('molecular_charge must be a finite number');
  }
  return value;
}

function parseMultiplicity(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw parseError('molecular_multiplicity must be a positive integer');
  }
  return value;
}

function parseUnits(molecule: QCSchemaMolecule): 'angstrom' | 'bohr' {
  const value = molecule.geometry_units ?? molecule.units ?? 'bohr';
  if (typeof value !== 'string') throw parseError('invalid geometry units');
  const normalized = value.toLowerCase().replace(/s$/, '');
  if (['angstrom', 'ang'].includes(normalized)) return 'angstrom';
  if (['bohr', 'au', 'a0'].includes(normalized)) return 'bohr';
  throw parseError(`unsupported geometry units "${value}"`);
}

function getBondType(order: number): number {
  if (order === 1) return Bond.PATTERN.TYPE.SINGLE;
  if (order === 2) return Bond.PATTERN.TYPE.DOUBLE;
  if (order === 3) return Bond.PATTERN.TYPE.TRIPLE;
  if (order === 1.5) return Bond.PATTERN.TYPE.AROMATIC;
  throw parseError(`unsupported connectivity bond order ${order}`);
}

function getBondOrder(type: number): number {
  if (type === Bond.PATTERN.TYPE.SINGLE) return 1;
  if (type === Bond.PATTERN.TYPE.DOUBLE) return 2;
  if (type === Bond.PATTERN.TYPE.TRIPLE) return 3;
  if (type === Bond.PATTERN.TYPE.AROMATIC) return 1.5;
  throw new Error(`QCSchema export error: unsupported bond type ${type}`);
}

function addConnectivity(
  struct: Struct,
  value: unknown,
  atomIds: number[],
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) throw parseError('connectivity must be an array');

  const pairs = new Set<string>();
  value.forEach((entry, entryIndex) => {
    if (
      !Array.isArray(entry) ||
      entry.length !== 3 ||
      !Number.isSafeInteger(entry[0]) ||
      !Number.isSafeInteger(entry[1]) ||
      typeof entry[2] !== 'number' ||
      !Number.isFinite(entry[2])
    ) {
      throw parseError(`invalid connectivity entry at index ${entryIndex}`);
    }
    const [beginIndex, endIndex, order] = entry as [number, number, number];
    if (
      beginIndex < 0 ||
      endIndex < 0 ||
      beginIndex >= atomIds.length ||
      endIndex >= atomIds.length ||
      beginIndex === endIndex
    ) {
      throw parseError(
        `connectivity index out of range at entry ${entryIndex}`,
      );
    }
    const pair = [beginIndex, endIndex].sort((a, b) => a - b).join(':');
    if (pairs.has(pair)) {
      throw parseError(`duplicate connectivity entry for atoms ${pair}`);
    }
    pairs.add(pair);
    struct.bonds.add(
      new Bond({
        begin: atomIds[beginIndex],
        end: atomIds[endIndex],
        type: getBondType(order),
      }),
    );
  });
}

function getTotalFormalCharge(struct: Struct): number {
  return Array.from(struct.atoms.values()).reduce(
    (sum, atom) => sum + (atom.charge ?? 0),
    0,
  );
}

export class QCSchemaFormatter implements StructFormatter {
  async getStringFromStructureAsync(struct: Struct): Promise<string> {
    const metadata = getComputationalFormatMetadata(struct);
    const atomEntries = Array.from(struct.atoms.entries());
    const atomIndexes = new Map(
      atomEntries.map(([atomId], index) => [atomId, index]),
    );
    const geometry = atomEntries.flatMap(([, atom]) => [
      atom.pp.x / BOHR_TO_ANGSTROM,
      -atom.pp.y / BOHR_TO_ANGSTROM,
      atom.pp.z / BOHR_TO_ANGSTROM,
    ]);
    const connectivity = Array.from(struct.bonds.values()).map((bond) => {
      const begin = atomIndexes.get(bond.begin);
      const end = atomIndexes.get(bond.end);
      if (begin === undefined || end === undefined) {
        throw new Error(
          'QCSchema export error: bond references a missing atom',
        );
      }
      return [begin, end, getBondOrder(bond.type)];
    });
    const molecule = {
      schema_name: 'qcschema_molecule',
      schema_version: 2,
      ...(struct.name ? { name: struct.name } : {}),
      symbols: atomEntries.map(([, atom]) => atom.label),
      // QCSchema geometry is expressed in atomic units (bohr).
      geometry,
      molecular_charge:
        metadata?.molecularCharge ?? getTotalFormalCharge(struct),
      ...(metadata?.molecularMultiplicity !== null &&
      metadata?.molecularMultiplicity !== undefined
        ? { molecular_multiplicity: metadata.molecularMultiplicity }
        : {}),
      connectivity,
    };
    return JSON.stringify(molecule, null, 2);
  }

  async getStructureFromStringAsync(content: string): Promise<Struct> {
    const molecule = parseJSON(content);
    const symbols = parseSymbols(molecule.symbols);
    const geometry = parseGeometry(molecule.geometry, symbols.length);
    const units = parseUnits(molecule);
    const scale = units === 'bohr' ? BOHR_TO_ANGSTROM : 1;
    const molecularCharge = parseCharge(molecule.molecular_charge);
    const molecularMultiplicity = parseMultiplicity(
      molecule.molecular_multiplicity,
    );
    const struct = new Struct();
    struct.name = typeof molecule.name === 'string' ? molecule.name : '';
    const atomIds = symbols.map((symbol, atomIndex) => {
      const coordinateIndex = atomIndex * 3;
      return struct.atoms.add(
        new Atom({
          label: symbol,
          pp: new Vec2(
            geometry[coordinateIndex] * scale,
            -geometry[coordinateIndex + 1] * scale,
            geometry[coordinateIndex + 2] * scale,
          ),
        }),
      );
    });
    addConnectivity(struct, molecule.connectivity, atomIds);
    setComputationalFormatMetadata(struct, {
      molecularCharge,
      molecularMultiplicity,
      sourceGeometryUnits: units,
    });
    return struct;
  }
}

export function isQCSchemaMolecule(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.schema_name === 'qcschema_molecule') return true;
  return (
    Array.isArray(value.symbols) &&
    Array.isArray(value.geometry) &&
    ('molecular_charge' in value ||
      'molecular_multiplicity' in value ||
      'connectivity' in value)
  );
}
