import assert from 'node:assert/strict';
import { Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import { createMoleculeCanvasReader } from 'molecule-ketcher';

export { Atom, Bond, Struct, Vec2 };
export function value(result) {
  assert.equal(result.ok, true, JSON.stringify(result));
  return result.value;
}
export function document(reader) {
  return value(reader.getDocument());
}
export function molecule() {
  const struct = new Struct();
  struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  struct.atoms.add(new Atom({ label: 'O', pp: new Vec2(1, 0) }));
  struct.bonds.add(new Bond({ begin: 0, end: 1, type: 1 }));
  return struct;
}
export function host(struct = molecule(), options = {}) {
  const listeners = new Set();
  const model = {
    struct,
    unavailable: null,
    availabilityError: false,
    issues: [],
    reads: 0,
    unsubscribes: 0,
  };
  const source = {
    getStruct() {
      model.reads++;
      return model.struct;
    },
    getUnavailableReason() {
      if (model.availabilityError) throw new Error('availability failed');
      return model.unavailable;
    },
    getAdditionalIssues() {
      return model.issues;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        model.unsubscribes++;
        listeners.delete(listener);
      };
    },
  };
  const reader = value(createMoleculeCanvasReader(source, options));
  return {
    model,
    reader,
    source,
    emit: (reason = 'edit') => {
      for (const listener of [...listeners]) listener(reason);
    },
  };
}
