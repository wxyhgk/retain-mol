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
import { ImageUpsert } from '../operations/image/imageUpsertDelete.modern.js';
import '../operations/multitailArrow/multitailArrowAddRemoveTail.modern.js';
import '../operations/multitailArrow/multitailArrowMove.modern.js';
import '../operations/multitailArrow/multitailArrowMoveHeadTail.modern.js';
import '../operations/multitailArrow/multitailArrowResizeTailHead.modern.js';
import { MultitailArrowUpsert } from '../operations/multitailArrow/multitailArrowUpsertDelete.modern.js';
import '../operations/rgroup/RGroupAttr.modern.js';
import { RGroupFragment } from '../operations/rgroup/RGroupFragment.modern.js';
import '../operations/rgroupAttachmentPoint/index.modern.js';
import { RxnArrowAdd } from '../operations/rxn/index.modern.js';
import { SimpleObjectAdd } from '../operations/simpleObject.modern.js';
import '../operations/sgroup/index.modern.js';
import { TextCreate } from '../operations/Text/TextCreateDelete.modern.js';
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
import { SGroup } from '../../../domain/entities/sgroup.modern.js';
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
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { getOrThrow } from '../../../utilities/getOrThrow.modern.js';
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
import { fromRGroupAttrs, fromUpdateIfThen } from './rgroup.modern.js';
import { Action } from './action.modern.js';
import { ActionTransaction } from './actionTransaction.modern.js';
import { fromSgroupAddition } from './sgroup.modern.js';
import { fromRGroupAttachmentPointAddition } from './rgroupAttachmentPoint.modern.js';
import { FragmentSetProperties } from '../operations/FragmentSetProperties.modern.js';
import { RxnPlusAdd } from '../operations/rxn/plus/index.modern.js';
import { FragmentAdd } from '../operations/FragmentAdd.modern.js';
import { AtomAdd } from '../operations/atom/AtomAdd.modern.js';
import { FragmentAddStereoAtom } from '../operations/FragmentAddStereoAtom.modern.js';
import { BondAdd } from '../operations/bond/BondAdd.modern.js';
import { BondAttr } from '../operations/bond/BondAttr.modern.js';
import { AtomAttr } from '../operations/atom/AtomAttr.modern.js';

