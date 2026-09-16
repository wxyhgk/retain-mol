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
var moleculeEditPlan_types = require('./moleculeEditPlan.types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function atomCommand(atom) {
  return {
    type: 'addAtom',
    atom: _objectSpread(_objectSpread({
      ref: atom.ref,
      element: atom.element,
      position: {
        x: atom.x,
        y: atom.y
      }
    }, atom.charge !== undefined ? {
      charge: atom.charge
    } : {}), atom.isotope !== undefined ? {
      isotope: atom.isotope
    } : {})
  };
}
function bondCommand(bond) {
  return {
    type: 'addBond',
    bond: _objectSpread({}, bond)
  };
}
function numericRefOrder(first, second) {
  return first.localeCompare(second, undefined, {
    numeric: true
  });
}
function createMoleculeEditPlanFromStruct(structure) {
  if (!structure.atoms.size) {
    throw new Error('Molecule edit plan requires at least one atom');
  }
  var atomRefById = new Map();
  var atoms = [];
  structure.atoms.forEach(function (atom, atomId) {
    var ref = "atom-".concat(atomId + 1);
    atomRefById.set(atomId, ref);
    atoms.push(_objectSpread(_objectSpread({
      ref: ref,
      element: atom.label || 'C',
      x: atom.pp.x,
      y: atom.pp.y
    }, atom.charge !== null ? {
      charge: atom.charge
    } : {}), atom.isotope !== null ? {
      isotope: atom.isotope
    } : {}));
  });
  atoms.sort(function (first, second) {
    return numericRefOrder(first.ref, second.ref);
  });
  var bonds = [];
  structure.bonds.forEach(function (bond, bondId) {
    var begin = atomRefById.get(bond.begin);
    var end = atomRefById.get(bond.end);
    if (!begin || !end) {
      throw new Error("Bond ".concat(bondId, " references a missing atom"));
    }
    bonds.push(_objectSpread({
      ref: "bond-".concat(bondId + 1),
      begin: begin,
      end: end,
      order: bond.type
    }, bond.stereo ? {
      stereo: bond.stereo
    } : {}));
  });
  bonds.sort(function (first, second) {
    return numericRefOrder(first.ref, second.ref);
  });
  var atomByRef = new Map(atoms.map(function (atom) {
    return [atom.ref, atom];
  }));
  var adjacency = new Map(atoms.map(function (atom) {
    return [atom.ref, []];
  }));
  for (var _i = 0, _bonds = bonds; _i < _bonds.length; _i++) {
    var _adjacency$get, _adjacency$get2;
    var bond = _bonds[_i];
    (_adjacency$get = adjacency.get(bond.begin)) === null || _adjacency$get === void 0 || _adjacency$get.push({
      bond: bond,
      neighbor: bond.end
    });
    (_adjacency$get2 = adjacency.get(bond.end)) === null || _adjacency$get2 === void 0 || _adjacency$get2.push({
      bond: bond,
      neighbor: bond.begin
    });
  }
  var steps = [];
  var visitedAtoms = new Set();
  var treeBonds = new Set();
  while (visitedAtoms.size < atoms.length) {
    var root = atoms.filter(function (_ref) {
      var ref = _ref.ref;
      return !visitedAtoms.has(ref);
    }).sort(function (first, second) {
      var _adjacency$get$length, _adjacency$get3, _adjacency$get$length2, _adjacency$get4;
      return ((_adjacency$get$length = (_adjacency$get3 = adjacency.get(first.ref)) === null || _adjacency$get3 === void 0 ? void 0 : _adjacency$get3.length) !== null && _adjacency$get$length !== void 0 ? _adjacency$get$length : 0) - ((_adjacency$get$length2 = (_adjacency$get4 = adjacency.get(second.ref)) === null || _adjacency$get4 === void 0 ? void 0 : _adjacency$get4.length) !== null && _adjacency$get$length2 !== void 0 ? _adjacency$get$length2 : 0) || numericRefOrder(first.ref, second.ref);
    })[0];
    visitedAtoms.add(root.ref);
    steps.push({
      label: "Place ".concat(root.element, " anchor"),
      commands: [atomCommand(root)]
    });
    var queue = [root.ref];
    while (queue.length) {
      var _adjacency$get5;
      var current = queue.shift();
      var neighbors = _toConsumableArray__default["default"]((_adjacency$get5 = adjacency.get(current)) !== null && _adjacency$get5 !== void 0 ? _adjacency$get5 : []).sort(function (first, second) {
        return numericRefOrder(first.neighbor, second.neighbor);
      });
      var _iterator = _createForOfIteratorHelper(neighbors),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _atomByRef$get$elemen, _atomByRef$get;
          var _step$value = _step.value,
            _bond = _step$value.bond,
            neighbor = _step$value.neighbor;
          if (visitedAtoms.has(neighbor)) continue;
          var atom = atomByRef.get(neighbor);
          if (!atom) throw new Error("Atom ".concat(neighbor, " is missing from the plan"));
          visitedAtoms.add(neighbor);
          treeBonds.add(_bond.ref);
          queue.push(neighbor);
          steps.push({
            label: "Extend ".concat((_atomByRef$get$elemen = (_atomByRef$get = atomByRef.get(current)) === null || _atomByRef$get === void 0 ? void 0 : _atomByRef$get.element) !== null && _atomByRef$get$elemen !== void 0 ? _atomByRef$get$elemen : 'atom', "-").concat(atom.element),
            commands: [atomCommand(atom), bondCommand(_bond)]
          });
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }
  var _iterator2 = _createForOfIteratorHelper(bonds.filter(function (_ref2) {
      var ref = _ref2.ref;
      return !treeBonds.has(ref);
    })),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _atomByRef$get$elemen2, _atomByRef$get2, _atomByRef$get$elemen3, _atomByRef$get3;
      var _bond2 = _step2.value;
      steps.push({
        label: "Connect ".concat((_atomByRef$get$elemen2 = (_atomByRef$get2 = atomByRef.get(_bond2.begin)) === null || _atomByRef$get2 === void 0 ? void 0 : _atomByRef$get2.element) !== null && _atomByRef$get$elemen2 !== void 0 ? _atomByRef$get$elemen2 : 'atom', "-").concat((_atomByRef$get$elemen3 = (_atomByRef$get3 = atomByRef.get(_bond2.end)) === null || _atomByRef$get3 === void 0 ? void 0 : _atomByRef$get3.element) !== null && _atomByRef$get$elemen3 !== void 0 ? _atomByRef$get$elemen3 : 'atom').concat(_bond2.order > 1 ? " (order ".concat(_bond2.order, ")") : ''),
        commands: [bondCommand(_bond2)]
      });
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return {
    schema: moleculeEditPlan_types.MOLECULE_EDIT_PLAN_SCHEMA,
    atomCount: atoms.length,
    bondCount: bonds.length,
    atoms: atoms,
    bonds: bonds,
    steps: steps.map(function (step, index) {
      return _objectSpread({
        id: "step-".concat(String(index + 1).padStart(3, '0'))
      }, step);
    })
  };
}

exports.createMoleculeEditPlanFromStruct = createMoleculeEditPlanFromStruct;
//# sourceMappingURL=moleculeEditPlan.js.map
