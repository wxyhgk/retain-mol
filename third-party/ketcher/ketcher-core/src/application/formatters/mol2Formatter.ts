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
import { Elements } from 'domain/constants';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

const MOL2_SECTION_PREFIX = '@<TRIPOS>';

type Mol2Section = {
  name: string;
  lineNumber: number;
  lines: string[];
};

type MoleculeContext = {
  name: string;
  expectedAtomCount: number;
  expectedBondCount: number;
  atomCount: number;
  bondCount: number;
  atomIds: Map<number, number>;
};

function parseError(message: string, lineNumber?: number): Error {
  const location = lineNumber ? ` at line ${lineNumber}` : '';
  return new Error(`MOL2 parse error${location}: ${message}`);
}

function getSections(content: string): Mol2Section[] {
  const lines = content.replace(/^\uFEFF/, '').split(/\r\n|[\n\r]/g);
  const headers: Array<{ name: string; index: number }> = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.toUpperCase().startsWith(MOL2_SECTION_PREFIX)) {
      headers.push({
        name: trimmedLine.slice(MOL2_SECTION_PREFIX.length).toUpperCase(),
        index,
      });
    }
  });

  return headers.map((header, index) => ({
    name: header.name,
    lineNumber: header.index + 1,
    lines: lines.slice(header.index + 1, headers[index + 1]?.index),
  }));
}

function getDataLines(section: Mol2Section) {
  return section.lines
    .map((line, index) => ({
      content: line.trim(),
      lineNumber: section.lineNumber + index + 1,
    }))
    .filter(({ content }) => content && !content.startsWith('#'));
}

function parseNonNegativeInteger(
  value: string | undefined,
  description: string,
  lineNumber: number,
): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw parseError(`invalid ${description} "${value ?? ''}"`, lineNumber);
  }
  return parsed;
}

function parseCoordinate(
  value: string | undefined,
  axis: string,
  lineNumber: number,
): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw parseError(`invalid ${axis} coordinate "${value ?? ''}"`, lineNumber);
  }
  return parsed;
}

function normalizeElementSymbol(symbol: string): string {
  if (!symbol) return '';
  return symbol[0].toUpperCase() + symbol.slice(1).toLowerCase();
}

function getElementFromAtomName(atomName: string): string | undefined {
  const letters = atomName.match(/^[A-Za-z]+/)?.[0];
  if (!letters) return undefined;

  const twoLetterSymbol = normalizeElementSymbol(letters.slice(0, 2));
  if (Elements.get(twoLetterSymbol)) return twoLetterSymbol;

  const oneLetterSymbol = normalizeElementSymbol(letters.slice(0, 1));
  return Elements.get(oneLetterSymbol) ? oneLetterSymbol : undefined;
}

function getAtomProperties(atomName: string, atomType: string) {
  const rawSymbol = atomType.split('.')[0];
  if (rawSymbol === 'D' || rawSymbol === 'T') {
    return { label: 'H', isotope: rawSymbol === 'D' ? 2 : 3 };
  }

  const normalizedSymbol = normalizeElementSymbol(rawSymbol);
  if (Elements.get(normalizedSymbol)) {
    return {
      label: normalizedSymbol,
      charge: atomType.toUpperCase() === 'N.4' ? 1 : undefined,
    };
  }

  if (['DU', 'XX'].includes(rawSymbol.toUpperCase())) {
    const elementFromName = getElementFromAtomName(atomName);
    if (elementFromName) return { label: elementFromName };
  }

  return { label: '*' };
}

function getBondType(mol2Type: string, lineNumber: number): number {
  switch (mol2Type.toLowerCase()) {
    case '1':
    case 'am':
      return Bond.PATTERN.TYPE.SINGLE;
    case '2':
      return Bond.PATTERN.TYPE.DOUBLE;
    case '3':
      return Bond.PATTERN.TYPE.TRIPLE;
    case 'ar':
      return Bond.PATTERN.TYPE.AROMATIC;
    case '0':
    case 'du':
    case 'un':
    case 'nc':
      return Bond.PATTERN.TYPE.ANY;
    default:
      throw parseError(`unsupported bond type "${mol2Type}"`, lineNumber);
  }
}

function createMoleculeContext(section: Mol2Section): MoleculeContext {
  const name = section.lines[0]?.trim() ?? '';
  const countsLine = section.lines[1]?.trim();
  if (!countsLine) {
    throw parseError('missing molecule counts line', section.lineNumber + 2);
  }

  const counts = countsLine.split(/\s+/);
  return {
    name,
    expectedAtomCount: parseNonNegativeInteger(
      counts[0],
      'atom count',
      section.lineNumber + 2,
    ),
    expectedBondCount: parseNonNegativeInteger(
      counts[1],
      'bond count',
      section.lineNumber + 2,
    ),
    atomCount: 0,
    bondCount: 0,
    atomIds: new Map(),
  };
}

