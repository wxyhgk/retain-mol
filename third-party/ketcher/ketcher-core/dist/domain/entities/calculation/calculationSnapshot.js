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
var _typeof = require('@babel/runtime/helpers/typeof');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var elements = require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
require('../../constants/chains.js');
require('../../constants/monomers.js');
var bond = require('../bond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var CALCULATION_SNAPSHOT_SCHEMA_VERSION = '1.0';
function assertFiniteNumber(value, description) {
  if (!Number.isFinite(value)) {
    throw new Error("".concat(description, " must be a finite number"));
  }
}
function assertInteger(value, description) {
  if (!Number.isInteger(value)) {
    throw new Error("".concat(description, " must be an integer"));
  }
}
function getBondOrder(bondType) {
  switch (bondType) {
    case bond.Bond.PATTERN.TYPE.SINGLE:
    case bond.Bond.PATTERN.TYPE.DATIVE:
    case bond.Bond.PATTERN.TYPE.HYDROGEN:
      return 1;
    case bond.Bond.PATTERN.TYPE.DOUBLE:
      return 2;
    case bond.Bond.PATTERN.TYPE.TRIPLE:
      return 3;
    case bond.Bond.PATTERN.TYPE.AROMATIC:
      return 1.5;
    default:
      return null;
  }
}
function buildFragments(atoms, connectivity) {
  var neighbors = atoms.map(function () {
    return new Set();
  });
  connectivity.forEach(function (_ref) {
    var _ref$atomIndices = _slicedToArray__default["default"](_ref.atomIndices, 2),
      begin = _ref$atomIndices[0],
      end = _ref$atomIndices[1];
    neighbors[begin].add(end);
    neighbors[end].add(begin);
  });
  var visited = new Set();
  var fragments = [];
  atoms.forEach(function (_atom, firstIndex) {
    if (visited.has(firstIndex)) return;
    var pending = [firstIndex];
    var atomIndices = [];
    visited.add(firstIndex);
    while (pending.length > 0) {
      var atomIndex = pending.pop();
      if (atomIndex === undefined) break;
      atomIndices.push(atomIndex);
      neighbors[atomIndex].forEach(function (neighborIndex) {
        if (!visited.has(neighborIndex)) {
          visited.add(neighborIndex);
          pending.push(neighborIndex);
        }
      });
    }
    atomIndices.sort(function (left, right) {
      return left - right;
    });
    fragments.push({
      index: fragments.length,
      atomIndices: atomIndices,
      sourceAtomIds: atomIndices.map(function (atomIndex) {
        return atoms[atomIndex].sourceAtomId;
      }),
      totalFormalCharge: atomIndices.reduce(function (charge, atomIndex) {
        return charge + atoms[atomIndex].formalCharge;
      }, 0)
    });
  });
  return fragments;
}
function hashRevision(value) {
  var serialized = JSON.stringify(value);
  var hash = 0x811c9dc5;
  for (var index = 0; index < serialized.length; index++) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return "fnv1a32:".concat((hash >>> 0).toString(16).padStart(8, '0'));
}
function deepFreeze(value) {
  if (value && _typeof__default["default"](value) === 'object' && !Object.isFrozen(value)) {
    Object.getOwnPropertyNames(value).forEach(function (property) {
      deepFreeze(value[property]);
    });
    Object.freeze(value);
  }
  return value;
}
function createCalculationSnapshotV1(struct) {
  var _options$coordinateSc, _options$totalCharge, _options$multiplicity, _options$sourceId;
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var coordinateScaleToAngstrom = (_options$coordinateSc = options.coordinateScaleToAngstrom) !== null && _options$coordinateSc !== void 0 ? _options$coordinateSc : 1;
  assertFiniteNumber(coordinateScaleToAngstrom, 'coordinateScaleToAngstrom');
  if (coordinateScaleToAngstrom <= 0) {
    throw new Error('coordinateScaleToAngstrom must be greater than zero');
  }
  var sourceAtomIds = Array.from(struct.atoms.keys()).sort(function (left, right) {
    return left - right;
  });
  var sourceAtomIdToIndex = new Map();
  var atoms = sourceAtomIds.map(function (sourceAtomId, index) {
    var _Elements$get$number, _Elements$get, _atom$charge, _atom$implicitHCount;
    var atom = struct.atoms.get(sourceAtomId);
    if (!atom) {
      throw new Error("atom ".concat(sourceAtomId, " is missing from the source Struct"));
    }
    var coordinatesAngstrom = [atom.pp.x * coordinateScaleToAngstrom, atom.pp.y * coordinateScaleToAngstrom, atom.pp.z * coordinateScaleToAngstrom];
    coordinatesAngstrom.forEach(function (coordinate, coordinateIndex) {
      assertFiniteNumber(coordinate, "atom ".concat(sourceAtomId, " coordinate ").concat(coordinateIndex));
    });
    sourceAtomIdToIndex.set(sourceAtomId, index);
    return {
      index: index,
      sourceAtomId: sourceAtomId,
      sourceAtomRef: "atom:".concat(sourceAtomId),
      element: atom.label,
      atomicNumber: (_Elements$get$number = (_Elements$get = elements.Elements.get(atom.label)) === null || _Elements$get === void 0 ? void 0 : _Elements$get.number) !== null && _Elements$get$number !== void 0 ? _Elements$get$number : null,
      coordinatesAngstrom: coordinatesAngstrom,
      formalCharge: (_atom$charge = atom.charge) !== null && _atom$charge !== void 0 ? _atom$charge : 0,
      isotope: atom.isotope,
      radical: atom.radical,
      implicitHydrogenCount: (_atom$implicitHCount = atom.implicitHCount) !== null && _atom$implicitHCount !== void 0 ? _atom$implicitHCount : atom.implicitH
    };
  });
  var connectivity = Array.from(struct.bonds.entries()).sort(function (_ref2, _ref3) {
    var _ref4 = _slicedToArray__default["default"](_ref2, 1),
      leftId = _ref4[0];
    var _ref5 = _slicedToArray__default["default"](_ref3, 1),
      rightId = _ref5[0];
    return leftId - rightId;
  }).map(function (_ref6) {
    var _ref7 = _slicedToArray__default["default"](_ref6, 2),
      sourceBondId = _ref7[0],
      bond = _ref7[1];
    var beginIndex = sourceAtomIdToIndex.get(bond.begin);
    var endIndex = sourceAtomIdToIndex.get(bond.end);
    if (beginIndex === undefined || endIndex === undefined) {
      throw new Error("bond ".concat(sourceBondId, " references an atom outside the source Struct"));
    }
    return {
      sourceBondId: sourceBondId,
      sourceBondRef: "bond:".concat(sourceBondId),
      atomIndices: [beginIndex, endIndex],
      order: getBondOrder(bond.type),
      ketcherBondType: bond.type
    };
  });
  var totalCharge = (_options$totalCharge = options.totalCharge) !== null && _options$totalCharge !== void 0 ? _options$totalCharge : atoms.reduce(function (charge, atom) {
    return charge + atom.formalCharge;
  }, 0);
  assertInteger(totalCharge, 'totalCharge');
  var multiplicity = (_options$multiplicity = options.multiplicity) !== null && _options$multiplicity !== void 0 ? _options$multiplicity : null;
  if (multiplicity !== null) {
    assertInteger(multiplicity, 'multiplicity');
    if (multiplicity < 1) throw new Error('multiplicity must be at least one');
  }
  var snapshotWithoutRevision = {
    schemaVersion: CALCULATION_SNAPSHOT_SCHEMA_VERSION,
    atoms: atoms,
    symbols: atoms.map(function (atom) {
      return atom.element;
    }),
    geometryAngstrom: atoms.map(function (atom) {
      return atom.coordinatesAngstrom;
    }),
    atomOrder: atoms.map(function (_ref8) {
      var index = _ref8.index,
        sourceAtomId = _ref8.sourceAtomId,
        sourceAtomRef = _ref8.sourceAtomRef;
      return {
        index: index,
        sourceAtomId: sourceAtomId,
        sourceAtomRef: sourceAtomRef
      };
    }),
    connectivity: connectivity,
    totalCharge: totalCharge,
    multiplicity: multiplicity,
    fragments: buildFragments(atoms, connectivity),
    source: {
      type: 'ketcher-struct',
      name: struct.name || null,
      sourceId: (_options$sourceId = options.sourceId) !== null && _options$sourceId !== void 0 ? _options$sourceId : null
    },
    provenance: {
      generator: 'ketcher-core',
      operation: 'createCalculationSnapshotV1',
      coordinateScaleToAngstrom: coordinateScaleToAngstrom,
      totalChargeOrigin: options.totalCharge === undefined ? 'formal-charges' : 'override',
      multiplicityOrigin: options.multiplicity === undefined || options.multiplicity === null ? 'unspecified' : 'override'
    }
  };
  var snapshot = _objectSpread(_objectSpread({}, snapshotWithoutRevision), {}, {
    revision: hashRevision(snapshotWithoutRevision)
  });
  return deepFreeze(snapshot);
}

exports.CALCULATION_SNAPSHOT_SCHEMA_VERSION = CALCULATION_SNAPSHOT_SCHEMA_VERSION;
exports.createCalculationSnapshotV1 = createCalculationSnapshotV1;
//# sourceMappingURL=calculationSnapshot.js.map
