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
import { EnhancedFlagMove } from '../operations/EnhancedFlagMove.modern.js';
import '../operations/EnhancedFlagClear.modern.js';
import '../operations/ifThen.modern.js';
import '../operations/fragment.modern.js';
import '../operations/fragmentStereoAtom.modern.js';
import { FragmentStereoFlag } from '../operations/FragmentStereoFlag.modern.js';
import '../operations/calcimplicitH.modern.js';
import { LoopMove } from '../operations/LoopMove.modern.js';
import '../operations/OperationType.modern.js';
import { ImageMove } from '../operations/image/imageMove.modern.js';
import '../operations/image/imageResize.modern.js';
import '../operations/image/imageUpsertDelete.modern.js';
import '../operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import { MultitailArrowMove } from '../operations/multitailArrow/multitailArrowMove.modern.js';
import '../operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import '../operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import '../operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import '../operations/rgroup/RGroupAttr.modern.js';
import '../operations/rgroup/RGroupFragment.modern.js';
import '../operations/rgroupAttachmentPoint/index.modern.js';
import '../operations/rxn/index.modern.js';
import { SimpleObjectMove } from '../operations/simpleObject.modern.js';
import '../operations/sgroup/index.modern.js';
import '../operations/Text/TextCreateDelete.modern.js';
import '../operations/Text/TextUpdate.modern.js';
import { TextMove } from '../operations/Text/TextMove.modern.js';
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
import { Pile } from '../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
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
import { fromRGroupFragment, fromUpdateIfThen } from './rgroup.modern.js';
import { Action } from './action.modern.js';
import { fromAtomsFragmentAttr } from './atom.modern.js';
import { getRelSGroupsBySelection } from './utils.modern.js';
import { BondMove } from '../operations/bond/BondMove.modern.js';
import { RxnArrowMove } from '../operations/rxn/RxnArrowMove.modern.js';
import { RxnPlusMove } from '../operations/rxn/plus/RxnPlusMove.modern.js';
import { AtomMove } from '../operations/atom/AtomMove.modern.js';
import { SGroupDataMove } from '../operations/sgroup/SGroupDataMove.modern.js';
import { FragmentDeleteStereoAtom } from '../operations/FragmentDeleteStereoAtom.modern.js';
import { FragmentAdd } from '../operations/FragmentAdd.modern.js';
import { FragmentDelete } from '../operations/FragmentDelete.modern.js';

