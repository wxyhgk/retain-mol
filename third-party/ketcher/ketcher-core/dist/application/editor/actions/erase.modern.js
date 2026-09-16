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
import { ImageDelete } from '../operations/image/imageUpsertDelete.modern.js';
import '../operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import '../operations/multitailArrow/multitailArrowMove.modern.js';
import '../operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import '../operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import { MultitailArrowDelete } from '../operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import '../operations/rgroup/RGroupAttr.modern.js';
import '../operations/rgroup/RGroupFragment.modern.js';
import '../operations/rgroupAttachmentPoint/index.modern.js';
import { RxnArrowDelete } from '../operations/rxn/index.modern.js';
import { SimpleObjectDelete } from '../operations/simpleObject.modern.js';
import '../operations/sgroup/index.modern.js';
import { TextDelete } from '../operations/Text/TextCreateDelete.modern.js';
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
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import { RGroup } from '../../../domain/entities/rgroup.modern.js';
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
import '../../../domain/entities/monomerMicromolecule.modern.js';
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
import '@babel/runtime/helpers/defineProperty';
import '@babel/runtime/helpers/typeof';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import { IMAGE_KEY } from '../../../domain/constants/image.modern.js';
import { MULTITAIL_ARROW_KEY } from '../../../domain/constants/multitailArrow.modern.js';
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
import { removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup.modern.js';
import { Action } from './action.modern.js';
import { formatSelection, atomGetDegree } from './utils.modern.js';
import { removeAttachmentPointFromSuperatom } from './bond.modern.js';
import { fromBondStereoUpdate } from './bondStereo.modern.js';
import { fromFragmentSplit } from './fragment.modern.js';
import { fromRGroupAttachmentPointDeletion } from './rgroupAttachmentPoint.modern.js';
import { isNumber } from 'lodash';
import { RxnPlusDelete } from '../operations/rxn/plus/index.modern.js';
import { SGroupAtomRemove } from '../operations/sgroup/sgroupAtom.modern.js';
import { AtomDelete } from '../operations/atom/AtomDelete.modern.js';
import { RGroupAttachmentPointRemove } from '../operations/rgroupAttachmentPoint/RGroupAttachmentPointRemove.modern.js';
import { BondDelete } from '../operations/bond/BondDelete.modern.js';

function fromOneAtomDeletion(restruct, atomId) {
  return fromFragmentDeletion(restruct, {
    atoms: [atomId]
  });
}
function fromBondDeletion(restruct, bid) {
  var _restruct$sgroups;
  var skipAtoms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var action = new Action();
  if (((_restruct$sgroups = restruct.sgroups) === null || _restruct$sgroups === void 0 ? void 0 : _restruct$sgroups.size) > 0) {
    restruct.sgroups.forEach(function (sgroup) {
      var _sgroup$item, _sgroup$item2;
      if ((_sgroup$item = sgroup.item) !== null && _sgroup$item !== void 0 && _sgroup$item.type && ((_sgroup$item2 = sgroup.item) === null || _sgroup$item2 === void 0 ? void 0 : _sgroup$item2.type) === 'SUP') {
        var _restruct$bonds$get, _restruct$bonds$get2;
        var beginAtomConnectedToBond = (_restruct$bonds$get = restruct.bonds.get(bid)) === null || _restruct$bonds$get === void 0 ? void 0 : _restruct$bonds$get.b.begin;
        var endAtomConnectedToBond = (_restruct$bonds$get2 = restruct.bonds.get(bid)) === null || _restruct$bonds$get2 === void 0 ? void 0 : _restruct$bonds$get2.b.end;
        removeAttachmentPointFromSuperatom(sgroup, beginAtomConnectedToBond, endAtomConnectedToBond, action, restruct);
      }
    });
  }
  var bond = restruct.molecule.bonds.get(bid);
  assert(bond != null);
  var atomsToRemove = [];
  action.addOp(new BondDelete(bid));
  if (!skipAtoms.includes(bond.begin) && atomGetDegree(restruct, bond.begin) === 0) {
    if (removeAtomFromSgroupIfNeeded(action, restruct, bond.begin)) {
      atomsToRemove.push(bond.begin);
    }
    action.addOp(new AtomDelete(bond.begin));
  }
  if (!skipAtoms.includes(bond.end) && atomGetDegree(restruct, bond.end) === 0) {
    if (removeAtomFromSgroupIfNeeded(action, restruct, bond.end)) {
      atomsToRemove.push(bond.end);
    }
    action.addOp(new AtomDelete(bond.end));
  }
  removeSgroupIfNeeded(action, restruct, atomsToRemove);
  action = action.perform(restruct);
  action.addOp(new CalcImplicitH([bond.begin, bond.end]).perform(restruct));
  action.mergeWith(fromBondStereoUpdate(restruct, bond, false));
  action.operations.reverse();
  return action;
}
function fromOneBondDeletion(restruct, id) {
  var frid = restruct.molecule.getBondFragment(id);
  var action = fromBondDeletion(restruct, id);
  action = fromFragmentSplit(restruct, frid).mergeWith(action);
  return action;
}
function fromFragmentDeletion(restruct, rawSelection) {
  assert(rawSelection != null);
  var action = new Action();
  var atomsToRemove = [];
  var frids = [];
  var struct = restruct.molecule;
  var selection = formatSelection(rawSelection);
  selection.sgroups.forEach(function (sgroupId) {
    var sgroup = restruct.sgroups.get(sgroupId);
    var sgroupAtoms = sgroup.item.atoms;
    selection.atoms = selection.atoms.concat(sgroupAtoms);
    restruct.molecule.bonds.forEach(function (bond, bondId) {
      if (sgroupAtoms.indexOf(bond.begin) >= 0 && sgroupAtoms.indexOf(bond.end) >= 0) {
        selection.bonds.push(bondId);
      }
    });
  });
  selection.atoms = Array.from(new Set(selection.atoms));
  selection.bonds = Array.from(new Set(selection.bonds));
  selection.atoms.forEach(function (atomId) {
    var sgroup = struct.getGroupFromAtomId(atomId);
    if (sgroup !== null && sgroup !== void 0 && sgroup.isSuperatomWithoutLabel) {
      var attachmentPoints = sgroup.getAttachmentPoints();
      attachmentPoints.forEach(function (attachmentPoint) {
        if (attachmentPoint.atomId === atomId && isNumber(attachmentPoint.leaveAtomId) && !selection.atoms.includes(attachmentPoint.leaveAtomId)) {
          action.addOp(new SGroupAtomRemove(sgroup.id, attachmentPoint.leaveAtomId));
          action.addOp(new AtomDelete(attachmentPoint.leaveAtomId));
        }
      });
    }
  });
  selection.atoms.forEach(function (aid) {
    restruct.molecule.atomGetNeighbors(aid).forEach(function (nei) {
      if (selection.bonds.indexOf(nei.bid) === -1) {
        selection.bonds = selection.bonds.concat([nei.bid]);
      }
    });
  });
  var actionRemoveBonds = new Action();
  selection.bonds.forEach(function (bid) {
    var frid = restruct.molecule.getBondFragment(bid);
    if (frids.indexOf(frid) < 0) frids.push(frid);
    actionRemoveBonds.mergeWith(fromBondDeletion(restruct, bid, selection.atoms));
  });
  var removedRGroupAttachmentPoints = [];
  selection.atoms.forEach(function (aid) {
    var frid3 = restruct.molecule.atoms.get(aid).fragment;
    if (frids.indexOf(frid3) < 0) frids.push(frid3);
    if (removeAtomFromSgroupIfNeeded(action, restruct, aid)) {
      atomsToRemove.push(aid);
    }
    action.addOp(new AtomDelete(aid));
    var attachmentPointsToDelete = restruct.molecule.getRGroupAttachmentPointsByAtomId(aid);
    attachmentPointsToDelete.forEach(function (id) {
      action.addOp(new RGroupAttachmentPointRemove(id));
      removedRGroupAttachmentPoints.push(id);
    });
  });
  removeSgroupIfNeeded(action, restruct, atomsToRemove);
  selection.rxnArrows.forEach(function (id) {
    action.addOp(new RxnArrowDelete(id));
  });
  selection.rxnPluses.forEach(function (id) {
    action.addOp(new RxnPlusDelete(id));
  });
  selection.simpleObjects.forEach(function (id) {
    action.addOp(new SimpleObjectDelete(id));
  });
  selection.texts.forEach(function (id) {
    action.addOp(new TextDelete(id));
  });
  selection[IMAGE_KEY].forEach(function (id) {
    action.addOp(new ImageDelete(id));
  });
  selection[MULTITAIL_ARROW_KEY].forEach(function (id) {
    action.addOp(new MultitailArrowDelete(id));
  });
  var actionToDeleteRGroupAttachmentPoints = new Action();
  selection.rgroupAttachmentPoints.forEach(function (id) {
    if (!removedRGroupAttachmentPoints.includes(id)) {
      actionToDeleteRGroupAttachmentPoints.mergeWith(fromRGroupAttachmentPointDeletion(restruct, id));
    }
  });
  action = action.perform(restruct);
  action.mergeWith(actionRemoveBonds).mergeWith(actionToDeleteRGroupAttachmentPoints);
  var rgForRemove = frids.reduce(function (acc, frid) {
    var rgid = RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);
    if (isNumber(rgid)) {
      acc.push(rgid);
    }
    return acc;
  }, []);
  while (frids.length > 0) {
    action = fromFragmentSplit(restruct, frids.pop(), rgForRemove).mergeWith(action);
  }
  return action;
}

export { fromFragmentDeletion, fromOneAtomDeletion, fromOneBondDeletion };
//# sourceMappingURL=erase.modern.js.map
