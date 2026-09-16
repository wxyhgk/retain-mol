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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { FunctionalGroupsProvider } from '../helpers/functionalGroupsProvider.modern.js';
import { SaltsAndSolventsProvider } from '../helpers/saltsAndSolventsProvider.modern.js';
import '../constants/generics.modern.js';
import '../helpers/attachmentPointCalculations.modern.js';
import { SGroup } from './sgroup.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var isSaltOrSolvent = function isSaltOrSolvent(moleculeName) {
  var saltsAndSolventsProvider = SaltsAndSolventsProvider.getInstance();
  var saltsAndSolvents = saltsAndSolventsProvider.getSaltsAndSolventsList();
  return saltsAndSolvents.some(function (_ref) {
    var name = _ref.name,
      abbreviation = _ref.abbreviation;
    return name === moleculeName || moleculeName === abbreviation;
  });
};
var getSGroupBonds = function getSGroupBonds(molecule, sgroup) {
  var atoms = sgroup.allAtoms ? Array.from(molecule.atoms.keys()) : sgroup.atoms;
  var bonds = [];
  molecule.bonds.forEach(function (bond, bid) {
    if (atoms.includes(bond.begin) && atoms.includes(bond.end)) {
      bonds.push(bid);
    }
  });
  return bonds;
};
var _sgroup = new WeakMap();
var FunctionalGroup = function () {
  function FunctionalGroup(sgroup) {
    _classCallCheck(this, FunctionalGroup);
    _classPrivateFieldInitSpec(this, _sgroup, {
      writable: true,
      value: void 0
    });
    assert(sgroup != null);
    _classPrivateFieldSet(this, _sgroup, sgroup);
    sgroup.setFunctionalGroup(this);
  }
  _createClass(FunctionalGroup, [{
    key: "name",
    get: function get() {
      return _classPrivateFieldGet(this, _sgroup).data.name;
    }
  }, {
    key: "relatedSGroupId",
    get: function get() {
      return _classPrivateFieldGet(this, _sgroup).id;
    }
  }, {
    key: "isExpanded",
    get: function get() {
      return Boolean(_classPrivateFieldGet(this, _sgroup).data.expanded);
    }
  }, {
    key: "relatedSGroup",
    get: function get() {
      return _classPrivateFieldGet(this, _sgroup);
    }
  }], [{
    key: "isFunctionalGroup",
    value: function isFunctionalGroup(sgroup) {
      var provider = FunctionalGroupsProvider.getInstance();
      var functionalGroups = provider.getFunctionalGroupsList();
      var name = sgroup.data.name,
        type = sgroup.type;
      return type === 'SUP' && (functionalGroups.some(function (type) {
        return type.name === name;
      }) || isSaltOrSolvent(name));
    }
  }, {
    key: "atomsInFunctionalGroup",
    value: function atomsInFunctionalGroup(functionalGroups, atom) {
      var isNeedCheckForGroups = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (functionalGroups.size === 0) {
        return null;
      }
      var _iterator = _createForOfIteratorHelper(functionalGroups.values()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var fg = _step.value;
          var isFunctionalGroup = isNeedCheckForGroups ? this.isFunctionalGroup(fg.relatedSGroup) : true;
          if (isFunctionalGroup && fg.relatedSGroup.atoms.includes(atom)) return atom;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return null;
    }
  }, {
    key: "bondsInFunctionalGroup",
    value: function bondsInFunctionalGroup(molecule, functionalGroups, bond) {
      if (functionalGroups.size === 0) {
        return null;
      }
      var _iterator2 = _createForOfIteratorHelper(functionalGroups.values()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var fg = _step2.value;
          var bonds = getSGroupBonds(molecule, fg.relatedSGroup);
          if (bonds.includes(bond)) return bond;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return null;
    }
  }, {
    key: "isRGroupAttachmentPointInsideFunctionalGroup",
    value: function isRGroupAttachmentPointInsideFunctionalGroup(molecule, id) {
      var rgroupAttachmentPoint = molecule.rgroupAttachmentPoints.get(id);
      assert(rgroupAttachmentPoint != null);
      var attachedAtom = rgroupAttachmentPoint.atomId;
      return FunctionalGroup.atomsInFunctionalGroup(molecule.functionalGroups, attachedAtom);
    }
  }, {
    key: "findFunctionalGroupByAtom",
    value: function findFunctionalGroupByAtom(functionalGroups, atomId, isFunctionalGroupReturned) {
      var _iterator3 = _createForOfIteratorHelper(functionalGroups.values()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var fg = _step3.value;
          if (!fg.relatedSGroup.isSuperatomWithoutLabel && fg.relatedSGroup.atoms.includes(atomId)) return isFunctionalGroupReturned ? fg : fg.relatedSGroupId;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return null;
    }
  }, {
    key: "findFunctionalGroupByBond",
    value: function findFunctionalGroupByBond(molecule, functionalGroups, bondId, isFunctionalGroupReturned) {
      var _iterator4 = _createForOfIteratorHelper(functionalGroups.values()),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var fg = _step4.value;
          var bonds = getSGroupBonds(molecule, fg.relatedSGroup);
          if (bondId !== null && !fg.relatedSGroup.isSuperatomWithoutLabel && bonds.includes(bondId)) {
            return isFunctionalGroupReturned ? fg : fg.relatedSGroupId;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      return null;
    }
  }, {
    key: "findFunctionalGroupBySGroup",
    value: function findFunctionalGroupBySGroup(functionalGroups, sGroup) {
      var key = functionalGroups.find(function (_, functionalGroup) {
        return functionalGroup.relatedSGroupId === (sGroup === null || sGroup === void 0 ? void 0 : sGroup.id);
      });
      return key !== null ? functionalGroups.get(key) : undefined;
    }
  }, {
    key: "clone",
    value: function clone(functionalGroup) {
      return new FunctionalGroup(_classPrivateFieldGet(functionalGroup, _sgroup));
    }
  }, {
    key: "isAtomInContractedFunctionalGroup",
    value: function isAtomInContractedFunctionalGroup(atom, sgroups, functionalGroups) {
      return _toConsumableArray(atom.sgs.values()).some(function (sgid) {
        var sgroup = sgroups.get(sgid);
        if (!sgroup) {
          return false;
        }
        return FunctionalGroup.isContractedFunctionalGroup('item' in sgroup ? sgroup.item : sgroup, functionalGroups);
      });
    }
  }, {
    key: "isBondInContractedFunctionalGroup",
    value: function isBondInContractedFunctionalGroup(bond, sGroups, functionalGroups) {
      return _toConsumableArray(sGroups.values()).some(function (_sGroup) {
        var _sGroup$atoms;
        var sGroup = 'item' in _sGroup ? _sGroup === null || _sGroup === void 0 ? void 0 : _sGroup.item : _sGroup;
        var atomsInSGroup = (_sGroup$atoms = sGroup === null || sGroup === void 0 ? void 0 : sGroup.atoms) !== null && _sGroup$atoms !== void 0 ? _sGroup$atoms : [];
        var isContracted = FunctionalGroup.isContractedFunctionalGroup(sGroup, functionalGroups);
        return isContracted && atomsInSGroup.includes(bond.begin) && atomsInSGroup.includes(bond.end);
      });
    }
  }, {
    key: "isHalfBondInContractedFunctionalGroup",
    value: function isHalfBondInContractedFunctionalGroup(halfBond, struct) {
      var bond = struct.bonds.get(halfBond.bid);
      assert(bond != null);
      return this.isBondInContractedFunctionalGroup(bond, struct.sgroups, struct.functionalGroups);
    }
  }, {
    key: "isContractedFunctionalGroup",
    value: function isContractedFunctionalGroup(sgroup, functionalGroups) {
      var isFunctionalGroup = false;
      var expanded = false;
      if (sgroup instanceof SGroup) {
        if (sgroup.functionalGroup) {
          isFunctionalGroup = true;
          expanded = sgroup.functionalGroup.isExpanded;
        }
      } else {
        functionalGroups.forEach(function (fg) {
          if (fg.relatedSGroupId === sgroup) {
            isFunctionalGroup = true;
            expanded = fg.isExpanded;
          }
        });
      }
      return !expanded && isFunctionalGroup;
    }
  }]);
  return FunctionalGroup;
}();

export { FunctionalGroup };
//# sourceMappingURL=functionalGroup.modern.js.map
