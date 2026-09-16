import {
  Atom,
  Bond,
  Fragment,
  Highlight,
  Pool,
  Struct,
  Vec2,
} from 'ketcher-core';
import {
  validateDocumentSnapshot,
  type MoleculeDocumentSnapshot,
  type MoleculeError,
  type Result,
} from 'molecule-contracts';
import { projectStructure } from './projection.js';

type IdentityMaps = {
  atoms: ReadonlyMap<number, string>;
  bonds: ReadonlyMap<number, string>;
};
type CanvasCandidate = {
  struct: Struct;
  identities: { atoms: Map<number, string>; bonds: Map<number, string> };
};

const MAX_POOL_SLOT = Number.MAX_SAFE_INTEGER - 1;
// Ketcher derives two half-bond IDs as 2 * bondId and 2 * bondId + 1.
const MAX_BOND_SLOT = Math.floor((Number.MAX_SAFE_INTEGER - 1) / 2);
const bondTypes = { single: 1, double: 2, triple: 3 } as const;

function failure(
  code: MoleculeError['code'],
  message: string,
  references?: readonly string[],
): Result<never> {
  return {
    ok: false,
    error: { code, message, ...(references ? { references } : {}) },
  };
}

function graphKey(document: MoleculeDocumentSnapshot): string {
  return JSON.stringify({
    documentId: document.documentId,
    revision: document.revision,
    atoms: [...document.atoms]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((atom) => [
        atom.id,
        atom.element,
        atom.charge,
        atom.isotope ?? null,
        atom.position ? [atom.position.x, atom.position.y] : null,
      ]),
    bonds: [...document.bonds]
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((bond) => [bond.id, bond.begin, bond.end, bond.order]),
  });
}

function emptyPool<T>(
  source: Pool<T>,
  reserved: Iterable<number> = [],
): Pool<T> {
  const result = source.clone();
  result.clear();
  for (const id of source.keys()) result.reserveId(id);
  for (const id of reserved) result.reserveId(id);
  return result;
}

// Highlights may be class instances or host-created plain objects. Preserve
// all their display fields, but never retain aliases into the live canvas.
function copyDisplayData<T>(value: T, ancestors = new Set<object>()): T {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'function' || typeof value === 'symbol')
      throw new Error('Unsupported display value');
    return value;
  }
  if (ancestors.has(value)) throw new Error('Cyclic display metadata');
  const prototype = Object.getPrototypeOf(value);
  if (
    ![
      Object.prototype,
      Array.prototype,
      Highlight.prototype,
      Vec2.prototype,
      null,
    ].includes(prototype)
  ) {
    throw new Error('Unsupported display metadata object');
  }
  const copy = Array.isArray(value) ? [] : Object.create(prototype);
  ancestors.add(value);
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== 'string' || !descriptor || !('value' in descriptor)) {
      throw new Error('Unsupported display metadata property');
    }
    Object.defineProperty(copy, key, {
      value: copyDisplayData(descriptor.value, ancestors),
      enumerable: descriptor.enumerable,
      configurable: true,
      writable: true,
    });
  }
  ancestors.delete(value);
  return copy as T;
}

function componentKey(ids: Iterable<number>): string {
  return [...ids].sort((a, b) => a - b).join(',');
}

// Compute old components without invoking helpers that initialize live caches.
function oldFragments(source: Struct): Map<string, number> {
  const neighbors = new Map<number, number[]>();
  const fragmentMembers = new Map<number, number[]>();
  for (const [id, atom] of source.atoms) {
    neighbors.set(id, []);
    const members = fragmentMembers.get(atom.fragment) ?? [];
    members.push(id);
    fragmentMembers.set(atom.fragment, members);
  }
  for (const bond of source.bonds.values()) {
    neighbors.get(bond.begin)!.push(bond.end);
    neighbors.get(bond.end)!.push(bond.begin);
  }
  const visited = new Set<number>();
  const result = new Map<string, number>();
  for (const start of source.atoms.keys()) {
    if (visited.has(start)) continue;
    const component: number[] = [];
    const queue = [start];
    visited.add(start);
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      component.push(id);
      for (const next of neighbors.get(id)!) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    const fragmentId = source.atoms.get(start)!.fragment;
    if (
      source.frags.get(fragmentId) &&
      componentKey(fragmentMembers.get(fragmentId) ?? []) ===
        componentKey(component)
    ) {
      result.set(componentKey(component), fragmentId);
    }
  }
  return result;
}

