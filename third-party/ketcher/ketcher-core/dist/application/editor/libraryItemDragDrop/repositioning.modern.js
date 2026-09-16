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
import '../../../domain/entities/AmbiguousMonomer.modern.js';
import '../../../domain/entities/MonomerToAtomBond.modern.js';
import '../../../domain/entities/HydrogenBond.modern.js';
import '../../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../../domain/entities/BackBoneSequenceNode.modern.js';
import '@babel/runtime/helpers/slicedToArray';
import { Command } from '../../../domain/entities/Command.modern.js';
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
import { SnakeLayoutCellWidth } from '../../../domain/constants/layout.modern.js';
import { attachmentPointNumberToAngle } from '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { provideEditorSettings } from '../editorSettings.modern.js';
import { getPreviousMonomerInChain, getNextMonomerInChain } from '../../../domain/helpers/monomers.modern.js';
import { PolymerBondSnapToMonomersOperation } from '../operations/polymerBond/index.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function computeAndApplyFlexDropRepositioning(drawingEntitiesManager, droppedMonomer, addedMonomers, targetMonomer, targetAttachmentPoint) {
  var command = new Command();
  var editorSettings = provideEditorSettings();
  var bondLengthInAngstroms = SnakeLayoutCellWidth / editorSettings.macroModeScale;
  var attachmentPointAngleDegrees = attachmentPointNumberToAngle[targetAttachmentPoint];
  if (attachmentPointAngleDegrees === undefined) return command;
  var outwardAngleDeg = attachmentPointAngleDegrees - 180;
  var outwardAngleRad = outwardAngleDeg * Math.PI / 180;
  var unitVector = new Vec2(Math.cos(outwardAngleRad), Math.sin(outwardAngleRad));
  var targetCenter = targetMonomer.position;
  var desiredDroppedCenter = new Vec2(targetCenter.x + unitVector.x * bondLengthInAngstroms, targetCenter.y + unitVector.y * bondLengthInAngstroms);
  var currentDroppedCenter = droppedMonomer.position;
  var delta = new Vec2(desiredDroppedCenter.x - currentDroppedCenter.x, desiredDroppedCenter.y - currentDroppedCenter.y);
  var _iterator = _createForOfIteratorHelper(addedMonomers),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var monomer = _step.value;
      var newPosition = new Vec2(monomer.position.x + delta.x, monomer.position.y + delta.y);
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
  var command = new Command();
  var droppedIsFirst = getPreviousMonomerInChain(droppedMonomer) === undefined;
  var droppedIsLast = getNextMonomerInChain(droppedMonomer) === undefined;
  var targetIsFirst = getPreviousMonomerInChain(targetMonomer) === undefined;
  var targetIsLast = getNextMonomerInChain(targetMonomer) === undefined;
  var shouldMirror = droppedIsFirst && targetIsFirst || droppedIsLast && targetIsLast;
  if (!shouldMirror) return command;
  var pivotX = droppedMonomer.position.x;
  var _iterator2 = _createForOfIteratorHelper(addedMonomers),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var monomer = _step2.value;
      var offsetX = monomer.position.x - pivotX;
      var newPos = new Vec2(pivotX - offsetX, monomer.position.y);
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
  var command = new Command();
  if (cellDelta === 0) return command;
  var editorSettings = provideEditorSettings();
  var deltaX = cellDelta * SnakeLayoutCellWidth / editorSettings.macroModeScale;
  var current = getNextMonomerInChain(anchorMonomer);
  while (current) {
    var newPosition = new Vec2(current.position.x + deltaX, current.position.y);
    command.merge(drawingEntitiesManager.moveMonomer(current, newPosition));
    current.polymerBonds.forEach(function (bond) {
      command.addOperation(new PolymerBondSnapToMonomersOperation(bond));
    });
    current = getNextMonomerInChain(current);
  }
  return command;
}

export { applyPresetMirroringIfNeeded, computeAndApplyFlexDropRepositioning, shiftDownstreamChainMonomers };
//# sourceMappingURL=repositioning.modern.js.map
