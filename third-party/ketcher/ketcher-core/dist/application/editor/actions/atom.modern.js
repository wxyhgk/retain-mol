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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Atom } from '../../../domain/entities/atom.modern.js';
import { MonomerMicromolecule } from '../../../domain/entities/monomerMicromolecule.modern.js';
import { RGroup } from '../../../domain/entities/rgroup.modern.js';
import '../operations/atom/index.modern.js';
import '../operations/bond/index.modern.js';
import '../operations/CanvasLoad.modern.js';
import '../operations/descriptors.modern.js';
import '../operations/EnhancedFlagMove.modern.js';
import '../operations/EnhancedFlagClear.modern.js';
import '../operations/ifThen.modern.js';
import '../operations/fragment.modern.js';
import '../operations/fragmentStereoAtom.modern.js';
import '../operations/FragmentStereoFlag.modern.js';
import { CalcImplicitH } from '../operations/calcimplicitH.modern.js';
import '../operations/LoopMove.modern.js';
import '../operations/OperationType.modern.js';
import '../operations/image/imageMove.modern.js';
import '../operations/image/imageResize.modern.js';
import '../operations/image/imageUpsertDelete.modern.js';
import '../operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import '../operations/multitailArrow/multitailArrowMove.modern.js';
import '../operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import '../operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import '../operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import '../operations/rgroup/RGroupAttr.modern.js';
import '../operations/rgroup/RGroupFragment.modern.js';
import '../operations/rgroupAttachmentPoint/index.modern.js';
import '../operations/rxn/index.modern.js';
import '../operations/simpleObject.modern.js';
import '../operations/sgroup/index.modern.js';
import '../operations/Text/TextCreateDelete.modern.js';
import '../operations/Text/TextUpdate.modern.js';
import '../operations/Text/TextMove.modern.js';
import '../operations/monomer/AttachmentPointHoverOperation.modern.js';
import '../operations/monomer/FlipMonomerOperation.modern.js';
import '../operations/monomer/MonomerAddOperation.modern.js';
import '../operations/monomer/MonomerDeleteOperation.modern.js';
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/helpers/monomers.modern.js';
import '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../../domain/entities/rxnArrow.modern.js';
import '../../../domain/entities/rxnPlus.modern.js';
import '../../../domain/entities/sgroup.modern.js';
import '../../../domain/entities/sgroupForest.modern.js';
import '../../../domain/entities/simpleObject.modern.js';
import '../../../domain/entities/struct.modern.js';
import '../../../domain/entities/text.modern.js';
import '../../../domain/entities/pile.modern.js';
import '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../../domain/entities/Peptide.modern.js';
import '../../../domain/entities/BaseMonomer.modern.js';
import '../../../domain/entities/Chem.modern.js';
import '../../../domain/entities/Sugar.modern.js';
import '../../../domain/entities/RNABase.modern.js';
import '../../../domain/entities/Phosphate.modern.js';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/Nucleoside.modern.js';
import '../../../domain/entities/Nucleotide.modern.js';
import '../../../domain/entities/monomer-chains/types.modern.js';
import '../../../domain/entities/monomer-chains/Chain.modern.js';
import '../../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../../domain/entities/MonomerSequenceNode.modern.js';
import '../../../domain/entities/EmptySequenceNode.modern.js';
import '../../../domain/entities/LinkerSequenceNode.modern.js';
import '../../../domain/entities/UnresolvedMonomer.modern.js';
import '../../../domain/entities/UnsplitNucleotide.modern.js';
import '../../../domain/entities/PolymerBond.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../../domain/entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import '../../render/renderers/ChemRenderer.modern.js';
import '../../render/renderers/PeptideRenderer.modern.js';
import '../../render/renderers/PhosphateRenderer.modern.js';
import '../../render/renderers/RNABaseRenderer.modern.js';
import '../../render/renderers/SugarRenderer.modern.js';
import '../../render/renderers/UnresolvedMonomerRenderer.modern.js';
import '../../render/renderers/UnsplitNucleotideRenderer.modern.js';
import '../operations/monomer/MonomerHoverOperation.modern.js';
import '../operations/monomer/MonomerItemModifyOperation.modern.js';
import '../operations/monomer/MonomerMoveOperation.modern.js';
import '../operations/monomer/RotateMonomerOperation.modern.js';
import '../operations/monomer/ShiftMonomerOperation.modern.js';
import '../operations/modes/index.modern.js';
import '../operations/monomerCreation/AssignAttachmentAtomOperation.modern.js';
import '../operations/monomerCreation/AssignLeavingGroupAtomOperation.modern.js';
import '../operations/monomerCreation/MarkAsRnaComponentOperation.modern.js';
import '../operations/monomerCreation/ReassignAttachmentPointOperation.modern.js';
import '../operations/monomerCreation/ReassignLeavingAtomOperation.modern.js';
import { atomGetAttr, atomGetSGroups } from './utils.modern.js';
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup.modern.js';
import { fromBondStereoUpdate } from './bondStereo.modern.js';
export { fromStereoAtomAttrs } from './bondStereo.modern.js';
import { Action } from './action.modern.js';
import { runActionTransaction } from './actionTransaction.modern.js';
import { without } from 'lodash/fp';
import { FragmentAdd } from '../operations/FragmentAdd.modern.js';
import { AtomAdd } from '../operations/atom/AtomAdd.modern.js';
import { FragmentDelete } from '../operations/FragmentDelete.modern.js';
import { SGroupAtomAdd } from '../operations/sgroup/sgroupAtom.modern.js';
import { AtomAttr } from '../operations/atom/AtomAttr.modern.js';
import { FragmentAddStereoAtom } from '../operations/FragmentAddStereoAtom.modern.js';
import { FragmentDeleteStereoAtom } from '../operations/FragmentDeleteStereoAtom.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function fromAtomAddition(restruct, pos, atom) {
  atom = _objectSpread({}, atom || {});
  var action = new Action();
  runActionTransaction(restruct, function (transaction) {
    var fragmentOperation = new FragmentAdd();
    var fragmentInverse = transaction.capture(fragmentOperation.perform(restruct));
    action.addOp(fragmentInverse);
    atom.fragment = fragmentOperation.frid;
    var atomOperation = new AtomAdd(atom, pos);
    var atomInverse = transaction.capture(atomOperation.perform(restruct));
    action.addOp(atomInverse);
    var aid = atomOperation.data.aid;
    var implicitHydrogenInverse = transaction.capture(new CalcImplicitH([aid]).perform(restruct));
    action.addOp(implicitHydrogenInverse);
  });
  return action;
}
function fromAtomsAttrs(restruct, ids, attrs, reset) {
  var action = new Action();
  var aids = Array.isArray(ids) ? ids : [ids];
  runActionTransaction(restruct, function (transaction) {
    aids.forEach(function (atomId) {
      var _atomNeighbors$;
      Object.keys(Atom.attrlist).forEach(function (key) {
        if (key === 'attachmentPoints' && !(key in attrs)) return;
        if (!(key in attrs) && !reset) return;
        var value = key in attrs ? attrs[key] : Atom.attrGetDefault(key);
        switch (key) {
          case 'stereoLabel':
          case 'stereoParity':
            if (key in attrs && value) {
              var inverse = transaction.capture(new AtomAttr(atomId, key, value).perform(restruct));
              action.addOp(inverse);
            }
            break;
          default:
            {
              var _inverse = transaction.capture(new AtomAttr(atomId, key, value).perform(restruct));
              action.addOp(_inverse);
              break;
            }
        }
      });
      if (!reset && 'label' in attrs && attrs.label !== null && attrs.label !== 'L#' && !('atomList' in attrs)) {
        var inverse = transaction.capture(new AtomAttr(atomId, 'atomList', null).perform(restruct));
        action.addOp(inverse);
      }
      var implicitHydrogenInverse = transaction.capture(new CalcImplicitH([atomId]).perform(restruct));
      action.addOp(implicitHydrogenInverse);
      var atomNeighbors = restruct.molecule.atomGetNeighbors(atomId);
      var bond = restruct.molecule.bonds.get(atomNeighbors === null || atomNeighbors === void 0 || (_atomNeighbors$ = atomNeighbors[0]) === null || _atomNeighbors$ === void 0 ? void 0 : _atomNeighbors$.bid);
      if (bond) {
        var stereoAction = fromBondStereoUpdate(restruct, bond);
        transaction.capture(stereoAction);
        action.mergeWith(stereoAction);
      }
      var atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);
      if (Atom.isInAromatizedRing(restruct.molecule, atomId)) {
        var _inverse2 = transaction.capture(new AtomAttr(atomId, 'implicitHCount', atom.implicitH).perform(restruct));
        action.addOp(_inverse2);
      }
    });
  });
  return action;
}
function fromAtomsFragmentAttr(restruct, aids, newfrid) {
  var action = new Action();
  aids.forEach(function (aid) {
    var atom = restruct.molecule.atoms.get(aid);
    var sgroup = restruct.molecule.getGroupFromAtomId(aid);
    var oldfrid = atom.fragment;
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
function mergeFragmentsIfNeeded(action, restruct, srcId, dstId) {
  var frid = atomGetAttr(restruct, srcId, 'fragment');
  var frid2 = atomGetAttr(restruct, dstId, 'fragment');
  if (frid2 !== frid && typeof frid === 'number' && typeof frid2 === 'number') {
    var mergeAction = new Action();
    runActionTransaction(restruct, function (transaction) {
      var struct = restruct.molecule;
      var rgid = RGroup.findRGroupByFragment(struct.rgroups, frid2);
      if (typeof rgid !== 'undefined') {
        var rgroupFragmentAction = fromRGroupFragment(restruct, null, frid2);
        transaction.capture(rgroupFragmentAction);
        mergeAction.mergeWith(rgroupFragmentAction);
        var updateIfThenAction = fromUpdateIfThen(restruct, 0, rgid);
        transaction.capture(updateIfThenAction);
        mergeAction.mergeWith(updateIfThenAction);
      }
      var fridAtoms = struct.getFragmentIds(frid);
      var atomsToNewFrag = [];
      struct.atoms.forEach(function (atom, aid) {
        if (atom.fragment === frid2) atomsToNewFrag.push(aid);
      });
      var moveAtomsAction = fromAtomsFragmentAttr(restruct, atomsToNewFrag, frid);
      transaction.capture(moveAtomsAction);
      var mergeSgroupsAction = mergeSgroups(mergeAction, restruct, fridAtoms, dstId);
      transaction.capture(mergeSgroupsAction);
      var fragmentDeleteInverse = transaction.capture(new FragmentDelete(frid2).perform(restruct));
      mergeAction.addOp(fragmentDeleteInverse);
      mergeAction.mergeWith(moveAtomsAction);
    });
    action.mergeWith(mergeAction);
  }
  return frid;
}
function mergeSgroups(action, restruct, srcAtoms, dstAtom) {
  var mergeAction = new Action();
  runActionTransaction(restruct, function (transaction) {
    var sgroups = atomGetSGroups(restruct, dstAtom);
    sgroups.forEach(function (sid) {
      var sgroup = restruct.molecule.sgroups.get(sid);
      var notExpandedContexts = ['Atom', 'Bond', 'Group'];
      if (sgroup.type === 'DAT' && notExpandedContexts.includes(sgroup.data.context)) {
        return;
      }
      var atomsToSgroup = without(sgroup.atoms, srcAtoms);
      atomsToSgroup.forEach(function (aid) {
        var inverse = transaction.capture(new SGroupAtomAdd(sid, aid).perform(restruct));
        mergeAction.addOp(inverse);
      });
    });
  });
  action.mergeWith(mergeAction);
  return mergeAction;
}
function checkAtomValence(restruct, atomId) {
  var action = new Action();
  if (!restruct.atoms.has(atomId)) return action;
  action.addOp(new CalcImplicitH([atomId]));
  return action.perform(restruct);
}

export { checkAtomValence, fromAtomAddition, fromAtomsAttrs, fromAtomsFragmentAttr, mergeFragmentsIfNeeded, mergeSgroups };
//# sourceMappingURL=atom.modern.js.map