/** Materialize a validated candidate in a separate, slot-preserving Struct. */
export function buildCanvasCandidate(
  source: Struct,
  base: MoleculeDocumentSnapshot,
  candidate: MoleculeDocumentSnapshot,
  identities: IdentityMaps,
): Result<CanvasCandidate> {
  try {
    const checkedBase = validateDocumentSnapshot(base);
    const checkedCandidate = validateDocumentSnapshot(candidate);
    if (!checkedBase.ok || !checkedCandidate.ok) {
      return failure(
        'invalid-structure',
        'Expected valid base and candidate molecule documents.',
      );
    }
    base = checkedBase.value;
    candidate = checkedCandidate.value;
    if (
      candidate.documentId !== base.documentId ||
      candidate.revision !== base.revision
    ) {
      return failure(
        'invalid-structure',
        'The candidate must belong to the prepared base document and revision.',
      );
    }
    const missingCoordinates = candidate.atoms
      .filter((atom) => !atom.position)
      .map((atom) => atom.id);
    if (missingCoordinates.length)
      return failure(
        'missing-coordinates',
        'Every candidate atom requires an explicit 2D position.',
        missingCoordinates,
      );
    if (candidate.atoms.length > 10_000 || candidate.bonds.length > 20_000) {
      return failure(
        'limit-exceeded',
        'The candidate exceeds basic graph limits.',
      );
    }

    const knownIds = new Set<string>();
    const atomSlots = new Map<string, number>();
    const bondSlots = new Map<string, number>();
    for (const [map, reverse, max] of [
      [identities.atoms, atomSlots, MAX_POOL_SLOT],
      [identities.bonds, bondSlots, MAX_BOND_SLOT],
    ] as const) {
      for (const [slot, id] of map) {
        if (!Number.isSafeInteger(slot) || slot < 0 || slot > max) {
          return failure(
            'invalid-structure',
            'Canvas pool slots exceed the safe runtime ID range.',
          );
        }
        if (typeof id !== 'string' || !id || knownIds.has(id)) {
          return failure(
            'invalid-structure',
            'Canvas entity identities must be distinct nonempty strings.',
          );
        }
        knownIds.add(id);
        reverse.set(id, slot);
      }
    }
    const projected = projectStructure(source, {
      documentId: base.documentId,
      revision: base.revision,
      atomId: (slot) => {
        const id = identities.atoms.get(slot);
        if (!id) throw new Error('Unmapped canvas atom');
        return id;
      },
      bondId: (slot) => {
        const id = identities.bonds.get(slot);
        if (!id) throw new Error('Unmapped canvas bond');
        return id;
      },
    });
    if (!projected.ok || graphKey(projected.document) !== graphKey(base)) {
      return failure(
        'canvas-changed',
        'The live canvas no longer matches the prepared base graph.',
      );
    }
    const baseAtoms = new Set(base.atoms.map((atom) => atom.id));
    const baseBonds = new Set(base.bonds.map((bond) => bond.id));
    const candidateIds = new Set<string>();
    for (const [entities, existing] of [
      [candidate.atoms, baseAtoms],
      [candidate.bonds, baseBonds],
    ] as const) {
      for (const entity of entities) {
        if (
          candidateIds.has(entity.id) ||
          (knownIds.has(entity.id) && !existing.has(entity.id))
        ) {
          return failure(
            'invalid-structure',
            'A candidate cannot duplicate or reuse an entity identity.',
            [entity.id],
          );
        }
        candidateIds.add(entity.id);
      }
    }

    const struct = new Struct();
    struct.name = source.name;
    struct.abbreviation = source.abbreviation;
    // These pools must be empty in the ready profile, but retain their private
    // allocation counters so a later human edit does not reuse historical slots.
    struct.sgroups = source.sgroups.clone();
    struct.rgroups = source.rgroups.clone();
    struct.rgroupAttachmentPoints = source.rgroupAttachmentPoints.clone();
    struct.rxnArrows = source.rxnArrows.clone();
    struct.rxnPluses = source.rxnPluses.clone();
    struct.multitailArrows = source.multitailArrows.clone();
    struct.simpleObjects = source.simpleObjects.clone();
    struct.texts = source.texts.clone();
    struct.images = source.images.clone();
    struct.functionalGroups = source.functionalGroups.clone();
    struct.atoms = emptyPool(source.atoms, identities.atoms.keys());
    struct.bonds = emptyPool(source.bonds, identities.bonds.keys());
    const mapped = {
      atoms: new Map(identities.atoms),
      bonds: new Map(identities.bonds),
    };

    for (const value of candidate.atoms) {
      const previousSlot = baseAtoms.has(value.id)
        ? atomSlots.get(value.id)
        : undefined;
      const slot = previousSlot ?? struct.atoms.newId();
      if (slot > MAX_POOL_SLOT)
        return failure('limit-exceeded', 'No safe atom pool slot remains.');
      const previous =
        previousSlot === undefined ? undefined : source.atoms.get(previousSlot);
      const atom = previous
        ? new Atom(previous)
        : new Atom({ label: value.element });
      atom.label = value.element;
      if (!previous || (previous.charge ?? 0) !== value.charge)
        atom.charge = value.charge;
      const previousIsotope =
        previous?.isotope == null || previous.isotope === 0
          ? undefined
          : previous.isotope;
      if (!previous || previousIsotope !== value.isotope)
        atom.isotope = value.isotope ?? null;
      atom.pp = new Vec2(value.position!);
      if (previous) {
        atom.queryProperties = { ...previous.queryProperties };
        atom.hasImplicitH = previous.hasImplicitH;
      }
      atom.fragment = -1;
      struct.atoms.set(slot, atom);
      atomSlots.set(value.id, slot);
      mapped.atoms.set(slot, value.id);
    }
    const currentAtoms = new Set(candidate.atoms.map((atom) => atom.id));
    const edges = new Set<string>();
    for (const value of candidate.bonds) {
      if (
        !currentAtoms.has(value.begin) ||
        !currentAtoms.has(value.end) ||
        value.begin === value.end
      ) {
        return failure(
          'invalid-structure',
          'A candidate bond must join two existing, distinct atoms.',
          [value.id],
        );
      }
      const edge = JSON.stringify([value.begin, value.end].sort());
      if (edges.has(edge))
        return failure(
          'invalid-structure',
          'Only one bond may join an atom pair.',
          [value.id],
        );
      edges.add(edge);
      const previousSlot = baseBonds.has(value.id)
        ? bondSlots.get(value.id)
        : undefined;
      const slot = previousSlot ?? struct.bonds.newId();
      if (slot > MAX_BOND_SLOT)
        return failure('limit-exceeded', 'No safe bond pool slot remains.');
      const previous =
        previousSlot === undefined ? undefined : source.bonds.get(previousSlot);
      const bond = new Bond({
        ...(previous ?? {}),
        begin: atomSlots.get(value.begin)!,
        end: atomSlots.get(value.end)!,
        type: bondTypes[value.order],
      });
      struct.bonds.set(slot, bond);
      mapped.bonds.set(slot, value.id);
    }

    struct.highlights = emptyPool(source.highlights);
    for (const [slot, highlight] of source.highlights) {
      const copy = copyDisplayData(highlight);
      copy.atoms = copy.atoms.filter((id) => struct.atoms.has(id));
      copy.bonds = copy.bonds.filter((id) => struct.bonds.has(id));
      struct.highlights.set(slot, copy);
    }
    struct.initHalfBonds();
    struct.initNeighbors();
    const atomIds = [...struct.atoms.keys()];
    struct.updateHalfBonds(atomIds);
    struct.sortNeighbors(atomIds);
    struct.setImplicitHydrogen(undefined, true);

    const preservedFragments = oldFragments(source);
    struct.frags = emptyPool(source.frags);
    for (const component of struct.findConnectedComponents(true)) {
      const previousSlot = preservedFragments.get(componentKey(component));
      const previous =
        previousSlot === undefined ? undefined : source.frags.get(previousSlot);
      const slot = previousSlot ?? struct.frags.newId();
      if (slot > MAX_POOL_SLOT)
        return failure('limit-exceeded', 'No safe fragment pool slot remains.');
      const fragment = new Fragment(
        [],
        [...component].every(
          (id) =>
            source.atoms.get(id)?.pp.x === struct.atoms.get(id)!.pp.x &&
            source.atoms.get(id)?.pp.y === struct.atoms.get(id)!.pp.y,
        )
          ? previous?.stereoFlagPosition
          : undefined,
        previous?.properties?.map((property) => ({ ...property })),
      );
      struct.frags.set(slot, fragment);
      for (const atomId of component) struct.atoms.get(atomId)!.fragment = slot;
    }
    struct.findLoops();
    const finalProjection = projectStructure(struct, {
      documentId: candidate.documentId,
      revision: candidate.revision,
      atomId: (slot) => mapped.atoms.get(slot)!,
      bondId: (slot) => mapped.bonds.get(slot)!,
    });
    if (
      !finalProjection.ok ||
      graphKey(finalProjection.document) !== graphKey(candidate)
    ) {
      return failure(
        'invalid-structure',
        'The isolated canvas candidate does not match its prepared graph.',
      );
    }
    return { ok: true, value: { struct, identities: mapped } };
  } catch {
    return failure(
      'invalid-structure',
      'The canvas candidate could not be materialized safely.',
    );
  }
}