function fromMultipleMove(restruct, lists, d) {
  d = new Vec2(d);
  var action = new Action();
  var struct = restruct.molecule;
  var loops = new Pile();
  var atomsToInvalidate = new Pile();
  if (lists.atoms) {
    var _lists$sgroupData;
    var atomSet = new Pile(lists.atoms);
    var bondlist = [];
    var relatedSgroups = getRelSGroupsBySelection(struct, lists.atoms);
    restruct.bonds.forEach(function (bond, bid) {
      if (atomSet.has(bond.b.begin) && atomSet.has(bond.b.end)) {
        bondlist.push(bid);
        ['hb1', 'hb2'].forEach(function (hb) {
          var loop = struct.halfBonds.get(bond.b[hb]).loop;
          if (loop >= 0) loops.add(loop);
        });
        return;
      }
      if (atomSet.has(bond.b.begin)) {
        atomsToInvalidate.add(bond.b.begin);
        return;
      }
      if (atomSet.has(bond.b.end)) atomsToInvalidate.add(bond.b.end);
    });
    bondlist.forEach(function (bond) {
      action.addOp(new BondMove(bond, d));
    });
    loops.forEach(function (loopId) {
      var loop = restruct.reloops.get(loopId);
      if (loop !== null && loop !== void 0 && loop.visel) {
        action.addOp(new LoopMove(loopId, d));
      }
    });
    lists.atoms.forEach(function (aid) {
      action.addOp(new AtomMove(aid, d, !atomsToInvalidate.has(aid)));
    });
    relatedSgroups.forEach(function (sgroup) {
      sgroup === null || sgroup === void 0 || sgroup.atoms.forEach(function (aid) {
        if (!atomSet.has(aid)) {
          action.addOp(new AtomMove(aid, d, true));
        }
      });
    });
    if (((_lists$sgroupData = lists.sgroupData) === null || _lists$sgroupData === void 0 ? void 0 : _lists$sgroupData.length) === 0) {
      relatedSgroups.forEach(function (sg) {
        action.addOp(new SGroupDataMove(sg.id, d));
      });
    }
  }
  if (lists.rxnArrows) {
    lists.rxnArrows.forEach(function (rxnArrow) {
      action.addOp(new RxnArrowMove(rxnArrow, d, true));
    });
  }
  if (lists.rxnPluses) {
    lists.rxnPluses.forEach(function (rxnPulse) {
      action.addOp(new RxnPlusMove(rxnPulse, d, true));
    });
  }
  if (lists.simpleObjects) {
    lists.simpleObjects.forEach(function (simpleObject) {
      action.addOp(new SimpleObjectMove(simpleObject, d, true));
    });
  }
  if (lists.sgroupData) {
    lists.sgroupData.forEach(function (sgData) {
      action.addOp(new SGroupDataMove(sgData, d));
    });
  }
  if (lists.enhancedFlags) {
    lists.enhancedFlags.forEach(function (fid) {
      action.addOp(new EnhancedFlagMove(fid, d));
    });
  }
  if (lists.texts) {
    lists.texts.forEach(function (text) {
      action.addOp(new TextMove(text, d, true));
    });
  }
  if (lists[IMAGE_KEY]) {
    lists[IMAGE_KEY].forEach(function (image) {
      action.addOp(new ImageMove(image, d));
    });
  }
  if (lists[MULTITAIL_ARROW_KEY]) {
    lists[MULTITAIL_ARROW_KEY].forEach(function (multitailArrow) {
      action.addOp(new MultitailArrowMove(multitailArrow, d));
    });
  }
  return action.perform(restruct);
}
function fromStereoFlagUpdate(restruct, frid) {
  var flag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var action = new Action();
  if (!flag) {
    var struct = restruct.molecule;
    var frag = restruct.molecule.frags.get(frid);
    if (frag) {
      frag.stereoAtoms.forEach(function (aid) {
        if (struct.atoms.get(aid).stereoLabel === null) {
          action.addOp(new FragmentDeleteStereoAtom(frid, aid));
        }
      });
    }
  }
  action.addOp(new FragmentStereoFlag(frid));
  return action.perform(restruct);
}
function processAtom(restruct, aid, frid, newfrid) {
  var queue = [aid];
  var usedIds = new Pile(queue);
  while (queue.length > 0) {
    var id = queue.shift();
    restruct.molecule.atomGetNeighbors(id).forEach(function (nei) {
      if (restruct.molecule.atoms.get(nei.aid).fragment === frid && !usedIds.has(nei.aid)) {
        usedIds.add(nei.aid);
        queue.push(nei.aid);
      }
    });
  }
  return fromAtomsFragmentAttr(restruct, usedIds, newfrid);
}
function fromFragmentSplit(restruct, frid) {
  var rgForRemove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var action = new Action();
  var rgid = RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);
  restruct.molecule.atoms.forEach(function (atom, aid) {
    if (atom.fragment === frid) {
      var newfrid = action.addOp(new FragmentAdd().perform(restruct)).frid;
      action.mergeWith(processAtom(restruct, aid, frid, newfrid));
      if (rgid) action.mergeWith(fromRGroupFragment(restruct, rgid, newfrid));
    }
  });
  if (frid !== -1) {
    action.mergeWith(fromRGroupFragment(restruct, 0, frid));
    action.addOp(new FragmentDelete(frid).perform(restruct));
    action.mergeWith(fromUpdateIfThen(restruct, 0, rgid, rgForRemove));
  }
  action.operations.reverse();
  return action;
}

export { fromFragmentSplit, fromMultipleMove, fromStereoFlagUpdate };
//# sourceMappingURL=fragment.modern.js.map
