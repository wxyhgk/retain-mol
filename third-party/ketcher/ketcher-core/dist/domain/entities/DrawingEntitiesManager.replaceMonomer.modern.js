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
import { Command } from './Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function replaceMonomer(drawingEntitiesManager, monomer, newMonomerItem) {
  var command = new Command();
  var polymerBondInfoList = Array.from(drawingEntitiesManager.polymerBonds).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);
      _ref2[0];
      var bond = _ref2[1];
    return bond.firstMonomer === monomer || bond.secondMonomer === monomer;
  }).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      id = _ref4[0],
      bond = _ref4[1];
    return {
      id: id,
      firstMonomer: bond.firstMonomer,
      firstMonomerAttachmentPoint: bond.firstMonomerAttachmentPoint,
      secondMonomer: bond.secondMonomer,
      secondMonomerAttachmentPoint: bond.secondMonomerAttachmentPoint,
      bond: bond
    };
  });
  var monomerToAtomBondInfoList = Array.from(drawingEntitiesManager.monomerToAtomBonds).filter(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);
      _ref6[0];
      var bond = _ref6[1];
    return bond.monomer === monomer;
  }).map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
      id = _ref8[0],
      bond = _ref8[1];
    var attachmentPointEntry = Object.entries(monomer.attachmentPointsToBonds).find(function (entry) {
      return entry[1] === bond;
    });
    if (!attachmentPointEntry) {
      throw new Error('Monomer to atom bond requires an attachment point reference');
    }
    var _attachmentPointEntry = _slicedToArray(attachmentPointEntry, 1),
      attachmentPoint = _attachmentPointEntry[0];
    return {
      id: id,
      monomer: bond.monomer,
      attachmentPoint: attachmentPoint,
      atom: bond.atom,
      bond: bond
    };
  });
  var _iterator = _createForOfIteratorHelper(polymerBondInfoList),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var polymerBondInfo = _step.value;
      assert(polymerBondInfo.bond);
      polymerBondInfo.bond.turnOnSelection();
      command.merge(drawingEntitiesManager.deletePolymerBond(polymerBondInfo.bond));
      delete polymerBondInfo.bond;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var _iterator2 = _createForOfIteratorHelper(monomerToAtomBondInfoList),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var monomerToAtomBondInfo = _step2.value;
      assert(monomerToAtomBondInfo.bond);
      command.merge(drawingEntitiesManager.deleteMonomerToAtomBond(monomerToAtomBondInfo.bond));
      delete monomerToAtomBondInfo.bond;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  command.merge(drawingEntitiesManager.deleteMonomer(monomer, true));
  var newMonomer = drawingEntitiesManager.createMonomer(newMonomerItem, monomer.position);
  command.merge(drawingEntitiesManager.addMonomer(new Proxy(newMonomerItem, {}), monomer.position, newMonomer));
  var _iterator3 = _createForOfIteratorHelper(polymerBondInfoList),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var _polymerBondInfo = _step3.value;
      if (!_polymerBondInfo.firstMonomerAttachmentPoint || !_polymerBondInfo.secondMonomerAttachmentPoint || !_polymerBondInfo.secondMonomer) throw new Error('Polymer bond requires both monomers and attachment points defined');
      command.merge(drawingEntitiesManager.createPolymerBond(_polymerBondInfo.firstMonomer === monomer ? newMonomer : _polymerBondInfo.firstMonomer, _polymerBondInfo.secondMonomer === monomer ? newMonomer : _polymerBondInfo.secondMonomer, _polymerBondInfo.firstMonomerAttachmentPoint, _polymerBondInfo.secondMonomerAttachmentPoint));
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  var _iterator4 = _createForOfIteratorHelper(monomerToAtomBondInfoList),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var _monomerToAtomBondInfo = _step4.value;
      command.merge(drawingEntitiesManager.addMonomerToAtomBond(_monomerToAtomBondInfo.monomer, _monomerToAtomBondInfo.atom, _monomerToAtomBondInfo.attachmentPoint));
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  return command;
}

export { replaceMonomer };
//# sourceMappingURL=DrawingEntitiesManager.replaceMonomer.modern.js.map
