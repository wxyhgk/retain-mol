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
require('../operations/EnhancedFlagMove.js');
require('../operations/EnhancedFlagClear.js');
require('../operations/ifThen.js');
require('../operations/fragment.js');
require('../operations/fragmentStereoAtom.js');
require('../operations/FragmentStereoFlag.js');
var calcimplicitH = require('../operations/calcimplicitH.js');
require('../operations/LoopMove.js');
require('../operations/OperationType.js');
require('../operations/image/imageMove.js');
require('../operations/image/imageResize.js');
var imageUpsertDelete = require('../operations/image/imageUpsertDelete.js');
require('../operations/multitailArrow/multitailArrowAddRemoveTail.js');
require('../operations/multitailArrow/multitailArrowMove.js');
require('../operations/multitailArrow/multitailArrowMoveHeadTail.js');
require('../operations/multitailArrow/multitailArrowResizeTailHead.js');
var multitailArrowUpsertDelete = require('../operations/multitailArrow/multitailArrowUpsertDelete.js');
require('../operations/rgroup/RGroupAttr.js');
var RGroupFragment = require('../operations/rgroup/RGroupFragment.js');
require('../operations/rgroupAttachmentPoint/index.js');
var index = require('../operations/rxn/index.js');
var simpleObject = require('../operations/simpleObject.js');
require('../operations/sgroup/index.js');
var TextCreateDelete = require('../operations/Text/TextCreateDelete.js');
require('../operations/Text/TextUpdate.js');
require('../operations/Text/TextMove.js');
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
require('../../../domain/entities/rgroup.js');
require('../../../domain/entities/rgroupAttachmentPoint.js');
require('../../../domain/entities/rxnArrow.js');
require('../../../domain/entities/rxnPlus.js');
var sgroup = require('../../../domain/entities/sgroup.js');
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
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var getOrThrow = require('../../../utilities/getOrThrow.js');
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
var rgroup = require('./rgroup.js');
var action = require('./action.js');
var actionTransaction = require('./actionTransaction.js');
var sgroup$1 = require('./sgroup.js');
var rgroupAttachmentPoint = require('./rgroupAttachmentPoint.js');
var FragmentSetProperties = require('../operations/FragmentSetProperties.js');
var index$1 = require('../operations/rxn/plus/index.js');
var FragmentAdd = require('../operations/FragmentAdd.js');
var AtomAdd = require('../operations/atom/AtomAdd.js');
var FragmentAddStereoAtom = require('../operations/FragmentAddStereoAtom.js');
var BondAdd = require('../operations/bond/BondAdd.js');
var BondAttr = require('../operations/bond/BondAttr.js');
var AtomAttr = require('../operations/atom/AtomAttr.js');

