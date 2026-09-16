import type { Struct } from 'ketcher-core';
import {
  DOCUMENT_SCHEMA,
  ELEMENT_SYMBOLS,
  PROFILE,
  validateDocumentSnapshot,
  type BondOrder,
  type MoleculeAtom,
  type MoleculeBond,
  type MoleculeCanvasIssue,
  type MoleculeDocumentSnapshot,
} from 'molecule-contracts';

export type ProjectionResult =
  | { ok: true; document: MoleculeDocumentSnapshot }
  | { ok: false; issues: readonly MoleculeCanvasIssue[] };

type Identity = {
  documentId: string;
  revision: number;
  atomId(runtimeId: number): string;
  bondId(runtimeId: number): string;
};

// These match the basic graph engine's published limits. Projection never
// truncates a molecule to make it fit the profile.
const MAX_ATOMS = 10_000;
const MAX_BONDS = 20_000;
const MAX_ISSUES = 100;
const elements: ReadonlySet<string> = new Set(ELEMENT_SYMBOLS);
const orders: Readonly<Record<number, BondOrder>> = {
  1: 'single',
  2: 'double',
  3: 'triple',
};

// Unknown own fields fail closed. The ignored fields below are drawing state
// or derived graph caches, not chemical information represented by the profile.
const atomFields = new Set([
  'label',
  'charge',
  'isotope',
  'pp',
  'fragment',
  'valence',
  'implicitH',
  'neighbors',
  'badConn',
  'hasImplicitH',
  'pseudo',
  'initiallySelected',
  'alias',
  'radical',
  'cip',
  'rglabel',
  'attachmentPoints',
  'implicitHCount',
  'atomList',
  'explicitValence',
  'isPreview',
  'sgs',
  'ringBondCount',
  'substitutionCount',
  'unsaturatedAtom',
  'hCount',
  'queryProperties',
  'aam',
  'invRet',
  'exactChangeFlag',
  'rxnFragmentType',
  'stereoLabel',
  'stereoParity',
]);
const bondFields = new Set([
  'begin',
  'end',
  'type',
  'xxx',
  'stereo',
  'topology',
  'reactingCenterStatus',
  'customQuery',
  'cip',
  'isPreview',
  'beginSuperatomAttachmentPointNumber',
  'endSuperatomAttachmentPointNumber',
  'beginSgroup',
  'endSgroup',
  'len',
  'sb',
  'sa',
  'hb1',
  'hb2',
  'angle',
  'center',
  'initiallySelected',
]);
const structFields = new Set([
  'atoms',
  'bonds',
  'sgroups',
  'halfBonds',
  'loops',
  'isReaction',
  'rxnArrows',
  'rxnPluses',
  'frags',
  'rgroups',
  'rgroupAttachmentPoints',
  'name',
  'abbreviation',
  'sGroupForest',
  'simpleObjects',
  'texts',
  'functionalGroups',
  'highlights',
  'images',
  'multitailArrows',
  'nextArrowId',
]);
const fragmentFields = new Set(['stereoFlagPosition', 'properties']);
const pointFields = new Set(['x', 'y', 'z']);
const queryFields = new Set([
  'aromaticity',
  'ringMembership',
  'ringSize',
  'connectivity',
  'chirality',
  'customQuery',
]);

/**
 * Read the live Struct without cloning, serializing, normalizing or freezing it.
 * The caller owns document identity and must check out-of-band metadata first.
 * Highlights/selection stay in the authoritative canvas and are deliberately
 * absent from this read-only graph projection.
 */
