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
import { MonomerMicromolecule } from '../../../domain/entities/monomerMicromolecule.modern.js';
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
import '../operations/calcimplicitH.modern.js';
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
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import '../../../domain/entities/fragment.modern.js';
import '../../../domain/entities/functionalGroup.modern.js';
import '../../../domain/entities/halfBond.modern.js';
import '../../../domain/entities/loop.modern.js';
import '../../../domain/entities/rgroup.modern.js';
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
import '../../../domain/entities/CoreAtom.modern.js';
import '../../../domain/entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/defineProperty';
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
import { Action } from './action.modern.js';
import { ActionTransaction } from './actionTransaction.modern.js';
import { getStereoAtomsMap } from './helpers.modern.js';
import { AtomAttr } from '../operations/atom/AtomAttr.modern.js';
import { FragmentDeleteStereoAtom } from '../operations/FragmentDeleteStereoAtom.modern.js';
import { FragmentAddStereoAtom } from '../operations/FragmentAddStereoAtom.modern.js';

function fromStereoAtomAttrs(restruct, aid, attrs, withReverse) {
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  var atom = restruct.molecule.atoms.get(aid);
  var sgroup = restruct.molecule.getGroupFromAtomId(aid);
  try {
    if (atom && !(sgroup instanceof MonomerMicromolecule)) {
      var frid = atom.fragment;
      if ('stereoParity' in attrs) {
        action.addOp(transaction.capture(new AtomAttr(aid, 'stereoParity', attrs.stereoParity).perform(restruct)));
      }
      if ('stereoLabel' in attrs) {
        action.addOp(transaction.capture(new AtomAttr(aid, 'stereoLabel', attrs.stereoLabel).perform(restruct)));
        if (attrs.stereoLabel === null) {
          action.addOp(transaction.capture(new FragmentDeleteStereoAtom(frid, aid).perform(restruct)));
        } else {
          action.addOp(transaction.capture(new FragmentAddStereoAtom(frid, aid).perform(restruct)));
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
function fromBondStereoUpdate(restruct, bond, withReverse) {
  var _struct$atoms$get, _struct$atoms$get2;
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  var struct = restruct.molecule;
  var beginFrId = (_struct$atoms$get = struct.atoms.get(bond === null || bond === void 0 ? void 0 : bond.begin)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment;
  var endFrId = (_struct$atoms$get2 = struct.atoms.get(bond === null || bond === void 0 ? void 0 : bond.end)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.fragment;
  var fragmentStereoBonds = [];
  struct.bonds.forEach(function (bond) {
    var _struct$atoms$get3, _struct$atoms$get4;
    if (((_struct$atoms$get3 = struct.atoms.get(bond.begin)) === null || _struct$atoms$get3 === void 0 ? void 0 : _struct$atoms$get3.fragment) === beginFrId) {
      fragmentStereoBonds.push(bond);
    }
    if (beginFrId !== endFrId && ((_struct$atoms$get4 = struct.atoms.get(bond.begin)) === null || _struct$atoms$get4 === void 0 ? void 0 : _struct$atoms$get4.fragment) === endFrId) {
      fragmentStereoBonds.push(bond);
    }
  });
  var stereoAtomsMap = getStereoAtomsMap(struct, fragmentStereoBonds, bond);
  try {
    stereoAtomsMap.forEach(function (stereoProp, aId) {
      var _struct$atoms$get5;
      if (((_struct$atoms$get5 = struct.atoms.get(aId)) === null || _struct$atoms$get5 === void 0 ? void 0 : _struct$atoms$get5.stereoLabel) !== stereoProp.stereoLabel) {
        var stereoAtomAction = fromStereoAtomAttrs(restruct, aId, stereoProp, withReverse);
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

export { fromBondStereoUpdate, fromStereoAtomAttrs };
//# sourceMappingURL=bondStereo.modern.js.map
