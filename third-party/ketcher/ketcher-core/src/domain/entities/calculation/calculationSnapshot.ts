/****************************************************************************
 * Copyright 2026 EPAM Systems
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

import { Elements } from 'domain/constants';
import { Bond } from 'domain/entities/bond';
import type { Struct } from 'domain/entities/struct';

export const CALCULATION_SNAPSHOT_SCHEMA_VERSION = '1.0' as const;

export type CoordinatesAngstrom = readonly [number, number, number];

export interface CalculationAtomReference {
  readonly index: number;
  readonly sourceAtomId: number;
  readonly sourceAtomRef: string;
}

export interface CalculationAtom extends CalculationAtomReference {
  readonly element: string;
  readonly atomicNumber: number | null;
  readonly coordinatesAngstrom: CoordinatesAngstrom;
  readonly formalCharge: number;
  readonly isotope: number | null;
  readonly radical: number;
  readonly implicitHydrogenCount: number;
}

export interface CalculationConnectivity {
  readonly sourceBondId: number;
  readonly sourceBondRef: string;
  readonly atomIndices: readonly [number, number];
  /** Null means that the Ketcher bond is a query/ambiguous bond. */
  readonly order: number | null;
  readonly ketcherBondType: number;
}

export interface CalculationFragment {
  readonly index: number;
  readonly atomIndices: readonly number[];
  readonly sourceAtomIds: readonly number[];
  readonly totalFormalCharge: number;
}

export interface CalculationSnapshotSource {
  readonly type: 'ketcher-struct';
  readonly name: string | null;
  readonly sourceId: string | null;
}

export interface CalculationSnapshotProvenance {
  readonly generator: 'ketcher-core';
  readonly operation: 'createCalculationSnapshotV1';
  readonly coordinateScaleToAngstrom: number;
  readonly totalChargeOrigin: 'formal-charges' | 'override';
  readonly multiplicityOrigin: 'unspecified' | 'override';
}

export interface CalculationSnapshotV1 {
  readonly schemaVersion: typeof CALCULATION_SNAPSHOT_SCHEMA_VERSION;
  /** Canonical atom representation. All atom-indexed fields follow this order. */
  readonly atoms: readonly CalculationAtom[];
  /** Convenience projection for QCSchema-like consumers. */
  readonly symbols: readonly string[];
  /** Convenience projection for geometry and trajectory serializers. */
  readonly geometryAngstrom: readonly CoordinatesAngstrom[];
  readonly atomOrder: readonly CalculationAtomReference[];
  readonly connectivity: readonly CalculationConnectivity[];
  readonly totalCharge: number;
  /** Null indicates that multiplicity has not been explicitly supplied. */
  readonly multiplicity: number | null;
  readonly fragments: readonly CalculationFragment[];
  readonly source: CalculationSnapshotSource;
  readonly provenance: CalculationSnapshotProvenance;
  /** Deterministic content revision. Equal snapshots have equal revisions. */
  readonly revision: string;
}

export interface CreateCalculationSnapshotV1Options {
  readonly totalCharge?: number;
  /** Null or omitted keeps multiplicity explicitly unspecified. */
  readonly multiplicity?: number | null;
  /** Conversion applied to every Ketcher coordinate before it enters the snapshot. */
  readonly coordinateScaleToAngstrom?: number;
  /** Optional stable identifier supplied by the host document/store. */
  readonly sourceId?: string;
}

type SnapshotWithoutRevision = Omit<CalculationSnapshotV1, 'revision'>;

function assertFiniteNumber(value: number, description: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${description} must be a finite number`);
  }
}

function assertInteger(value: number, description: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${description} must be an integer`);
  }
}

function getBondOrder(bondType: number): number | null {
  switch (bondType) {
    case Bond.PATTERN.TYPE.SINGLE:
    case Bond.PATTERN.TYPE.DATIVE:
    case Bond.PATTERN.TYPE.HYDROGEN:
      return 1;
    case Bond.PATTERN.TYPE.DOUBLE:
      return 2;
    case Bond.PATTERN.TYPE.TRIPLE:
      return 3;
    case Bond.PATTERN.TYPE.AROMATIC:
      return 1.5;
    default:
      return null;
  }
}

function buildFragments(
  atoms: readonly CalculationAtom[],
  connectivity: readonly CalculationConnectivity[],
): CalculationFragment[] {
  const neighbors = atoms.map(() => new Set<number>());
  connectivity.forEach(({ atomIndices: [begin, end] }) => {
    neighbors[begin].add(end);
    neighbors[end].add(begin);
  });

  const visited = new Set<number>();
  const fragments: CalculationFragment[] = [];
  atoms.forEach((_atom, firstIndex) => {
    if (visited.has(firstIndex)) return;

    const pending = [firstIndex];
    const atomIndices: number[] = [];
    visited.add(firstIndex);
    while (pending.length > 0) {
      const atomIndex = pending.pop();
      if (atomIndex === undefined) break;
      atomIndices.push(atomIndex);
      neighbors[atomIndex].forEach((neighborIndex) => {
        if (!visited.has(neighborIndex)) {
          visited.add(neighborIndex);
          pending.push(neighborIndex);
        }
      });
    }
    atomIndices.sort((left, right) => left - right);
    fragments.push({
      index: fragments.length,
      atomIndices,
      sourceAtomIds: atomIndices.map(
        (atomIndex) => atoms[atomIndex].sourceAtomId,
      ),
      totalFormalCharge: atomIndices.reduce(
        (charge, atomIndex) => charge + atoms[atomIndex].formalCharge,
        0,
      ),
    });
  });
  return fragments;
}

