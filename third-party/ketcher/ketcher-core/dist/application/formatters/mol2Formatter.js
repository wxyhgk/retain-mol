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

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
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
require('@babel/runtime/helpers/typeof');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var MOL2_SECTION_PREFIX = '@<TRIPOS>';
function parseError(message, lineNumber) {
  var location = lineNumber ? " at line ".concat(lineNumber) : '';
  return new Error("MOL2 parse error".concat(location, ": ").concat(message));
}
function getSections(content) {
  var lines = content.replace(/^\uFEFF/, '').split(/\r\n|[\n\r]/g);
  var headers = [];
  lines.forEach(function (line, index) {
    var trimmedLine = line.trim();
    if (trimmedLine.toUpperCase().startsWith(MOL2_SECTION_PREFIX)) {
      headers.push({
        name: trimmedLine.slice(MOL2_SECTION_PREFIX.length).toUpperCase(),
        index: index
      });
    }
  });
  return headers.map(function (header, index) {
    var _headers;
    return {
      name: header.name,
      lineNumber: header.index + 1,
      lines: lines.slice(header.index + 1, (_headers = headers[index + 1]) === null || _headers === void 0 ? void 0 : _headers.index)
    };
  });
}
function getDataLines(section) {
  return section.lines.map(function (line, index) {
    return {
      content: line.trim(),
      lineNumber: section.lineNumber + index + 1
    };
  }).filter(function (_ref) {
    var content = _ref.content;
    return content && !content.startsWith('#');
  });
}
function parseNonNegativeInteger(value, description, lineNumber) {
  var parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw parseError("invalid ".concat(description, " \"").concat(value !== null && value !== void 0 ? value : '', "\""), lineNumber);
  }
  return parsed;
}
function parseCoordinate(value, axis, lineNumber) {
  var parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw parseError("invalid ".concat(axis, " coordinate \"").concat(value !== null && value !== void 0 ? value : '', "\""), lineNumber);
  }
  return parsed;
}
function normalizeElementSymbol(symbol) {
  if (!symbol) return '';
  return symbol[0].toUpperCase() + symbol.slice(1).toLowerCase();
}
function getElementFromAtomName(atomName) {
  var _atomName$match;
  var letters = (_atomName$match = atomName.match(/^[A-Za-z]+/)) === null || _atomName$match === void 0 ? void 0 : _atomName$match[0];
  if (!letters) return undefined;
  var twoLetterSymbol = normalizeElementSymbol(letters.slice(0, 2));
  if (elements.Elements.get(twoLetterSymbol)) return twoLetterSymbol;
  var oneLetterSymbol = normalizeElementSymbol(letters.slice(0, 1));
  return elements.Elements.get(oneLetterSymbol) ? oneLetterSymbol : undefined;
}
function getAtomProperties(atomName, atomType) {
  var rawSymbol = atomType.split('.')[0];
  if (rawSymbol === 'D' || rawSymbol === 'T') {
    return {
      label: 'H',
      isotope: rawSymbol === 'D' ? 2 : 3
    };
  }
  var normalizedSymbol = normalizeElementSymbol(rawSymbol);
  if (elements.Elements.get(normalizedSymbol)) {
    return {
      label: normalizedSymbol,
      charge: atomType.toUpperCase() === 'N.4' ? 1 : undefined
    };
  }
  if (['DU', 'XX'].includes(rawSymbol.toUpperCase())) {
    var elementFromName = getElementFromAtomName(atomName);
    if (elementFromName) return {
      label: elementFromName
    };
  }
  return {
    label: '*'
  };
}
function getBondType(mol2Type, lineNumber) {
  switch (mol2Type.toLowerCase()) {
    case '1':
    case 'am':
      return bond.Bond.PATTERN.TYPE.SINGLE;
    case '2':
      return bond.Bond.PATTERN.TYPE.DOUBLE;
    case '3':
      return bond.Bond.PATTERN.TYPE.TRIPLE;
    case 'ar':
      return bond.Bond.PATTERN.TYPE.AROMATIC;
    case '0':
    case 'du':
    case 'un':
    case 'nc':
      return bond.Bond.PATTERN.TYPE.ANY;
    default:
      throw parseError("unsupported bond type \"".concat(mol2Type, "\""), lineNumber);
  }
}
function createMoleculeContext(section) {
  var _section$lines$0$trim, _section$lines$, _section$lines$2;
  var name = (_section$lines$0$trim = (_section$lines$ = section.lines[0]) === null || _section$lines$ === void 0 ? void 0 : _section$lines$.trim()) !== null && _section$lines$0$trim !== void 0 ? _section$lines$0$trim : '';
  var countsLine = (_section$lines$2 = section.lines[1]) === null || _section$lines$2 === void 0 ? void 0 : _section$lines$2.trim();
  if (!countsLine) {
    throw parseError('missing molecule counts line', section.lineNumber + 2);
  }
  var counts = countsLine.split(/\s+/);
  return {
    name: name,
    expectedAtomCount: parseNonNegativeInteger(counts[0], 'atom count', section.lineNumber + 2),
    expectedBondCount: parseNonNegativeInteger(counts[1], 'bond count', section.lineNumber + 2),
    atomCount: 0,
    bondCount: 0,
    atomIds: new Map()
  };
}
function parseAtoms(section, context, struct) {
  getDataLines(section).forEach(function (_ref2) {
    var content = _ref2.content,
      lineNumber = _ref2.lineNumber;
    var fields = content.split(/\s+/);
    if (fields.length < 6) {
      throw parseError('truncated atom record', lineNumber);
    }
    var mol2AtomId = parseNonNegativeInteger(fields[0], 'atom id', lineNumber);
    if (context.atomIds.has(mol2AtomId)) {
      throw parseError("duplicate atom id ".concat(mol2AtomId), lineNumber);
    }
    var x = parseCoordinate(fields[2], 'x', lineNumber);
    var y = parseCoordinate(fields[3], 'y', lineNumber);
    var z = parseCoordinate(fields[4], 'z', lineNumber);
    var atomProperties = getAtomProperties(fields[1], fields[5]);
    var ketcherAtomId = struct.atoms.add(new atom.Atom(_objectSpread(_objectSpread({}, atomProperties), {}, {
      pp: new vec2.Vec2(x, -y, z)
    })));
    context.atomIds.set(mol2AtomId, ketcherAtomId);
    context.atomCount += 1;
  });
}
function parseBonds(section, context, struct) {
  getDataLines(section).forEach(function (_ref3) {
    var content = _ref3.content,
      lineNumber = _ref3.lineNumber;
    var fields = content.split(/\s+/);
    if (fields.length < 4) {
      throw parseError('truncated bond record', lineNumber);
    }
    var beginMol2Id = parseNonNegativeInteger(fields[1], 'bond begin atom id', lineNumber);
    var endMol2Id = parseNonNegativeInteger(fields[2], 'bond end atom id', lineNumber);
    var begin = context.atomIds.get(beginMol2Id);
    var end = context.atomIds.get(endMol2Id);
    if (begin === undefined || end === undefined) {
      throw parseError("bond references unknown atom id ".concat(begin === undefined ? beginMol2Id : endMol2Id), lineNumber);
    }
    struct.bonds.add(new bond.Bond({
      begin: begin,
      end: end,
      type: getBondType(fields[3], lineNumber)
    }));
    context.bondCount += 1;
  });
}
function parseUnityAtomAttributes(section, context, struct) {
  var lines = getDataLines(section);
  var index = 0;
  while (index < lines.length) {
    var header = lines[index];
    var fields = header.content.split(/\s+/);
    var mol2AtomId = parseNonNegativeInteger(fields[0], 'UNITY atom id', header.lineNumber);
    var attributeCount = parseNonNegativeInteger(fields[1], 'UNITY attribute count', header.lineNumber);
    var atomId = context.atomIds.get(mol2AtomId);
    if (atomId === undefined) {
      throw parseError("UNITY attributes reference unknown atom id ".concat(mol2AtomId), header.lineNumber);
    }
    var atom = struct.atoms.get(atomId);
    if (!atom) {
      throw parseError("UNITY attributes reference missing atom id ".concat(mol2AtomId), header.lineNumber);
    }
    for (var offset = 1; offset <= attributeCount; offset += 1) {
      var attribute = lines[index + offset];
      if (!attribute) {
        throw parseError('truncated UNITY atom attributes', header.lineNumber);
      }
      var _attribute$content$sp = attribute.content.split(/\s+/),
        _attribute$content$sp2 = _slicedToArray__default["default"](_attribute$content$sp, 2),
        name = _attribute$content$sp2[0],
        value = _attribute$content$sp2[1];
      if (name.toLowerCase() === 'charge') {
        var charge = Number(value);
        if (!Number.isSafeInteger(charge)) {
          throw parseError("invalid formal charge \"".concat(value !== null && value !== void 0 ? value : '', "\""), attribute.lineNumber);
        }
        atom.charge = charge;
      }
    }
    index += attributeCount + 1;
  }
}
function validateMolecule(context) {
  if (context.atomCount !== context.expectedAtomCount) {
    throw parseError("expected ".concat(context.expectedAtomCount, " atoms, found ").concat(context.atomCount));
  }
  if (context.bondCount !== context.expectedBondCount) {
    throw parseError("expected ".concat(context.expectedBondCount, " bonds, found ").concat(context.bondCount));
  }
}
var Mol2Formatter = function () {
  function Mol2Formatter() {
    _classCallCheck__default["default"](this, Mol2Formatter);
  }
  _createClass__default["default"](Mol2Formatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee() {
        return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              throw new Error('MOL2 export is not supported.');
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function getStringFromStructureAsync() {
        return _getStringFromStructureAsync.apply(this, arguments);
      }
      return getStringFromStructureAsync;
    }()
  }, {
    key: "getStructureFromStringAsync",
    value: function () {
      var _getStructureFromStringAsync = _asyncToGenerator__default["default"](_regeneratorRuntime__default["default"].mark(function _callee2(content) {
        var sections, struct$1, context, contexts;
        return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              sections = getSections(content);
              if (!(!sections.length || sections[0].name !== 'MOLECULE')) {
                _context2.next = 3;
                break;
              }
              throw parseError('missing @<TRIPOS>MOLECULE header');
            case 3:
              struct$1 = new struct.Struct();
              contexts = [];
              sections.forEach(function (section) {
                if (section.name === 'MOLECULE') {
                  context = createMoleculeContext(section);
                  contexts.push(context);
                  if (!struct$1.name && context.name) struct$1.name = context.name;
                  return;
                }
                if (!context) {
                  throw parseError("@<TRIPOS>".concat(section.name, " appears before a molecule header"), section.lineNumber);
                }
                switch (section.name) {
                  case 'ATOM':
                    parseAtoms(section, context, struct$1);
                    break;
                  case 'BOND':
                    parseBonds(section, context, struct$1);
                    break;
                  case 'UNITY_ATOM_ATTR':
                    parseUnityAtomAttributes(section, context, struct$1);
                    break;
                }
              });
              contexts.forEach(validateMolecule);
              return _context2.abrupt("return", struct$1);
            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function getStructureFromStringAsync(_x) {
        return _getStructureFromStringAsync.apply(this, arguments);
      }
      return getStructureFromStringAsync;
    }()
  }]);
  return Mol2Formatter;
}();

exports.Mol2Formatter = Mol2Formatter;
//# sourceMappingURL=mol2Formatter.js.map
