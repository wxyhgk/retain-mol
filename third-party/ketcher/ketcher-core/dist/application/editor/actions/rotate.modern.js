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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import '../operations/atom/index.modern.js';
import '../operations/bond/index.modern.js';
import '../operations/CanvasLoad.modern.js';
import '../operations/descriptors.modern.js';
import { EnhancedFlagMove } from '../operations/EnhancedFlagMove.modern.js';
import { EnhancedFlagClear } from '../operations/EnhancedFlagClear.modern.js';
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
import { TextMove } from '../operations/Text/TextMove.modern.js';
import '../operations/monomer/AttachmentPointHoverOperation.modern.js';
import { FlipMonomerOperation } from '../operations/monomer/FlipMonomerOperation.modern.js';
import '../operations/monomer/MonomerAddOperation.modern.js';
import '../operations/monomer/MonomerDeleteOperation.modern.js';
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/helpers/monomers.modern.js';
import '../../render/renderers/AmbiguousMonomerRenderer.modern.js';
import '@babel/runtime/helpers/toConsumableArray';
import '../../../domain/entities/atom.modern.js';
import '../../../domain/entities/atomList.modern.js';
import { Bond } from '../../../domain/entities/bond.modern.js';
import '../../../domain/entities/fixedPrecision.modern.js';
import { Fragment } from '../../../domain/entities/fragment.modern.js';
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
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import '../../../domain/entities/box2Abs.modern.js';
import '../../../domain/entities/pool.modern.js';
import '../../../domain/entities/image.modern.js';
import '../../../domain/entities/multitailArrow.modern.js';
import '../../../domain/entities/highlight.modern.js';
import '../../../domain/entities/sGroupAttachmentPoint.modern.js';
import { MonomerMicromolecule } from '../../../domain/entities/monomerMicromolecule.modern.js';
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
import { structSelection, getRelSGroupsBySelection } from './utils.modern.js';
import { Action } from './action.modern.js';
import { flipPointByCenter, rotateDelta } from '../shared/utils.modern.js';
import { RxnArrowRotate } from '../operations/rxn/RxnArrowRotate.modern.js';
import { RxnArrowMove } from '../operations/rxn/RxnArrowMove.modern.js';
import { RxnPlusMove } from '../operations/rxn/plus/RxnPlusMove.modern.js';
import { BondAttr } from '../operations/bond/BondAttr.modern.js';
import { AtomMove } from '../operations/atom/AtomMove.modern.js';
import { SGroupDataMove } from '../operations/sgroup/SGroupDataMove.modern.js';

