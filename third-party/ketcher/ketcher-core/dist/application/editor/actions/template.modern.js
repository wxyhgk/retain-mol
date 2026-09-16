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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import { Atom } from '../../../domain/entities/atom.modern.js';
import { Bond } from '../../../domain/entities/bond.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
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
import '../../../domain/entities/atomList.modern.js';
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
import { atomForNewBond, atomGetAttr } from './utils.modern.js';
import { fromAtomsAttrs, mergeSgroups } from './atom.modern.js';
import { fromBondAddition, fromBondsAttrs } from './bond.modern.js';
import { fromBondStereoUpdate } from './bondStereo.modern.js';
import { Action } from './action.modern.js';
import { ActionTransaction } from './actionTransaction.modern.js';
import closest from '../shared/closest.modern.js';
import { fromAromaticTemplateOnBond } from './aromaticFusing.modern.js';
import { fromPaste } from './paste.modern.js';
import utils from '../shared/utils.modern.js';
import { fromSgroupAddition } from './sgroup.modern.js';
import { isNumber } from 'lodash';
import { AtomAdd } from '../operations/atom/AtomAdd.modern.js';
import { BondAdd } from '../operations/bond/BondAdd.modern.js';
import { BondAttr } from '../operations/bond/BondAttr.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var benzeneMoleculeName = 'Benzene';
var cyclopentadieneMoleculeName = 'Cyclopentadiene';
var benzeneDoubleBondIndexes = [2, 4];
function fromTemplateOnCanvas(restruct, template, pos) {
  var angle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var transaction = new ActionTransaction(restruct);
  try {
    var _fromPaste = fromPaste(restruct, template.molecule, pos, angle, isPreview),
      _fromPaste2 = _slicedToArray(_fromPaste, 3),
      action = _fromPaste2[0],
      pasteItems = _fromPaste2[1],
      items = _fromPaste2[2];
    transaction.capture(action);
    action.addOp(transaction.capture(new CalcImplicitH(pasteItems.atoms).perform(restruct)));
    transaction.commit();
    return [action, pasteItems, items];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function extraBondAction(restruct, aid, angle) {
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  var frid = atomGetAttr(restruct, aid, 'fragment');
  var additionalAtom;
  try {
    if (angle === null) {
      var middleAtom = atomForNewBond(restruct, aid);
      var actionRes = fromBondAddition(restruct, {
        type: 1
      }, aid, middleAtom.atom, undefined, middleAtom.pos.get_xy0());
      transaction.capture(actionRes[0]);
      action = actionRes[0];
      action.operations.reverse();
      additionalAtom = actionRes[2];
    } else {
      var pivotAtom = restruct.molecule.atoms.get(aid);
      if (!pivotAtom) {
        throw new Error("Template pivot atom ".concat(aid, " was not found"));
      }
      var operation = new AtomAdd({
        label: 'C',
        fragment: frid
      }, new Vec2(1, 0).rotate(angle).add(pivotAtom.pp).get_xy0());
      action.addOp(transaction.capture(operation.perform(restruct)));
      var newAtomId = operation.data.aid;
      if (!isNumber(newAtomId)) {
        throw new Error('Template connector atom id was not assigned');
      }
      action.addOp(transaction.capture(new BondAdd(aid, newAtomId, {
        type: 1
      }).perform(restruct)));
      additionalAtom = newAtomId;
    }
    transaction.commit();
    return {
      action: action,
      aid1: additionalAtom
    };
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromTemplateOnAtom(restruct, template, aid, angle, extraBond) {
  var isPreview = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  try {
    var tmpl = template.molecule;
    var struct = restruct.molecule;
    var isTmplSingleGroup = template.molecule.isSingleGroup();
    var atom = struct.atoms.get(aid);
    var aid1 = aid;
    var delta;
    if (extraBond) {
      var extraRes = extraBondAction(restruct, aid, angle);
      transaction.capture(extraRes.action);
      action = extraRes.action;
      aid1 = extraRes.aid1;
      atom = struct.atoms.get(aid1);
      delta = utils.calcAngle(struct.atoms.get(aid).pp, atom.pp) - template.angle0;
    } else {
      if (angle === null) {
        angle = utils.calcAngle(atom.pp, atomForNewBond(restruct, aid).pos);
      }
      delta = angle - template.angle0;
    }
    var map = new Map();
    var xy0 = tmpl.atoms.get(template.aid).pp;
    var frid = atomGetAttr(restruct, aid, 'fragment');
    var pasteItems = {
      atoms: [],
      bonds: []
    };
    tmpl.atoms.forEach(function (a, id) {
      var attrs = Atom.getAttrHash(a);
      attrs.fragment = frid;
      if (id === template.aid) {
        var atomAttrsAction = fromAtomsAttrs(restruct, aid1, attrs, true);
        transaction.capture(atomAttrsAction);
        action.mergeWith(atomAttrsAction);
        map.set(id, aid1);
        pasteItems.atoms.push(aid1);
      } else {
        var v = Vec2.diff(a.pp, xy0).rotate(delta).add(atom.pp);
        var operation = transaction.capture(new AtomAdd(attrs, v.get_xy0()).perform(restruct));
        action.addOp(operation);
        map.set(id, operation.data.aid);
        pasteItems.atoms.push(operation.data.aid);
      }
    });
    if (!isTmplSingleGroup) {
      transaction.capture(mergeSgroups(action, restruct, pasteItems.atoms, aid));
    }
    tmpl.bonds.forEach(function (bond) {
      var operation = transaction.capture(new BondAdd(map.get(bond.begin), map.get(bond.end), bond).perform(restruct));
      action.addOp(operation);
      transaction.capture(new BondAttr(operation.data.bid, 'isPreview', isPreview).perform(restruct));
      pasteItems.bonds.push(operation.data.bid);
    });
    tmpl.sgroups.forEach(function (sg) {
      var newsgid = restruct.molecule.sgroups.newId();
      var sgAtoms = sg.atoms.map(function (aid) {
        return map.get(aid);
      });
      var attachmentPoints = sg.cloneAttachmentPoints(map);
      var sgAction = fromSgroupAddition(restruct, sg.type, sgAtoms, _objectSpread(_objectSpread({}, sg.data), {}, {
        expanded: isPreview ? true : sg.data.expanded
      }), newsgid, attachmentPoints, atom.pp, sg.type === 'SUP' ? sg.isExpanded() : null, sg.data.name);
      transaction.capture(sgAction);
      sgAction.operations.reverse();
      sgAction.operations.forEach(function (oper) {
        action.addOp(oper);
      });
    });
    action.operations.reverse();
    action.addOp(transaction.capture(new CalcImplicitH([].concat(_toConsumableArray(pasteItems.atoms), [aid])).perform(restruct)));
    var stereoAction = fromBondStereoUpdate(restruct, restruct.molecule.bonds.get(pasteItems.bonds[0]));
    transaction.capture(stereoAction);
    action.mergeWith(stereoAction);
    transaction.commit();
    return [action, pasteItems];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromTemplateOnBondAction(restruct, template, bid, events, flip, force) {
  var isPreview = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
  if (!force) return fromTemplateOnBond(restruct, template, bid, flip);
  var simpleFusing = function simpleFusing(restruct, template, bid) {
    return fromTemplateOnBond(restruct, template, bid, flip, isPreview);
  };
  return Promise.resolve().then(function () {
    return fromAromaticTemplateOnBond(restruct, template, bid, events, simpleFusing);
  });
}
function getBondOrThrow(struct, bondId, kind) {
  var bond = struct.bonds.get(bondId);
  if (!bond) {
    throw new Error("Cannot attach template: ".concat(kind, " bond ").concat(bondId, " not found"));
  }
  return bond;
}
function getConnectingBond(template, struct, bondId, bond) {
  var isBenzeneTemplate = template.name === benzeneMoleculeName;
  var isCyclopentadieneTemplate = template.name === cyclopentadieneMoleculeName;
  if (template.bonds.size && (isBenzeneTemplate || isCyclopentadieneTemplate)) {
    var _Bond$getBondNeighbou = Bond.getBondNeighbourIds(struct, bondId),
      beginBondIds = _Bond$getBondNeighbou.beginBondIds,
      endBondIds = _Bond$getBondNeighbou.endBondIds;
    var isOnlyTwoConnectingBonds = beginBondIds.length === 1 && endBondIds.length === 1;
    if (!isOnlyTwoConnectingBonds) {
      return null;
    }
    var beginBond = struct.bonds.get(beginBondIds[0]);
    var endBond = struct.bonds.get(endBondIds[0]);
    if (!beginBond || !endBond) {
      throw new Error('Incorrect bond id was provided');
    }
    if (isBenzeneTemplate) {
      return Bond.getBenzeneConnectingBondType(bond, beginBond, endBond);
    }
    if (isCyclopentadieneTemplate) {
      return Bond.getCyclopentadieneFusingBondType(bond, beginBond, endBond);
    }
  }
  return null;
}
function placeTemplateAtoms(restruct, tmpl, struct, tmplBond, tmplBegin, bond, atomsMap, frid, angle, scale, action, pasteItems, transaction) {
  tmpl.atoms.forEach(function (atom, id) {
    var attrs = Atom.getAttrHash(atom);
    attrs.fragment = frid;
    if (id === tmplBond.begin || id === tmplBond.end) {
      var atomAttrsAction = fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true);
      transaction.capture(atomAttrsAction);
      action.mergeWith(atomAttrsAction);
      return;
    }
    var v = Vec2.diff(atom.pp, tmplBegin.pp).rotate(angle).scaled(scale).add(struct.atoms.get(bond.begin).pp);
    var mergeA = closest.atom(restruct, v, null, 0.1);
    if (mergeA === null) {
      var operation = transaction.capture(new AtomAdd(attrs, v).perform(restruct));
      action.addOp(operation);
      atomsMap.set(id, operation.data.aid);
      pasteItems.atoms.push(operation.data.aid);
    } else {
      atomsMap.set(id, mergeA.id);
      var _atomAttrsAction = fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true);
      transaction.capture(_atomAttrsAction);
      action.mergeWith(_atomAttrsAction);
    }
  });
  transaction.capture(mergeSgroups(action, restruct, pasteItems.atoms, bond.begin));
}
function placeTemplateBonds(restruct, tmpl, struct, tmplBond, bond, bid, atomsMap, fusingBondType, isPreview, action, pasteItems, transaction) {
  var isFusingBenzeneBySpecialRules = fusingBondType !== null;
  tmpl.bonds.forEach(function (tBond, tBondIndex) {
    var existId = struct.findBondId(atomsMap.get(tBond.begin), atomsMap.get(tBond.end));
    var previewBondId;
    if (existId === null) {
      var operation = transaction.capture(new BondAdd(atomsMap.get(tBond.begin), atomsMap.get(tBond.end), tBond).perform(restruct));
      action.addOp(operation);
      var newBondId = operation.data.bid;
      previewBondId = newBondId;
      if (isFusingBenzeneBySpecialRules) {
        var isBenzeneTemplate = tmpl.name === benzeneMoleculeName;
        var isCyclopentadieneTemplate = tmpl.name === cyclopentadieneMoleculeName;
        if (isBenzeneTemplate) {
          var newBondType = benzeneDoubleBondIndexes.includes(tBondIndex) ? Bond.PATTERN.TYPE.DOUBLE : Bond.PATTERN.TYPE.SINGLE;
          action.addOp(transaction.capture(new BondAttr(newBondId, 'type', newBondType).perform(restruct)));
        }
        if (isCyclopentadieneTemplate) {
          var _Bond$getBondNeighbou2 = Bond.getBondNeighbourIds(struct, bid),
            beginBondIds = _Bond$getBondNeighbou2.beginBondIds,
            endBondIds = _Bond$getBondNeighbou2.endBondIds;
          var bondBegin = struct.bonds.get(beginBondIds[0]);
          var bondEnd = struct.bonds.get(endBondIds[0]);
          var _newBondType = Bond.getCyclopentadieneDoubleBondIndexes(bond, bondBegin, bondEnd).includes(tBondIndex) ? Bond.PATTERN.TYPE.DOUBLE : Bond.PATTERN.TYPE.SINGLE;
          action.addOp(transaction.capture(new BondAttr(newBondId, 'type', _newBondType).perform(restruct)));
        }
      }
      pasteItems.bonds.push(newBondId);
    } else {
      var commonBond = bond.type > tmplBond.type ? bond : tmplBond;
      var bondAttrsAction = fromBondsAttrs(restruct, existId, commonBond, true);
      transaction.capture(bondAttrsAction);
      action.mergeWith(bondAttrsAction);
      if (isFusingBenzeneBySpecialRules && fusingBondType) {
        action.addOp(transaction.capture(new BondAttr(bid, 'type', fusingBondType).perform(restruct)));
      }
      previewBondId = bid;
    }
    action.addOp(transaction.capture(new BondAttr(previewBondId, 'isPreview', isPreview).perform(restruct)));
  });
}
function applyTemplatePostProcessing(restruct, bond, pasteItems, action, transaction) {
  if (pasteItems.atoms.length) {
    action.addOp(transaction.capture(new CalcImplicitH([bond.begin, bond.end].concat(_toConsumableArray(pasteItems.atoms))).perform(restruct)));
  }
  if (pasteItems.bonds.length) {
    var stereoAction = fromBondStereoUpdate(restruct, restruct.molecule.bonds.get(pasteItems.bonds[0]));
    transaction.capture(stereoAction);
    action.mergeWith(stereoAction);
  }
}
function fromTemplateOnBond(restruct, template, bid, flip) {
  var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var action = new Action();
  var transaction = new ActionTransaction(restruct);
  try {
    var _struct$atoms$get;
    var tmpl = template.molecule;
    var struct = restruct.molecule;
    var bond = getBondOrThrow(struct, bid, 'target');
    var tmplBond = getBondOrThrow(tmpl, template.bid, 'template');
    var tmplBegin = tmpl.atoms.get(flip ? tmplBond.end : tmplBond.begin);
    if (!tmplBegin) {
      throw new Error('Cannot attach template: template bond references a missing atom');
    }
    var atomsMap = new Map([[tmplBond.begin, flip ? bond.end : bond.begin], [tmplBond.end, flip ? bond.begin : bond.end]]);
    var bondAtoms = {
      begin: flip ? tmplBond.end : tmplBond.begin,
      end: flip ? tmplBond.begin : tmplBond.end
    };
    var mergeParams = utils.mergeBondsParams(struct, bond, tmpl, bondAtoms);
    if (!mergeParams) {
      throw new Error('Cannot attach template: target or template bond references a missing atom');
    }
    var angle = mergeParams.angle,
      scale = mergeParams.scale;
    var frid = (_struct$atoms$get = struct.atoms.get(bond.begin)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment;
    var pasteItems = {
      atoms: [],
      bonds: []
    };
    placeTemplateAtoms(restruct, tmpl, struct, tmplBond, tmplBegin, bond, atomsMap, frid, angle, scale, action, pasteItems, transaction);
    var fusingBondType = getConnectingBond(tmpl, struct, bid, bond);
    placeTemplateBonds(restruct, tmpl, struct, tmplBond, bond, bid, atomsMap, fusingBondType, isPreview, action, pasteItems, transaction);
    applyTemplatePostProcessing(restruct, bond, pasteItems, action, transaction);
    action.operations.reverse();
    transaction.commit();
    return [action, pasteItems];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}

export { fromTemplateOnAtom, fromTemplateOnBondAction, fromTemplateOnCanvas };
//# sourceMappingURL=template.modern.js.map
