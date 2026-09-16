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
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
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
import '@babel/runtime/helpers/typeof';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
  if (Elements.get(twoLetterSymbol)) return twoLetterSymbol;
  var oneLetterSymbol = normalizeElementSymbol(letters.slice(0, 1));
  return Elements.get(oneLetterSymbol) ? oneLetterSymbol : undefined;
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
  if (Elements.get(normalizedSymbol)) {
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
      return Bond.PATTERN.TYPE.SINGLE;
    case '2':
      return Bond.PATTERN.TYPE.DOUBLE;
    case '3':
      return Bond.PATTERN.TYPE.TRIPLE;
    case 'ar':
      return Bond.PATTERN.TYPE.AROMATIC;
    case '0':
    case 'du':
    case 'un':
    case 'nc':
      return Bond.PATTERN.TYPE.ANY;
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
    var ketcherAtomId = struct.atoms.add(new Atom(_objectSpread(_objectSpread({}, atomProperties), {}, {
      pp: new Vec2(x, -y, z)
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
    struct.bonds.add(new Bond({
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
        _attribute$content$sp2 = _slicedToArray(_attribute$content$sp, 2),
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
    _classCallCheck(this, Mol2Formatter);
  }
  _createClass(Mol2Formatter, [{
    key: "getStringFromStructureAsync",
    value: function () {
      var _getStringFromStructureAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
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
      var _getStructureFromStringAsync = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(content) {
        var sections, struct, context, contexts;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              sections = getSections(content);
              if (!(!sections.length || sections[0].name !== 'MOLECULE')) {
                _context2.next = 3;
                break;
              }
              throw parseError('missing @<TRIPOS>MOLECULE header');
            case 3:
              struct = new Struct();
              contexts = [];
              sections.forEach(function (section) {
                if (section.name === 'MOLECULE') {
                  context = createMoleculeContext(section);
                  contexts.push(context);
                  if (!struct.name && context.name) struct.name = context.name;
                  return;
                }
                if (!context) {
                  throw parseError("@<TRIPOS>".concat(section.name, " appears before a molecule header"), section.lineNumber);
                }
                switch (section.name) {
                  case 'ATOM':
                    parseAtoms(section, context, struct);
                    break;
                  case 'BOND':
                    parseBonds(section, context, struct);
                    break;
                  case 'UNITY_ATOM_ATTR':
                    parseUnityAtomAttributes(section, context, struct);
                    break;
                }
              });
              contexts.forEach(validateMolecule);
              return _context2.abrupt("return", struct);
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

export { Mol2Formatter };
//# sourceMappingURL=mol2Formatter.modern.js.map
