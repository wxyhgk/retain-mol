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

var atom$1 = require('../../../domain/entities/atom.js');
var bond = require('../../../domain/entities/bond.js');
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
require('../../../domain/entities/vec2.js');
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
var sgroupAttachmentPoints = require('../operations/sgroup/sgroupAttachmentPoints.js');
var utils = require('./utils.js');
var atom = require('./atom.js');
var sgroup = require('./sgroup.js');
var bondStereo = require('./bondStereo.js');
var action = require('./action.js');
var actionTransaction = require('./actionTransaction.js');
var BondDelete = require('../operations/bond/BondDelete.js');
var BondAdd = require('../operations/bond/BondAdd.js');
var BondAttr = require('../operations/bond/BondAttr.js');
var AtomAttr = require('../operations/atom/AtomAttr.js');
var AtomDelete = require('../operations/atom/AtomDelete.js');

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function fromAtomMerge(restruct, srcId, dstId) {
  if (srcId === dstId) return new action.Action();
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    var _restruct$molecule$at, _restruct$molecule$at2, _dstAtomNeighbors$0$b, _dstAtomNeighbors$, _atomNeighbors$;
    var fragAction = new action.Action();
    atom.mergeFragmentsIfNeeded(fragAction, restruct, srcId, dstId);
    transaction.capture(fragAction);
    var action$1 = new action.Action();
    var atomNeighbors = (_restruct$molecule$at = restruct.molecule.atomGetNeighbors(srcId)) !== null && _restruct$molecule$at !== void 0 ? _restruct$molecule$at : [];
    atomNeighbors.forEach(function (nei) {
      var bond$1 = restruct.molecule.bonds.get(nei.bid);
      if (!bond$1) return;
      if (dstId === bond$1.begin || dstId === bond$1.end) {
        action$1.addOp(new BondDelete.BondDelete(nei.bid));
        return;
      }
      var begin = bond$1.begin === nei.aid ? nei.aid : dstId;
      var end = bond$1.begin === nei.aid ? dstId : nei.aid;
      var mergeBondId = restruct.molecule.findBondId(begin, end);
      if (mergeBondId === null) {
        action$1.addOp(new BondAdd.BondAdd(begin, end, bond$1));
      } else {
        var _attrs = bond.Bond.getAttrHash(bond$1);
        Object.keys(_attrs).forEach(function (key) {
          action$1.addOp(new BondAttr.BondAttr(mergeBondId, key, _attrs[key]));
        });
      }
      action$1.addOp(new BondDelete.BondDelete(nei.bid));
    });
    var srcAtom = restruct.molecule.atoms.get(srcId);
    if (!srcAtom) {
      var _performedAction = action$1.perform(restruct);
      transaction.capture(_performedAction);
      var _result = _performedAction.mergeWith(fragAction);
      transaction.commit();
      return _result;
    }
    var attrs = atom$1.Atom.getAttrHash(srcAtom);
    if (utils.atomGetDegree(restruct, srcId) === 1 && attrs.label === '*') {
      attrs.label = 'C';
    }
    Object.keys(attrs).forEach(function (key) {
      if (key !== 'stereoLabel' && key !== 'stereoParity') {
        action$1.addOp(new AtomAttr.AtomAttr(dstId, key, attrs[key]));
      }
    });
    var sgChanged = sgroup.removeAtomFromSgroupIfNeeded(action$1, restruct, srcId);
    if (sgChanged) sgroup.removeSgroupIfNeeded(action$1, restruct, [srcId]);
    var sgroups = utils.atomGetSGroups(restruct, srcId);
    sgroups.forEach(function (sgroupId) {
      var _restruct$sgroups$get;
      var sgroup = (_restruct$sgroups$get = restruct.sgroups.get(sgroupId)) === null || _restruct$sgroups$get === void 0 ? void 0 : _restruct$sgroups$get.item;
      if (!sgroup) return;
      var _iterator = _createForOfIteratorHelper(sgroup.getAttachmentPoints()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var attachmentPoint = _step.value;
          if (attachmentPoint.atomId === srcId) {
            action$1.addOp(new sgroupAttachmentPoints.SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
            return;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
    action$1.addOp(new AtomDelete.AtomDelete(srcId));
    var dstAtomNeighbors = (_restruct$molecule$at2 = restruct.molecule.atomGetNeighbors(dstId)) !== null && _restruct$molecule$at2 !== void 0 ? _restruct$molecule$at2 : [];
    var bond$1 = restruct.molecule.bonds.get((_dstAtomNeighbors$0$b = (_dstAtomNeighbors$ = dstAtomNeighbors[0]) === null || _dstAtomNeighbors$ === void 0 ? void 0 : _dstAtomNeighbors$.bid) !== null && _dstAtomNeighbors$0$b !== void 0 ? _dstAtomNeighbors$0$b : (_atomNeighbors$ = atomNeighbors[0]) === null || _atomNeighbors$ === void 0 ? void 0 : _atomNeighbors$.bid);
    var stereoAction = bond$1 ? bondStereo.fromBondStereoUpdate(restruct, bond$1) : new action.Action();
    transaction.capture(stereoAction);
    var performedAction = action$1.perform(restruct);
    transaction.capture(performedAction);
    var result = performedAction.mergeWith(fragAction).mergeWith(stereoAction);
    transaction.commit();
    return result;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}

exports.fromAtomMerge = fromAtomMerge;
//# sourceMappingURL=atomMerge.js.map
