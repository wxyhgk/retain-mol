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
require('../../../domain/entities/AmbiguousMonomer.js');
require('../../../domain/entities/MonomerToAtomBond.js');
require('../../../domain/entities/HydrogenBond.js');
require('../../../domain/entities/SGroupDrawingEntity.js');
require('../../../domain/entities/BackBoneSequenceNode.js');
require('@babel/runtime/helpers/slicedToArray');
var Command = require('../../../domain/entities/Command.js');
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
var layout = require('../../../domain/constants/layout.js');
var attachmentPointCalculations = require('../../../domain/helpers/attachmentPointCalculations.js');
var editorSettings = require('../editorSettings.js');
var monomers = require('../../../domain/helpers/monomers.js');
var index = require('../operations/polymerBond/index.js');

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function computeAndApplyFlexDropRepositioning(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer, targetAttachmentPoint) {
  var command = new Command.Command();
  var editorSettings$1 = editorSettings.provideEditorSettings();
  var bondLengthInAngstroms = layout.SnakeLayoutCellWidth / editorSettings$1.macroModeScale;
  var attachmentPointAngleDegrees = attachmentPointCalculations.attachmentPointNumberToAngle[targetAttachmentPoint];
  if (attachmentPointAngleDegrees === undefined) return command;
  var outwardAngleDeg = attachmentPointAngleDegrees - 180;
  var outwardAngleRad = outwardAngleDeg * Math.PI / 180;
  var unitVector = new vec2.Vec2(Math.cos(outwardAngleRad), Math.sin(outwardAngleRad));
  var targetCenter = targetMonomer.position;
  var desiredDroppedCenter = new vec2.Vec2(targetCenter.x + unitVector.x * bondLengthInAngstroms, targetCenter.y + unitVector.y * bondLengthInAngstroms);
  var currentDroppedCenter = droppedMonomer.position;
  var delta = new vec2.Vec2(desiredDroppedCenter.x - currentDroppedCenter.x, desiredDroppedCenter.y - currentDroppedCenter.y);
  var _iterator = _createForOfIteratorHelper(addedMonomers),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var monomer = _step.value;
      var newPosition = new vec2.Vec2(monomer.position.x + delta.x, monomer.position.y + delta.y);
      command.merge(drawingEntitiesManager.moveMonomer(monomer, newPosition));
      monomer.polymerBonds.forEach(function (polymerBond) {
        drawingEntitiesManager.movePolymerBond(polymerBond);
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return command;
}
function applyPresetMirroringIfNeeded(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer) {
  var command = new Command.Command();
  var droppedIsFirst = monomers.getPreviousMonomerInChain(droppedMonomer) === undefined;
  var droppedIsLast = monomers.getNextMonomerInChain(droppedMonomer) === undefined;
  var targetIsFirst = monomers.getPreviousMonomerInChain(targetMonomer) === undefined;
  var targetIsLast = monomers.getNextMonomerInChain(targetMonomer) === undefined;
  var shouldMirror = droppedIsFirst && targetIsFirst || droppedIsLast && targetIsLast;
  if (!shouldMirror) return command;
  var pivotX = droppedMonomer.position.x;
  var _iterator2 = _createForOfIteratorHelper(addedMonomers),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var monomer = _step2.value;
      var offsetX = monomer.position.x - pivotX;
      var newPos = new vec2.Vec2(pivotX - offsetX, monomer.position.y);
      command.merge(drawingEntitiesManager.moveMonomer(monomer, newPos));
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return command;
}
function shiftDownstreamChainMonomers(drawingEntitiesManager, anchorMonomer, cellDelta) {
  var command = new Command.Command();
  if (cellDelta === 0) return command;
  var editorSettings$1 = editorSettings.provideEditorSettings();
  var deltaX = cellDelta * layout.SnakeLayoutCellWidth / editorSettings$1.macroModeScale;
  var current = monomers.getNextMonomerInChain(anchorMonomer);
  while (current) {
    var newPosition = new vec2.Vec2(current.position.x + deltaX, current.position.y);
    command.merge(drawingEntitiesManager.moveMonomer(current, newPosition));
    current.polymerBonds.forEach(function (bond) {
      command.addOperation(new index.PolymerBondSnapToMonomersOperation(bond));
    });
    current = monomers.getNextMonomerInChain(current);
  }
  return command;
}

exports.applyPresetMirroringIfNeeded = applyPresetMirroringIfNeeded;
exports.computeAndApplyFlexDropRepositioning = computeAndApplyFlexDropRepositioning;
exports.shiftDownstreamChainMonomers = shiftDownstreamChainMonomers;
//# sourceMappingURL=repositioning.js.map
