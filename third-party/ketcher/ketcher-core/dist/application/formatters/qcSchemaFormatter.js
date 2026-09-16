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
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _typeof = require('@babel/runtime/helpers/typeof');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var computationalFormatMetadata = require('./computationalFormatMetadata.js');
var elements = require('../../domain/constants/elements.js');
require('../../domain/constants/element.types.js');
require('../../domain/constants/generics.js');
require('../../domain/constants/chains.js');
require('../../domain/constants/monomers.js');
var atom = require('../../domain/entities/atom.js');
require('../../domain/entities/atomList.js');
var bond = require('../../domain/entities/bond.js');
require('../../domain/entities/fixedPrecision.js');
require('../../domain/entities/fragment.js');
require('../../domain/entities/functionalGroup.js');
require('../../domain/entities/halfBond.js');
require('../../domain/entities/loop.js');
require('../../domain/entities/rgroup.js');
require('../../domain/entities/rgroupAttachmentPoint.js');
require('../../domain/entities/rxnArrow.js');
require('../../domain/entities/rxnPlus.js');
require('../../domain/entities/sgroup.js');
require('../../domain/entities/sgroupForest.js');
require('../../domain/entities/simpleObject.js');
var struct = require('../../domain/entities/struct.js');
require('../../domain/entities/text.js');
require('../../domain/entities/pile.js');
var vec2 = require('../../domain/entities/vec2.js');
require('../../domain/entities/box2Abs.js');
require('../../domain/entities/pool.js');
require('../../domain/entities/image.js');
require('../../domain/entities/multitailArrow.js');
require('../../domain/entities/highlight.js');
require('../../domain/entities/sGroupAttachmentPoint.js');
require('../../domain/entities/monomerMicromolecule.js');
require('../../domain/entities/Peptide.js');
require('../../domain/entities/BaseMonomer.js');
require('../../domain/entities/Chem.js');
require('../../domain/entities/Sugar.js');
require('../../domain/entities/RNABase.js');
require('../../domain/entities/Phosphate.js');
require('../../domain/entities/Axis.js');
require('../../domain/entities/Nucleoside.js');
require('../../domain/entities/Nucleotide.js');
require('../../domain/entities/monomer-chains/types.js');
require('../../domain/entities/monomer-chains/Chain.js');
require('../../domain/entities/monomer-chains/ChainsCollection.js');
require('../../domain/entities/MonomerSequenceNode.js');
require('../../domain/entities/EmptySequenceNode.js');
require('../../domain/entities/LinkerSequenceNode.js');
require('../../domain/entities/UnresolvedMonomer.js');
require('../../domain/entities/UnsplitNucleotide.js');
require('../../domain/entities/PolymerBond.js');
require('../../domain/entities/AmbiguousMonomer.js');
require('../../domain/entities/MonomerToAtomBond.js');
require('../../domain/entities/HydrogenBond.js');
require('../../domain/entities/SGroupDrawingEntity.js');
require('../../domain/entities/BackBoneSequenceNode.js');
require('../../domain/entities/Command.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
require('../../domain/entities/CoreAtom.js');
require('../../domain/entities/CoreStereoFlag.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var BOHR_TO_ANGSTROM = 0.529177210903;
function parseError(message) {
  return new Error("QCSchema parse error: ".concat(message));
}
function isRecord(value) {
  return value !== null && _typeof__default["default"](value) === 'object' && !Array.isArray(value);
}
function parseJSON(content) {
  var parsed;
  try {
    parsed = JSON.parse(content);
  } catch (_unused) {
    throw parseError('invalid JSON');
  }
  if (!isRecord(parsed)) throw parseError('expected a molecule object');
  return parsed;
}
function parseSymbols(value) {
  if (!Array.isArray(value) || !value.length) {
    throw parseError('symbols must be a non-empty array');
  }
  return value.map(function (symbol, index) {
    if (typeof symbol !== 'string' || !elements.Elements.get(symbol)) {
      throw parseError("unsupported symbol at index ".concat(index));
    }
    return symbol;
  });
}
function parseGeometry(value, atomCount) {
  var flattened = Array.isArray(value) && value.every(function (item) {
    return Array.isArray(item);
  }) ? value.flat() : value;
  if (!Array.isArray(flattened) || flattened.length !== atomCount * 3 || !flattened.every(function (coordinate) {
    return Number.isFinite(typeof coordinate === 'number' ? coordinate : NaN);
  })) {
    throw parseError("geometry must contain ".concat(atomCount * 3, " finite numbers"));
  }
  return flattened;
}
function parseCharge(value) {
  if (value === undefined) return 0;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw parseError('molecular_charge must be a finite number');
  }
  return value;
}
function parseMultiplicity(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw parseError('molecular_multiplicity must be a positive integer');
  }
  return value;
}
function parseUnits(molecule) {
  var _ref, _molecule$geometry_un;
  var value = (_ref = (_molecule$geometry_un = molecule.geometry_units) !== null && _molecule$geometry_un !== void 0 ? _molecule$geometry_un : molecule.units) !== null && _ref !== void 0 ? _ref : 'bohr';
  if (typeof value !== 'string') throw parseError('invalid geometry units');
  var normalized = value.toLowerCase().replace(/s$/, '');
  if (['angstrom', 'ang'].includes(normalized)) return 'angstrom';
  if (['bohr', 'au', 'a0'].includes(normalized)) return 'bohr';
  throw parseError("unsupported geometry units \"".concat(value, "\""));
}
function getBondType(order) {
  if (order === 1) return bond.Bond.PATTERN.TYPE.SINGLE;
  if (order === 2) return bond.Bond.PATTERN.TYPE.DOUBLE;
  if (order === 3) return bond.Bond.PATTERN.TYPE.TRIPLE;
  if (order === 1.5) return bond.Bond.PATTERN.TYPE.AROMATIC;
  throw parseError("unsupported connectivity bond order ".concat(order));
}
function getBondOrder(type) {
  if (type === bond.Bond.PATTERN.TYPE.SINGLE) return 1;
  if (type === bond.Bond.PATTERN.TYPE.DOUBLE) return 2;
  if (type === bond.Bond.PATTERN.TYPE.TRIPLE) return 3;
  if (type === bond.Bond.PATTERN.TYPE.AROMATIC) return 1.5;
  throw new Error("QCSchema export error: unsupported bond type ".concat(type));
}
function addConnectivity(struct, value, atomIds) {
  if (value === undefined) return;
  if (!Array.isArray(value)) throw parseError('connectivity must be an array');
  var pairs = new Set();
  value.forEach(function (entry, entryIndex) {
    if (!Array.isArray(entry) || entry.length !== 3 || !Number.isSafeInteger(entry[0]) || !Number.isSafeInteger(entry[1]) || typeof entry[2] !== 'number' || !Number.isFinite(entry[2])) {
      throw parseError("invalid connectivity entry at index ".concat(entryIndex));
    }
    var _entry = _slicedToArray__default["default"](entry, 3),
      beginIndex = _entry[0],
      endIndex = _entry[1],
      order = _entry[2];
    if (beginIndex < 0 || endIndex < 0 || beginIndex >= atomIds.length || endIndex >= atomIds.length || beginIndex === endIndex) {
      throw parseError("connectivity index out of range at entry ".concat(entryIndex));
    }
    var pair = [beginIndex, endIndex].sort(function (a, b) {
      return a - b;
    }).join(':');
    if (pairs.has(pair)) {
      throw parseError("duplicate connectivity entry for atoms ".concat(pair));
    }
    pairs.add(pair);
    struct.bonds.add(new bond.Bond({
      begin: atomIds[beginIndex],
      end: atomIds[endIndex],
      type: getBondType(order)
    }));
  });
}
function getTotalFormalCharge(struct) {
  return Array.from(struct.atoms.values()).reduce(function (sum, atom) {
    var _atom$charge;
    return sum + ((_atom$charge = atom.charge) !== null && _atom$charge !== void 0 ? _atom$charge : 0);
  }, 0);
}
var QCSchemaFormatter = function () {
  function QCSchemaFormatter() {
    _classCallCheck__default["default"](this, QCSchemaFormatter);
  }
  _createClass__default["default"](QCSchemaFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(struct) {
        var _metadata$molecularCh;
        var metadata, atomEntries, atomIndexes, geometry, connectivity, molecule;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              metadata = computationalFormatMetadata.getComputationalFormatMetadata(struct);
              atomEntries = Array.from(struct.atoms.entries());
              atomIndexes = new Map(atomEntries.map(function (_ref2, index) {
                var _ref3 = _slicedToArray__default["default"](_ref2, 1),
                  atomId = _ref3[0];
                return [atomId, index];
              }));
              geometry = atomEntries.flatMap(function (_ref4) {
                var _ref5 = _slicedToArray__default["default"](_ref4, 2),
                  atom = _ref5[1];
                return [atom.pp.x / BOHR_TO_ANGSTROM, -atom.pp.y / BOHR_TO_ANGSTROM, atom.pp.z / BOHR_TO_ANGSTROM];
              });
              connectivity = Array.from(struct.bonds.values()).map(function (bond) {
                var begin = atomIndexes.get(bond.begin);
                var end = atomIndexes.get(bond.end);
                if (begin === undefined || end === undefined) {
                  throw new Error('QCSchema export error: bond references a missing atom');
                }
                return [begin, end, getBondOrder(bond.type)];
              });
              molecule = _objectSpread(_objectSpread(_objectSpread({
                schema_name: 'qcschema_molecule',
                schema_version: 2
              }, struct.name ? {
                name: struct.name
              } : {}), {}, {
                symbols: atomEntries.map(function (_ref6) {
                  var _ref7 = _slicedToArray__default["default"](_ref6, 2),
                    atom = _ref7[1];
                  return atom.label;
                }),
                geometry: geometry,
                molecular_charge: (_metadata$molecularCh = metadata === null || metadata === void 0 ? void 0 : metadata.molecularCharge) !== null && _metadata$molecularCh !== void 0 ? _metadata$molecularCh : getTotalFormalCharge(struct)
              }, (metadata === null || metadata === void 0 ? void 0 : metadata.molecularMultiplicity) !== null && (metadata === null || metadata === void 0 ? void 0 : metadata.molecularMultiplicity) !== undefined ? {
                molecular_multiplicity: metadata.molecularMultiplicity
              } : {}), {}, {
                connectivity: connectivity
              });
              return _context.abrupt("return", JSON.stringify(molecule, null, 2));
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function getStringFromStructureAsync(_x) {
        return _getStringFromStructureAsync.apply(this, arguments);
      }
      return getStringFromStructureAsync;
    }()
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(content) {
        var molecule, symbols, geometry, units, scale, molecularCharge, molecularMultiplicity, struct$1, atomIds;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              molecule = parseJSON(content);
              symbols = parseSymbols(molecule.symbols);
              geometry = parseGeometry(molecule.geometry, symbols.length);
              units = parseUnits(molecule);
              scale = units === 'bohr' ? BOHR_TO_ANGSTROM : 1;
              molecularCharge = parseCharge(molecule.molecular_charge);
              molecularMultiplicity = parseMultiplicity(molecule.molecular_multiplicity);
              struct$1 = new struct.Struct();
              struct$1.name = typeof molecule.name === 'string' ? molecule.name : '';
              atomIds = symbols.map(function (symbol, atomIndex) {
                var coordinateIndex = atomIndex * 3;
                return struct$1.atoms.add(new atom.Atom({
                  label: symbol,
                  pp: new vec2.Vec2(geometry[coordinateIndex] * scale, -geometry[coordinateIndex + 1] * scale, geometry[coordinateIndex + 2] * scale)
                }));
              });
              addConnectivity(struct$1, molecule.connectivity, atomIds);
              computationalFormatMetadata.setComputationalFormatMetadata(struct$1, {
                molecularCharge: molecularCharge,
                molecularMultiplicity: molecularMultiplicity,
                sourceGeometryUnits: units
              });
              return _context2.abrupt("return", struct$1);
            case 13:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function getStructureFromStringAsync(_x2) {
        return _getStructureFromStringAsync.apply(this, arguments);
      }
      return getStructureFromStringAsync;
    }()
  }]);
  return QCSchemaFormatter;
}();
function isQCSchemaMolecule(value) {
  if (!isRecord(value)) return false;
  if (value.schema_name === 'qcschema_molecule') return true;
  return Array.isArray(value.symbols) && Array.isArray(value.geometry) && ('molecular_charge' in value || 'molecular_multiplicity' in value || 'connectivity' in value);
}

exports.QCSchemaFormatter = QCSchemaFormatter;
exports.isQCSchemaMolecule = isQCSchemaMolecule;
//# sourceMappingURL=qcSchemaFormatter.js.map