function parseAtoms(
  section: Mol2Section,
  context: MoleculeContext,
  struct: Struct,
): void {
  getDataLines(section).forEach(({ content, lineNumber }) => {
    const fields = content.split(/\s+/);
    if (fields.length < 6) {
      throw parseError('truncated atom record', lineNumber);
    }

    const mol2AtomId = parseNonNegativeInteger(
      fields[0],
      'atom id',
      lineNumber,
    );
    if (context.atomIds.has(mol2AtomId)) {
      throw parseError(`duplicate atom id ${mol2AtomId}`, lineNumber);
    }

    const x = parseCoordinate(fields[2], 'x', lineNumber);
    const y = parseCoordinate(fields[3], 'y', lineNumber);
    const z = parseCoordinate(fields[4], 'z', lineNumber);
    const atomProperties = getAtomProperties(fields[1], fields[5]);
    const ketcherAtomId = struct.atoms.add(
      new Atom({
        ...atomProperties,
        pp: new Vec2(x, -y, z),
      }),
    );

    context.atomIds.set(mol2AtomId, ketcherAtomId);
    context.atomCount += 1;
  });
}

function parseBonds(
  section: Mol2Section,
  context: MoleculeContext,
  struct: Struct,
): void {
  getDataLines(section).forEach(({ content, lineNumber }) => {
    const fields = content.split(/\s+/);
    if (fields.length < 4) {
      throw parseError('truncated bond record', lineNumber);
    }

    const beginMol2Id = parseNonNegativeInteger(
      fields[1],
      'bond begin atom id',
      lineNumber,
    );
    const endMol2Id = parseNonNegativeInteger(
      fields[2],
      'bond end atom id',
      lineNumber,
    );
    const begin = context.atomIds.get(beginMol2Id);
    const end = context.atomIds.get(endMol2Id);
    if (begin === undefined || end === undefined) {
      throw parseError(
        `bond references unknown atom id ${
          begin === undefined ? beginMol2Id : endMol2Id
        }`,
        lineNumber,
      );
    }

    struct.bonds.add(
      new Bond({
        begin,
        end,
        type: getBondType(fields[3], lineNumber),
      }),
    );
    context.bondCount += 1;
  });
}

function parseUnityAtomAttributes(
  section: Mol2Section,
  context: MoleculeContext,
  struct: Struct,
): void {
  const lines = getDataLines(section);
  let index = 0;

  while (index < lines.length) {
    const header = lines[index];
    const fields = header.content.split(/\s+/);
    const mol2AtomId = parseNonNegativeInteger(
      fields[0],
      'UNITY atom id',
      header.lineNumber,
    );
    const attributeCount = parseNonNegativeInteger(
      fields[1],
      'UNITY attribute count',
      header.lineNumber,
    );
    const atomId = context.atomIds.get(mol2AtomId);
    if (atomId === undefined) {
      throw parseError(
        `UNITY attributes reference unknown atom id ${mol2AtomId}`,
        header.lineNumber,
      );
    }
    const atom = struct.atoms.get(atomId);
    if (!atom) {
      throw parseError(
        `UNITY attributes reference missing atom id ${mol2AtomId}`,
        header.lineNumber,
      );
    }

    for (let offset = 1; offset <= attributeCount; offset += 1) {
      const attribute = lines[index + offset];
      if (!attribute) {
        throw parseError('truncated UNITY atom attributes', header.lineNumber);
      }
      const [name, value] = attribute.content.split(/\s+/);
      if (name.toLowerCase() === 'charge') {
        const charge = Number(value);
        if (!Number.isSafeInteger(charge)) {
          throw parseError(
            `invalid formal charge "${value ?? ''}"`,
            attribute.lineNumber,
          );
        }
        atom.charge = charge;
      }
    }

    index += attributeCount + 1;
  }
}

function validateMolecule(context: MoleculeContext): void {
  if (context.atomCount !== context.expectedAtomCount) {
    throw parseError(
      `expected ${context.expectedAtomCount} atoms, found ${context.atomCount}`,
    );
  }
  if (context.bondCount !== context.expectedBondCount) {
    throw parseError(
      `expected ${context.expectedBondCount} bonds, found ${context.bondCount}`,
    );
  }
}

export class Mol2Formatter implements StructFormatter {
  async getStringFromStructureAsync(): Promise<string> {
    throw new Error('MOL2 export is not supported.');
  }

  async getStructureFromStringAsync(content: string): Promise<Struct> {
    const sections = getSections(content);
    if (!sections.length || sections[0].name !== 'MOLECULE') {
      throw parseError('missing @<TRIPOS>MOLECULE header');
    }

    const struct = new Struct();
    let context: MoleculeContext | undefined;
    const contexts: MoleculeContext[] = [];

    sections.forEach((section) => {
      if (section.name === 'MOLECULE') {
        context = createMoleculeContext(section);
        contexts.push(context);
        if (!struct.name && context.name) struct.name = context.name;
        return;
      }

      if (!context) {
        throw parseError(
          `@<TRIPOS>${section.name} appears before a molecule header`,
          section.lineNumber,
        );
      }

      switch (section.name) {
        case 'ATOM':
          parseAtoms(section, context, struct);
          break;
        case 'BOND':
          parseBonds(section, context, struct);
          break;
        case 'UNITY_ATOM_ATTR':
          parseUnityAtomAttributes(section, context, struct);
          break;
        default:
          break;
      }
    });

    contexts.forEach(validateMolecule);
    return struct;
  }
}
