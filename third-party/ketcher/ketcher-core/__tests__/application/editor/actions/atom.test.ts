/****************************************************************************
 * Copyright 2026 EPAM Systems
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
  fromAtomAddition,
  fromAtomsAttrs,
  mergeFragmentsIfNeeded,
  mergeSgroups,
} from 'application/editor/actions/atom';
import { Action } from 'application/editor/actions/action';
import {
  CalcImplicitH,
  FragmentDelete,
  SGroupAtomAdd,
} from 'application/editor/operations';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { SGroup, Struct, Vec2 } from 'domain/entities';

const createReStruct = () => {
  const options = {
    scale: 40,
    width: 100,
    height: 100,
  } as unknown as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, options);

  return new ReStruct(new Struct(), render);
};

describe('fromAtomAddition', () => {
  it('returns an inverse action that removes the added atom and fragment', () => {
    const restruct = createReStruct();

    const inverseAction = fromAtomAddition(restruct, new Vec2(2, 3), {
      label: 'N',
    });

    expect(restruct.molecule.atoms.size).toBe(1);
    expect(restruct.molecule.frags.size).toBe(1);

    inverseAction.perform(restruct);

    expect(restruct.molecule.atoms.size).toBe(0);
    expect(restruct.molecule.frags.size).toBe(0);
    expect(restruct.atoms.size).toBe(0);
    expect(restruct.frags.size).toBe(0);
  });

  it('rolls back the atom and fragment when a later operation fails', () => {
    const restruct = createReStruct();
    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('implicit hydrogen calculation failed');
      });

    expect(() =>
      fromAtomAddition(restruct, new Vec2(2, 3), { label: 'N' }),
    ).toThrow('implicit hydrogen calculation failed');

    expect(restruct.molecule.atoms.size).toBe(0);
    expect(restruct.molecule.frags.size).toBe(0);
    expect(restruct.atoms.size).toBe(0);
    expect(restruct.frags.size).toBe(0);
    expect(restruct.enhancedFlags.size).toBe(0);
    expect(restruct.connectedComponents.size).toBe(0);
  });
});

describe('fromAtomsAttrs', () => {
  it('restores changed attributes when a later operation fails', () => {
    const restruct = createReStruct();
    fromAtomAddition(restruct, new Vec2(2, 3), { label: 'C' });
    const atomId = restruct.molecule.atoms.keys().next().value as number;

    jest
      .spyOn(CalcImplicitH.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('implicit hydrogen calculation failed');
      });

    expect(() =>
      fromAtomsAttrs(restruct, atomId, { label: 'N' }, false),
    ).toThrow('implicit hydrogen calculation failed');

    expect(restruct.molecule.atoms.get(atomId)?.label).toBe('C');
  });
});

describe('mergeFragmentsIfNeeded', () => {
  it('restores fragment and S-group membership when a later operation fails', () => {
    const restruct = createReStruct();
    fromAtomAddition(restruct, new Vec2(0, 0), { label: 'C' });
    fromAtomAddition(restruct, new Vec2(1, 0), { label: 'N' });
    const [sourceAtomId, destinationAtomId] = Array.from(
      restruct.molecule.atoms.keys(),
    );
    const sourceFragmentId = restruct.molecule.atoms.get(sourceAtomId)
      ?.fragment as number;
    const destinationFragmentId = restruct.molecule.atoms.get(destinationAtomId)
      ?.fragment as number;
    const sgroup = new SGroup(SGroup.TYPES.SUP);
    const sgroupId = restruct.molecule.sgroups.add(sgroup);
    sgroup.id = sgroupId;
    restruct.molecule.atomAddToSGroup(sgroupId, destinationAtomId);
    const inverseAction = new Action();

    jest
      .spyOn(FragmentDelete.prototype, 'perform')
      .mockImplementationOnce(() => {
        throw new Error('fragment deletion failed');
      });

    expect(() =>
      mergeFragmentsIfNeeded(
        inverseAction,
        restruct,
        sourceAtomId,
        destinationAtomId,
      ),
    ).toThrow('fragment deletion failed');

    expect(restruct.molecule.atoms.get(sourceAtomId)?.fragment).toBe(
      sourceFragmentId,
    );
    expect(restruct.molecule.atoms.get(destinationAtomId)?.fragment).toBe(
      destinationFragmentId,
    );
    expect(sgroup.atoms).toEqual([destinationAtomId]);
    expect(inverseAction.operations).toHaveLength(0);
  });
});

describe('mergeSgroups', () => {
  it('removes earlier S-group additions when a later addition fails', () => {
    const restruct = createReStruct();
    fromAtomAddition(restruct, new Vec2(0, 0), { label: 'C' });
    fromAtomAddition(restruct, new Vec2(1, 0), { label: 'N' });
    fromAtomAddition(restruct, new Vec2(2, 0), { label: 'O' });
    const [firstSourceAtomId, secondSourceAtomId, destinationAtomId] =
      Array.from(restruct.molecule.atoms.keys());
    const sgroup = new SGroup(SGroup.TYPES.SUP);
    const sgroupId = restruct.molecule.sgroups.add(sgroup);
    sgroup.id = sgroupId;
    restruct.molecule.atomAddToSGroup(sgroupId, destinationAtomId);
    const inverseAction = new Action();
    const originalPerform = SGroupAtomAdd.prototype.perform;
    let additions = 0;

    jest
      .spyOn(SGroupAtomAdd.prototype, 'perform')
      .mockImplementation(function (this: SGroupAtomAdd, restruct) {
        additions += 1;
        if (additions === 2) {
          throw new Error('S-group addition failed');
        }
        return originalPerform.call(this, restruct);
      });

    expect(() =>
      mergeSgroups(
        inverseAction,
        restruct,
        [firstSourceAtomId, secondSourceAtomId],
        destinationAtomId,
      ),
    ).toThrow('S-group addition failed');

    expect(sgroup.atoms).toEqual([destinationAtomId]);
    expect(
      restruct.molecule.atoms.get(firstSourceAtomId)?.sgs.has(sgroupId),
    ).toBe(false);
    expect(
      restruct.molecule.atoms.get(secondSourceAtomId)?.sgs.has(sgroupId),
    ).toBe(false);
    expect(inverseAction.operations).toHaveLength(0);
  });
});
