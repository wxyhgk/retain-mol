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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _typeof from '@babel/runtime/helpers/typeof';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { getComputationalFormatMetadata, setComputationalFormatMetadata } from './computationalFormatMetadata.modern.js';
import { Elements } from '../../domain/constants/elements.modern.js';
import '../../domain/constants/element.types.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/constants/chains.modern.js';
import '../../domain/constants/monomers.modern.js';
import { Atom } from '../../domain/entities/atom.modern.js';
import '../../domain/entities/atomList.modern.js';
import { Bond } from '../../domain/entities/bond.modern.js';
import '../../domain/entities/fixedPrecision.modern.js';
import '../../domain/entities/fragment.modern.js';
import '../../domain/entities/functionalGroup.modern.js';
import '../../domain/entities/halfBond.modern.js';
import '../../domain/entities/loop.modern.js';
import '../../domain/entities/rgroup.modern.js';
import '../../domain/entities/rgroupAttachmentPoint.modern.js';
import '../../domain/entities/rxnArrow.modern.js';
import '../../domain/entities/rxnPlus.modern.js';
import '../../domain/entities/sgroup.modern.js';
import '../../domain/entities/sgroupForest.modern.js';
import '../../domain/entities/simpleObject.modern.js';
import { Struct } from '../../domain/entities/struct.modern.js';
import '../../domain/entities/text.modern.js';
import '../../domain/entities/pile.modern.js';
import { Vec2 } from '../../domain/entities/vec2.modern.js';
import '../../domain/entities/box2Abs.modern.js';
import '../../domain/entities/pool.modern.js';
import '../../domain/entities/image.modern.js';
import '../../domain/entities/multitailArrow.modern.js';
import '../../domain/entities/highlight.modern.js';
import '../../domain/entities/sGroupAttachmentPoint.modern.js';
import '../../domain/entities/monomerMicromolecule.modern.js';
import '../../domain/entities/Peptide.modern.js';
import '../../domain/entities/BaseMonomer.modern.js';
import '../../domain/entities/Chem.modern.js';
import '../../domain/entities/Sugar.modern.js';
import '../../domain/entities/RNABase.modern.js';
import '../../domain/entities/Phosphate.modern.js';
import '../../domain/entities/Axis.modern.js';
import '../../domain/entities/Nucleoside.modern.js';
import '../../domain/entities/Nucleotide.modern.js';
import '../../domain/entities/monomer-chains/types.modern.js';
import '../../domain/entities/monomer-chains/Chain.modern.js';
import '../../domain/entities/monomer-chains/ChainsCollection.modern.js';
import '../../domain/entities/MonomerSequenceNode.modern.js';
import '../../domain/entities/EmptySequenceNode.modern.js';
import '../../domain/entities/LinkerSequenceNode.modern.js';
import '../../domain/entities/UnresolvedMonomer.modern.js';
import '../../domain/entities/UnsplitNucleotide.modern.js';
import '../../domain/entities/PolymerBond.modern.js';
import '../../domain/entities/AmbiguousMonomer.modern.js';
import '../../domain/entities/MonomerToAtomBond.modern.js';
import '../../domain/entities/HydrogenBond.modern.js';
import '../../domain/entities/SGroupDrawingEntity.modern.js';
import '../../domain/entities/BackBoneSequenceNode.modern.js';
import '../../domain/entities/Command.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import '../../domain/entities/CoreAtom.modern.js';
import '../../domain/entities/CoreStereoFlag.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var BOHR_TO_ANGSTROM = 0.529177210903;
function parseError(message) {
  return new Error("QCSchema parse error: ".concat(message));
}
function isRecord(value) {
  return value !== null && _typeof(value) === 'object' && !Array.isArray(value);
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
    if (typeof symbol !== 'string' || !Elements.get(symbol)) {
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
  if (order === 1) return Bond.PATTERN.TYPE.SINGLE;
  if (order === 2) return Bond.PATTERN.TYPE.DOUBLE;
  if (order === 3) return Bond.PATTERN.TYPE.TRIPLE;
  if (order === 1.5) return Bond.PATTERN.TYPE.AROMATIC;
  throw parseError("unsupported connectivity bond order ".concat(order));
}
function getBondOrder(type) {
  if (type === Bond.PATTERN.TYPE.SINGLE) return 1;
  if (type === Bond.PATTERN.TYPE.DOUBLE) return 2;
  if (type === Bond.PATTERN.TYPE.TRIPLE) return 3;
  if (type === Bond.PATTERN.TYPE.AROMATIC) return 1.5;
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
    var _entry = _slicedToArray(entry, 3),
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
    struct.bonds.add(new Bond({
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
    _classCallCheck(this, QCSchemaFormatter);
  }
  _createClass(QCSchemaFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(struct) {
        var _metadata$molecularCh;
        var metadata, atomEntries, atomIndexes, geometry, connectivity, molecule;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              metadata = getComputationalFormatMetadata(struct);
              atomEntries = Array.from(struct.atoms.entries());
              atomIndexes = new Map(atomEntries.map(function (_ref2, index) {
                var _ref3 = _slicedToArray(_ref2, 1),
                  atomId = _ref3[0];
                return [atomId, index];
              }));
              geometry = atomEntries.flatMap(function (_ref4) {
                var _ref5 = _slicedToArray(_ref4, 2),
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
                  var _ref7 = _slicedToArray(_ref6, 2),
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
      var _getStructureFromStringAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(content) {
        var molecule, symbols, geometry, units, scale, molecularCharge, molecularMultiplicity, struct, atomIds;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              molecule = parseJSON(content);
              symbols = parseSymbols(molecule.symbols);
              geometry = parseGeometry(molecule.geometry, symbols.length);
              units = parseUnits(molecule);
              scale = units === 'bohr' ? BOHR_TO_ANGSTROM : 1;
              molecularCharge = parseCharge(molecule.molecular_charge);
              molecularMultiplicity = parseMultiplicity(molecule.molecular_multiplicity);
              struct = new Struct();
              struct.name = typeof molecule.name === 'string' ? molecule.name : '';
              atomIds = symbols.map(function (symbol, atomIndex) {
                var coordinateIndex = atomIndex * 3;
                return struct.atoms.add(new Atom({
                  label: symbol,
                  pp: new Vec2(geometry[coordinateIndex] * scale, -geometry[coordinateIndex + 1] * scale, geometry[coordinateIndex + 2] * scale)
                }));
              });
              addConnectivity(struct, molecule.connectivity, atomIds);
              setComputationalFormatMetadata(struct, {
                molecularCharge: molecularCharge,
                molecularMultiplicity: molecularMultiplicity,
                sourceGeometryUnits: units
              });
              return _context2.abrupt("return", struct);
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

export { QCSchemaFormatter, isQCSchemaMolecule };
//# sourceMappingURL=qcSchemaFormatter.modern.js.map
