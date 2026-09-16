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
import { AttachmentPointName } from '../../../domain/types/monomers.modern.js';
import '../../../domain/types/entities.modern.js';
import { PolymerBond } from '../../../domain/entities/PolymerBond.modern.js';
import { MonomerToAtomBond } from '../../../domain/entities/MonomerToAtomBond.modern.js';
import { isPhosphateOrAmbiguousPhosphate, isSugarOrAmbiguousSugar, isRnaBaseOrAmbiguousRnaBase, getSugarFromRnaBase, getRnaBaseFromSugar } from '../../../domain/helpers/monomers.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function collectMonomerBonds(monomer) {
  var records = [];
  for (var apName in monomer.attachmentPointsToBonds) {
    var bond = monomer.attachmentPointsToBonds[apName];
    if (!bond) continue;
    var otherEntity = null;
    var otherAttachmentPoint = null;
    if (bond instanceof PolymerBond) {
      var _bond$secondMonomer, _bond$secondMonomerAt, _bond$firstMonomerAtt;
      otherEntity = bond.firstMonomer === monomer ? (_bond$secondMonomer = bond.secondMonomer) !== null && _bond$secondMonomer !== void 0 ? _bond$secondMonomer : null : bond.firstMonomer;
      otherAttachmentPoint = bond.firstMonomer === monomer ? (_bond$secondMonomerAt = bond.secondMonomerAttachmentPoint) !== null && _bond$secondMonomerAt !== void 0 ? _bond$secondMonomerAt : null : (_bond$firstMonomerAtt = bond.firstMonomerAttachmentPoint) !== null && _bond$firstMonomerAtt !== void 0 ? _bond$firstMonomerAtt : null;
    } else if (bond instanceof MonomerToAtomBond) {
      otherEntity = null;
    }
    if (otherEntity) {
      records.push({
        attachmentPointName: apName,
        bond: bond,
        otherEntity: otherEntity,
        otherAttachmentPointName: otherAttachmentPoint
      });
    }
  }
  var _iterator = _createForOfIteratorHelper(monomer.hydrogenBonds),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var hydrogenBond = _step.value;
      var otherMonomer = hydrogenBond.firstMonomer === monomer ? hydrogenBond.secondMonomer : hydrogenBond.firstMonomer;
      if (otherMonomer) {
        records.push({
          attachmentPointName: 'hydrogen',
          bond: hydrogenBond,
          otherEntity: otherMonomer,
          otherAttachmentPointName: null
        });
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return records;
}
function computeReestablishableBonds(originalBonds, newMonomer) {
  var reestablishable = [];
  var lost = [];
  var _iterator2 = _createForOfIteratorHelper(originalBonds),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var record = _step2.value;
      if (record.attachmentPointName === 'hydrogen') {
        reestablishable.push(record);
        continue;
      }
      if (newMonomer.isAttachmentPointExistAndFree(record.attachmentPointName)) {
        reestablishable.push(record);
      } else {
        lost.push(record);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return {
    reestablishable: reestablishable,
    lost: lost
  };
}
function getPresetPhosphateFromSugar(sugar, position) {
  var sugarAP = position === 'left' ? 'R1' : 'R2';
  var phosphateAP = position === 'left' ? 'R2' : 'R1';
  var bond = sugar.attachmentPointsToBonds[sugarAP];
  if (bond instanceof PolymerBond) {
    var other = bond.getAnotherMonomer(sugar);
    if (other && isPhosphateOrAmbiguousPhosphate(other) && other.getAttachmentPointByBond(bond) === phosphateAP) {
      return other;
    }
  }
  return null;
}
function getPresetSugarForMonomer(monomer, libraryPreset) {
  if (isSugarOrAmbiguousSugar(monomer)) {
    return monomer;
  }
  if (isRnaBaseOrAmbiguousRnaBase(monomer)) {
    var _getSugarFromRnaBase;
    return (_getSugarFromRnaBase = getSugarFromRnaBase(monomer)) !== null && _getSugarFromRnaBase !== void 0 ? _getSugarFromRnaBase : null;
  }
  if (isPhosphateOrAmbiguousPhosphate(monomer)) {
    var _libraryPreset$phosph;
    var preferredAP = ((_libraryPreset$phosph = libraryPreset.phosphatePosition) !== null && _libraryPreset$phosph !== void 0 ? _libraryPreset$phosph : 'right') === 'left' ? AttachmentPointName.R2 : AttachmentPointName.R1;
    var apOrder = preferredAP === AttachmentPointName.R1 ? [AttachmentPointName.R1, AttachmentPointName.R2] : [AttachmentPointName.R2, AttachmentPointName.R1];
    for (var _i = 0, _apOrder = apOrder; _i < _apOrder.length; _i++) {
      var apName = _apOrder[_i];
      var bond = monomer.attachmentPointsToBonds[apName];
      if (bond instanceof PolymerBond) {
        var other = bond.getAnotherMonomer(monomer);
        if (other && isSugarOrAmbiguousSugar(other)) {
          return other;
        }
      }
    }
  }
  return null;
}
function getMatchingPresetComponents(sugar, libraryPreset) {
  if (!isSugarOrAmbiguousSugar(sugar)) return null;
  var components = [sugar];
  if (libraryPreset.base) {
    var base = getRnaBaseFromSugar(sugar);
    if (!base) return null;
    components.push(base);
  }
  if (libraryPreset.phosphate) {
    var _libraryPreset$phosph2;
    var position = (_libraryPreset$phosph2 = libraryPreset.phosphatePosition) !== null && _libraryPreset$phosph2 !== void 0 ? _libraryPreset$phosph2 : 'right';
    var phosphate = getPresetPhosphateFromSugar(sugar, position);
    if (!phosphate) return null;
    components.push(phosphate);
  }
  return components;
}
function getPresetComponentRole(monomer) {
  if (isSugarOrAmbiguousSugar(monomer)) return 'sugar';
  if (isRnaBaseOrAmbiguousRnaBase(monomer)) return 'base';
  if (isPhosphateOrAmbiguousPhosphate(monomer)) return 'phosphate';
  return null;
}
var HYDROGEN = 'hydrogen';
function computeLostBondsForMonomerReplacement(oldMonomer, newFreeAPs) {
  return collectMonomerBonds(oldMonomer).filter(function (record) {
    return record.attachmentPointName !== HYDROGEN && !newFreeAPs.has(record.attachmentPointName);
  });
}
function computeLostBondsForPresetReplacement(originalComponents, newFreeAPsByRole, rolePresent) {
  var lost = [];
  var _iterator4 = _createForOfIteratorHelper(originalComponents),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var component = _step4.value;
      var externalBonds = collectMonomerBonds(component).filter(function (record) {
        return !originalComponents.includes(record.otherEntity) && record.attachmentPointName !== HYDROGEN;
      });
      var role = getPresetComponentRole(component);
      if (!role || !rolePresent[role]) {
        lost.push.apply(lost, _toConsumableArray(externalBonds));
        continue;
      }
      var freeAPs = newFreeAPsByRole[role];
      var _iterator5 = _createForOfIteratorHelper(externalBonds),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var record = _step5.value;
          if (!freeAPs.has(record.attachmentPointName)) {
            lost.push(record);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  return lost;
}

export { collectMonomerBonds, computeLostBondsForMonomerReplacement, computeLostBondsForPresetReplacement, computeReestablishableBonds, getMatchingPresetComponents, getPresetComponentRole, getPresetPhosphateFromSugar, getPresetSugarForMonomer };
//# sourceMappingURL=replacementHelpers.modern.js.map
