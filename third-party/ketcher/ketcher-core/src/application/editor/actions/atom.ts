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

import { Atom } from 'domain/entities/atom';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { RGroup } from 'domain/entities/rgroup';
import {
  AtomAdd,
  AtomAttr,
  CalcImplicitH,
  FragmentAdd,
  FragmentAddStereoAtom,
  FragmentDelete,
  FragmentDeleteStereoAtom,
  SGroupAtomAdd,
} from '../operations';
import { atomGetAttr, atomGetSGroups } from './utils';
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup';
import { fromBondStereoUpdate } from './bondStereo';

import { Action } from './action';
import { runActionTransaction } from './actionTransaction';
import { without } from 'lodash/fp';
import type ReStruct from 'application/render/restruct/restruct';
import { assert } from 'utilities';

export function fromAtomAddition(restruct, pos, atom) {
  atom = { ...(atom || {}) };
  const action = new Action();

  runActionTransaction(restruct, (transaction) => {
    const fragmentOperation = new FragmentAdd();
    const fragmentInverse = transaction.capture(
      fragmentOperation.perform(restruct),
    );
    action.addOp(fragmentInverse);
    atom.fragment = fragmentOperation.frid;

    const atomOperation = new AtomAdd(atom, pos);
    const atomInverse = transaction.capture(atomOperation.perform(restruct));
    action.addOp(atomInverse);
    const aid = atomOperation.data.aid;

    const implicitHydrogenInverse = transaction.capture(
      new CalcImplicitH([aid as number]).perform(restruct),
    );
    action.addOp(implicitHydrogenInverse);
  });

  return action;
}

export function fromAtomsAttrs(
  restruct: ReStruct,
  ids: Array<number> | number,
  attrs: any,
  reset: boolean | null,
) {
  const action = new Action();
  const aids = Array.isArray(ids) ? ids : [ids];

  runActionTransaction(restruct, (transaction) => {
    aids.forEach((atomId) => {
      Object.keys(Atom.attrlist).forEach((key) => {
        if (key === 'attachmentPoints' && !(key in attrs)) return;
        if (!(key in attrs) && !reset) return;

        const value = key in attrs ? attrs[key] : Atom.attrGetDefault(key);

        switch (key) {
          case 'stereoLabel':
          case 'stereoParity':
            if (key in attrs && value) {
              const inverse = transaction.capture(
                new AtomAttr(atomId, key, value).perform(restruct),
              );
              action.addOp(inverse);
            }
            break;
          default: {
            const inverse = transaction.capture(
              new AtomAttr(atomId, key, value).perform(restruct),
            );
            action.addOp(inverse);
            break;
          }
        }
      });

      if (
        !reset &&
        'label' in attrs &&
        attrs.label !== null &&
        attrs.label !== 'L#' &&
        !('atomList' in attrs)
      ) {
        const inverse = transaction.capture(
          new AtomAttr(atomId, 'atomList', null).perform(restruct),
        );
        action.addOp(inverse);
      }

      const implicitHydrogenInverse = transaction.capture(
        new CalcImplicitH([atomId]).perform(restruct),
      );
      action.addOp(implicitHydrogenInverse);

      const atomNeighbors = restruct.molecule.atomGetNeighbors(atomId);
      const bond = restruct.molecule.bonds.get(
        atomNeighbors?.[0]?.bid as number,
      );
      if (bond) {
        const stereoAction = fromBondStereoUpdate(restruct, bond);
        transaction.capture(stereoAction);
        action.mergeWith(stereoAction);
      }
      // when a heteroatom connects to an aromatic ring it's necessary to add a ImplicitHCount
      // property to this atom to specify the number of hydrogens on it.
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      if (Atom.isInAromatizedRing(restruct.molecule, atomId)) {
        const inverse = transaction.capture(
          new AtomAttr(atomId, 'implicitHCount', atom.implicitH).perform(
            restruct,
          ),
        );
        action.addOp(inverse);
      }
    });
  });

  return action;
}