function hashRevision(value: unknown): string {
  const serialized = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index++) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.getOwnPropertyNames(value).forEach((property) => {
      deepFreeze(value[property]);
    });
    Object.freeze(value);
  }
  return value;
}

/**
 * Creates a computation-facing, deterministic and immutable snapshot without
 * mutating or normalizing the source Struct.
 */
export function createCalculationSnapshotV1(
  struct: Struct,
  options: CreateCalculationSnapshotV1Options = {},
): CalculationSnapshotV1 {
  const coordinateScaleToAngstrom = options.coordinateScaleToAngstrom ?? 1;
  assertFiniteNumber(coordinateScaleToAngstrom, 'coordinateScaleToAngstrom');
  if (coordinateScaleToAngstrom <= 0) {
    throw new Error('coordinateScaleToAngstrom must be greater than zero');
  }

  const sourceAtomIds = Array.from(struct.atoms.keys()).sort(
    (left, right) => left - right,
  );
  const sourceAtomIdToIndex = new Map<number, number>();
  const atoms = sourceAtomIds.map((sourceAtomId, index): CalculationAtom => {
    const atom = struct.atoms.get(sourceAtomId);
    if (!atom) {
      throw new Error(`atom ${sourceAtomId} is missing from the source Struct`);
    }
    const coordinatesAngstrom: CoordinatesAngstrom = [
      atom.pp.x * coordinateScaleToAngstrom,
      atom.pp.y * coordinateScaleToAngstrom,
      atom.pp.z * coordinateScaleToAngstrom,
    ];
    coordinatesAngstrom.forEach((coordinate, coordinateIndex) => {
      assertFiniteNumber(
        coordinate,
        `atom ${sourceAtomId} coordinate ${coordinateIndex}`,
      );
    });
    sourceAtomIdToIndex.set(sourceAtomId, index);
    return {
      index,
      sourceAtomId,
      sourceAtomRef: `atom:${sourceAtomId}`,
      element: atom.label,
      atomicNumber: Elements.get(atom.label)?.number ?? null,
      coordinatesAngstrom,
      formalCharge: atom.charge ?? 0,
      isotope: atom.isotope,
      radical: atom.radical,
      implicitHydrogenCount: atom.implicitHCount ?? atom.implicitH,
    };
  });

  const connectivity = Array.from(struct.bonds.entries())
    .sort(([leftId], [rightId]) => leftId - rightId)
    .map(([sourceBondId, bond]): CalculationConnectivity => {
      const beginIndex = sourceAtomIdToIndex.get(bond.begin);
      const endIndex = sourceAtomIdToIndex.get(bond.end);
      if (beginIndex === undefined || endIndex === undefined) {
        throw new Error(
          `bond ${sourceBondId} references an atom outside the source Struct`,
        );
      }
      return {
        sourceBondId,
        sourceBondRef: `bond:${sourceBondId}`,
        atomIndices: [beginIndex, endIndex],
        order: getBondOrder(bond.type),
        ketcherBondType: bond.type,
      };
    });

  const totalCharge =
    options.totalCharge ??
    atoms.reduce((charge, atom) => charge + atom.formalCharge, 0);
  assertInteger(totalCharge, 'totalCharge');

  const multiplicity = options.multiplicity ?? null;
  if (multiplicity !== null) {
    assertInteger(multiplicity, 'multiplicity');
    if (multiplicity < 1) throw new Error('multiplicity must be at least one');
  }

  const snapshotWithoutRevision: SnapshotWithoutRevision = {
    schemaVersion: CALCULATION_SNAPSHOT_SCHEMA_VERSION,
    atoms,
    symbols: atoms.map((atom) => atom.element),
    geometryAngstrom: atoms.map((atom) => atom.coordinatesAngstrom),
    atomOrder: atoms.map(({ index, sourceAtomId, sourceAtomRef }) => ({
      index,
      sourceAtomId,
      sourceAtomRef,
    })),
    connectivity,
    totalCharge,
    multiplicity,
    fragments: buildFragments(atoms, connectivity),
    source: {
      type: 'ketcher-struct',
      name: struct.name || null,
      sourceId: options.sourceId ?? null,
    },
    provenance: {
      generator: 'ketcher-core',
      operation: 'createCalculationSnapshotV1',
      coordinateScaleToAngstrom,
      totalChargeOrigin:
        options.totalCharge === undefined ? 'formal-charges' : 'override',
      multiplicityOrigin:
        options.multiplicity === undefined || options.multiplicity === null
          ? 'unspecified'
          : 'override',
    },
  };
  const snapshot: CalculationSnapshotV1 = {
    ...snapshotWithoutRevision,
    revision: hashRevision(snapshotWithoutRevision),
  };
  return deepFreeze(snapshot);
}
