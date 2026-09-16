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

var monomerMicromolecule = require('../../entities/monomerMicromolecule.js');
var pile = require('../../entities/pile.js');
var sgroup = require('../../entities/sgroup.js');
var utils = require('./utils.js');
var v2000 = require('./v2000.js');

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function getAtom(mol, id) {
  var atom = mol.atoms.get(id);
  if (!atom) {
    throw new Error("Atom ".concat(id, " not found"));
  }
  return atom;
}
function parseMol(ctabLines, ignoreChiralFlag) {
  if (ctabLines[0].search('\\$MDL') === 0) {
    var _struct = v2000["default"].parseRg2000(ctabLines, ignoreChiralFlag);
    _struct.name = ctabLines[3].trim();
    return _struct;
  }
  var struct = parseCTab(ctabLines.slice(3), ignoreChiralFlag);
  struct.name = ctabLines[0].trim();
  return struct;
}
function parseCTab(ctabLines, ignoreChiralFlag) {
  var countsSplit = partitionLine(ctabLines[0], utils["default"].fmtInfo.countsLinePartition);
  var version = countsSplit[11].trim();
  ctabLines = ctabLines.slice(1);
  if (version === 'V2000') {
    return v2000["default"].parseCTabV2000(ctabLines, countsSplit, ignoreChiralFlag);
  }
  throw new Error('Molfile version unknown: ' + version);
}
function parseRxn(ctabLines, shouldReactionRelayout, ignoreChiralFlag) {
  var version = ctabLines[0].trim().split(/\s+/)[1];
  if (version && version !== 'V2000') {
    throw new Error('Rxnfile version unknown: ' + version);
  }
  var struct = v2000["default"].parseRxn2000(ctabLines, shouldReactionRelayout, ignoreChiralFlag);
  struct.name = ctabLines[1].trim();
  return struct;
}
var prepareForSaving = {
  MUL: sgroup.SGroup.prepareMulForSaving,
  SRU: prepareSruForSaving,
  SUP: prepareSupForSaving,
  DAT: prepareDatForSaving,
  GEN: prepareGenForSaving,
  COP: prepareCopForSaving,
  queryComponent: prepareQueryComponentForSaving
};
function prepareSruForSaving(sgroup, mol) {
  var xBonds = [];
  mol.bonds.forEach(function (bond, bid) {
    var a1 = getAtom(mol, bond.begin);
    var a2 = getAtom(mol, bond.end);
    if (a1.sgs.has(sgroup.id) && !a2.sgs.has(sgroup.id) || a2.sgs.has(sgroup.id) && !a1.sgs.has(sgroup.id)) {
      xBonds.push(bid);
    }
  });
  if (xBonds.length !== 0 && xBonds.length !== 2) {
    var error = new Error('Unsupported cross-bonds number');
    error.id = sgroup.id;
    error['error-type'] = 'cross-bond-number';
    throw error;
  }
  sgroup.bonds = xBonds;
}
function prepareCopForSaving(sgroup, mol) {
  prepareSruForSaving(sgroup, mol);
}
function prepareSupForSaving(sgroup, mol) {
  var xBonds = [];
  mol.bonds.forEach(function (bond, bid) {
    var a1 = getAtom(mol, bond.begin);
    var a2 = getAtom(mol, bond.end);
    if (a1.sgs.has(sgroup.id) && !a2.sgs.has(sgroup.id) || a2.sgs.has(sgroup.id) && !a1.sgs.has(sgroup.id)) {
      xBonds.push(bid);
    }
  });
  sgroup.bonds = xBonds;
}
function prepareGenForSaving(_sgroup, _mol) {
}
function prepareQueryComponentForSaving(_sgroup, _mol) {
}
function prepareDatForSaving(sgroup$1, mol) {
  sgroup$1.atoms = sgroup.SGroup.getAtoms(mol, sgroup$1);
}
var saveToMolfile = {
  MUL: saveMulToMolfile,
  SRU: saveSruToMolfile,
  COP: saveCopToMolfile,
  SUP: saveSupToMolfile,
  DAT: saveDatToMolfile,
  GEN: saveGenToMolfile
};
function saveMulToMolfile(sgroup, mol, sgMap, atomMap, bondMap) {
  var idstr = (sgMap[sgroup.id] + '').padStart(3);
  var lines = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, Array.from(sgroup.atomSet.values()), atomMap));
  lines = lines.concat(makeAtomBondLines('SPA', idstr, Array.from(sgroup.parentAtomSet.values()), atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  var smtLine = 'M  SMT ' + idstr + ' ' + sgroup.data.mul;
  lines.push(smtLine);
  lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
  return lines.join('\n');
}
function saveSruToMolfile(sgroup, mol, sgMap, atomMap, bondMap) {
  var idstr = (sgMap[sgroup.id] + '').padStart(3);
  var lines = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  lines = lines.concat(bracketsToMolfile(mol, sgroup, idstr));
  return lines.join('\n');
}
function saveCopToMolfile(sgroup, mol, sgMap, atomMap, bondMap) {
  return saveSruToMolfile(sgroup, mol, sgMap, atomMap, bondMap);
}
function saveSupToMolfile(sgroup, _mol, sgMap, atomMap, bondMap) {
  var idstr = (sgMap[sgroup.id] + '').padStart(3);
  var lines = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup.atoms, atomMap));
  lines = lines.concat(makeAtomBondLines('SBL', idstr, sgroup.bonds, bondMap));
  var sgroupName;
  if (sgroup instanceof monomerMicromolecule.MonomerMicromolecule) {
    sgroupName = sgroup.monomer.label;
  } else if (sgroup.data.name && sgroup.data.name !== '') {
    sgroupName = sgroup.data.name;
  }
  if (sgroupName) {
    lines.push('M  SMT ' + idstr + ' ' + sgroupName);
  }
  if (sgroup.data["class"]) {
    lines.push('M  SCL ' + idstr + ' ' + sgroup.data["class"]);
  }
  return lines.join('\n');
}
function saveDatToMolfile(sgroup$1, mol, sgMap, atomMap) {
  var idstr = (sgMap[sgroup$1.id] + '').padStart(3);
  var data = sgroup$1.data;
  if (!sgroup$1.pp) {
    throw new Error('SGroup pp is not set');
  }
  var pp = sgroup$1.pp;
  if (!data.absolute) pp = pp.sub(sgroup.SGroup.getMassCentre(mol, sgroup$1.atoms));
  var lines = [];
  lines = lines.concat(makeAtomBondLines('SAL', idstr, sgroup$1.atoms, atomMap));
  var sdtLine = 'M  SDT ' + idstr + ' ' + (data.fieldName || '').padEnd(30) + (data.fieldType || '').padStart(2) + (data.units || '').padEnd(20) + (data.query || '').padStart(2);
  if (data.queryOp) {
    sdtLine += data.queryOp.padEnd(80 - 65);
  }
  lines.push(sdtLine);
  var sddLine = 'M  SDD ' + idstr + ' ' + utils["default"].paddedNum(pp.x, 10, 4) + utils["default"].paddedNum(-pp.y, 10, 4) + '    ' + (
  data.attached ? 'A' : 'D') + (
  data.absolute ? 'A' : 'R') + (
  data.showUnits ? 'U' : ' ') +
  '   ' + (
  data.nCharnCharsToDisplay >= 0 ? utils["default"].paddedNum(data.nCharnCharsToDisplay, 3) : 'ALL') +
  '  1   ' + (
  data.tagChar || ' ') +
  '  ' + utils["default"].paddedNum(data.daspPos, 1) +
  '  ';
  lines.push(sddLine);
  var val = normalizeNewlines(data.fieldValue).replace(/\n*$/, '');
  var charsPerLine = 69;
  val.split('\n').forEach(function (chars) {
    while (chars.length > charsPerLine) {
      lines.push('M  SCD ' + idstr + ' ' + chars.slice(0, charsPerLine));
      chars = chars.slice(charsPerLine);
    }
    lines.push('M  SED ' + idstr + ' ' + chars);
  });
  return lines.join('\n');
}
function saveGenToMolfile(sgroup, mol, sgMap, atomMap, bondMap) {
  return saveSruToMolfile(sgroup, mol, sgMap, atomMap, bondMap);
}
function makeAtomBondLines(prefix, idstr, ids, map) {
  if (!ids) return [];
  var lines = [];
  for (var i = 0; i < Math.floor((ids.length + 14) / 15); ++i) {
    var rem = Math.min(ids.length - 15 * i, 15);
    var salLine = 'M  ' + prefix + ' ' + idstr + ' ' + utils["default"].paddedNum(rem, 2);
    for (var j = 0; j < rem; ++j) {
      salLine += ' ' + utils["default"].paddedNum(map[ids[i * 15 + j]], 3);
    }
    lines.push(salLine);
  }
  return lines;
}
function bracketsToMolfile(mol, sg, idstr) {
  var atomSet = new pile.Pile(sg.atoms);
  var crossBonds = sgroup.SGroup.getCrossBonds(mol, atomSet);
  sgroup.SGroup.bracketPos(sg, mol);
  var bb = sg.bracketBox;
  if (!bb) {
    return [];
  }
  var d = sg.bracketDirection;
  var n = d.rotateSC(1, 0);
  var brackets = sgroup.SGroup.getBracketParameters(mol, crossBonds, atomSet, bb, d, n);
  var lines = [];
  var _iterator = _createForOfIteratorHelper(brackets),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var bracket = _step.value;
      var a0 = bracket.c.addScaled(bracket.n, -0.5 * bracket.h).yComplement(0);
      var a1 = bracket.c.addScaled(bracket.n, 0.5 * bracket.h).yComplement(0);
      var line = 'M  SDI ' + idstr + utils["default"].paddedNum(4, 3);
      var coord = [a0.x, a0.y, a1.x, a1.y];
      for (var _i = 0, _coord = coord; _i < _coord.length; _i++) {
        var coordValue = _coord[_i];
        line += utils["default"].paddedNum(coordValue, 10, 4);
      }
      lines.push(line);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return lines;
}
var nlRe = /\r\n|[\n\r]/g;
function normalizeNewlines(str) {
  return str.replace(nlRe, '\n');
}
function partitionLine(str, parts, withspace) {
  var res = [];
  for (var i = 0, shift = 0; i < parts.length; ++i) {
    res.push(str.slice(shift, shift + parts[i]));
    if (withspace) shift++;
    shift += parts[i];
  }
  return res;
}
var common = {
  parseCTab: parseCTab,
  parseMol: parseMol,
  parseRxn: parseRxn,
  prepareForSaving: prepareForSaving,
  saveToMolfile: saveToMolfile
};

exports["default"] = common;
//# sourceMappingURL=common.js.map