function fromPaste(restruct, pstruct, point) {
  var angle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var needMoveFromTopLeftPoint = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var xy0 = needMoveFromTopLeftPoint ? pstruct.getCoordBoundingBox().min : getStructCenter(pstruct);
  var offset = vec2.Vec2.diff(point, xy0);
  var action$1 = new action.Action();
  var aidMap = new Map();
  var fridMap = new Map();
  var pasteItems = {
    atoms: [],
    bonds: []
  };
  var items = {
    atoms: [],
    bonds: [],
    rxnArrows: [],
    rxnPluses: [],
    texts: [],
    images: [],
    simpleObjects: [],
    multitailArrows: []
  };
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    pstruct.atoms.forEach(function (atom, aid) {
      var fragmentId = atom.fragment;
      var isMacromoleculeAtom = pstruct.isAtomFromMacromolecule(aid);
      if (fragmentId !== undefined && fragmentId !== null && !fridMap.has(fragmentId) && !isMacromoleculeAtom) {
        var fragment = pstruct.frags.get(fragmentId);
        if (fragment === undefined || fragment === null) {
          var errorMessage = "Fragment not found for pasted atom fragment ".concat(fragmentId);
          KetcherLogger.KetcherLogger.error("paste.ts::fromPaste: ".concat(errorMessage));
          throw new Error(errorMessage);
        }
        var fragmentAdd = action$1.addOp(transaction.capture(new FragmentAdd.FragmentAdd(null, fragment.properties).perform(restruct)));
        if (fragmentAdd.frid === null) {
          var _errorMessage = 'FragmentAdd did not create a fragment ID during paste';
          KetcherLogger.KetcherLogger.error("paste.ts::fromPaste: ".concat(_errorMessage));
          throw new Error(_errorMessage);
        }
        fridMap.set(fragmentId, fragmentAdd.frid);
      }
      var mappedFragmentId;
      if (fragmentId !== undefined) {
        mappedFragmentId = fridMap.get(fragmentId);
      }
      var tmpAtom = Object.assign(atom.clone(), {
        fragment: mappedFragmentId
      });
      var operation = transaction.capture(new AtomAdd.AtomAdd(tmpAtom, vec2.Vec2.diff(atom.pp, xy0).rotate(angle).add(point)).perform(restruct));
      action$1.addOp(operation);
      aidMap.set(aid, operation.data.aid);
      pasteItems.atoms.push(operation.data.aid);
      items.atoms.push(operation.data.aid);
      var attachmentPointAction = rgroupAttachmentPoint.fromRGroupAttachmentPointAddition(restruct, tmpAtom.attachmentPoints, operation.data.aid);
      transaction.capture(attachmentPointAction);
      action$1.mergeWith(attachmentPointAction);
    });
    pstruct.frags.forEach(function (frag, frid) {
      if (!frag) return;
      if (frag.properties) {
        var newFragmentId = fridMap.get(frid);
        if (newFragmentId === undefined) {
          throw new Error("Fragment ".concat(frid, " is missing from fridMap during paste"));
        }
        action$1.addOp(transaction.capture(new FragmentSetProperties.FragmentSetProperties(newFragmentId, frag.properties).perform(restruct)));
      }
      frag.stereoAtoms.forEach(function (aid) {
        var newFragmentId = fridMap.get(frid);
        var newStereoAtomId = aidMap.get(aid);
        if (newFragmentId === undefined) {
          throw new Error("Fragment ".concat(frid, " is missing for stereo atom paste operation"));
        }
        if (newStereoAtomId === undefined) {
          throw new Error("Atom ".concat(aid, " is missing from aidMap during paste"));
        }
        action$1.addOp(transaction.capture(new FragmentAddStereoAtom.FragmentAddStereoAtom(newFragmentId, newStereoAtomId).perform(restruct)));
      });
    });
    pstruct.bonds.forEach(function (bond) {
      var operation = transaction.capture(new BondAdd.BondAdd(aidMap.get(bond.begin), aidMap.get(bond.end), bond, false).perform(restruct));
      action$1.addOp(operation);
      pasteItems.bonds.push(operation.data.bid);
      items.bonds.push(operation.data.bid);
      transaction.capture(new BondAttr.BondAttr(operation.data.bid, 'isPreview', isPreview, false).perform(restruct));
    });
    pstruct.sgroups.forEach(function (sg) {
      var newsgid = restruct.molecule.sgroups.newId();
      var sgAtoms = sg.atoms.map(function (aid) {
        return aidMap.get(aid);
      });
      var attachmentPoints = function () {
        try {
          return sg.cloneAttachmentPoints(aidMap);
        } catch (_e) {
          return [];
        }
      }();
      if (sg.isNotContractible(pstruct) && !(sg instanceof monomerMicromolecule.MonomerMicromolecule) && !sgroup.SGroup.isSuperAtom(sg)) {
        sg.setAttr('expanded', true);
      }
      var sgAction = sgroup$1.fromSgroupAddition(restruct, sg.type, sgAtoms, sg.data, newsgid, attachmentPoints, sg.pp ? sg.pp.add(offset) : null, sg.type === 'SUP' ? sg.isExpanded() : null, sg.data.name, sg);
      transaction.capture(sgAction);
      sgAction.operations.reverse();
      sgAction.operations.forEach(function (oper) {
        action$1.addOp(oper);
      });
    });
    pasteItems.atoms.forEach(function (aid) {
      action$1.addOp(transaction.capture(new calcimplicitH.CalcImplicitH([aid]).perform(restruct)));
      transaction.capture(new AtomAttr.AtomAttr(aid, 'isPreview', isPreview).perform(restruct));
    });
    pstruct.rxnArrows.forEach(function (rxnArrow) {
      var operation = transaction.capture(new index.RxnArrowAdd(rxnArrow.pos.map(function (p) {
        return p.add(offset);
      }), rxnArrow.mode, undefined, rxnArrow.height).perform(restruct));
      action$1.addOp(operation);
      var rxnArrowId = operation.data.id;
      if (rxnArrowId != null) {
        items.rxnArrows.push(rxnArrowId);
      }
    });
    pstruct.rxnPluses.forEach(function (plus) {
      var operation = transaction.capture(new index$1.RxnPlusAdd(plus.pp.add(offset)).perform(restruct));
      action$1.addOp(operation);
      if (operation.data.plid !== null) {
        items.rxnPluses.push(operation.data.plid);
      }
    });
    pstruct.simpleObjects.forEach(function (simpleObject$1) {
      var operation = transaction.capture(new simpleObject.SimpleObjectAdd(simpleObject$1.pos.map(function (p) {
        return p.add(offset);
      }), simpleObject$1.mode).perform(restruct));
      action$1.addOp(operation);
      items.simpleObjects.push(operation.data.id);
    });
    pstruct.texts.forEach(function (text) {
      var operation = transaction.capture(new TextCreateDelete.TextCreate(text.content, text.position.add(offset), text.pos.map(function (p) {
        return p.add(offset);
      })).perform(restruct));
      action$1.addOp(operation);
      items.texts.push(operation.data.id);
    });
    pstruct.images.forEach(function (image) {
      var clonedImage = image.clone();
      clonedImage.addPositionOffset(offset);
      var operation = transaction.capture(new imageUpsertDelete.ImageUpsert(clonedImage).perform(restruct));
      action$1.addOp(operation);
      items.images.push(operation.data.id);
    });
    pstruct.multitailArrows.forEach(function (multitailArrow) {
      var clonedMultitailArrow = multitailArrow.clone();
      clonedMultitailArrow.move(offset);
      var operation = transaction.capture(new multitailArrowUpsertDelete.MultitailArrowUpsert(clonedMultitailArrow).perform(restruct));
      action$1.addOp(operation);
      items.multitailArrows.push(operation.data.id);
    });
    pstruct.rgroups.forEach(function (rg, rgid) {
      rg.frags.forEach(function (__frag, frid) {
        var newFragmentId = fridMap.get(frid);
        if (newFragmentId === undefined) {
          throw new Error("Fragment ".concat(frid, " is missing for R-group paste mapping"));
        }
        action$1.addOp(transaction.capture(new RGroupFragment.RGroupFragment(rgid, newFragmentId).perform(restruct)));
      });
      var ifThen = rg.ifthen;
      var safeIfThenId = pstruct.rgroups.get(ifThen) ? ifThen : 0;
      var attrsAction = rgroup.fromRGroupAttrs(restruct, rgid, rg.getAttrs());
      transaction.capture(attrsAction);
      action$1.mergeWith(attrsAction);
      var ifThenAction = rgroup.fromUpdateIfThen(restruct, safeIfThenId, rg.ifthen);
      transaction.capture(ifThenAction);
      action$1.mergeWith(ifThenAction);
    });
    action$1.operations.reverse();
    transaction.commit();
    return [action$1, pasteItems, items];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function getStructCenter(struct) {
  var isOnlyOneSGroup = struct.sgroups.size === 1;
  if (isOnlyOneSGroup) {
    var sgroupIterator = struct.sgroups.keys().next();
    if (!sgroupIterator.done) {
      var onlyOneStructsSgroupId = sgroupIterator.value;
      var sgroup = struct.sgroups.get(onlyOneStructsSgroupId);
      if (sgroup !== null && sgroup !== void 0 && sgroup.isContracted()) {
        return sgroup.getContractedPosition(struct).position;
      }
    }
  }
  if (struct.atoms.size > 0) {
    var xmin = 1e50;
    var ymin = xmin;
    var xmax = -xmin;
    var ymax = -ymin;
    struct.atoms.forEach(function (atom) {
      xmin = Math.min(xmin, atom.pp.x);
      ymin = Math.min(ymin, atom.pp.y);
      xmax = Math.max(xmax, atom.pp.x);
      ymax = Math.max(ymax, atom.pp.y);
    });
    return new vec2.Vec2((xmin + xmax) / 2, (ymin + ymax) / 2);
  }
  if (struct.rxnArrows.size > 0) {
    var rxnArrow = getOrThrow.getOrThrow(struct.rxnArrows, 0, 'getStructCenter: rxnArrows pool is missing id 0');
    return rxnArrow.center();
  }
  if (struct.rxnPluses.size > 0) {
    var rxnPlus = getOrThrow.getOrThrow(struct.rxnPluses, 0, 'getStructCenter: rxnPluses pool is missing id 0');
    return rxnPlus.pp;
  }
  if (struct.simpleObjects.size > 0) {
    var simpleObject = getOrThrow.getOrThrow(struct.simpleObjects, 0, 'getStructCenter: simpleObjects pool is missing id 0');
    return simpleObject.center();
  }
  if (struct.texts.size > 0) {
    var text = getOrThrow.getOrThrow(struct.texts, 0, 'getStructCenter: texts pool is missing id 0');
    return text.position;
  }
  if (struct.images.size > 0) {
    var image = getOrThrow.getOrThrow(struct.images, 0, 'getStructCenter: images pool is missing id 0');
    return image.center();
  }
  if (struct.multitailArrows.size > 0) {
    var multitailArrow = getOrThrow.getOrThrow(struct.multitailArrows, 0, 'getStructCenter: multitailArrows pool is missing id 0');
    return multitailArrow.center();
  }
  return new vec2.Vec2(0, 0);
}

exports.fromPaste = fromPaste;
//# sourceMappingURL=paste.js.map
