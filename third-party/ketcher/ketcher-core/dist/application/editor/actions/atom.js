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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var atom = require('../../../domain/entities/atom.js');
var monomerMicromolecule = require('../../../domain/entities/monomerMicromolecule.js');
var rgroup = require('../../../domain/entities/rgroup.js');
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
require('@babel/runtime/helpers/slicedToArray');
require('@babel/runtime/helpers/toConsumableArray');
require('../../../domain/entities/atomList.js');
require('../../../domain/entities/bond.js');
require('../../../domain/entities/fixedPrecision.js');
require('../../../domain/entities/fragment.js');
require('../../../domain/entities/functionalGroup.js');
require('../../../domain/entities/halfBond.js');
require('../../../domain/entities/loop.js');
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
var assert = require('../../../utilities/assert.js');
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
var utils = require('./utils.js');
var rgroup$1 = require('./rgroup.js');
var bondStereo = require('./bondStereo.js');
var action = require('./action.js');
var actionTransaction = require('./actionTransaction.js');
var fp = require('lodash/fp');
var FragmentAdd = require('../operations/FragmentAdd.js');
var AtomAdd = require('../operations/atom/AtomAdd.js');
var FragmentDelete = require('../operations/FragmentDelete.js');
var sgroupAtom = require('../operations/sgroup/sgroupAtom.js');
var AtomAttr = require('../operations/atom/AtomAttr.js');
var FragmentAddStereoAtom = require('../operations/FragmentAddStereoAtom.js');
var FragmentDeleteStereoAtom = require('../operations/FragmentDeleteStereoAtom.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function fromAtomAddition(restruct, pos, atom) {
  atom = _objectSpread({}, atom || {});
  var action$1 = new action.Action();
  actionTransaction.runActionTransaction(restruct, function (transaction) {
    var fragmentOperation = new FragmentAdd.FragmentAdd();
    var fragmentInverse = transaction.capture(fragmentOperation.perform(restruct));
    action$1.addOp(fragmentInverse);
    atom.fragment = fragmentOperation.frid;
    var atomOperation = new AtomAdd.AtomAdd(atom, pos);
    var atomInverse = transaction.capture(atomOperation.perform(restruct));
    action$1.addOp(atomInverse);
    var aid = atomOperation.data.aid;
    var implicitHydrogenInverse = transaction.capture(new calcimplicitH.CalcImplicitH([aid]).perform(restruct));
    action$1.addOp(implicitHydrogenInverse);
  });
  return action$1;
}
function fromAtomsAttrs(restruct, ids, attrs, reset) {
  var action$1 = new action.Action();
  var aids = Array.isArray(ids) ? ids : [ids];
  actionTransaction.runActionTransaction(restruct, function (transaction) {
    aids.forEach(function (atomId) {
      var _atomNeighbors$;
      Object.keys(atom.Atom.attrlist).forEach(function (key) {
        if (key === 'attachmentPoints' && !(key in attrs)) return;
        if (!(key in attrs) && !reset) return;
        var value = key in attrs ? attrs[key] : atom.Atom.attrGetDefault(key);
        switch (key) {
          case 'stereoLabel':
          case 'stereoParity':
            if (key in attrs && value) {
              var inverse = transaction.capture(new AtomAttr.AtomAttr(atomId, key, value).perform(restruct));
              action$1.addOp(inverse);
            }
            break;
          default:
            {
              var _inverse = transaction.capture(new AtomAttr.AtomAttr(atomId, key, value).perform(restruct));
              action$1.addOp(_inverse);
              break;
            }
        }
      });
      if (!reset && 'label' in attrs && attrs.label !== null && attrs.label !== 'L#' && !('atomList' in attrs)) {
        var inverse = transaction.capture(new AtomAttr.AtomAttr(atomId, 'atomList', null).perform(restruct));
        action$1.addOp(inverse);
      }
      var implicitHydrogenInverse = transaction.capture(new calcimplicitH.CalcImplicitH([atomId]).perform(restruct));
      action$1.addOp(implicitHydrogenInverse);
      var atomNeighbors = restruct.molecule.atomGetNeighbors(atomId);
      var bond = restruct.molecule.bonds.get(atomNeighbors === null || atomNeighbors === void 0 || (_atomNeighbors$ = atomNeighbors[0]) === null || _atomNeighbors$ === void 0 ? void 0 : _atomNeighbors$.bid);
      if (bond) {
        var stereoAction = bondStereo.fromBondStereoUpdate(restruct, bond);
        transaction.capture(stereoAction);
        action$1.mergeWith(stereoAction);
      }
      var atom$1 = restruct.molecule.atoms.get(atomId);
      assert.assert(atom$1 != null);
      if (atom.Atom.isInAromatizedRing(restruct.molecule, atomId)) {
        var _inverse2 = transaction.capture(new AtomAttr.AtomAttr(atomId, 'implicitHCount', atom$1.implicitH).perform(restruct));
        action$1.addOp(_inverse2);
      }
    });
  });
  return action$1;
}
function fromAtomsFragmentAttr(restruct, aids, newfrid) {
  var action$1 = new action.Action();
  aids.forEach(function (aid) {
    var atom = restruct.molecule.atoms.get(aid);
    var sgroup = restruct.molecule.getGroupFromAtomId(aid);
    var oldfrid = atom.fragment;
    if (sgroup instanceof monomerMicromolecule.MonomerMicromolecule) {
      return;
    }
    action$1.addOp(new AtomAttr.AtomAttr(aid, 'fragment', newfrid));
    if (atom.stereoLabel !== null) {
      action$1.addOp(new FragmentAddStereoAtom.FragmentAddStereoAtom(newfrid, aid));
      action$1.addOp(new FragmentDeleteStereoAtom.FragmentDeleteStereoAtom(oldfrid, aid));
    }
  });
  return action$1.perform(restruct);
}
function mergeFragmentsIfNeeded(action$1, restruct, srcId, dstId) {
  var frid = utils.atomGetAttr(restruct, srcId, 'fragment');
  var frid2 = utils.atomGetAttr(restruct, dstId, 'fragment');
  if (frid2 !== frid && typeof frid === 'number' && typeof frid2 === 'number') {
    var mergeAction = new action.Action();
    actionTransaction.runActionTransaction(restruct, function (transaction) {
      var struct = restruct.molecule;
      var rgid = rgroup.RGroup.findRGroupByFragment(struct.rgroups, frid2);
      if (typeof rgid !== 'undefined') {
        var rgroupFragmentAction = rgroup$1.fromRGroupFragment(restruct, null, frid2);
        transaction.capture(rgroupFragmentAction);
        mergeAction.mergeWith(rgroupFragmentAction);
        var updateIfThenAction = rgroup$1.fromUpdateIfThen(restruct, 0, rgid);
        transaction.capture(updateIfThenAction);
        mergeAction.mergeWith(updateIfThenAction);
      }
      var fridAtoms = struct.getFragmentIds(frid);
      var atomsToNewFrag = [];
      struct.atoms.forEach(function (atom, aid) {
        if (atom.fragment === frid2) atomsToNewFrag.push(aid);
      });
      var moveAtomsAction = fromAtomsFragmentAttr(restruct, atomsToNewFrag, frid);
      transaction.capture(moveAtomsAction);
      var mergeSgroupsAction = mergeSgroups(mergeAction, restruct, fridAtoms, dstId);
      transaction.capture(mergeSgroupsAction);
      var fragmentDeleteInverse = transaction.capture(new FragmentDelete.FragmentDelete(frid2).perform(restruct));
      mergeAction.addOp(fragmentDeleteInverse);
      mergeAction.mergeWith(moveAtomsAction);
    });
    action$1.mergeWith(mergeAction);
  }
  return frid;
}
function mergeSgroups(action$1, restruct, srcAtoms, dstAtom) {
  var mergeAction = new action.Action();
  actionTransaction.runActionTransaction(restruct, function (transaction) {
    var sgroups = utils.atomGetSGroups(restruct, dstAtom);
    sgroups.forEach(function (sid) {
      var sgroup = restruct.molecule.sgroups.get(sid);
      var notExpandedContexts = ['Atom', 'Bond', 'Group'];
      if (sgroup.type === 'DAT' && notExpandedContexts.includes(sgroup.data.context)) {
        return;
      }
      var atomsToSgroup = fp.without(sgroup.atoms, srcAtoms);
      atomsToSgroup.forEach(function (aid) {
        var inverse = transaction.capture(new sgroupAtom.SGroupAtomAdd(sid, aid).perform(restruct));
        mergeAction.addOp(inverse);
      });
    });
  });
  action$1.mergeWith(mergeAction);
  return mergeAction;
}
function checkAtomValence(restruct, atomId) {
  var action$1 = new action.Action();
  if (!restruct.atoms.has(atomId)) return action$1;
  action$1.addOp(new calcimplicitH.CalcImplicitH([atomId]));
  return action$1.perform(restruct);
}

exports.fromStereoAtomAttrs = bondStereo.fromStereoAtomAttrs;
exports.checkAtomValence = checkAtomValence;
exports.fromAtomAddition = fromAtomAddition;
exports.fromAtomsAttrs = fromAtomsAttrs;
exports.fromAtomsFragmentAttr = fromAtomsFragmentAttr;
exports.mergeFragmentsIfNeeded = mergeFragmentsIfNeeded;
exports.mergeSgroups = mergeSgroups;
//# sourceMappingURL=atom.js.map