export { fromStereoAtomAttrs } from './bondStereo';

export function fromAtomsFragmentAttr(restruct, aids, newfrid) {
  const action = new Action();

  aids.forEach((aid) => {
    const atom = restruct.molecule.atoms.get(aid);
    const sgroup = restruct.molecule.getGroupFromAtomId(aid);
    const oldfrid = atom.fragment;

    if (sgroup instanceof MonomerMicromolecule) {
      return;
    }

    action.addOp(new AtomAttr(aid, 'fragment', newfrid));

    if (atom.stereoLabel !== null) {
      action.addOp(new FragmentAddStereoAtom(newfrid, aid));
      action.addOp(new FragmentDeleteStereoAtom(oldfrid, aid));
    }
  });

  return action.perform(restruct);
}

export function mergeFragmentsIfNeeded(action, restruct, srcId, dstId) {
  const frid = atomGetAttr(restruct, srcId, 'fragment') as number;
  const frid2 = atomGetAttr(restruct, dstId, 'fragment');

  if (frid2 !== frid && typeof frid === 'number' && typeof frid2 === 'number') {
    const mergeAction = new Action();

    runActionTransaction(restruct, (transaction) => {
      const struct = restruct.molecule;

      const rgid = RGroup.findRGroupByFragment(struct.rgroups, frid2);
      if (typeof rgid !== 'undefined') {
        const rgroupFragmentAction = fromRGroupFragment(restruct, null, frid2);
        transaction.capture(rgroupFragmentAction);
        mergeAction.mergeWith(rgroupFragmentAction);

        const updateIfThenAction = fromUpdateIfThen(restruct, 0, rgid);
        transaction.capture(updateIfThenAction);
        mergeAction.mergeWith(updateIfThenAction);
      }

      const fridAtoms = struct.getFragmentIds(frid);

      const atomsToNewFrag: Array<any> = [];
      struct.atoms.forEach((atom, aid) => {
        if (atom.fragment === frid2) atomsToNewFrag.push(aid);
      });
      const moveAtomsAction = fromAtomsFragmentAttr(
        restruct,
        atomsToNewFrag,
        frid,
      );
      transaction.capture(moveAtomsAction);

      const mergeSgroupsAction = mergeSgroups(
        mergeAction,
        restruct,
        fridAtoms,
        dstId,
      );
      transaction.capture(mergeSgroupsAction);

      const fragmentDeleteInverse = transaction.capture(
        new FragmentDelete(frid2).perform(restruct),
      );
      mergeAction.addOp(fragmentDeleteInverse);
      mergeAction.mergeWith(moveAtomsAction);
    });

    action.mergeWith(mergeAction);
  }

  return frid;
}

export function mergeSgroups(action, restruct, srcAtoms, dstAtom) {
  const mergeAction = new Action();

  runActionTransaction(restruct, (transaction) => {
    const sgroups = atomGetSGroups(restruct, dstAtom);

    sgroups.forEach((sid) => {
      const sgroup = restruct.molecule.sgroups.get(sid);
      const notExpandedContexts = ['Atom', 'Bond', 'Group'];
      if (
        sgroup.type === 'DAT' &&
        notExpandedContexts.includes(sgroup.data.context)
      ) {
        return;
      }
      const atomsToSgroup: any = without(sgroup.atoms, srcAtoms);
      atomsToSgroup.forEach((aid) => {
        const inverse = transaction.capture(
          new SGroupAtomAdd(sid, aid).perform(restruct),
        );
        mergeAction.addOp(inverse);
      });
    });
  });

  action.mergeWith(mergeAction);
  return mergeAction;
}

export function checkAtomValence(restruct, atomId) {
  const action = new Action();

  if (!restruct.atoms.has(atomId)) return action;

  action.addOp(new CalcImplicitH([atomId]));

  return action.perform(restruct);
}