function fromFlip(reStruct, selection, flipDirection, center) {
  var action = new Action();
  var structToFlip = selection !== null && selection !== void 0 ? selection : structSelection(reStruct.molecule);
  action.mergeWith(fromStructureFlip(reStruct, structToFlip, flipDirection, center));
  if (structToFlip.rxnArrows) {
    action.mergeWith(fromRxnArrowFlip(reStruct, structToFlip.rxnArrows, flipDirection, center));
  }
  if (structToFlip.rxnPluses) {
    action.mergeWith(fromRxnPlusFlip(reStruct, structToFlip.rxnPluses, flipDirection, center));
  }
  if (structToFlip.texts) {
    action.mergeWith(fromTextFlip(reStruct, structToFlip.texts, flipDirection, center));
  }
  if (structToFlip.enhancedFlags) {
    action.mergeWith(fromEnhancedFlagsFlip(reStruct, structToFlip.enhancedFlags));
  }
  return action;
}
function fromRxnArrowFlip(reStruct, rxnArrowIds, flipDirection, center) {
  var action = new Action();
  rxnArrowIds.forEach(function (arrowId) {
    var rxnArrow = reStruct.molecule.rxnArrows.get(arrowId);
    if (!rxnArrow) {
      return;
    }
    var _rxnArrow$pos = _slicedToArray(rxnArrow.pos, 2),
      start = _rxnArrow$pos[0],
      end = _rxnArrow$pos[1];
    var oxAngle = end.sub(start).oxAngle();
    var oyAngle = oxAngle - Math.PI / 2;
    var rotateAngle = flipDirection === 'vertical' ? -2 * oxAngle : -2 * oyAngle;
    action.addOp(new RxnArrowRotate(arrowId, rotateAngle, rxnArrow.center()));
    var difference = flipPointByCenter(rxnArrow.center(), center, flipDirection);
    action.addOp(new RxnArrowMove(arrowId, difference));
  });
  return action.perform(reStruct);
}
function fromRxnPlusFlip(reStruct, rxnPlusIds, flipDirection, center) {
  var action = new Action();
  rxnPlusIds.forEach(function (plusId) {
    var rxnPlus = reStruct.molecule.rxnPluses.get(plusId);
    if (!rxnPlus) {
      return;
    }
    var difference = flipPointByCenter(rxnPlus.pp, center, flipDirection);
    action.addOp(new RxnPlusMove(plusId, difference));
  });
  return action.perform(reStruct);
}
function fromTextFlip(reStruct, textIds, flipDirection, center) {
  var action = new Action();
  textIds.forEach(function (textId) {
    var text = reStruct.molecule.texts.get(textId);
    if (!text) {
      return;
    }
    var textMiddleLeft = text.pos[0];
    var textMiddleRight = text.pos[2];
    var textCenter = Vec2.centre(textMiddleLeft, textMiddleRight);
    var difference = flipPointByCenter(textCenter, center, flipDirection);
    action.addOp(new TextMove(textId, difference));
  });
  return action.perform(reStruct);
}
function fromEnhancedFlagsFlip(reStruct, enhancedFlagIds, _flipDirection, _center) {
  var action = new Action();
  enhancedFlagIds.forEach(function (flagId) {
    var frId = flagId;
    var frag = reStruct.molecule.frags.get(frId);
    if (!frag) {
      return;
    }
    action.addOp(new EnhancedFlagClear(flagId));
  });
  return action.perform(reStruct);
}
var flipBonds = function flipBonds(bondIds, struct, action) {
  bondIds.forEach(function (bondId) {
    var bond = struct.bonds.get(bondId);
    if (!bond) {
      return;
    }
    if (bond.type !== Bond.PATTERN.TYPE.SINGLE) {
      return;
    }
    if (bond.stereo === Bond.PATTERN.STEREO.UP) {
      action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.DOWN));
      return;
    }
    if (bond.stereo === Bond.PATTERN.STEREO.DOWN) {
      action.addOp(new BondAttr(bondId, 'stereo', Bond.PATTERN.STEREO.UP));
    }
  });
};
function fromStructureFlip(reStruct, selection, flipDirection, center) {
  var _selection$atoms, _selection$atoms2;
  var struct = reStruct.molecule;
  var action = new Action();
  selection === null || selection === void 0 || (_selection$atoms = selection.atoms) === null || _selection$atoms === void 0 || _selection$atoms.forEach(function (atomId) {
    var atom = struct.atoms.get(atomId);
    if (!atom) {
      return;
    }
    var difference = flipPointByCenter(atom.pp, center, flipDirection);
    action.addOp(new AtomMove(atomId, difference));
  });
  var sGroups = getRelSGroupsBySelection(struct, (_selection$atoms2 = selection === null || selection === void 0 ? void 0 : selection.atoms) !== null && _selection$atoms2 !== void 0 ? _selection$atoms2 : []);
  sGroups.forEach(function (sGroup) {
    if (!sGroup.pp) {
      return;
    }
    var difference = flipPointByCenter(sGroup.pp, center, flipDirection);
    action.addOp(new SGroupDataMove(sGroup.id, difference));
    if (sGroup instanceof MonomerMicromolecule) {
      action.addOp(new FlipMonomerOperation({
        id: sGroup.id,
        value: flipDirection
      }));
    }
  });
  if (selection !== null && selection !== void 0 && selection.bonds) {
    flipBonds(selection.bonds, struct, action);
  }
  return action.perform(reStruct);
}
function fromRotate(restruct, selection, center, angle) {
  var struct = restruct.molecule;
  var action = new Action();
  if (!selection) {
    selection = structSelection(struct);
  }
  if (selection.atoms) {
    selection.atoms.forEach(function (aid) {
      var atom = struct.atoms.get(aid);
      if (!atom) return;
      action.addOp(new AtomMove(aid, rotateDelta(atom.pp, center, angle)));
    });
    if (!selection.sgroupData) {
      var sgroups = getRelSGroupsBySelection(struct, selection.atoms);
      sgroups.forEach(function (sg) {
        if (!sg.pp) {
          return;
        }
        action.addOp(new SGroupDataMove(sg.id, rotateDelta(sg.pp, center, angle)));
      });
    }
  }
  if (selection.rxnArrows) {
    selection.rxnArrows.forEach(function (arrowId) {
      action.addOp(new RxnArrowRotate(arrowId, angle, center));
    });
  }
  if (selection.rxnPluses) {
    selection.rxnPluses.forEach(function (pid) {
      var plus = struct.rxnPluses.get(pid);
      action.addOp(new RxnPlusMove(pid, rotateDelta(plus.pp, center, angle)));
    });
  }
  if (selection.texts) {
    selection.texts.forEach(function (textId) {
      var text = struct.texts.get(textId);
      action.addOp(new TextMove(textId, rotateDelta(text.position, center, angle)));
    });
  }
  if (selection.sgroupData) {
    selection.sgroupData.forEach(function (did) {
      var data = struct.sgroups.get(did);
      action.addOp(new SGroupDataMove(did, rotateDelta(data.pp, center, angle)));
    });
  }
  if (selection.enhancedFlags) {
    selection.enhancedFlags.forEach(function (flagId) {
      var frId = flagId;
      var frag = restruct.molecule.frags.get(frId);
      action.addOp(new EnhancedFlagMove(flagId, rotateDelta(frag.stereoFlagPosition || Fragment.getDefaultStereoFlagPosition(restruct.molecule, frId), center, angle)));
    });
  }
  return action.perform(restruct);
}

export { flipBonds, fromFlip, fromRotate };
//# sourceMappingURL=rotate.modern.js.map
