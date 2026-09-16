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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
require('../operations/atom/index.js');
require('../operations/bond/index.js');
require('../operations/CanvasLoad.js');
require('../operations/descriptors.js');
var EnhancedFlagMove = require('../operations/EnhancedFlagMove.js');
var EnhancedFlagClear = require('../operations/EnhancedFlagClear.js');
require('../operations/ifThen.js');
require('../operations/fragment.js');
require('../operations/fragmentStereoAtom.js');
require('../operations/FragmentStereoFlag.js');
require('../operations/calcimplicitH.js');
require('../operations/LoopMove.js');
require('../operations/OperationType.js');
require('../operations/image/imageMove.js');
require('../operations/image/imageResize.js');
require('../operations/image/imageUpsertDelete.js');
require('../operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('../operations/multitailArrow/multitailArrowMove.js');
require('../operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('../operations/multitailArrow/multitailArrowResizeTailHead.js');
require('../operations/multitailArrow/multitailArrowUpsertDelete.js');
require('../operations/rgroup/RGroupAttr.js');
require('../operations/rgroup/RGroupFragment.js');
require('../operations/rgroupAttachmentPoint/index.js');
require('../operations/rxn/index.js');
require('../operations/simpleObject.js');
require('../operations/sgroup/index.js');
require('../operations/Text/TextCreateDelete.js');
require('../operations/Text/TextUpdate.js');
var TextMove = require('../operations/Text/TextMove.js');
require('../operations/monomer/AttachmentPointHoverOperation.js');
var FlipMonomerOperation = require('../operations/monomer/FlipMonomerOperation.js');
require('../operations/monomer/MonomerAddOperation.js');
require('../operations/monomer/MonomerDeleteOperation.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/helpers/monomers.js');
require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../domain/entities/atom.js');
require('../../../domain/entities/atomList.js');
var bond = require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
var fragment = require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
require('../../../domain/entities/sgroup.js');
require('../../../domain/entities/sgroupForest.js');
require('../../../domain/entities/simpleObject.js');
require('../../../domain/entities/struct.js');
require('../../../domain/entities/text.js');
require('../../../domain/entities/pile.js');
var vec2 = require('../../../domain/entities/vec2.js');
require('../../../domain/entities/box2Abs.js');
require('../../../domain/entities/pool.js');
require('../../../domain/entities/image.js');
require('../../../domain/entities/multitailArrow.js');
require('../../../domain/entities/highlight.js');
require('../../../domain/entities/sGroupAttachmentPoint.js');
var monomerMicromolecule = require('../../../domain/entities/monomerMicromolecule.js');
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
var utils = require('./utils.js');
var action = require('./action.js');
var utils$1 = require('../shared/utils.js');
var RxnArrowRotate = require('../operations/rxn/RxnArrowRotate.js');
var RxnArrowMove = require('../operations/rxn/RxnArrowMove.js');
var RxnPlusMove = require('../operations/rxn/plus/RxnPlusMove.js');
var BondAttr = require('../operations/bond/BondAttr.js');
var AtomMove = require('../operations/atom/AtomMove.js');
var SGroupDataMove = require('../operations/sgroup/SGroupDataMove.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function fromFlip(reStruct, selection, flipDirection, center) {
  var action$1 = new action.Action();
  var structToFlip = selection !== null && selection !== void 0 ? selection : utils.structSelection(reStruct.molecule);
  action$1.mergeWith(fromStructureFlip(reStruct, structToFlip, flipDirection, center));
  if (structToFlip.rxnArrows) {
    action$1.mergeWith(fromRxnArrowFlip(reStruct, structToFlip.rxnArrows, flipDirection, center));
  }
  if (structToFlip.rxnPluses) {
    action$1.mergeWith(fromRxnPlusFlip(reStruct, structToFlip.rxnPluses, flipDirection, center));
  }
  if (structToFlip.texts) {
    action$1.mergeWith(fromTextFlip(reStruct, structToFlip.texts, flipDirection, center));
  }
  if (structToFlip.enhancedFlags) {
    action$1.mergeWith(fromEnhancedFlagsFlip(reStruct, structToFlip.enhancedFlags));
  }
  return action$1;
}
function fromRxnArrowFlip(reStruct, rxnArrowIds, flipDirection, center) {
  var action$1 = new action.Action();
  rxnArrowIds.forEach(function (arrowId) {
    var rxnArrow = reStruct.molecule.rxnArrows.get(arrowId);
    if (!rxnArrow) {
      return;
    }
    var _rxnArrow$pos = _slicedToArray__default["default"](rxnArrow.pos, 2),
      start = _rxnArrow$pos[0],
      end = _rxnArrow$pos[1];
    var oxAngle = end.sub(start).oxAngle();
    var oyAngle = oxAngle - Math.PI / 2;
    var rotateAngle = flipDirection === 'vertical' ? -2 * oxAngle : -2 * oyAngle;
    action$1.addOp(new RxnArrowRotate.RxnArrowRotate(arrowId, rotateAngle, rxnArrow.center()));
    var difference = utils$1.flipPointByCenter(rxnArrow.center(), center, flipDirection);
    action$1.addOp(new RxnArrowMove.RxnArrowMove(arrowId, difference));
  });
  return action$1.perform(reStruct);
}
function fromRxnPlusFlip(reStruct, rxnPlusIds, flipDirection, center) {
  var action$1 = new action.Action();
  rxnPlusIds.forEach(function (plusId) {
    var rxnPlus = reStruct.molecule.rxnPluses.get(plusId);
    if (!rxnPlus) {
      return;
    }
    var difference = utils$1.flipPointByCenter(rxnPlus.pp, center, flipDirection);
    action$1.addOp(new RxnPlusMove.RxnPlusMove(plusId, difference));
  });
  return action$1.perform(reStruct);
}
function fromTextFlip(reStruct, textIds, flipDirection, center) {
  var action$1 = new action.Action();
  textIds.forEach(function (textId) {
    var text = reStruct.molecule.texts.get(textId);
    if (!text) {
      return;
    }
    var textMiddleLeft = text.pos[0];
    var textMiddleRight = text.pos[2];
    var textCenter = vec2.Vec2.centre(textMiddleLeft, textMiddleRight);
    var difference = utils$1.flipPointByCenter(textCenter, center, flipDirection);
    action$1.addOp(new TextMove.TextMove(textId, difference));
  });
  return action$1.perform(reStruct);
}
function fromEnhancedFlagsFlip(reStruct, enhancedFlagIds, _flipDirection, _center) {
  var action$1 = new action.Action();
  enhancedFlagIds.forEach(function (flagId) {
    var frId = flagId;
    var frag = reStruct.molecule.frags.get(frId);
    if (!frag) {
      return;
    }
    action$1.addOp(new EnhancedFlagClear.EnhancedFlagClear(flagId));
  });
  return action$1.perform(reStruct);
}
var flipBonds = function flipBonds(bondIds, struct, action) {
  bondIds.forEach(function (bondId) {
    var bond$1 = struct.bonds.get(bondId);
    if (!bond$1) {
      return;
    }
    if (bond$1.type !== bond.Bond.PATTERN.TYPE.SINGLE) {
      return;
    }
    if (bond$1.stereo === bond.Bond.PATTERN.STEREO.UP) {
      action.addOp(new BondAttr.BondAttr(bondId, 'stereo', bond.Bond.PATTERN.STEREO.DOWN));
      return;
    }
    if (bond$1.stereo === bond.Bond.PATTERN.STEREO.DOWN) {
      action.addOp(new BondAttr.BondAttr(bondId, 'stereo', bond.Bond.PATTERN.STEREO.UP));
    }
  });
};
function fromStructureFlip(reStruct, selection, flipDirection, center) {
  var _selection$atoms, _selection$atoms2;
  var struct = reStruct.molecule;
  var action$1 = new action.Action();
  selection === null || selection === void 0 || (_selection$atoms = selection.atoms) === null || _selection$atoms === void 0 || _selection$atoms.forEach(function (atomId) {
    var atom = struct.atoms.get(atomId);
    if (!atom) {
      return;
    }
    var difference = utils$1.flipPointByCenter(atom.pp, center, flipDirection);
    action$1.addOp(new AtomMove.AtomMove(atomId, difference));
  });
  var sGroups = utils.getRelSGroupsBySelection(struct, (_selection$atoms2 = selection === null || selection === void 0 ? void 0 : selection.atoms) !== null && _selection$atoms2 !== void 0 ? _selection$atoms2 : []);
  sGroups.forEach(function (sGroup) {
    if (!sGroup.pp) {
      return;
    }
    var difference = utils$1.flipPointByCenter(sGroup.pp, center, flipDirection);
    action$1.addOp(new SGroupDataMove.SGroupDataMove(sGroup.id, difference));
    if (sGroup instanceof monomerMicromolecule.MonomerMicromolecule) {
      action$1.addOp(new FlipMonomerOperation.FlipMonomerOperation({
        id: sGroup.id,
        value: flipDirection
      }));
    }
  });
  if (selection !== null && selection !== void 0 && selection.bonds) {
    flipBonds(selection.bonds, struct, action$1);
  }
  return action$1.perform(reStruct);
}
function fromRotate(restruct, selection, center, angle) {
  var struct = restruct.molecule;
  var action$1 = new action.Action();
  if (!selection) {
    selection = utils.structSelection(struct);
  }
  if (selection.atoms) {
    selection.atoms.forEach(function (aid) {
      var atom = struct.atoms.get(aid);
      if (!atom) return;
      action$1.addOp(new AtomMove.AtomMove(aid, utils$1.rotateDelta(atom.pp, center, angle)));
    });
    if (!selection.sgroupData) {
      var sgroups = utils.getRelSGroupsBySelection(struct, selection.atoms);
      sgroups.forEach(function (sg) {
        if (!sg.pp) {
          return;
        }
        action$1.addOp(new SGroupDataMove.SGroupDataMove(sg.id, utils$1.rotateDelta(sg.pp, center, angle)));
      });
    }
  }
  if (selection.rxnArrows) {
    selection.rxnArrows.forEach(function (arrowId) {
      action$1.addOp(new RxnArrowRotate.RxnArrowRotate(arrowId, angle, center));
    });
  }
  if (selection.rxnPluses) {
    selection.rxnPluses.forEach(function (pid) {
      var plus = struct.rxnPluses.get(pid);
      action$1.addOp(new RxnPlusMove.RxnPlusMove(pid, utils$1.rotateDelta(plus.pp, center, angle)));
    });
  }
  if (selection.texts) {
    selection.texts.forEach(function (textId) {
      var text = struct.texts.get(textId);
      action$1.addOp(new TextMove.TextMove(textId, utils$1.rotateDelta(text.position, center, angle)));
    });
  }
  if (selection.sgroupData) {
    selection.sgroupData.forEach(function (did) {
      var data = struct.sgroups.get(did);
      action$1.addOp(new SGroupDataMove.SGroupDataMove(did, utils$1.rotateDelta(data.pp, center, angle)));
    });
  }
  if (selection.enhancedFlags) {
    selection.enhancedFlags.forEach(function (flagId) {
      var frId = flagId;
      var frag = restruct.molecule.frags.get(frId);
      action$1.addOp(new EnhancedFlagMove.EnhancedFlagMove(flagId, utils$1.rotateDelta(frag.stereoFlagPosition || fragment.Fragment.getDefaultStereoFlagPosition(restruct.molecule, frId), center, angle)));
    });
  }
  return action$1.perform(restruct);
}

exports.flipBonds = flipBonds;
exports.fromFlip = fromFlip;
exports.fromRotate = fromRotate;
//# sourceMappingURL=rotate.js.map
