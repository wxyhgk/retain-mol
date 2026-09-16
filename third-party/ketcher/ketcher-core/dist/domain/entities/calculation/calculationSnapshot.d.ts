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
import type { Struct } from '../../entities/struct';
export declare const CALCULATION_SNAPSHOT_SCHEMA_VERSION: "1.0";
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
/**
 * Creates a computation-facing, deterministic and immutable snapshot without
 * mutating or normalizing the source Struct.
 */
export declare function createCalculationSnapshotV1(struct: Struct, options?: CreateCalculationSnapshotV1Options): CalculationSnapshotV1;
