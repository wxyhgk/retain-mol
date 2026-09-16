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
import { Atom } from '../../../domain/entities/atom.modern.js';
import { Bond } from '../../../domain/entities/bond.modern.js';
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
import '../../../domain/entities/vec2.modern.js';
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
import { SGroupAttachmentPointRemove } from '../operations/sgroup/sgroupAttachmentPoints.modern.js';
import { atomGetDegree, atomGetSGroups } from './utils.modern.js';
import { mergeFragmentsIfNeeded } from './atom.modern.js';
import { removeAtomFromSgroupIfNeeded, removeSgroupIfNeeded } from './sgroup.modern.js';
import { fromBondStereoUpdate } from './bondStereo.modern.js';
import { Action } from './action.modern.js';
import { ActionTransaction } from './actionTransaction.modern.js';
import { BondDelete } from '../operations/bond/BondDelete.modern.js';
import { BondAdd } from '../operations/bond/BondAdd.modern.js';
import { BondAttr } from '../operations/bond/BondAttr.modern.js';
import { AtomAttr } from '../operations/atom/AtomAttr.modern.js';
import { AtomDelete } from '../operations/atom/AtomDelete.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function fromAtomMerge(restruct, srcId, dstId) {
  if (srcId === dstId) return new Action();
  var transaction = new ActionTransaction(restruct);
  try {
    var _restruct$molecule$at, _restruct$molecule$at2, _dstAtomNeighbors$0$b, _dstAtomNeighbors$, _atomNeighbors$;
    var fragAction = new Action();
    mergeFragmentsIfNeeded(fragAction, restruct, srcId, dstId);
    transaction.capture(fragAction);
    var action = new Action();
    var atomNeighbors = (_restruct$molecule$at = restruct.molecule.atomGetNeighbors(srcId)) !== null && _restruct$molecule$at !== void 0 ? _restruct$molecule$at : [];
    atomNeighbors.forEach(function (nei) {
      var bond = restruct.molecule.bonds.get(nei.bid);
      if (!bond) return;
      if (dstId === bond.begin || dstId === bond.end) {
        action.addOp(new BondDelete(nei.bid));
        return;
      }
      var begin = bond.begin === nei.aid ? nei.aid : dstId;
      var end = bond.begin === nei.aid ? dstId : nei.aid;
      var mergeBondId = restruct.molecule.findBondId(begin, end);
      if (mergeBondId === null) {
        action.addOp(new BondAdd(begin, end, bond));
      } else {
        var _attrs = Bond.getAttrHash(bond);
        Object.keys(_attrs).forEach(function (key) {
          action.addOp(new BondAttr(mergeBondId, key, _attrs[key]));
        });
      }
      action.addOp(new BondDelete(nei.bid));
    });
    var srcAtom = restruct.molecule.atoms.get(srcId);
    if (!srcAtom) {
      var _performedAction = action.perform(restruct);
      transaction.capture(_performedAction);
      var _result = _performedAction.mergeWith(fragAction);
      transaction.commit();
      return _result;
    }
    var attrs = Atom.getAttrHash(srcAtom);
    if (atomGetDegree(restruct, srcId) === 1 && attrs.label === '*') {
      attrs.label = 'C';
    }
    Object.keys(attrs).forEach(function (key) {
      if (key !== 'stereoLabel' && key !== 'stereoParity') {
        action.addOp(new AtomAttr(dstId, key, attrs[key]));
      }
    });
    var sgChanged = removeAtomFromSgroupIfNeeded(action, restruct, srcId);
    if (sgChanged) removeSgroupIfNeeded(action, restruct, [srcId]);
    var sgroups = atomGetSGroups(restruct, srcId);
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
            action.addOp(new SGroupAttachmentPointRemove(sgroupId, attachmentPoint));
            return;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
    action.addOp(new AtomDelete(srcId));
    var dstAtomNeighbors = (_restruct$molecule$at2 = restruct.molecule.atomGetNeighbors(dstId)) !== null && _restruct$molecule$at2 !== void 0 ? _restruct$molecule$at2 : [];
    var bond = restruct.molecule.bonds.get((_dstAtomNeighbors$0$b = (_dstAtomNeighbors$ = dstAtomNeighbors[0]) === null || _dstAtomNeighbors$ === void 0 ? void 0 : _dstAtomNeighbors$.bid) !== null && _dstAtomNeighbors$0$b !== void 0 ? _dstAtomNeighbors$0$b : (_atomNeighbors$ = atomNeighbors[0]) === null || _atomNeighbors$ === void 0 ? void 0 : _atomNeighbors$.bid);
    var stereoAction = bond ? fromBondStereoUpdate(restruct, bond) : new Action();
    transaction.capture(stereoAction);
    var performedAction = action.perform(restruct);
    transaction.capture(performedAction);
    var result = performedAction.mergeWith(fragAction).mergeWith(stereoAction);
    transaction.commit();
    return result;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}

export { fromAtomMerge };
//# sourceMappingURL=atomMerge.modern.js.map
