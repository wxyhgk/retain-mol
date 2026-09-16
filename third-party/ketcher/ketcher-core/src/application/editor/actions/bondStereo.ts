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

import type { Bond } from 'domain/entities/bond';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import type { ReStruct } from 'application/render';
import {
  AtomAttr,
  FragmentAddStereoAtom,
  FragmentDeleteStereoAtom,
} from '../operations';
import { Action } from './action';
import { ActionTransaction } from './actionTransaction';
import { getStereoAtomsMap } from './helpers';

export function fromStereoAtomAttrs(restruct, aid, attrs, withReverse): Action {
  const action = new Action();
  const transaction = new ActionTransaction(restruct);
  const atom = restruct.molecule.atoms.get(aid);
  const sgroup = restruct.molecule.getGroupFromAtomId(aid);
  try {
    if (atom && !(sgroup instanceof MonomerMicromolecule)) {
      const frid = atom.fragment;

      if ('stereoParity' in attrs) {
        action.addOp(
          transaction.capture(
            new AtomAttr(aid, 'stereoParity', attrs.stereoParity).perform(
              restruct,
            ),
          ),
        );
      }
      if ('stereoLabel' in attrs) {
        action.addOp(
          transaction.capture(
            new AtomAttr(aid, 'stereoLabel', attrs.stereoLabel).perform(
              restruct,
            ),
          ),
        );
        if (attrs.stereoLabel === null) {
          action.addOp(
            transaction.capture(
              new FragmentDeleteStereoAtom(frid, aid).perform(restruct),
            ),
          );
        } else {
          action.addOp(
            transaction.capture(
              new FragmentAddStereoAtom(frid, aid).perform(restruct),
            ),
          );
        }
      }
      if (withReverse) action.operations.reverse();
    }

    transaction.commit();
    return action;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}

export function fromBondStereoUpdate(
  restruct: ReStruct,
  bond: Bond,
  withReverse?: boolean,
): Action {
  const action = new Action();
  const transaction = new ActionTransaction(restruct);
  const struct = restruct.molecule;

  const beginFrId = struct.atoms.get(bond?.begin)?.fragment;
  const endFrId = struct.atoms.get(bond?.end)?.fragment;

  const fragmentStereoBonds: Array<Bond> = [];

  struct.bonds.forEach((bond) => {
    if (struct.atoms.get(bond.begin)?.fragment === beginFrId) {
      fragmentStereoBonds.push(bond);
    }

    if (
      beginFrId !== endFrId &&
      struct.atoms.get(bond.begin)?.fragment === endFrId
    ) {
      fragmentStereoBonds.push(bond);
    }
  });

  const stereoAtomsMap = getStereoAtomsMap(struct, fragmentStereoBonds, bond);

  try {
    stereoAtomsMap.forEach((stereoProp, aId) => {
      if (struct.atoms.get(aId)?.stereoLabel !== stereoProp.stereoLabel) {
        const stereoAtomAction = fromStereoAtomAttrs(
          restruct,
          aId,
          stereoProp,
          withReverse,
        );
        transaction.capture(stereoAtomAction);
        action.mergeWith(stereoAtomAction);
      }
    });

    transaction.commit();
    return action;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
