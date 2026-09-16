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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var atom = require('../../../domain/entities/atom.js');
var bond$1 = require('../../../domain/entities/bond.js');
var vec2 = require('../../../domain/entities/vec2.js');
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
require('../operations/Text/TextMove.js');
require('../operations/monomer/AttachmentPointHoverOperation.js');
require('../operations/monomer/FlipMonomerOperation.js');
require('../operations/monomer/MonomerAddOperation.js');
require('../operations/monomer/MonomerDeleteOperation.js');
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/helpers/monomers.js');
require('../../render/renderers/AmbiguousMonomerRenderer.js');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
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
var utils$1 = require('./utils.js');
var atom$1 = require('./atom.js');
var bond = require('./bond.js');
var bondStereo = require('./bondStereo.js');
var action = require('./action.js');
var actionTransaction = require('./actionTransaction.js');
var closest = require('../shared/closest.js');
var aromaticFusing = require('./aromaticFusing.js');
var paste = require('./paste.js');
var utils = require('../shared/utils.js');
var sgroup = require('./sgroup.js');
var _ = require('lodash');
var AtomAdd = require('../operations/atom/AtomAdd.js');
var BondAdd = require('../operations/bond/BondAdd.js');
var BondAttr = require('../operations/bond/BondAttr.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var benzeneMoleculeName = 'Benzene';
var cyclopentadieneMoleculeName = 'Cyclopentadiene';
var benzeneDoubleBondIndexes = [2, 4];
function fromTemplateOnCanvas(restruct, template, pos) {
  var angle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    var _fromPaste = paste.fromPaste(restruct, template.molecule, pos, angle, isPreview),
      _fromPaste2 = _slicedToArray__default["default"](_fromPaste, 3),
      action = _fromPaste2[0],
      pasteItems = _fromPaste2[1],
      items = _fromPaste2[2];
    transaction.capture(action);
    action.addOp(transaction.capture(new calcimplicitH.CalcImplicitH(pasteItems.atoms).perform(restruct)));
    transaction.commit();
    return [action, pasteItems, items];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function extraBondAction(restruct, aid, angle) {
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  var frid = utils$1.atomGetAttr(restruct, aid, 'fragment');
  var additionalAtom;
  try {
    if (angle === null) {
      var middleAtom = utils$1.atomForNewBond(restruct, aid);
      var actionRes = bond.fromBondAddition(restruct, {
        type: 1
      }, aid, middleAtom.atom, undefined, middleAtom.pos.get_xy0());
      transaction.capture(actionRes[0]);
      action$1 = actionRes[0];
      action$1.operations.reverse();
      additionalAtom = actionRes[2];
    } else {
      var pivotAtom = restruct.molecule.atoms.get(aid);
      if (!pivotAtom) {
        throw new Error("Template pivot atom ".concat(aid, " was not found"));
      }
      var operation = new AtomAdd.AtomAdd({
        label: 'C',
        fragment: frid
      }, new vec2.Vec2(1, 0).rotate(angle).add(pivotAtom.pp).get_xy0());
      action$1.addOp(transaction.capture(operation.perform(restruct)));
      var newAtomId = operation.data.aid;
      if (!_.isNumber(newAtomId)) {
        throw new Error('Template connector atom id was not assigned');
      }
      action$1.addOp(transaction.capture(new BondAdd.BondAdd(aid, newAtomId, {
        type: 1
      }).perform(restruct)));
      additionalAtom = newAtomId;
    }
    transaction.commit();
    return {
      action: action$1,
      aid1: additionalAtom
    };
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function fromTemplateOnAtom(restruct, template, aid, angle, extraBond) {
  var isPreview = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    var tmpl = template.molecule;
    var struct = restruct.molecule;
    var isTmplSingleGroup = template.molecule.isSingleGroup();
    var atom$2 = struct.atoms.get(aid);
    var aid1 = aid;
    var delta;
    if (extraBond) {
      var extraRes = extraBondAction(restruct, aid, angle);
      transaction.capture(extraRes.action);
      action$1 = extraRes.action;
      aid1 = extraRes.aid1;
      atom$2 = struct.atoms.get(aid1);
      delta = utils["default"].calcAngle(struct.atoms.get(aid).pp, atom$2.pp) - template.angle0;
    } else {
      if (angle === null) {
        angle = utils["default"].calcAngle(atom$2.pp, utils$1.atomForNewBond(restruct, aid).pos);
      }
      delta = angle - template.angle0;
    }
    var map = new Map();
    var xy0 = tmpl.atoms.get(template.aid).pp;
    var frid = utils$1.atomGetAttr(restruct, aid, 'fragment');
    var pasteItems = {
      atoms: [],
      bonds: []
    };
    tmpl.atoms.forEach(function (a, id) {
      var attrs = atom.Atom.getAttrHash(a);
      attrs.fragment = frid;
      if (id === template.aid) {
        var atomAttrsAction = atom$1.fromAtomsAttrs(restruct, aid1, attrs, true);
        transaction.capture(atomAttrsAction);
        action$1.mergeWith(atomAttrsAction);
        map.set(id, aid1);
        pasteItems.atoms.push(aid1);
      } else {
        var v = vec2.Vec2.diff(a.pp, xy0).rotate(delta).add(atom$2.pp);
        var operation = transaction.capture(new AtomAdd.AtomAdd(attrs, v.get_xy0()).perform(restruct));
        action$1.addOp(operation);
        map.set(id, operation.data.aid);
        pasteItems.atoms.push(operation.data.aid);
      }
    });
    if (!isTmplSingleGroup) {
      transaction.capture(atom$1.mergeSgroups(action$1, restruct, pasteItems.atoms, aid));
    }
    tmpl.bonds.forEach(function (bond) {
      var operation = transaction.capture(new BondAdd.BondAdd(map.get(bond.begin), map.get(bond.end), bond).perform(restruct));
      action$1.addOp(operation);
      transaction.capture(new BondAttr.BondAttr(operation.data.bid, 'isPreview', isPreview).perform(restruct));
      pasteItems.bonds.push(operation.data.bid);
    });
    tmpl.sgroups.forEach(function (sg) {
      var newsgid = restruct.molecule.sgroups.newId();
      var sgAtoms = sg.atoms.map(function (aid) {
        return map.get(aid);
      });
      var attachmentPoints = sg.cloneAttachmentPoints(map);
      var sgAction = sgroup.fromSgroupAddition(restruct, sg.type, sgAtoms, _objectSpread(_objectSpread({}, sg.data), {}, {
        expanded: isPreview ? true : sg.data.expanded
      }), newsgid, attachmentPoints, atom$2.pp, sg.type === 'SUP' ? sg.isExpanded() : null, sg.data.name);
      transaction.capture(sgAction);
      sgAction.operations.reverse();
      sgAction.operations.forEach(function (oper) {
        action$1.addOp(oper);
      });
    });
    action$1.operations.reverse();
    action$1.addOp(transaction.capture(new calcimplicitH.CalcImplicitH([].concat(_toConsumableArray__default["default"](pasteItems.atoms), [aid])).perform(restruct)));
    var stereoAction = bondStereo.fromBondStereoUpdate(restruct, restruct.molecule.bonds.get(pasteItems.bonds[0]));
    transaction.capture(stereoAction);
    action$1.mergeWith(stereoAction);
    transaction.commit();
    return [action$1, pasteItems];
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
    return aromaticFusing.fromAromaticTemplateOnBond(restruct, template, bid, events, simpleFusing);
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
    var _Bond$getBondNeighbou = bond$1.Bond.getBondNeighbourIds(struct, bondId),
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
      return bond$1.Bond.getBenzeneConnectingBondType(bond, beginBond, endBond);
    }
    if (isCyclopentadieneTemplate) {
      return bond$1.Bond.getCyclopentadieneFusingBondType(bond, beginBond, endBond);
    }
  }
  return null;
}
function placeTemplateAtoms(restruct, tmpl, struct, tmplBond, tmplBegin, bond, atomsMap, frid, angle, scale, action, pasteItems, transaction) {
  tmpl.atoms.forEach(function (atom$2, id) {
    var attrs = atom.Atom.getAttrHash(atom$2);
    attrs.fragment = frid;
    if (id === tmplBond.begin || id === tmplBond.end) {
      var atomAttrsAction = atom$1.fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true);
      transaction.capture(atomAttrsAction);
      action.mergeWith(atomAttrsAction);
      return;
    }
    var v = vec2.Vec2.diff(atom$2.pp, tmplBegin.pp).rotate(angle).scaled(scale).add(struct.atoms.get(bond.begin).pp);
    var mergeA = closest["default"].atom(restruct, v, null, 0.1);
    if (mergeA === null) {
      var operation = transaction.capture(new AtomAdd.AtomAdd(attrs, v).perform(restruct));
      action.addOp(operation);
      atomsMap.set(id, operation.data.aid);
      pasteItems.atoms.push(operation.data.aid);
    } else {
      atomsMap.set(id, mergeA.id);
      var _atomAttrsAction = atom$1.fromAtomsAttrs(restruct, atomsMap.get(id), attrs, true);
      transaction.capture(_atomAttrsAction);
      action.mergeWith(_atomAttrsAction);
    }
  });
  transaction.capture(atom$1.mergeSgroups(action, restruct, pasteItems.atoms, bond.begin));
}
function placeTemplateBonds(restruct, tmpl, struct, tmplBond, bond$2, bid, atomsMap, fusingBondType, isPreview, action, pasteItems, transaction) {
  var isFusingBenzeneBySpecialRules = fusingBondType !== null;
  tmpl.bonds.forEach(function (tBond, tBondIndex) {
    var existId = struct.findBondId(atomsMap.get(tBond.begin), atomsMap.get(tBond.end));
    var previewBondId;
    if (existId === null) {
      var operation = transaction.capture(new BondAdd.BondAdd(atomsMap.get(tBond.begin), atomsMap.get(tBond.end), tBond).perform(restruct));
      action.addOp(operation);
      var newBondId = operation.data.bid;
      previewBondId = newBondId;
      if (isFusingBenzeneBySpecialRules) {
        var isBenzeneTemplate = tmpl.name === benzeneMoleculeName;
        var isCyclopentadieneTemplate = tmpl.name === cyclopentadieneMoleculeName;
        if (isBenzeneTemplate) {
          var newBondType = benzeneDoubleBondIndexes.includes(tBondIndex) ? bond$1.Bond.PATTERN.TYPE.DOUBLE : bond$1.Bond.PATTERN.TYPE.SINGLE;
          action.addOp(transaction.capture(new BondAttr.BondAttr(newBondId, 'type', newBondType).perform(restruct)));
        }
        if (isCyclopentadieneTemplate) {
          var _Bond$getBondNeighbou2 = bond$1.Bond.getBondNeighbourIds(struct, bid),
            beginBondIds = _Bond$getBondNeighbou2.beginBondIds,
            endBondIds = _Bond$getBondNeighbou2.endBondIds;
          var bondBegin = struct.bonds.get(beginBondIds[0]);
          var bondEnd = struct.bonds.get(endBondIds[0]);
          var _newBondType = bond$1.Bond.getCyclopentadieneDoubleBondIndexes(bond$2, bondBegin, bondEnd).includes(tBondIndex) ? bond$1.Bond.PATTERN.TYPE.DOUBLE : bond$1.Bond.PATTERN.TYPE.SINGLE;
          action.addOp(transaction.capture(new BondAttr.BondAttr(newBondId, 'type', _newBondType).perform(restruct)));
        }
      }
      pasteItems.bonds.push(newBondId);
    } else {
      var commonBond = bond$2.type > tmplBond.type ? bond$2 : tmplBond;
      var bondAttrsAction = bond.fromBondsAttrs(restruct, existId, commonBond, true);
      transaction.capture(bondAttrsAction);
      action.mergeWith(bondAttrsAction);
      if (isFusingBenzeneBySpecialRules && fusingBondType) {
        action.addOp(transaction.capture(new BondAttr.BondAttr(bid, 'type', fusingBondType).perform(restruct)));
      }
      previewBondId = bid;
    }
    action.addOp(transaction.capture(new BondAttr.BondAttr(previewBondId, 'isPreview', isPreview).perform(restruct)));
  });
}
function applyTemplatePostProcessing(restruct, bond, pasteItems, action, transaction) {
  if (pasteItems.atoms.length) {
    action.addOp(transaction.capture(new calcimplicitH.CalcImplicitH([bond.begin, bond.end].concat(_toConsumableArray__default["default"](pasteItems.atoms))).perform(restruct)));
  }
  if (pasteItems.bonds.length) {
    var stereoAction = bondStereo.fromBondStereoUpdate(restruct, restruct.molecule.bonds.get(pasteItems.bonds[0]));
    transaction.capture(stereoAction);
    action.mergeWith(stereoAction);
  }
}
function fromTemplateOnBond(restruct, template, bid, flip) {
  var isPreview = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var action$1 = new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
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
    var mergeParams = utils["default"].mergeBondsParams(struct, bond, tmpl, bondAtoms);
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
    placeTemplateAtoms(restruct, tmpl, struct, tmplBond, tmplBegin, bond, atomsMap, frid, angle, scale, action$1, pasteItems, transaction);
    var fusingBondType = getConnectingBond(tmpl, struct, bid, bond);
    placeTemplateBonds(restruct, tmpl, struct, tmplBond, bond, bid, atomsMap, fusingBondType, isPreview, action$1, pasteItems, transaction);
    applyTemplatePostProcessing(restruct, bond, pasteItems, action$1, transaction);
    action$1.operations.reverse();
    transaction.commit();
    return [action$1, pasteItems];
  } catch (cause) {
    return transaction.rollback(cause);
  }
}

exports.fromTemplateOnAtom = fromTemplateOnAtom;
exports.fromTemplateOnBondAction = fromTemplateOnBondAction;
exports.fromTemplateOnCanvas = fromTemplateOnCanvas;
//# sourceMappingURL=template.js.map
