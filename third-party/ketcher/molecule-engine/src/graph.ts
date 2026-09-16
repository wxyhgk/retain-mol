import type {
  Atom,
  Bond,
  ChangeSet,
  EntityChanges,
  EntityReference,
  MoleculeDocumentSnapshot,
  MoleculeEditRequest,
  ReferenceMap,
  Result,
} from 'molecule-contracts';
import { canonicalJson, failure, success } from './results.js';

export const MAX_ATOMS = 10_000;
export const MAX_BONDS = 20_000;

type EntityKind = 'atoms' | 'bonds';
type LocalReference = { kind: EntityKind; id: string };

function bondKey(begin: string, end: string): string {
  return JSON.stringify(begin < end ? [begin, end] : [end, begin]);
}

export function validateGraph(
  snapshot: MoleculeDocumentSnapshot,
): Result<MoleculeDocumentSnapshot> {
  if (snapshot.atoms.length > MAX_ATOMS || snapshot.bonds.length > MAX_BONDS) {
    return failure('limit-exceeded', 'The molecule exceeds the graph limits.');
  }
  const atomIds = new Set<string>();
  const entityIds = new Set<string>();
  for (const atom of snapshot.atoms) {
    if (entityIds.has(atom.id)) {
      return failure('duplicate-reference', 'Entity IDs must be unique.', {
        references: [atom.id],
      });
    }
    atomIds.add(atom.id);
    entityIds.add(atom.id);
  }
  const endpoints = new Set<string>();
  for (const bond of snapshot.bonds) {
    if (entityIds.has(bond.id)) {
      return failure('duplicate-reference', 'Entity IDs must be unique.', {
        references: [bond.id],
      });
    }
    entityIds.add(bond.id);
    if (!atomIds.has(bond.begin) || !atomIds.has(bond.end)) {
      return failure('reference-not-found', 'Both bond endpoints must exist.', {
        references: [bond.begin, bond.end],
      });
    }
    if (bond.begin === bond.end) {
      return failure('self-bond', 'A bond must connect two different atoms.', {
        references: [bond.begin],
      });
    }
    const key = bondKey(bond.begin, bond.end);
    if (endpoints.has(key)) {
      return failure(
        'duplicate-bond',
        'Only one bond may connect an atom pair.',
        {
          references: [bond.begin, bond.end],
        },
      );
    }
    endpoints.add(key);
  }
  return success(snapshot);
}

function entityChanges<T extends { id: string }>(
  before: readonly T[],
  after: readonly T[],
): EntityChanges {
  const previous = new Map(before.map((entity) => [entity.id, entity]));
  const next = new Map(after.map((entity) => [entity.id, entity]));
  return {
    created: after.filter(({ id }) => !previous.has(id)).map(({ id }) => id),
    updated: after
      .filter(
        (entity) =>
          previous.has(entity.id) &&
          canonicalJson(entity) !== canonicalJson(previous.get(entity.id)),
      )
      .map(({ id }) => id),
    removed: before.filter(({ id }) => !next.has(id)).map(({ id }) => id),
  };
}

export function diffGraph(
  before: MoleculeDocumentSnapshot,
  after: MoleculeDocumentSnapshot,
): ChangeSet {
  return {
    atoms: entityChanges(before.atoms, after.atoms),
    bonds: entityChanges(before.bonds, after.bonds),
  };
}

function hasChanges(changes: ChangeSet): boolean {
  return Object.values(changes).some((entities: EntityChanges) =>
    Object.values(entities).some((ids: readonly string[]) => ids.length > 0),
  );
}

interface Draft {
  candidate: MoleculeDocumentSnapshot;
  changes: ChangeSet;
  refs: ReferenceMap;
}