function fromPaste(restruct, pstruct, point) {
  var angle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var needMoveFromTopLeftPoint = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var xy0 = needMoveFromTopLeftPoint ? pstruct.getCoordBoundingBox().min : getStructCenter(pstruct);
  var offset = Vec2.diff(point, xy0);
  var action = new Action();
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
  var transaction = new ActionTransaction(restruct);
  try {
    pstruct.atoms.forEach(function (atom, aid) {
      var fragmentId = atom.fragment;
      var isMacromoleculeAtom = pstruct.isAtomFromMacromolecule(aid);
      if (fragmentId !== undefined && fragmentId !== null && !fridMap.has(fragmentId) && !isMacromoleculeAtom) {
        var fragment = pstruct.frags.get(fragmentId);
        if (fragment === undefined || fragment === null) {
          var errorMessage = "Fragment not found for pasted atom fragment ".concat(fragmentId);
          KetcherLogger.error("paste.ts::fromPaste: ".concat(errorMessage));
          throw new Error(errorMessage);
        }
        var fragmentAdd = action.addOp(transaction.capture(new FragmentAdd(null, fragment.properties).perform(restruct)));
        if (fragmentAdd.frid === null) {
          var _errorMessage = 'FragmentAdd did not create a fragment ID during paste';
          KetcherLogger.error("paste.ts::fromPaste: ".concat(_errorMessage));
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
      var operation = transaction.capture(new AtomAdd(tmpAtom, Vec2.diff(atom.pp, xy0).rotate(angle).add(point)).perform(restruct));
      action.addOp(operation);
      aidMap.set(aid, operation.data.aid);
      pasteItems.atoms.push(operation.data.aid);
      items.atoms.push(operation.data.aid);
      var attachmentPointAction = fromRGroupAttachmentPointAddition(restruct, tmpAtom.attachmentPoints, operation.data.aid);
      transaction.capture(attachmentPointAction);
      action.mergeWith(attachmentPointAction);
    });
    pstruct.frags.forEach(function (frag, frid) {
      if (!frag) return;
      if (frag.properties) {
        var newFragmentId = fridMap.get(frid);
        if (newFragmentId === undefined) {
          throw new Error("Fragment ".concat(frid, " is missing from fridMap during paste"));
        }
        action.addOp(transaction.capture(new FragmentSetProperties(newFragmentId, frag.properties).perform(restruct)));
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
        action.addOp(transaction.capture(new FragmentAddStereoAtom(newFragmentId, newStereoAtomId).perform(restruct)));
      });
    });
    pstruct.bonds.forEach(function (bond) {
      var operation = transaction.capture(new BondAdd(aidMap.get(bond.begin), aidMap.get(bond.end), bond, false).perform(restruct));
      action.addOp(operation);
      pasteItems.bonds.push(operation.data.bid);
      items.bonds.push(operation.data.bid);
      transaction.capture(new BondAttr(operation.data.bid, 'isPreview', isPreview, false).perform(restruct));
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
      if (sg.isNotContractible(pstruct) && !(sg instanceof MonomerMicromolecule) && !SGroup.isSuperAtom(sg)) {
        sg.setAttr('expanded', true);
      }
      var sgAction = fromSgroupAddition(restruct, sg.type, sgAtoms, sg.data, newsgid, attachmentPoints, sg.pp ? sg.pp.add(offset) : null, sg.type === 'SUP' ? sg.isExpanded() : null, sg.data.name, sg);
      transaction.capture(sgAction);
      sgAction.operations.reverse();
      sgAction.operations.forEach(function (oper) {
        action.addOp(oper);
      });
    });
    pasteItems.atoms.forEach(function (aid) {
      action.addOp(transaction.capture(new CalcImplicitH([aid]).perform(restruct)));
      transaction.capture(new AtomAttr(aid, 'isPreview', isPreview).perform(restruct));
    });
    pstruct.rxnArrows.forEach(function (rxnArrow) {
      var operation = transaction.capture(new RxnArrowAdd(rxnArrow.pos.map(function (p) {
        return p.add(offset);
      }), rxnArrow.mode, undefined, rxnArrow.height).perform(restruct));
      action.addOp(operation);
      var rxnArrowId = operation.data.id;
      if (rxnArrowId != null) {
        items.rxnArrows.push(rxnArrowId);
      }
    });
    pstruct.rxnPluses.forEach(function (plus) {
      var operation = transaction.capture(new RxnPlusAdd(plus.pp.add(offset)).perform(restruct));
      action.addOp(operation);
      if (operation.data.plid !== null) {
        items.rxnPluses.push(operation.data.plid);
      }
    });
    pstruct.simpleObjects.forEach(function (simpleObject) {
      var operation = transaction.capture(new SimpleObjectAdd(simpleObject.pos.map(function (p) {
        return p.add(offset);
      }), simpleObject.mode).perform(restruct));
      action.addOp(operation);
      items.simpleObjects.push(operation.data.id);
    });
    pstruct.texts.forEach(function (text) {
      var operation = transaction.capture(new TextCreate(text.content, text.position.add(offset), text.pos.map(function (p) {
        return p.add(offset);
      })).perform(restruct));
      action.addOp(operation);
      items.texts.push(operation.data.id);
    });
    pstruct.images.forEach(function (image) {
      var clonedImage = image.clone();
      clonedImage.addPositionOffset(offset);
      var operation = transaction.capture(new ImageUpsert(clonedImage).perform(restruct));
      action.addOp(operation);
      items.images.push(operation.data.id);
    });
    pstruct.multitailArrows.forEach(function (multitailArrow) {
      var clonedMultitailArrow = multitailArrow.clone();
      clonedMultitailArrow.move(offset);
      var operation = transaction.capture(new MultitailArrowUpsert(clonedMultitailArrow).perform(restruct));
      action.addOp(operation);
      items.multitailArrows.push(operation.data.id);
    });
    pstruct.rgroups.forEach(function (rg, rgid) {
      rg.frags.forEach(function (__frag, frid) {
        var newFragmentId = fridMap.get(frid);
        if (newFragmentId === undefined) {
          throw new Error("Fragment ".concat(frid, " is missing for R-group paste mapping"));
        }
        action.addOp(transaction.capture(new RGroupFragment(rgid, newFragmentId).perform(restruct)));
      });
      var ifThen = rg.ifthen;
      var safeIfThenId = pstruct.rgroups.get(ifThen) ? ifThen : 0;
      var attrsAction = fromRGroupAttrs(restruct, rgid, rg.getAttrs());
      transaction.capture(attrsAction);
      action.mergeWith(attrsAction);
      var ifThenAction = fromUpdateIfThen(restruct, safeIfThenId, rg.ifthen);
      transaction.capture(ifThenAction);
      action.mergeWith(ifThenAction);
    });
    action.operations.reverse();
    transaction.commit();
    return [action, pasteItems, items];
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
    return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2);
  }
  if (struct.rxnArrows.size > 0) {
    var rxnArrow = getOrThrow(struct.rxnArrows, 0, 'getStructCenter: rxnArrows pool is missing id 0');
    return rxnArrow.center();
  }
  if (struct.rxnPluses.size > 0) {
    var rxnPlus = getOrThrow(struct.rxnPluses, 0, 'getStructCenter: rxnPluses pool is missing id 0');
    return rxnPlus.pp;
  }
  if (struct.simpleObjects.size > 0) {
    var simpleObject = getOrThrow(struct.simpleObjects, 0, 'getStructCenter: simpleObjects pool is missing id 0');
    return simpleObject.center();
  }
  if (struct.texts.size > 0) {
    var text = getOrThrow(struct.texts, 0, 'getStructCenter: texts pool is missing id 0');
    return text.position;
  }
  if (struct.images.size > 0) {
    var image = getOrThrow(struct.images, 0, 'getStructCenter: images pool is missing id 0');
    return image.center();
  }
  if (struct.multitailArrows.size > 0) {
    var multitailArrow = getOrThrow(struct.multitailArrows, 0, 'getStructCenter: multitailArrows pool is missing id 0');
    return multitailArrow.center();
  }
  return new Vec2(0, 0);
}

export { fromPaste };
//# sourceMappingURL=paste.modern.js.map
