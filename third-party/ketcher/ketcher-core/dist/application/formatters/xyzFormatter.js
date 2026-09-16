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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var computationalFormatMetadata = require('./computationalFormatMetadata.js');
var elements = require('../../domain/constants/elements.js');
require('../../domain/constants/element.types.js');
require('../../domain/constants/generics.js');
require('../../domain/constants/chains.js');
require('../../domain/constants/monomers.js');
var atom = require('../../domain/entities/atom.js');
require('../../domain/entities/atomList.js');
require('../../domain/entities/bond.js');
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
require('@babel/runtime/helpers/typeof');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var EXTENDED_XYZ_PROPERTIES = 'Properties';
function parseError(message, lineNumber) {
  var location = lineNumber ? " at line ".concat(lineNumber) : '';
  return new Error("XYZ parse error".concat(location, ": ").concat(message));
}
function normalizeElementSymbol(symbol) {
  if (!symbol) return '';
  return symbol[0].toUpperCase() + symbol.slice(1).toLowerCase();
}
function parseFiniteNumber(value, description, lineNumber) {
  var parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw parseError("invalid ".concat(description, " \"").concat(value !== null && value !== void 0 ? value : '', "\""), lineNumber);
  }
  return parsed;
}
function parseAtomCount(value, lineNumber) {
  var parsed = Number(value.trim());
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw parseError("invalid atom count \"".concat(value.trim(), "\""), lineNumber);
  }
  return parsed;
}
function getXYZLines(content) {
  var lines = content.replace(/^\uFEFF/, '').split(/\r\n|[\n\r]/g);
  var firstLineIndex = lines.findIndex(function (line) {
    return line.trim().length > 0;
  });
  if (firstLineIndex === -1) throw parseError('missing atom count');
  var atomCount = parseAtomCount(lines[firstLineIndex], firstLineIndex + 1);
  var commentLineIndex = firstLineIndex + 1;
  if (commentLineIndex >= lines.length) {
    throw parseError('missing comment line', commentLineIndex + 1);
  }
  var atomLines = lines.slice(commentLineIndex + 1).map(function (line, index) {
    return {
      content: line.trim(),
      lineNumber: commentLineIndex + index + 2
    };
  }).filter(function (_ref) {
    var content = _ref.content;
    return content.length > 0;
  });
  if (atomLines.length < atomCount) {
    throw parseError("expected ".concat(atomCount, " atoms, found ").concat(atomLines.length));
  }
  if (atomLines.length > atomCount) {
    throw parseError('multiple XYZ frames are not supported');
  }
  return {
    atomCount: atomCount,
    comment: lines[commentLineIndex],
    atomLines: atomLines
  };
}
function getElement(value, lineNumber) {
  var symbol = value;
  if (/^\d+$/.test(value)) {
    var _Elements$get$label, _Elements$get;
    var atomicNumber = Number(value);
    symbol = (_Elements$get$label = (_Elements$get = elements.Elements.get(atomicNumber)) === null || _Elements$get === void 0 ? void 0 : _Elements$get.label) !== null && _Elements$get$label !== void 0 ? _Elements$get$label : '';
  }
  var normalized = normalizeElementSymbol(symbol);
  if (!elements.Elements.get(normalized)) {
    throw parseError("unsupported element \"".concat(value, "\""), lineNumber);
  }
  return normalized;
}
function addAtom(struct, symbol, coordinates, lineNumber) {
  var x = parseFiniteNumber(coordinates[0], 'x coordinate', lineNumber);
  var y = parseFiniteNumber(coordinates[1], 'y coordinate', lineNumber);
  var z = parseFiniteNumber(coordinates[2], 'z coordinate', lineNumber);
  return struct.atoms.add(new atom.Atom({
    label: getElement(symbol, lineNumber),
    pp: new vec2.Vec2(x, -y, z)
  }));
}
function formatNumber(value) {
  return Object.is(value, -0) ? '0' : String(value);
}
function getCoordinateValues(atom) {
  return [formatNumber(atom.pp.x), formatNumber(-atom.pp.y), formatNumber(atom.pp.z)];
}
function serializeXYZAtoms(struct) {
  return Array.from(struct.atoms.values()).map(function (atom) {
    return [atom.label].concat(_toConsumableArray__default["default"](getCoordinateValues(atom))).join(' ');
  });
}
function parseHeaderFields(comment) {
  var fields = {};
  var fieldPattern = /([A-Za-z_][A-Za-z0-9_]*)=("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+)/g;
  var match;
  while (match = fieldPattern.exec(comment)) {
    var rawValue = match[2];
    fields[match[1]] = rawValue.startsWith('"') && rawValue.endsWith('"') || rawValue.startsWith("'") && rawValue.endsWith("'") ? rawValue.slice(1, -1).replace(/\\([\\"'])/g, '$1') : rawValue;
  }
  return fields;
}
function getFieldCaseInsensitive(fields, name) {
  var key = Object.keys(fields).find(function (candidate) {
    return candidate.toLowerCase() === name.toLowerCase();
  });
  return key ? fields[key] : undefined;
}
function parseProperties(value) {
  if (!value) throw parseError('missing Properties descriptor', 2);
  var fields = value.split(':');
  if (fields.length % 3 !== 0) {
    throw parseError("invalid Properties descriptor \"".concat(value, "\""), 2);
  }
  var properties = [];
  for (var index = 0; index < fields.length; index += 3) {
    var columns = Number(fields[index + 2]);
    if (!fields[index] || !fields[index + 1] || !Number.isSafeInteger(columns) || columns < 1) {
      throw parseError("invalid Properties descriptor \"".concat(value, "\""), 2);
    }
    properties.push({
      name: fields[index],
      type: fields[index + 1],
      columns: columns
    });
  }
  return properties;
}
function parseOptionalNumber(value, description) {
  if (value === undefined) return undefined;
  var parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw parseError("invalid ".concat(description, " \"").concat(value, "\""), 2);
  }
  return parsed;
}
function parseOptionalMultiplicity(value) {
  var parsed = parseOptionalNumber(value, 'multiplicity');
  if (parsed !== undefined && (!Number.isSafeInteger(parsed) || parsed < 1)) {
    throw parseError("invalid multiplicity \"".concat(value, "\""), 2);
  }
  return parsed;
}
function findProperty(properties, names) {
  return properties.find(function (property) {
    return names.includes(property.name.toLowerCase());
  });
}
function quoteHeaderValue(value) {
  return /^[^\s"']+$/.test(value) ? value : "\"".concat(value.replace(/([\\"])/g, '\\$1'), "\"");
}
function getTotalFormalCharge(struct) {
  return Array.from(struct.atoms.values()).reduce(function (sum, atom) {
    var _atom$charge;
    return sum + ((_atom$charge = atom.charge) !== null && _atom$charge !== void 0 ? _atom$charge : 0);
  }, 0);
}
var XYZFormatter = function () {
  function XYZFormatter() {
    _classCallCheck__default["default"](this, XYZFormatter);
  }
  _createClass__default["default"](XYZFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee(struct) {
        var _metadata$comment;
        var metadata, comment;
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              metadata = computationalFormatMetadata.getComputationalFormatMetadata(struct);
              comment = (_metadata$comment = metadata === null || metadata === void 0 ? void 0 : metadata.comment) !== null && _metadata$comment !== void 0 ? _metadata$comment : struct.name;
              return _context.abrupt("return", [String(struct.atoms.size), comment].concat(_toConsumableArray__default["default"](serializeXYZAtoms(struct))).join('\n'));
            case 3:
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
        var _getXYZLines, comment, atomLines, struct$1;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _getXYZLines = getXYZLines(content), comment = _getXYZLines.comment, atomLines = _getXYZLines.atomLines;
              struct$1 = new struct.Struct();
              struct$1.name = comment.trim();
              atomLines.forEach(function (_ref2) {
                var atomLine = _ref2.content,
                  lineNumber = _ref2.lineNumber;
                var fields = atomLine.split(/\s+/);
                if (fields.length < 4) throw parseError('truncated atom record', lineNumber);
                addAtom(struct$1, fields[0], fields.slice(1, 4), lineNumber);
              });
              computationalFormatMetadata.setComputationalFormatMetadata(struct$1, {
                comment: comment
              });
              return _context2.abrupt("return", struct$1);
            case 6:
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
  return XYZFormatter;
}();
var ExtendedXYZFormatter = function () {
  function ExtendedXYZFormatter() {
    _classCallCheck__default["default"](this, ExtendedXYZFormatter);
  }
  _createClass__default["default"](ExtendedXYZFormatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync2 = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee3(struct) {
        var _extMetadata$properti, _extMetadata$fields, _Object$keys$find, _Object$keys$find2, _Object$keys$find3, _metadata$molecularCh;
        var metadata, extMetadata, properties, fields, propertiesKey, chargeKey, multiplicityKey, header, atomLines;
        return _regeneratorRuntime__default["default"].wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              metadata = computationalFormatMetadata.getComputationalFormatMetadata(struct);
              extMetadata = metadata === null || metadata === void 0 ? void 0 : metadata.extendedXYZ;
              properties = (_extMetadata$properti = extMetadata === null || extMetadata === void 0 ? void 0 : extMetadata.properties) !== null && _extMetadata$properti !== void 0 ? _extMetadata$properti : [{
                name: 'species',
                type: 'S',
                columns: 1
              }, {
                name: 'pos',
                type: 'R',
                columns: 3
              }];
              fields = _objectSpread({}, (_extMetadata$fields = extMetadata === null || extMetadata === void 0 ? void 0 : extMetadata.fields) !== null && _extMetadata$fields !== void 0 ? _extMetadata$fields : {});
              propertiesKey = (_Object$keys$find = Object.keys(fields).find(function (key) {
                return key.toLowerCase() === EXTENDED_XYZ_PROPERTIES.toLowerCase();
              })) !== null && _Object$keys$find !== void 0 ? _Object$keys$find : EXTENDED_XYZ_PROPERTIES;
              fields[propertiesKey] = properties.flatMap(function (property) {
                return [property.name, property.type, property.columns];
              }).join(':');
              chargeKey = (_Object$keys$find2 = Object.keys(fields).find(function (key) {
                return ['charge', 'molecular_charge'].includes(key.toLowerCase());
              })) !== null && _Object$keys$find2 !== void 0 ? _Object$keys$find2 : 'charge';
              multiplicityKey = (_Object$keys$find3 = Object.keys(fields).find(function (key) {
                return ['multiplicity', 'molecular_multiplicity'].includes(key.toLowerCase());
              })) !== null && _Object$keys$find3 !== void 0 ? _Object$keys$find3 : 'multiplicity';
              fields[chargeKey] = String((_metadata$molecularCh = metadata === null || metadata === void 0 ? void 0 : metadata.molecularCharge) !== null && _metadata$molecularCh !== void 0 ? _metadata$molecularCh : getTotalFormalCharge(struct));
              if ((metadata === null || metadata === void 0 ? void 0 : metadata.molecularMultiplicity) !== null && (metadata === null || metadata === void 0 ? void 0 : metadata.molecularMultiplicity) !== undefined) {
                fields[multiplicityKey] = String(metadata.molecularMultiplicity);
              } else {
                Object.keys(fields).forEach(function (key) {
                  if (['multiplicity', 'molecular_multiplicity'].includes(key.toLowerCase())) {
                    delete fields[key];
                  }
                });
              }
              header = Object.entries(fields).map(function (_ref3) {
                var _ref4 = _slicedToArray__default["default"](_ref3, 2),
                  key = _ref4[0],
                  value = _ref4[1];
                return "".concat(key, "=").concat(quoteHeaderValue(value));
              }).join(' ');
              atomLines = Array.from(struct.atoms.entries()).map(function (_ref5) {
                var _ref6 = _slicedToArray__default["default"](_ref5, 2),
                  atomId = _ref6[0],
                  atom = _ref6[1];
                var importedValues = extMetadata === null || extMetadata === void 0 ? void 0 : extMetadata.atomValues.get(atomId);
                return properties.flatMap(function (property) {
                  var _importedValues$prope;
                  var propertyName = property.name.toLowerCase();
                  if (['species', 'element'].includes(propertyName)) return [atom.label];
                  if (['pos', 'position', 'positions'].includes(propertyName)) {
                    return getCoordinateValues(atom);
                  }
                  if (propertyName === 'z' && property.columns === 1) {
                    var _Elements$get$number, _Elements$get2;
                    return [String((_Elements$get$number = (_Elements$get2 = elements.Elements.get(atom.label)) === null || _Elements$get2 === void 0 ? void 0 : _Elements$get2.number) !== null && _Elements$get$number !== void 0 ? _Elements$get$number : atom.label)];
                  }
                  return (_importedValues$prope = importedValues === null || importedValues === void 0 ? void 0 : importedValues[property.name]) !== null && _importedValues$prope !== void 0 ? _importedValues$prope : Array.from({
                    length: property.columns
                  }, function () {
                    return property.type.toUpperCase() === 'S' ? '""' : '0';
                  });
                }).join(' ');
              });
              return _context3.abrupt("return", [String(struct.atoms.size), header].concat(_toConsumableArray__default["default"](atomLines)).join('\n'));
            case 13:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));
      function getStringFromStructureAsync(_x3) {
        return _getStringFromStructureAsync2.apply(this, arguments);
      }
      return getStringFromStructureAsync;
    }()
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync2 = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee4(content) {
        var _getFieldCaseInsensit, _getFieldCaseInsensit2, _getFieldCaseInsensit3;
        var _getXYZLines2, comment, atomLines, fields, properties, speciesProperty, positionProperty, expectedColumns, struct$1, atomValues, molecularCharge, molecularMultiplicity, extendedXYZ;
        return _regeneratorRuntime__default["default"].wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _getXYZLines2 = getXYZLines(content), comment = _getXYZLines2.comment, atomLines = _getXYZLines2.atomLines;
              fields = parseHeaderFields(comment);
              properties = parseProperties(getFieldCaseInsensitive(fields, EXTENDED_XYZ_PROPERTIES));
              speciesProperty = findProperty(properties, ['species', 'element', 'z']);
              positionProperty = findProperty(properties, ['pos', 'position', 'positions']);
              if (!(!speciesProperty || speciesProperty.columns !== 1)) {
                _context4.next = 7;
                break;
              }
              throw parseError('Properties must define a one-column species/element/Z');
            case 7:
              if (!(!positionProperty || positionProperty.columns !== 3)) {
                _context4.next = 9;
                break;
              }
              throw parseError('Properties must define a three-column pos');
            case 9:
              expectedColumns = properties.reduce(function (sum, property) {
                return sum + property.columns;
              }, 0);
              struct$1 = new struct.Struct();
              atomValues = new Map();
              atomLines.forEach(function (_ref7) {
                var _atomLine$match;
                var atomLine = _ref7.content,
                  lineNumber = _ref7.lineNumber;
                var values = (_atomLine$match = atomLine.match(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+/g)) !== null && _atomLine$match !== void 0 ? _atomLine$match : [];
                if (values.length !== expectedColumns) {
                  throw parseError("expected ".concat(expectedColumns, " atom fields, found ").concat(values.length), lineNumber);
                }
                var valuesByProperty = {};
                var offset = 0;
                properties.forEach(function (property) {
                  valuesByProperty[property.name] = values.slice(offset, offset + property.columns);
                  offset += property.columns;
                });
                var atomId = addAtom(struct$1, valuesByProperty[speciesProperty.name][0], valuesByProperty[positionProperty.name], lineNumber);
                atomValues.set(atomId, valuesByProperty);
              });
              molecularCharge = parseOptionalNumber((_getFieldCaseInsensit = getFieldCaseInsensitive(fields, 'charge')) !== null && _getFieldCaseInsensit !== void 0 ? _getFieldCaseInsensit : getFieldCaseInsensitive(fields, 'molecular_charge'), 'charge');
              molecularMultiplicity = parseOptionalMultiplicity((_getFieldCaseInsensit2 = getFieldCaseInsensitive(fields, 'multiplicity')) !== null && _getFieldCaseInsensit2 !== void 0 ? _getFieldCaseInsensit2 : getFieldCaseInsensitive(fields, 'molecular_multiplicity'));
              extendedXYZ = {
                fields: fields,
                properties: properties,
                atomValues: atomValues
              };
              computationalFormatMetadata.setComputationalFormatMetadata(struct$1, {
                comment: comment,
                molecularCharge: molecularCharge,
                molecularMultiplicity: molecularMultiplicity,
                sourceGeometryUnits: 'angstrom',
                extendedXYZ: extendedXYZ
              });
              struct$1.name = (_getFieldCaseInsensit3 = getFieldCaseInsensitive(fields, 'name')) !== null && _getFieldCaseInsensit3 !== void 0 ? _getFieldCaseInsensit3 : '';
              return _context4.abrupt("return", struct$1);
            case 19:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));
      function getStructureFromStringAsync(_x4) {
        return _getStructureFromStringAsync2.apply(this, arguments);
      }
      return getStructureFromStringAsync;
    }()
  }]);
  return ExtendedXYZFormatter;
}();
function isXYZString(content) {
  try {
    var _getXYZLines3 = getXYZLines(content),
      atomLines = _getXYZLines3.atomLines;
    return atomLines.every(function (_ref8) {
      var line = _ref8.content,
        lineNumber = _ref8.lineNumber;
      var values = line.split(/\s+/);
      if (values.length < 4) return false;
      getElement(values[0], lineNumber);
      values.slice(1, 4).forEach(function (value, index) {
        return parseFiniteNumber(value, ['x', 'y', 'z'][index], lineNumber);
      });
      return true;
    });
  } catch (_unused) {
    return false;
  }
}
function isExtendedXYZString(content) {
  try {
    var _getXYZLines4 = getXYZLines(content),
      comment = _getXYZLines4.comment,
      atomLines = _getXYZLines4.atomLines;
    var fields = parseHeaderFields(comment);
    var properties = parseProperties(getFieldCaseInsensitive(fields, EXTENDED_XYZ_PROPERTIES));
    var expectedColumns = properties.reduce(function (sum, property) {
      return sum + property.columns;
    }, 0);
    var speciesProperty = findProperty(properties, ['species', 'element', 'z']);
    var positionProperty = findProperty(properties, ['pos', 'position', 'positions']);
    return Boolean((speciesProperty === null || speciesProperty === void 0 ? void 0 : speciesProperty.columns) === 1 && (positionProperty === null || positionProperty === void 0 ? void 0 : positionProperty.columns) === 3 && atomLines.every(function (_ref9) {
      var _atomLine$match2;
      var atomLine = _ref9.content;
      var values = (_atomLine$match2 = atomLine.match(/"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\S+/g)) !== null && _atomLine$match2 !== void 0 ? _atomLine$match2 : [];
      return values.length === expectedColumns;
    }));
  } catch (_unused2) {
    return false;
  }
}
function isExtendedXYZComment(comment) {
  return getFieldCaseInsensitive(parseHeaderFields(comment), EXTENDED_XYZ_PROPERTIES) !== undefined;
}

exports.ExtendedXYZFormatter = ExtendedXYZFormatter;
exports.XYZFormatter = XYZFormatter;
exports.isExtendedXYZComment = isExtendedXYZComment;
exports.isExtendedXYZString = isExtendedXYZString;
exports.isXYZString = isXYZString;
//# sourceMappingURL=xyzFormatter.js.map