/** All mutations below are confined to this unpublished, request-local draft. */
export function buildDraft(
  snapshot: MoleculeDocumentSnapshot,
  request: MoleculeEditRequest,
  idPrefix: string,
  reservedIds: ReadonlySet<string>,
): Result<Draft> {
  const atoms = new Map(snapshot.atoms.map((atom) => [atom.id, atom]));
  const bonds = new Map(snapshot.bonds.map((bond) => [bond.id, bond]));
  const endpoints = new Set(
    snapshot.bonds.map((bond) => bondKey(bond.begin, bond.end)),
  );
  const refs = new Map<string, LocalReference>();
  let sequence = 0;
  const allocate = (kind: EntityKind): string => {
    let id: string;
    do {
      id = `${idPrefix}:${kind === 'atoms' ? 'a' : 'b'}${++sequence}`;
    } while (reservedIds.has(id));
    return id;
  };

  const resolve = (
    reference: EntityReference,
    kind: EntityKind,
    commandIndex: number,
  ): Result<string> => {
    const local = 'ref' in reference ? refs.get(reference.ref) : undefined;
    const id =
      'id' in reference
        ? reference.id
        : local?.kind === kind
        ? local.id
        : undefined;
    const exists =
      id !== undefined && (kind === 'atoms' ? atoms.has(id) : bonds.has(id));
    return exists
      ? success(id as string)
      : failure('reference-not-found', `The referenced ${kind} do not exist.`, {
          commandIndex,
          references: ['id' in reference ? reference.id : reference.ref],
        });
  };

  const removeBond = (bond: Bond): void => {
    bonds.delete(bond.id);
    endpoints.delete(bondKey(bond.begin, bond.end));
  };

  for (const [commandIndex, command] of request.commands.entries()) {
    if ('ref' in command && refs.has(command.ref)) {
      return failure(
        'duplicate-reference',
        'Request-local references must be unique across atoms and bonds.',
        { commandIndex, references: [command.ref] },
      );
    }
    switch (command.op) {
      case 'atom.add': {
        if (atoms.size >= MAX_ATOMS) {
          return failure('limit-exceeded', 'The atom limit has been reached.', {
            commandIndex,
          });
        }
        const id = allocate('atoms');
        const atom: Atom = {
          id,
          element: command.element,
          charge: command.charge ?? 0,
          ...(command.isotope === undefined
            ? {}
            : { isotope: command.isotope }),
          ...(command.position === undefined
            ? {}
            : { position: { ...command.position } }),
        };
        atoms.set(id, atom);
        refs.set(command.ref, { kind: 'atoms', id });
        break;
      }
      case 'atom.update': {
        const target = resolve(command.target, 'atoms', commandIndex);
        if (!target.ok) return target;
        const atom = { ...atoms.get(target.value)! };
        const { patch } = command;
        if (patch.element !== undefined) atom.element = patch.element;
        if (patch.charge !== undefined) atom.charge = patch.charge;
        if (patch.isotope === null) delete atom.isotope;
        else if (patch.isotope !== undefined) atom.isotope = patch.isotope;
        if (patch.position === null) delete atom.position;
        else if (patch.position !== undefined) {
          atom.position = { ...patch.position };
        }
        atoms.set(target.value, atom);
        break;
      }
      case 'atom.remove': {
        const target = resolve(command.target, 'atoms', commandIndex);
        if (!target.ok) return target;
        const incident = [...bonds.values()].filter(
          (bond) => bond.begin === target.value || bond.end === target.value,
        );
        if (incident.length > 0 && command.incidentBonds === 'reject') {
          return failure(
            'atom-has-bonds',
            'Remove incident bonds explicitly or select incidentBonds: remove.',
            {
              commandIndex,
              references: [target.value, ...incident.map(({ id }) => id)],
            },
          );
        }
        for (const bond of incident) removeBond(bond);
        atoms.delete(target.value);
        break;
      }
      case 'bond.add': {
        const begin = resolve(command.begin, 'atoms', commandIndex);
        if (!begin.ok) return begin;
        const end = resolve(command.end, 'atoms', commandIndex);
        if (!end.ok) return end;
        if (begin.value === end.value) {
          return failure('self-bond', 'A bond must connect different atoms.', {
            commandIndex,
            references: [begin.value],
          });
        }
        const key = bondKey(begin.value, end.value);
        if (endpoints.has(key)) {
          return failure(
            'duplicate-bond',
            'Only one bond may connect an atom pair; update its order instead.',
            { commandIndex, references: [begin.value, end.value] },
          );
        }
        if (bonds.size >= MAX_BONDS) {
          return failure('limit-exceeded', 'The bond limit has been reached.', {
            commandIndex,
          });
        }
        const id = allocate('bonds');
        bonds.set(id, {
          id,
          begin: begin.value,
          end: end.value,
          order: command.order,
        });
        endpoints.add(key);
        refs.set(command.ref, { kind: 'bonds', id });
        break;
      }
      case 'bond.update': {
        const target = resolve(command.target, 'bonds', commandIndex);
        if (!target.ok) return target;
        bonds.set(target.value, {
          ...bonds.get(target.value)!,
          order: command.patch.order,
        });
        break;
      }
      case 'bond.remove': {
        const target = resolve(command.target, 'bonds', commandIndex);
        if (!target.ok) return target;
        removeBond(bonds.get(target.value)!);
        break;
      }
    }
  }

  const candidate: MoleculeDocumentSnapshot = {
    ...snapshot,
    atoms: [...atoms.values()],
    bonds: [...bonds.values()],
  };
  const changes = diffGraph(snapshot, candidate);
  if (!hasChanges(changes)) {
    return failure('no-change', 'The batch does not change the molecule.');
  }
  const atomRefs: Record<string, string> = Object.create(null);
  const bondRefs: Record<string, string> = Object.create(null);
  for (const [name, reference] of refs) {
    if (reference.kind === 'atoms' && atoms.has(reference.id)) {
      atomRefs[name] = reference.id;
    } else if (reference.kind === 'bonds' && bonds.has(reference.id)) {
      bondRefs[name] = reference.id;
    }
  }
  return success({
    candidate,
    changes,
    refs: { atoms: atomRefs, bonds: bondRefs },
  });
}