export function projectStructure(
  struct: Struct,
  identity: Identity,
): ProjectionResult {
  const issues: MoleculeCanvasIssue[] = [];
  let truncated = false;
  function issue(
    code: MoleculeCanvasIssue['code'],
    message: string,
    path: string,
    references?: readonly string[],
  ): void {
    if (issues.length < MAX_ISSUES - 1) {
      issues.push({
        code,
        message,
        path,
        ...(references ? { references } : {}),
      });
    } else if (!truncated) {
      truncated = true;
      issues.push({
        code: 'limit-exceeded',
        message:
          'Additional projection issues were omitted; the whole structure was rejected.',
        path: '',
      });
    }
  }
  function unsupported(path: string, references?: readonly string[]): void {
    issue(
      'unsupported-feature',
      'This field cannot be represented by basic-graph-v1.',
      path,
      references,
    );
  }
  function checkFields(
    value: object,
    known: ReadonlySet<string>,
    path: string,
    references?: readonly string[],
  ): void {
    for (const key of Reflect.ownKeys(value)) {
      if (truncated) break;
      if (typeof key !== 'string' || !known.has(key)) {
        unsupported(
          `${path}/${String(key).replace(/~/g, '~0').replace(/\//g, '~1')}`,
          references,
        );
      }
    }
  }
  function invalid(
    message: string,
    path: string,
    references?: readonly string[],
  ): void {
    issue('invalid-structure', message, path, references);
  }

  try {
    if (struct.atoms.size > MAX_ATOMS || struct.bonds.size > MAX_BONDS) {
      issue(
        'limit-exceeded',
        `Projection allows at most ${MAX_ATOMS} atoms and ${MAX_BONDS} bonds.`,
        '',
      );
      return { ok: false, issues };
    }
    checkFields(struct, structFields, '');
    if (struct.isReaction) unsupported('/isReaction');
    if (struct.name !== '' && struct.name != null) unsupported('/name');
    if (struct.abbreviation !== '' && struct.abbreviation != null)
      unsupported('/abbreviation');
    for (const field of [
      'sgroups',
      'rgroups',
      'rgroupAttachmentPoints',
      'rxnArrows',
      'rxnPluses',
      'multitailArrows',
      'simpleObjects',
      'texts',
      'images',
      'functionalGroups',
    ] as const) {
      if (struct[field].size) unsupported(`/${field}`);
    }
    for (const [runtimeId, fragment] of struct.frags) {
      if (truncated) break;
      // Null fragment slots are permitted by Struct; ordinary connected
      // components carry no extra semantics and are also supported.
      if (fragment === null) continue;
      const path = `/frags/${runtimeId}`;
      checkFields(fragment, fragmentFields, path);
      if (fragment.properties?.length) unsupported(`${path}/properties`);
      // Centering runs EnhancedFlagMove for every fragment, so it can create
      // stereoFlagPosition even when no stereo flag exists. That position is
      // drawing state; stereo membership and the flag retain their semantics.
      if (fragment.stereoAtoms.length || fragment.enhancedStereoFlag != null) {
        unsupported(`${path}/enhancedStereo`);
      }
    }

    const atoms: MoleculeAtom[] = [];
    const bonds: MoleculeBond[] = [];
    const atomIds = new Map<number, string>();
    const usedAtomIds = new Set<string>();
    const usedBondIds = new Set<string>();
    for (const [runtimeId, atom] of struct.atoms) {
      if (truncated) break;
      const path = `/atoms/${runtimeId}`;
      const id = identity.atomId(runtimeId);
      const references = [id];
      if (!Number.isSafeInteger(runtimeId) || runtimeId < 0)
        invalid('Expected a nonnegative integer atom slot.', path, references);
      if (usedAtomIds.has(id))
        invalid('Atom identity must be unique.', path, references);
      usedAtomIds.add(id);
      atomIds.set(runtimeId, id);
      checkFields(atom, atomFields, path, references);
      if (!elements.has(atom.label)) unsupported(`${path}/label`, references);
      // These numeric fields use zero as their *absent* value in Ketcher.
      for (const field of [
        'radical',
        'ringBondCount',
        'substitutionCount',
        'unsaturatedAtom',
        'hCount',
        'aam',
        'invRet',
        'exactChangeFlag',
        'stereoParity',
      ] as const) {
        if (atom[field] !== 0) unsupported(`${path}/${field}`, references);
      }
      for (const field of [
        'alias',
        'cip',
        'rglabel',
        'implicitHCount',
        'atomList',
        'stereoLabel',
      ] as const) {
        if (atom[field] != null) unsupported(`${path}/${field}`, references);
      }
      if (atom.attachmentPoints != null && atom.attachmentPoints !== 0)
        unsupported(`${path}/attachmentPoints`, references);
      if (atom.explicitValence !== -1)
        unsupported(`${path}/explicitValence`, references);
      if (atom.rxnFragmentType !== -1)
        unsupported(`${path}/rxnFragmentType`, references);
      if (atom.isPreview !== false)
        unsupported(`${path}/isPreview`, references);
      if (atom.sgs.size) unsupported(`${path}/sgs`, references);
      if (
        atom.queryProperties == null ||
        typeof atom.queryProperties !== 'object'
      ) {
        invalid(
          'Expected an atom query-properties object.',
          `${path}/queryProperties`,
          references,
        );
      } else {
        checkFields(
          atom.queryProperties,
          queryFields,
          `${path}/queryProperties`,
          references,
        );
        for (const [field, value] of Object.entries(atom.queryProperties)) {
          // Unlike the legacy top-level fields, a nested query value of zero
          // is meaningful and must never be treated as absence.
          if (value != null)
            unsupported(`${path}/queryProperties/${field}`, references);
        }
      }
      if (!atom.pp || typeof atom.pp !== 'object') {
        invalid('Expected an atom position.', `${path}/pp`, references);
        continue;
      }
      checkFields(atom.pp, pointFields, `${path}/pp`, references);
      if (atom.pp.z !== 0) unsupported(`${path}/pp/z`, references);
      atoms.push({
        id,
        element: atom.label,
        charge: atom.charge ?? 0,
        ...(atom.isotope == null || atom.isotope === 0
          ? {}
          : { isotope: atom.isotope }),
        position: { x: atom.pp.x, y: atom.pp.y },
      });
    }
    const edges = new Set<string>();
    for (const [runtimeId, bond] of struct.bonds) {
      if (truncated) break;
      const path = `/bonds/${runtimeId}`;
      const id = identity.bondId(runtimeId);
      const references = [id];
      if (!Number.isSafeInteger(runtimeId) || runtimeId < 0)
        invalid('Expected a nonnegative integer bond slot.', path, references);
      if (usedBondIds.has(id) || usedAtomIds.has(id))
        invalid(
          'Entity identity must be unique across atoms and bonds.',
          path,
          references,
        );
      usedBondIds.add(id);
      checkFields(bond, bondFields, path, references);
      for (const field of [
        'stereo',
        'topology',
        'reactingCenterStatus',
      ] as const) {
        if (bond[field] !== 0) unsupported(`${path}/${field}`, references);
      }
      for (const field of [
        'customQuery',
        'cip',
        'beginSuperatomAttachmentPointNumber',
        'endSuperatomAttachmentPointNumber',
        'beginSgroup',
        'endSgroup',
      ] as const) {
        if (bond[field] != null) unsupported(`${path}/${field}`, references);
      }
      if (bond.isPreview !== false)
        unsupported(`${path}/isPreview`, references);
      // The reserved MOL V2000 column is emitted as spaces or a padded zero.
      if (typeof bond.xxx !== 'string' || !/^\s*0?\s*$/.test(bond.xxx))
        unsupported(`${path}/xxx`, references);
      const order = orders[bond.type];
      if (order === undefined) unsupported(`${path}/type`, references);
      const begin = atomIds.get(bond.begin);
      const end = atomIds.get(bond.end);
      if (begin === undefined || end === undefined) {
        invalid(
          'A bond endpoint is missing from the atom pool.',
          path,
          references,
        );
      } else if (begin === end) {
        invalid('A bond cannot connect an atom to itself.', path, [id, begin]);
      } else {
        const edge = JSON.stringify(begin < end ? [begin, end] : [end, begin]);
        if (edges.has(edge))
          invalid('Only one bond is allowed between two atoms.', path, [
            id,
            begin,
            end,
          ]);
        edges.add(edge);
        if (order !== undefined) bonds.push({ id, begin, end, order });
      }
    }
    if (issues.length) return { ok: false, issues };
    const validated = validateDocumentSnapshot({
      schema: DOCUMENT_SCHEMA,
      profile: PROFILE,
      documentId: identity.documentId,
      revision: identity.revision,
      atoms,
      bonds,
    });
    if (!validated.ok) {
      issue(
        validated.error.code === 'limit-exceeded'
          ? 'limit-exceeded'
          : 'invalid-structure',
        validated.error.message,
        validated.error.path ?? '',
      );
      return { ok: false, issues };
    }
    return { ok: true, document: validated.value };
  } catch {
    invalid('The current structure could not be read safely.', '');
    return { ok: false, issues };
  }
}
