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

import {
  type Action,
  type Atom,
  type Pool,
  type ReStruct,
  type Render,
  type RenderOptions,
  type Struct,
  type Vec2,
  CoordinateTransformation,
  fromDescriptorsAlign,
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
  Pile,
} from 'ketcher-core';

import closest from '../shared/closest';
import type {
  ClosestItemWithMap,
  MergeResult,
  SelectedItems,
  SkipItem,
} from '../shared/closest.types';
import type { HoverTarget } from '../tool/Tool';

export interface Selection {
  atoms?: Array<number>;
  bonds?: Array<number>;
  frags?: Array<number>;
  sgroups?: Array<number>;
  sgroupData?: Array<number>;
  rgroups?: Array<number>;
  enhancedFlags?: Array<number>;
  rxnPluses?: Array<number>;
  rxnArrows?: Array<number>;
  simpleObjects?: Array<number>;
  texts?: Array<number>;
  rgroupAttachmentPoints?: Array<number>;
  [IMAGE_KEY]?: Array<number>;
  [MULTITAIL_ARROW_KEY]?: Array<number>;
}

const structObjects: Array<keyof typeof ReStruct.maps> = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'sgroupData',
  'rgroups',
  'rxnArrows',
  'rxnPluses',
  'enhancedFlags',
  'simpleObjects',
  'texts',
  'rgroupAttachmentPoints',
  IMAGE_KEY,
  MULTITAIL_ARROW_KEY,
];

function selectStereoFlagsIfNecessary(
  atoms: Pool<Atom>,
  explicitlySelectedAtoms: number[],
): number[] {
  const fragmentToAtoms: Map<number, number[]> = new Map();
  atoms.forEach((atom, atomId) => {
    const atomFragment = atom.fragment;
    if (atomFragment === -1) {
      return;
    }
    const currentAtoms = fragmentToAtoms.get(atomFragment) ?? [];
    const updatedAtoms = currentAtoms.concat(atomId);
    fragmentToAtoms.set(atomFragment, updatedAtoms);
  });

  let stereoFlags: number[] = [];
  fragmentToAtoms.forEach((fragmentAtoms, fragmentId) => {
    const shouldSelectStereoFlag = fragmentAtoms.every((atomId) =>
      explicitlySelectedAtoms.includes(atomId),
    );
    if (shouldSelectStereoFlag) {
      stereoFlags = stereoFlags.concat(fragmentId);
    }
  });
  return stereoFlags;
}

export interface ISelectionManager {
  replaceSilently(selection: Selection | null): void;
  selection(ci?: Selection | 'all' | 'descriptors' | null): Selection | null;
  explicitSelected(autoSelectBonds?: boolean): Selection;
  structSelected(
    existingSelection?: Selection,
    atomIdMap?: Map<number, number>,
    bondIdMap?: Map<number, number>,
  ): Struct;
  findItem(
    event: Event | MouseEvent | { clientX: number; clientY: number },
    maps: Array<string> | null,
    skip?: SkipItem | null,
  ): (ClosestItemWithMap & HoverTarget) | null;
  findMerge(srcItems: SelectedItems, maps?: string[]): MergeResult;
  alignDescriptors(): void;
}

export interface SelectionManagerDeps {
  getCtab: () => ReStruct;
  getRender: () => Render;
  getOptions: () => RenderOptions;
  dispatchSelectionChange: (sel: Selection | null) => void;
  onSelectAll: () => void;
  onSelectionCleared: () => void;
  requestUpdate: (force?: boolean, viewSz?: Vec2 | null) => void;
  update: (action: Action | true, ignoreHistory?: boolean) => void;
}

