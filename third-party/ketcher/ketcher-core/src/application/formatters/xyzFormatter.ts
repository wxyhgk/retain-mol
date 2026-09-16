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
  type ExtendedXYZMetadata,
  type ExtendedXYZProperty,
} from './computationalFormatMetadata';
import { Elements } from 'domain/constants';
import { Atom, Struct, Vec2 } from 'domain/entities';

const EXTENDED_XYZ_PROPERTIES = 'Properties';

function parseError(message: string, lineNumber?: number): Error {
  const location = lineNumber ? ` at line ${lineNumber}` : '';
  return new Error(`XYZ parse error${location}: ${message}`);
}

function normalizeElementSymbol(symbol: string): string {
  if (!symbol) return '';
  return symbol[0].toUpperCase() + symbol.slice(1).toLowerCase();
}

function parseFiniteNumber(
  value: string | undefined,
  description: string,
  lineNumber: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw parseError(`invalid ${description} "${value ?? ''}"`, lineNumber);
  }
  return parsed;
}

function parseAtomCount(value: string, lineNumber: number): number {
  const parsed = Number(value.trim());
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw parseError(`invalid atom count "${value.trim()}"`, lineNumber);
  }
  return parsed;
}

function getXYZLines(content: string): {
  atomCount: number;
  comment: string;
  atomLines: Array<{ content: string; lineNumber: number }>;
} {
  const lines = content.replace(/^\uFEFF/, '').split(/\r\n|[\n\r]/g);
  const firstLineIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstLineIndex === -1) throw parseError('missing atom count');

  const atomCount = parseAtomCount(lines[firstLineIndex], firstLineIndex + 1);
  const commentLineIndex = firstLineIndex + 1;
  if (commentLineIndex >= lines.length) {
    throw parseError('missing comment line', commentLineIndex + 1);
  }

  const atomLines = lines
    .slice(commentLineIndex + 1)
    .map((line, index) => ({
      content: line.trim(),
      lineNumber: commentLineIndex + index + 2,
    }))
    .filter(({ content }) => content.length > 0);

  if (atomLines.length < atomCount) {
    throw parseError(`expected ${atomCount} atoms, found ${atomLines.length}`);
  }
  if (atomLines.length > atomCount) {
    throw parseError('multiple XYZ frames are not supported');
  }

  return {
    atomCount,
    comment: lines[commentLineIndex],
    atomLines,
  };
}

function getElement(value: string, lineNumber: number): string {
  let symbol = value;
  if (/^\d+$/.test(value)) {
    const atomicNumber = Number(value);
    symbol = Elements.get(atomicNumber)?.label ?? '';
  }

  const normalized = normalizeElementSymbol(symbol);
  if (!Elements.get(normalized)) {
    throw parseError(`unsupported element "${value}"`, lineNumber);
  }
  return normalized;
}

function addAtom(
  struct: Struct,
  symbol: string,
  coordinates: string[],
  lineNumber: number,
): number {
  const x = parseFiniteNumber(coordinates[0], 'x coordinate', lineNumber);
  const y = parseFiniteNumber(coordinates[1], 'y coordinate', lineNumber);
  const z = parseFiniteNumber(coordinates[2], 'z coordinate', lineNumber);

  return struct.atoms.add(
    new Atom({
      label: getElement(symbol, lineNumber),
      // Ketcher's drawing axis points down, while chemistry coordinates point up.
      pp: new Vec2(x, -y, z),
    }),
  );
}

function formatNumber(value: number): string {
  return Object.is(value, -0) ? '0' : String(value);
}

function getCoordinateValues(atom: Atom): string[] {
  return [
    formatNumber(atom.pp.x),
    formatNumber(-atom.pp.y),
    formatNumber(atom.pp.z),
  ];
}

function serializeXYZAtoms(struct: Struct): string[] {
  return Array.from(struct.atoms.values()).map((atom) =>
    [atom.label, ...getCoordinateValues(atom)].join(' '),
  );
}

function parseHeaderFields(comment: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const fieldPattern =
    /([A-Za-z_][A-Za-z0-9_]*)=("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = fieldPattern.exec(comment))) {
    const rawValue = match[2];
    fields[match[1]] =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1).replace(/\\([\\"'])/g, '$1')
        : rawValue;
  }

  return fields;
}

function getFieldCaseInsensitive(
  fields: Record<string, string>,
  name: string,
): string | undefined {
  const key = Object.keys(fields).find(
    (candidate) => candidate.toLowerCase() === name.toLowerCase(),
  );
  return key ? fields[key] : undefined;
}

function parseProperties(value: string | undefined): ExtendedXYZProperty[] {
  if (!value) throw parseError('missing Properties descriptor', 2);
  const fields = value.split(':');
  if (fields.length % 3 !== 0) {
    throw parseError(`invalid Properties descriptor "${value}"`, 2);
  }

  const properties: ExtendedXYZProperty[] = [];
  for (let index = 0; index < fields.length; index += 3) {
    const columns = Number(fields[index + 2]);
    if (
      !fields[index] ||
      !fields[index + 1] ||
      !Number.isSafeInteger(columns) ||
      columns < 1
    ) {
      throw parseError(`invalid Properties descriptor "${value}"`, 2);
    }
    properties.push({
      name: fields[index],
      type: fields[index + 1],
      columns,
    });
  }
  return properties;
}

function parseOptionalNumber(
  value: string | undefined,
  description: string,
): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw parseError(`invalid ${description} "${value}"`, 2);
  }
  return parsed;
}

