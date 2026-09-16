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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../operations/atom/index.js');
require('../operations/bond/index.js');
require('../operations/CanvasLoad.js');
require('../operations/descriptors.js');
var EnhancedFlagMove = require('../operations/EnhancedFlagMove.js');
require('../operations/EnhancedFlagClear.js');
require('../operations/ifThen.js');
require('../operations/fragment.js');
require('../operations/fragmentStereoAtom.js');
var FragmentStereoFlag = require('../operations/FragmentStereoFlag.js');
require('../operations/calcimplicitH.js');
var LoopMove = require('../operations/LoopMove.js');
require('../operations/OperationType.js');
var imageMove = require('../operations/image/imageMove.js');
require('../operations/image/imageResize.js');
require('../operations/image/imageUpsertDelete.js');
require('../operations/multitailArrow/multitailArrowAddRemoveTail.js');
var multitailArrowMove = require('../operations/multitailArrow/multitailArrowMove.js');
require('../operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('../operations/multitailArrow/multitailArrowResizeTailHead.js');
require('../operations/multitailArrow/multitailArrowUpsertDelete.js');
require('../operations/rgroup/RGroupAttr.js');
require('../operations/rgroup/RGroupFragment.js');
require('../operations/rgroupAttachmentPoint/index.js');
require('../operations/rxn/index.js');
var simpleObject = require('../operations/simpleObject.js');
require('../operations/sgroup/index.js');
require('../operations/Text/TextCreateDelete.js');
require('../operations/Text/TextUpdate.js');
var TextMove = require('../operations/Text/TextMove.js');
require('../operations/monomer/AttachmentPointHoverOperation.js');
require('../operations/monomer/FlipMonomerOperation.js');
require('../operations/monomer/MonomerAddOperation.js');
require('../operations/monomer/MonomerDeleteOperation.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/helpers/monomers.js');
require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('@babel/runtime/helpers/slicedToArray');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
var rgroup = require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
var pile = require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
require('../../../domain/entities/monomerMicromolecule.js');
require('../../../domain/entities/Peptide.js');
require('../../../domain/entities/BaseMonomer.js');
require('../../../domain/entities/Chem.js');
require('../../../domain/entities/Sugar.js');
require('../../../domain/entities/RNABase.js');
require('../../../domain/entities/Phosphate.js');
require('../../../domain/entities/Axis.js');
require('../../../domain/entities/Nucleoside.js');
require('../../../domain/entities/Nucleotide.js');
require('../../../domain/entities/monomer-chains/types.js');
require('../../../domain/entities/monomer-chains/Chain.js');
require('../../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../../domain/entities/MonomerSequenceNode.js');
require('../../../domain/entities/EmptySequenceNode.js');
require('../../../domain/entities/LinkerSequenceNode.js');
require('../../../domain/entities/UnresolvedMonomer.js');
require('../../../domain/entities/UnsplitNucleotide.js');
require('../../../domain/entities/PolymerBond.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
require('../../../domain/entities/Command.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
require('../../../domain/entities/CoreAtom.js');
require('../../../domain/entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/defineProperty');
require('@babel/runtime/helpers/typeof');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
var image = require('../../../domain/constants/image.js');
var multitailArrow = require('../../../domain/constants/multitailArrow.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
require('../../render/renderers/ChemRenderer.js');
require('../../render/renderers/PeptideRenderer.js');
require('../../render/renderers/PhosphateRenderer.js');
require('../../render/renderers/RNABaseRenderer.js');
require('../../render/renderers/SugarRenderer.js');
require('../../render/renderers/UnresolvedMonomerRenderer.js');
require('../../render/renderers/UnsplitNucleotideRenderer.js');
require('../operations/monomer/MonomerHoverOperation.js');
require('../operations/monomer/MonomerItemModifyOperation.js');
require('../operations/monomer/MonomerMoveOperation.js');
require('../operations/monomer/RotateMonomerOperation.js');
require('../operations/monomer/ShiftMonomerOperation.js');
require('../operations/modes/index.js');
require('../operations/monomerCreation/AssignAttachmentAtomOperation.js');
require('../operations/monomerCreation/AssignLeavingGroupAtomOperation.js');
require('../operations/monomerCreation/MarkAsRnaComponentOperation.js');
require('../operations/monomerCreation/ReassignAttachmentPointOperation.js');
require('../operations/monomerCreation/ReassignLeavingAtomOperation.js');
var rgroup$1 = require('./rgroup.js');
var action = require('./action.js');
var atom = require('./atom.js');
var utils = require('./utils.js');
var BondMove = require('../operations/bond/BondMove.js');
var RxnArrowMove = require('../operations/rxn/RxnArrowMove.js');
var RxnPlusMove = require('../operations/rxn/plus/RxnPlusMove.js');
var AtomMove = require('../operations/atom/AtomMove.js');
var SGroupDataMove = require('../operations/sgroup/SGroupDataMove.js');
var FragmentDeleteStereoAtom = require('../operations/FragmentDeleteStereoAtom.js');
var FragmentAdd = require('../operations/FragmentAdd.js');
var FragmentDelete = require('../operations/FragmentDelete.js');

function fromMultipleMove(restruct, lists, d) {
  d = new vec2.Vec2(d);
  var action$1 = new action.Action();
  var struct = restruct.molecule;
  var loops = new pile.Pile();
  var atomsToInvalidate = new pile.Pile();
  if (lists.atoms) {
    var _lists$sgroupData;
    var atomSet = new pile.Pile(lists.atoms);
    var bondlist = [];
    var relatedSgroups = utils.getRelSGroupsBySelection(struct, lists.atoms);
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
      action$1.addOp(new BondMove.BondMove(bond, d));
    });
    loops.forEach(function (loopId) {
      var loop = restruct.reloops.get(loopId);
      if (loop !== null && loop !== void 0 && loop.visel) {
        action$1.addOp(new LoopMove.LoopMove(loopId, d));
      }
    });
    lists.atoms.forEach(function (aid) {
      action$1.addOp(new AtomMove.AtomMove(aid, d, !atomsToInvalidate.has(aid)));
    });
    relatedSgroups.forEach(function (sgroup) {
      sgroup === null || sgroup === void 0 || sgroup.atoms.forEach(function (aid) {
        if (!atomSet.has(aid)) {
          action$1.addOp(new AtomMove.AtomMove(aid, d, true));
        }
      });
    });
    if (((_lists$sgroupData = lists.sgroupData) === null || _lists$sgroupData === void 0 ? void 0 : _lists$sgroupData.length) === 0) {
      relatedSgroups.forEach(function (sg) {
        action$1.addOp(new SGroupDataMove.SGroupDataMove(sg.id, d));
      });
    }
  }
  if (lists.rxnArrows) {
    lists.rxnArrows.forEach(function (rxnArrow) {
      action$1.addOp(new RxnArrowMove.RxnArrowMove(rxnArrow, d, true));
    });
  }
  if (lists.rxnPluses) {
    lists.rxnPluses.forEach(function (rxnPulse) {
      action$1.addOp(new RxnPlusMove.RxnPlusMove(rxnPulse, d, true));
    });
  }
  if (lists.simpleObjects) {
    lists.simpleObjects.forEach(function (simpleObject$1) {
      action$1.addOp(new simpleObject.SimpleObjectMove(simpleObject$1, d, true));
    });
  }
  if (lists.sgroupData) {
    lists.sgroupData.forEach(function (sgData) {
      action$1.addOp(new SGroupDataMove.SGroupDataMove(sgData, d));
    });
  }
  if (lists.enhancedFlags) {
    lists.enhancedFlags.forEach(function (fid) {
      action$1.addOp(new EnhancedFlagMove.EnhancedFlagMove(fid, d));
    });
  }
  if (lists.texts) {
    lists.texts.forEach(function (text) {
      action$1.addOp(new TextMove.TextMove(text, d, true));
    });
  }
  if (lists[image.IMAGE_KEY]) {
    lists[image.IMAGE_KEY].forEach(function (image) {
      action$1.addOp(new imageMove.ImageMove(image, d));
    });
  }
  if (lists[multitailArrow.MULTITAIL_ARROW_KEY]) {
    lists[multitailArrow.MULTITAIL_ARROW_KEY].forEach(function (multitailArrow) {
      action$1.addOp(new multitailArrowMove.MultitailArrowMove(multitailArrow, d));
    });
  }
  return action$1.perform(restruct);
}
function fromStereoFlagUpdate(restruct, frid) {
  var flag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var action$1 = new action.Action();
  if (!flag) {
    var struct = restruct.molecule;
    var frag = restruct.molecule.frags.get(frid);
    if (frag) {
      frag.stereoAtoms.forEach(function (aid) {
        if (struct.atoms.get(aid).stereoLabel === null) {
          action$1.addOp(new FragmentDeleteStereoAtom.FragmentDeleteStereoAtom(frid, aid));
        }
      });
    }
  }
  action$1.addOp(new FragmentStereoFlag.FragmentStereoFlag(frid));
  return action$1.perform(restruct);
}
function processAtom(restruct, aid, frid, newfrid) {
  var queue = [aid];
  var usedIds = new pile.Pile(queue);
  while (queue.length > 0) {
    var id = queue.shift();
    restruct.molecule.atomGetNeighbors(id).forEach(function (nei) {
      if (restruct.molecule.atoms.get(nei.aid).fragment === frid && !usedIds.has(nei.aid)) {
        usedIds.add(nei.aid);
        queue.push(nei.aid);
      }
    });
  }
  return atom.fromAtomsFragmentAttr(restruct, usedIds, newfrid);
}
function fromFragmentSplit(restruct, frid) {
  var rgForRemove = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var action$1 = new action.Action();
  var rgid = rgroup.RGroup.findRGroupByFragment(restruct.molecule.rgroups, frid);
  restruct.molecule.atoms.forEach(function (atom, aid) {
    if (atom.fragment === frid) {
      var newfrid = action$1.addOp(new FragmentAdd.FragmentAdd().perform(restruct)).frid;
      action$1.mergeWith(processAtom(restruct, aid, frid, newfrid));
      if (rgid) action$1.mergeWith(rgroup$1.fromRGroupFragment(restruct, rgid, newfrid));
    }
  });
  if (frid !== -1) {
    action$1.mergeWith(rgroup$1.fromRGroupFragment(restruct, 0, frid));
    action$1.addOp(new FragmentDelete.FragmentDelete(frid).perform(restruct));
    action$1.mergeWith(rgroup$1.fromUpdateIfThen(restruct, 0, rgid, rgForRemove));
  }
  action$1.operations.reverse();
  return action$1;
}

exports.fromFragmentSplit = fromFragmentSplit;
exports.fromMultipleMove = fromMultipleMove;
exports.fromStereoFlagUpdate = fromStereoFlagUpdate;
//# sourceMappingURL=fragment.js.map