export class SelectionManager implements ISelectionManager {
  private _selection: Selection | null = null;

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly deps: SelectionManagerDeps) {}

  /** Restore only surviving runtime IDs without dispatching or rendering. */
  replaceSilently(selection: Selection | null): void {
    const ctab = this.deps.getCtab();
    const filtered: Selection = {};
    if (selection) {
      for (const key of structObjects) {
        const ids = selection[key]?.filter((id) => ctab[key].has(id));
        if (ids?.length) filtered[key] = ids;
      }
    }
    this._selection = Object.keys(filtered).length ? filtered : null;
    ctab.setSelection(this._selection);
  }

  selection(ci?: Selection | 'all' | 'descriptors' | null): Selection | null {
    if (arguments.length === 0) {
      return this._selection; // eslint-disable-line
    }

    let ReStructRef = this.deps.getCtab();
    let selectAll = false;
    this._selection = null; // eslint-disable-line
    let resolvedCi: Record<string, number[]> | null;
    if (typeof ci === 'object' && ci !== null) {
      resolvedCi = ci as Record<string, number[]>;
    } else {
      resolvedCi = null;
    }

    if (ci === 'all') {
      selectAll = true;
      resolvedCi = structObjects.reduce((res, key) => {
        res[key] = Array.from(ReStructRef[key].keys());
        return res;
      }, {} as Record<string, number[]>);
    }

    if (ci === 'descriptors') {
      ReStructRef = this.deps.getCtab();
      resolvedCi = { sgroupData: Array.from(ReStructRef.sgroupData.keys()) };
    }

    if (resolvedCi) {
      const res: Selection = {};
      Object.keys(resolvedCi).forEach((key) => {
        if (resolvedCi && resolvedCi[key] && resolvedCi[key].length > 0)
          // TODO: deep merge
          res[key] = resolvedCi[key].slice();
      });

      if (Object.keys(res).length !== 0) {
        this._selection = res; // eslint-disable-line
      }
      const stereoFlags = selectStereoFlagsIfNecessary(
        this.deps.getCtab().molecule.atoms,
        this.explicitSelected().atoms ?? [],
      );
      if (stereoFlags.length !== 0) {
        if (this._selection?.enhancedFlags) {
          this._selection.enhancedFlags = Array.from(
            new Set([...this._selection.enhancedFlags, ...stereoFlags]),
          );
        } else {
          res.enhancedFlags = stereoFlags;
        }
      }
    }

    this.deps.getCtab().setSelection(this._selection); // eslint-disable-line
    this.deps.dispatchSelectionChange(this._selection); // eslint-disable-line

    if (selectAll) {
      this.deps.onSelectAll();
    } else if (this._selection === null) {
      this.deps.onSelectionCleared();
    }

    this.deps.requestUpdate(false, null);
    return this._selection; // eslint-disable-line
  }

  findItem(
    event: Event | MouseEvent | { clientX: number; clientY: number },
    maps: Array<string> | null,
    skip: SkipItem | null = null,
  ): (ClosestItemWithMap & HoverTarget) | null {
    const pos = CoordinateTransformation.pageToModel(
      event as MouseEvent | { clientX: number; clientY: number },
      this.deps.getRender(),
    );
    return closest.item(
      this.deps.getCtab(),
      pos,
      maps,
      skip,
      this.deps.getOptions(),
    ) as unknown as (ClosestItemWithMap & HoverTarget) | null;
  }

  findMerge(srcItems: SelectedItems, maps?: string[]): MergeResult {
    return closest.merge(
      this.deps.getCtab(),
      srcItems,
      this.deps.getOptions(),
      maps,
    ) as MergeResult;
  }

  explicitSelected(autoSelectBonds = true): Selection {
    const selection = this.selection() ?? {};
    const res = structObjects.reduce((acc, key) => {
      acc[key] = selection[key] ? selection[key].slice() : [];
      return acc;
    }, {} as Selection);

    const struct = this.deps.getCtab().molecule;

    // "auto-select" the atoms for the bonds in selection
    if (res.bonds) {
      res.bonds.forEach((bid) => {
        const bond = struct.bonds.get(bid);
        if (bond) {
          res.atoms = res.atoms ?? [];
          if (res.atoms.indexOf(bond.begin) < 0) {
            res.atoms.push(bond.begin);
          }
          if (res.atoms.indexOf(bond.end) < 0) {
            res.atoms.push(bond.end);
          }
        }
      });
    }

    // "auto-select" the bonds with both atoms selected
    if (autoSelectBonds && res.atoms && res.bonds) {
      struct.bonds.forEach((bond, bid) => {
        if (
          res.bonds &&
          res.atoms &&
          res.bonds.indexOf(bid) < 0 &&
          res.atoms.indexOf(bond.begin) >= 0 &&
          res.atoms.indexOf(bond.end) >= 0
        ) {
          res.bonds.push(bid);
        }
      });
    }

    return res;
  }

  structSelected(
    existingSelection?: Selection,
    atomIdMap?: Map<number, number>,
    bondIdMap?: Map<number, number>,
  ): Struct {
    const struct = this.deps.getCtab().molecule;
    const selection = existingSelection ?? this.explicitSelected();
    const dst = struct.clone(
      new Pile(selection.atoms),
      new Pile(selection.bonds),
      true,
      atomIdMap,
      new Pile(selection.simpleObjects),
      new Pile(selection.texts),
      null,
      new Pile(selection.images),
      new Pile(selection[MULTITAIL_ARROW_KEY]),
      bondIdMap,
    );

    // Copy by its own as Struct.clone doesn't support arrows/pluses id sets
    struct.rxnArrows.forEach((item, id) => {
      if ((selection.rxnArrows ?? []).indexOf(id) !== -1)
        dst.rxnArrows.add(item.clone());
    });
    struct.rxnPluses.forEach((item, id) => {
      if ((selection.rxnPluses ?? []).indexOf(id) !== -1)
        dst.rxnPluses.add(item.clone());
    });

    dst.isReaction = struct.isReaction && struct.isRxn();

    return dst;
  }

  alignDescriptors(): void {
    this.selection(null);
    const action = fromDescriptorsAlign(this.deps.getCtab());
    this.deps.update(action);
    this.deps.requestUpdate(true, null);
  }
}