function parseOptionalMultiplicity(
  value: string | undefined,
): number | undefined {
  const parsed = parseOptionalNumber(value, 'multiplicity');
  if (parsed !== undefined && (!Number.isSafeInteger(parsed) || parsed < 1)) {
    throw parseError(`invalid multiplicity "${value}"`, 2);
  }
  return parsed;
}

function findProperty(
  properties: ExtendedXYZProperty[],
  names: string[],
): ExtendedXYZProperty | undefined {
  return properties.find((property) =>
    names.includes(property.name.toLowerCase()),
  );
}

function quoteHeaderValue(value: string): string {
  return /^[^\s"']+$/.test(value)
    ? value
    : `"${value.replace(/([\\"])/g, '\\$1')}"`;
}

function getTotalFormalCharge(struct: Struct): number {
  return Array.from(struct.atoms.values()).reduce(
    (sum, atom) => sum + (atom.charge ?? 0),
    0,
  );
}

export class XYZFormatter implements StructFormatter {
  async getStringFromStructureAsync(struct: Struct): Promise<string> {
    const metadata = getComputationalFormatMetadata(struct);
    const comment = metadata?.comment ?? struct.name;
    return [
      String(struct.atoms.size),
      comment,
      ...serializeXYZAtoms(struct),
    ].join('\n');
  }

  async getStructureFromStringAsync(content: string): Promise<Struct> {
    const { comment, atomLines } = getXYZLines(content);
    const struct = new Struct();
    struct.name = comment.trim();

    atomLines.forEach(({ content: atomLine, lineNumber }) => {
      const fields = atomLine.split(/\s+/);
      if (fields.length < 4)
        throw parseError('truncated atom record', lineNumber);
      addAtom(struct, fields[0], fields.slice(1, 4), lineNumber);
    });

    setComputationalFormatMetadata(struct, { comment });
    return struct;
  }
}

export class ExtendedXYZFormatter implements StructFormatter {
  async getStringFromStructureAsync(struct: Struct): Promise<string> {
    const metadata = getComputationalFormatMetadata(struct);
    const extMetadata = metadata?.extendedXYZ;
    const properties = extMetadata?.properties ?? [
      { name: 'species', type: 'S', columns: 1 },
      { name: 'pos', type: 'R', columns: 3 },
    ];
    const fields = { ...(extMetadata?.fields ?? {}) };
    const propertiesKey =
      Object.keys(fields).find(
        (key) => key.toLowerCase() === EXTENDED_XYZ_PROPERTIES.toLowerCase(),
      ) ?? EXTENDED_XYZ_PROPERTIES;
    fields[propertiesKey] = properties
      .flatMap((property) => [property.name, property.type, property.columns])
      .join(':');

    const chargeKey =
      Object.keys(fields).find((key) =>
        ['charge', 'molecular_charge'].includes(key.toLowerCase()),
      ) ?? 'charge';
    const multiplicityKey =
      Object.keys(fields).find((key) =>
        ['multiplicity', 'molecular_multiplicity'].includes(key.toLowerCase()),
      ) ?? 'multiplicity';
    fields[chargeKey] = String(
      metadata?.molecularCharge ?? getTotalFormalCharge(struct),
    );
    if (
      metadata?.molecularMultiplicity !== null &&
      metadata?.molecularMultiplicity !== undefined
    ) {
      fields[multiplicityKey] = String(metadata.molecularMultiplicity);
    } else {
      Object.keys(fields).forEach((key) => {
        if (
          ['multiplicity', 'molecular_multiplicity'].includes(key.toLowerCase())
        ) {
          delete fields[key];
        }
      });
    }

    const header = Object.entries(fields)
      .map(([key, value]) => `${key}=${quoteHeaderValue(value)}`)
      .join(' ');
    const atomLines = Array.from(struct.atoms.entries()).map(
      ([atomId, atom]) => {
        const importedValues = extMetadata?.atomValues.get(atomId);
        return properties
          .flatMap((property) => {
            const propertyName = property.name.toLowerCase();
            if (['species', 'element'].includes(propertyName))
              return [atom.label];
            if (['pos', 'position', 'positions'].includes(propertyName)) {
              return getCoordinateValues(atom);
            }
            if (propertyName === 'z' && property.columns === 1) {
              return [String(Elements.get(atom.label)?.number ?? atom.label)];
            }
            return (
              importedValues?.[property.name] ??
              Array.from({ length: property.columns }, () =>
                property.type.toUpperCase() === 'S' ? '""' : '0',
              )
            );
          })
          .join(' ');
      },
    );

    return [String(struct.atoms.size), header, ...atomLines].join('\n');
  }

  async getStructureFromStringAsync(content: string): Promise<Struct> {
    const { comment, atomLines } = getXYZLines(content);
    const fields = parseHeaderFields(comment);
    const properties = parseProperties(
      getFieldCaseInsensitive(fields, EXTENDED_XYZ_PROPERTIES),
    );
    const speciesProperty = findProperty(properties, [
      'species',
      'element',
      'z',
    ]);
    const positionProperty = findProperty(properties, [
      'pos',
      'position',
      'positions',
    ]);
    if (!speciesProperty || speciesProperty.columns !== 1) {
      throw parseError('Properties must define a one-column species/element/Z');
    }
    if (!positionProperty || positionProperty.columns !== 3) {
      throw parseError('Properties must define a three-column pos');
    }

    const expectedColumns = properties.reduce(
      (sum, property) => sum + property.columns,
      0,
    );
    const struct = new Struct();
    const atomValues: ExtendedXYZMetadata['atomValues'] = new Map();

    atomLines.forEach(({ content: atomLine, lineNumber }) => {
      const values =
        atomLine.match(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+/g) ?? [];
      if (values.length !== expectedColumns) {
        throw parseError(
          `expected ${expectedColumns} atom fields, found ${values.length}`,
          lineNumber,
        );
      }

      const valuesByProperty: Record<string, string[]> = {};
      let offset = 0;
      properties.forEach((property) => {
        valuesByProperty[property.name] = values.slice(
          offset,
          offset + property.columns,
        );
        offset += property.columns;
      });
      const atomId = addAtom(
        struct,
        valuesByProperty[speciesProperty.name][0],
        valuesByProperty[positionProperty.name],
        lineNumber,
      );
      atomValues.set(atomId, valuesByProperty);
    });

    const molecularCharge = parseOptionalNumber(
      getFieldCaseInsensitive(fields, 'charge') ??
        getFieldCaseInsensitive(fields, 'molecular_charge'),
      'charge',
    );
    const molecularMultiplicity = parseOptionalMultiplicity(
      getFieldCaseInsensitive(fields, 'multiplicity') ??
        getFieldCaseInsensitive(fields, 'molecular_multiplicity'),
    );
    const extendedXYZ: ExtendedXYZMetadata = {
      fields,
      properties,
      atomValues,
    };
    setComputationalFormatMetadata(struct, {
      comment,
      molecularCharge,
      molecularMultiplicity,
      sourceGeometryUnits: 'angstrom',
      extendedXYZ,
    });
    struct.name = getFieldCaseInsensitive(fields, 'name') ?? '';
    return struct;
  }
}

export function isXYZString(content: string): boolean {
  try {
    const { atomLines } = getXYZLines(content);
    return atomLines.every(({ content: line, lineNumber }) => {
      const values = line.split(/\s+/);
      if (values.length < 4) return false;
      getElement(values[0], lineNumber);
      values
        .slice(1, 4)
        .forEach((value, index) =>
          parseFiniteNumber(value, ['x', 'y', 'z'][index], lineNumber),
        );
      return true;
    });
  } catch {
    return false;
  }
}

export function isExtendedXYZString(content: string): boolean {
  try {
    const { comment, atomLines } = getXYZLines(content);
    const fields = parseHeaderFields(comment);
    const properties = parseProperties(
      getFieldCaseInsensitive(fields, EXTENDED_XYZ_PROPERTIES),
    );
    const expectedColumns = properties.reduce(
      (sum, property) => sum + property.columns,
      0,
    );
    const speciesProperty = findProperty(properties, [
      'species',
      'element',
      'z',
    ]);
    const positionProperty = findProperty(properties, [
      'pos',
      'position',
      'positions',
    ]);
    return Boolean(
      speciesProperty?.columns === 1 &&
        positionProperty?.columns === 3 &&
        atomLines.every(({ content: atomLine }) => {
          const values =
            atomLine.match(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+/g) ?? [];
          return values.length === expectedColumns;
        }),
    );
  } catch {
    return false;
  }
}

export function isExtendedXYZComment(comment: string): boolean {
  return (
    getFieldCaseInsensitive(
      parseHeaderFields(comment),
      EXTENDED_XYZ_PROPERTIES,
    ) !== undefined
  );
}
