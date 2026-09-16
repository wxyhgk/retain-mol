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

import type { Struct } from 'domain/entities';

export type ExtendedXYZProperty = {
  name: string;
  type: string;
  columns: number;
};

export type ExtendedXYZMetadata = {
  fields: Record<string, string>;
  properties: ExtendedXYZProperty[];
  atomValues: Map<number, Record<string, string[]>>;
};

export type ComputationalFormatMetadata = {
  comment?: string;
  molecularCharge?: number;
  molecularMultiplicity?: number | null;
  sourceGeometryUnits?: 'angstrom' | 'bohr';
  extendedXYZ?: ExtendedXYZMetadata;
};

// This is intentionally formatter-scoped transitional metadata. It survives a
// direct parse/edit/serialize flow for the same Struct instance, but does not
// claim persistence across Struct cloning or KET serialization.
const metadataByStruct = new WeakMap<Struct, ComputationalFormatMetadata>();

export function setComputationalFormatMetadata(
  struct: Struct,
  metadata: ComputationalFormatMetadata,
): void {
  metadataByStruct.set(struct, {
    ...metadataByStruct.get(struct),
    ...metadata,
  });
}

export function getComputationalFormatMetadata(
  struct: Struct,
): ComputationalFormatMetadata | undefined {
  return metadataByStruct.get(struct);
}
