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
var action = require('./action.js');
var actionTransaction = require('./actionTransaction.js');
var atom = require('./atom.js');
var atomMerge = require('./atomMerge.js');
var bond = require('./bond.js');
var utils = require('../shared/utils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function fromItemsFuse(restruct, items) {
  var action$1 = new action.Action();
  if (!items) return action$1;
  var transaction = new actionTransaction.ActionTransaction(restruct);
  try {
    var usedAtoms = new Set();
    var connectedAtomIds = getAllConnectedAtomsIds(restruct, mergeMapOfItemsToSet(items.atoms), mergeMapOfItemsToSet(items.bonds));
    items.atoms.forEach(function (dst, src) {
      if (usedAtoms.has(dst) || usedAtoms.has(src)) return;
      var atomMergeAction = atomMerge.fromAtomMerge(restruct, src, dst);
      transaction.capture(atomMergeAction);
      action$1 = atomMergeAction.mergeWith(action$1);
      usedAtoms.add(dst).add(src);
    });
    var bondsMergeAction = bond.fromBondsMerge(restruct, items.bonds);
    transaction.capture(bondsMergeAction);
    action$1 = bondsMergeAction.mergeWith(action$1);
    var valenceAction = valenceCheck(restruct, connectedAtomIds);
    transaction.capture(valenceAction);
    action$1 = valenceAction.mergeWith(action$1);
    transaction.commit();
    return action$1;
  } catch (cause) {
    return transaction.rollback(cause);
  }
}
function getItemsToFuse(struct, mergeCandidates) {
  return closestToMerge(struct, mergeCandidates);
}
function getHoverToFuse(items) {
  if (!items) return null;
  var hoverItems = _objectSpread(_objectSpread({
    atoms: Array.from(items.atoms.values()),
    bonds: Array.from(items.bonds.values())
  }, items.functionalGroups && {
    functionalGroups: Array.from(items.functionalGroups.values())
  }), items.atomToFunctionalGroup && {
    sgroups: Array.from(items.atomToFunctionalGroup.values())
  });
  return {
    map: 'merge',
    id: +Date.now(),
    items: hoverItems
  };
}
function mergeMapOfItemsToSet(items) {
  var itemsSet = new Set();
  items.forEach(function (value, key) {
    itemsSet.add(value).add(key);
  });
  return itemsSet;
}
function closestToMerge(struct, closestMap) {
  var mergeMap = {
    atoms: new Map(closestMap.atoms),
    bonds: new Map(closestMap.bonds),
    atomToFunctionalGroup: new Map(closestMap.atomToFunctionalGroup)
  };
  closestMap.bonds.forEach(function (dstId, srcId) {
    var bond = struct.bonds.get(srcId);
    var bondCI = struct.bonds.get(dstId);
    if (!bond || !bondCI) {
      mergeMap.bonds["delete"](srcId);
      return;
    }
    var mergeParams = utils["default"].mergeBondsParams(struct, bond, struct, bondCI);
    if (mergeParams !== null && mergeParams !== void 0 && mergeParams.merged) {
      mergeMap.atoms["delete"](bond.begin);
      mergeMap.atoms["delete"](bond.end);
    } else {
      mergeMap.bonds["delete"](srcId);
    }
  });
  if (mergeMap.atoms.size === 0 && mergeMap.bonds.size === 0 && mergeMap.atomToFunctionalGroup.size === 0) {
    return null;
  }
  return mergeMap;
}
function getAllConnectedAtomsIds(restruct, atomsIds, bondsIds) {
  var initialAtoms = new Set(atomsIds);
  var connectedAtoms = new Set();
  var _iterator = _createForOfIteratorHelper(bondsIds),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var bondId = _step.value;
      var bond = restruct.bonds.get(bondId);
      if (bond) {
        var _bond$b = bond.b,
          begin = _bond$b.begin,
          end = _bond$b.end;
        initialAtoms.add(begin).add(end);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var _iterator2 = _createForOfIteratorHelper(initialAtoms),
    _step2;
  try {
    var _loop = function _loop() {
      var initialAtom = _step2.value;
      if (connectedAtoms.has(initialAtom)) return 1;
      var relevantConnectedComponent = _toConsumableArray__default["default"](restruct.connectedComponents.values()).find(function (component) {
        return component.has(initialAtom);
      });
      if (relevantConnectedComponent) relevantConnectedComponent.forEach(function (id) {
        return connectedAtoms.add(id);
      });
    };
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      if (_loop()) continue;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return connectedAtoms;
}
function valenceCheck(restruct, atomIds) {
  var action$1 = new action.Action();
  if (!atomIds) return action$1;
  var usedAtoms = new Set();
  atomIds.forEach(function (atomId) {
    if (usedAtoms.has(atomId)) return;
    action$1 = atom.checkAtomValence(restruct, atomId).mergeWith(action$1);
    usedAtoms.add(atomId);
  });
  return action$1;
}

exports.fromItemsFuse = fromItemsFuse;
exports.getHoverToFuse = getHoverToFuse;
exports.getItemsToFuse = getItemsToFuse;
exports.mergeMapOfItemsToSet = mergeMapOfItemsToSet;
//# sourceMappingURL=closelyFusing.js.map
