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

var atom = require('../../entities/atom.js');
var atomList = require('../../entities/atomList.js');
var bond = require('../../entities/bond.js');
var pool = require('../../entities/pool.js');
var rgroup = require('../../entities/rgroup.js');
var rgroupAttachmentPoint = require('../../entities/rgroupAttachmentPoint.js');
var sgroup = require('../../entities/sgroup.js');
var struct = require('../../entities/struct.js');
var vec2 = require('../../entities/vec2.js');
var elements = require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
require('../../constants/chains.js');
require('../../constants/monomers.js');
var parseSGroup = require('./parseSGroup.js');
var utils = require('./utils.js');

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function parseAtomLine(atomLine) {
  var atomSplit = utils["default"].partitionLine(atomLine, utils["default"].fmtInfo.atomLinePartition);
  var params = {
    pp: new vec2.Vec2(parseFloat(atomSplit[0]), -parseFloat(atomSplit[1]), parseFloat(atomSplit[2])),
    label: atomSplit[4].trim(),
    explicitValence: utils["default"].fmtInfo.valenceMap[utils["default"].parseDecimalInt(atomSplit[10])],
    massDifference: utils["default"].parseDecimalInt(atomSplit[5]),
    charge: utils["default"].fmtInfo.chargeMap[utils["default"].parseDecimalInt(atomSplit[6])],
    hCount: utils["default"].parseDecimalInt(atomSplit[8]),
    stereoCare: utils["default"].parseDecimalInt(atomSplit[9]) !== 0,
    aam: utils["default"].parseDecimalInt(atomSplit[14]),
    invRet: utils["default"].parseDecimalInt(atomSplit[15]),
    exactChangeFlag: utils["default"].parseDecimalInt(atomSplit[16])
  };
  return new atom.Atom(params);
}
function parseBondLine(bondLine) {
  var bondSplit = utils["default"].partitionLine(bondLine, utils["default"].fmtInfo.bondLinePartition);
  var params = {
    begin: utils["default"].parseDecimalInt(bondSplit[0]) - 1,
    end: utils["default"].parseDecimalInt(bondSplit[1]) - 1,
    type: utils["default"].fmtInfo.bondTypeMap[utils["default"].parseDecimalInt(bondSplit[2])],
    stereo: utils["default"].fmtInfo.bondStereoMap[utils["default"].parseDecimalInt(bondSplit[3])],
    xxx: bondSplit[4],
    topology: utils["default"].fmtInfo.bondTopologyMap[utils["default"].parseDecimalInt(bondSplit[5])],
    reactingCenterStatus: utils["default"].parseDecimalInt(bondSplit[6])
  };
  return new bond.Bond(params);
}
function parseAtomListLine(atomListLine) {
  var split = utils["default"].partitionLine(atomListLine, utils["default"].fmtInfo.atomListHeaderPartition);
  var number = utils["default"].parseDecimalInt(split[0]) - 1;
  var notList = split[2].trim() === 'T';
  var count = utils["default"].parseDecimalInt(split[4].trim());
  var ids = atomListLine.slice(utils["default"].fmtInfo.atomListHeaderLength);
  var list = [];
  var itemLength = utils["default"].fmtInfo.atomListHeaderItemLength;
  for (var i = 0; i < count; ++i) {
    list[i] = utils["default"].parseDecimalInt(ids.slice(i * itemLength, (i + 1) * itemLength - 1));
  }
  return {
    aid: number,
    atomList: new atomList.AtomList({
      notList: notList,
      ids: list
    })
  };
}
function handleAliasProperty(line, ctabLines, shift, props) {
  var propValue = ctabLines[shift];
  var isPseudo = /'.+'/.test(propValue);
  var propType = isPseudo ? 'pseudo' : 'alias';
  if (!props.get(propType)) {
    props.set(propType, new pool.Pool());
  }
  var aliasPool = props.get(propType);
  if (aliasPool) {
    aliasPool.set(utils["default"].parseDecimalInt(line.slice(3)) - 1, propValue);
  }
}
function handleSimpleAtomProperty(propName, propertyData, props) {
  if (!props.get(propName)) {
    props.set(propName, parseSGroup["default"].readKeyValuePairs(propertyData, false));
  }
}
function handleSubstitutionProperty(propertyData, props) {
  if (!props.get('substitutionCount')) {
    props.set('substitutionCount', new pool.Pool());
  }
  var subLabels = props.get('substitutionCount');
  if (!subLabels) {
    return;
  }
  var arrs = parseSGroup["default"].readKeyMultiValuePairs(propertyData, false);
  var _iterator = _createForOfIteratorHelper(arrs),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var a2r = _step.value;
      subLabels.set(a2r[0], a2r[1]);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function handleRGroupProperty(propertyData, props) {
  if (!props.get('rglabel')) {
    props.set('rglabel', new pool.Pool());
  }
  var rglabels = props.get('rglabel');
  if (!rglabels) {
    return;
  }
  var a2rs = parseSGroup["default"].readKeyMultiValuePairs(propertyData, false);
  var _iterator2 = _createForOfIteratorHelper(a2rs),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var a2r = _step2.value;
      var rg = Number(a2r[1]);
      rglabels.set(a2r[0], (rglabels.get(a2r[0]) || 0) | 1 << rg - 1);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
function handleRGroupLogic(propertyData, rLogic) {
  var data = propertyData.slice(4);
  var rgid = utils["default"].parseDecimalInt(data.slice(0, 3).trim());
  var iii = utils["default"].parseDecimalInt(data.slice(4, 7).trim());
  var hhh = utils["default"].parseDecimalInt(data.slice(8, 11).trim());
  var ooo = data.slice(12).trim();
  var logic = {
    resth: hhh === 1,
    range: ooo
  };
  if (iii > 0) {
    logic.ifthen = iii;
  }
  rLogic[rgid] = logic;
}
function handleAtomListProperty(propertyData, props) {
  var pool$1 = parsePropertyLineAtomList(utils["default"].partitionLine(propertyData, [1, 3, 3, 1, 1, 1]), utils["default"].partitionLineFixed(propertyData.slice(10), 4, false));
  if (!props.get('atomList')) {
    props.set('atomList', new pool.Pool());
  }
  if (!props.get('label')) {
    props.set('label', new pool.Pool());
  }
  var labelPool = props.get('label');
  var atomListPool = props.get('atomList');
  if (!labelPool || !atomListPool) {
    return;
  }
  pool$1.forEach(function (atomList, aid) {
    labelPool.set(aid, 'L#');
    atomListPool.set(aid, atomList);
  });
}
function handleSGroupDataProperty(type, propertyData, sGroups) {
  var sid = utils["default"].parseDecimalInt(propertyData.slice(0, 4)) - 1;
  var value = propertyData.slice(4).trim();
  if (type === 'SMT') {
    sGroups[sid].data.subscript = value;
  } else {
    sGroups[sid].data["class"] = value;
  }
}
function handleSGroupExpandedProperty(propertyData, sGroups) {
  var expandedSGroups = propertyData.slice(7).trim().split('   ');
  expandedSGroups.forEach(function (eg) {
    var sGroupId = Number(eg) - 1;
    sGroups[sGroupId].data.expanded = true;
  });
}
function handleSGroupAttachmentProperty(propertyData, sGroups) {
  var _sGroup$parseSGroupSA = parseSGroup["default"].parseSGroupSAPLineV2000(propertyData),
    sGroupId = _sGroup$parseSGroupSA.sGroupId,
    attachmentPoints = _sGroup$parseSGroupSA.attachmentPoints;
  attachmentPoints.forEach(function (attachmentPoint) {
    sGroups[sGroupId].addAttachmentPoint(attachmentPoint);
  });
}
function processMPropertyLine(type, propertyData, props, sGroups, rLogic) {
  switch (type) {
    case 'END':
      return true;
    case 'CHG':
      handleSimpleAtomProperty('charge', propertyData, props);
      break;
    case 'RAD':
      handleSimpleAtomProperty('radical', propertyData, props);
      break;
    case 'ISO':
      handleSimpleAtomProperty('isotope', propertyData, props);
      break;
    case 'RBC':
      handleSimpleAtomProperty('ringBondCount', propertyData, props);
      break;
    case 'SUB':
      handleSubstitutionProperty(propertyData, props);
      break;
    case 'UNS':
      handleSimpleAtomProperty('unsaturatedAtom', propertyData, props);
      break;
    case 'RGP':
      handleRGroupProperty(propertyData, props);
      break;
    case 'LOG':
      handleRGroupLogic(propertyData, rLogic);
      break;
    case 'APO':
      handleSimpleAtomProperty('attachmentPoints', propertyData, props);
      break;
    case 'ALS':
      handleAtomListProperty(propertyData, props);
      break;
    case 'STY':
      parseSGroup["default"].initSGroup(sGroups, propertyData);
      break;
    case 'SST':
      parseSGroup["default"].applySGroupProp(sGroups, 'subtype', propertyData);
      break;
    case 'SLB':
      parseSGroup["default"].applySGroupProp(sGroups, 'label', propertyData, true);
      break;
    case 'SPL':
      parseSGroup["default"].applySGroupProp(sGroups, 'parent', propertyData, true, true);
      break;
    case 'SCN':
      parseSGroup["default"].applySGroupProp(sGroups, 'connectivity', propertyData);
      break;
    case 'SAL':
      parseSGroup["default"].applySGroupArrayProp(sGroups, 'atoms', propertyData, -1);
      break;
    case 'SBL':
      parseSGroup["default"].applySGroupArrayProp(sGroups, 'bonds', propertyData, -1);
      break;
    case 'SPA':
      parseSGroup["default"].applySGroupArrayProp(sGroups, 'patoms', propertyData, -1);
      break;
    case 'SMT':
    case 'SCL':
      handleSGroupDataProperty(type, propertyData, sGroups);
      break;
    case 'SDT':
      parseSGroup["default"].applyDataSGroupDesc(sGroups, propertyData);
      break;
    case 'SDD':
      parseSGroup["default"].applyDataSGroupInfoLine(sGroups, propertyData);
      break;
    case 'SCD':
      parseSGroup["default"].applyDataSGroupDataLine(sGroups, propertyData, false);
      break;
    case 'SED':
      parseSGroup["default"].applyDataSGroupDataLine(sGroups, propertyData, true);
      break;
    case 'SDS':
      handleSGroupExpandedProperty(propertyData, sGroups);
      break;
    case 'SAP':
      handleSGroupAttachmentProperty(propertyData, sGroups);
      break;
  }
  return false;
}
function parsePropertyLines(_ctab, ctabLines, shift, end, sGroups, rLogic) {
  var props = new Map();
  while (shift < end) {
    var line = ctabLines[shift];
    if (line.startsWith('A')) {
      handleAliasProperty(line, ctabLines, ++shift, props);
    } else if (line.startsWith('M')) {
      var type = line.slice(3, 6);
      var propertyData = line.slice(6);
      var shouldBreak = processMPropertyLine(type, propertyData, props, sGroups, rLogic);
      if (shouldBreak) {
        break;
      }
    }
    ++shift;
  }
  return props;
}
function applyAtomProp(atoms, values, propId) {
  values.forEach(function (propVal, aid) {
    var atom = atoms.get(aid);
    if (atom) {
      atom[propId] = propVal;
    }
  });
}
function createRGroupAttachmentPointsFromAtoms(struct) {
  struct.atoms.forEach(function (atom$1, atomId) {
    if (!atom$1.attachmentPoints) {
      return;
    }
    var attachmentPoints = atom$1.attachmentPoints;
    if (attachmentPoints === atom.AttachmentPoints.FirstSideOnly) {
      struct.rgroupAttachmentPoints.add(new rgroupAttachmentPoint.RGroupAttachmentPoint(atomId, 'primary'));
    } else if (attachmentPoints === atom.AttachmentPoints.SecondSideOnly) {
      struct.rgroupAttachmentPoints.add(new rgroupAttachmentPoint.RGroupAttachmentPoint(atomId, 'secondary'));
    } else if (attachmentPoints === atom.AttachmentPoints.BothSides) {
      struct.rgroupAttachmentPoints.add(new rgroupAttachmentPoint.RGroupAttachmentPoint(atomId, 'primary'));
      struct.rgroupAttachmentPoints.add(new rgroupAttachmentPoint.RGroupAttachmentPoint(atomId, 'secondary'));
    }
  });
}
function parseCTabV2000(ctabLines, countsSplit, ignoreChiralFlag) {
  var ctab = new struct.Struct();
  var i;
  var atomCount = utils["default"].parseDecimalInt(countsSplit[0]);
  var bondCount = utils["default"].parseDecimalInt(countsSplit[1]);
  var atomListCount = utils["default"].parseDecimalInt(countsSplit[2]);
  var isAbs = utils["default"].parseDecimalInt(countsSplit[4]) === 1 || ignoreChiralFlag;
  var isAnd = utils["default"].parseDecimalInt(countsSplit[4]) === 0 && !ignoreChiralFlag;
  var stextLinesCount = utils["default"].parseDecimalInt(countsSplit[5]);
  var propertyLinesCount = utils["default"].parseDecimalInt(countsSplit[10]);
  var shift = 0;
  var atomLines = ctabLines.slice(shift, shift + atomCount);
  shift += atomCount;
  var bondLines = ctabLines.slice(shift, shift + bondCount);
  shift += bondCount;
  var atomListLines = ctabLines.slice(shift, shift + atomListCount);
  shift += atomListCount + stextLinesCount;
  var atoms = atomLines.map(parseAtomLine);
  atoms.forEach(function (atom) {
    return ctab.atoms.add(atom);
  });
  var bonds = bondLines.map(parseBondLine);
  bonds.forEach(function (bond) {
    var beginAtom = ctab.atoms.get(bond.begin);
    if (beginAtom) {
      if (bond.stereo && isAbs) {
        beginAtom.stereoLabel = atom.StereoLabel.Abs;
      }
      if (bond.stereo && isAnd) {
        beginAtom.stereoLabel = "".concat(atom.StereoLabel.And, "1");
      }
    }
    ctab.bonds.add(bond);
  });
  var atomLists = atomListLines.map(parseAtomListLine);
  atomLists.forEach(function (pair) {
    var atom = ctab.atoms.get(pair.aid);
    if (!atom) {
      throw new Error('Atom index out of range for atom list');
    }
    atom.atomList = pair.atomList;
    atom.label = 'L#';
  });
  var sGroups = {};
  var rLogic = {};
  var props = parsePropertyLines(ctab, ctabLines, shift, Math.min(ctabLines.length, shift + propertyLinesCount), sGroups, rLogic);
  props.forEach(function (values, propId) {
    applyAtomProp(ctab.atoms, values, propId);
  });
  var atomMap = {};
  var sid;
  for (sid in sGroups) {
    var sg = sGroups[sid];
    if (sg.type === 'DAT' && sg.atoms.length === 0) {
      var parent = sGroups[sid].parent;
      if (parent >= 0) {
        var psg = sGroups[parent - 1];
        if (psg.type === 'GEN') sg.atoms = [].slice.call(psg.atoms);
      }
    }
  }
  for (sid in sGroups) parseSGroup["default"].loadSGroup(ctab, sGroups[sid], atomMap);
  var emptyGroups = [];
  for (sid in sGroups) {
    sgroup.SGroup.filter(ctab, sGroups[sid], atomMap);
    if (sGroups[sid].atoms.length === 0 && !sGroups[sid].allAtoms) {
      emptyGroups.push(+sid);
    }
  }
  for (i = 0; i < emptyGroups.length; ++i) {
    ctab.sGroupForest.remove(emptyGroups[i]);
    ctab.sgroups["delete"](emptyGroups[i]);
  }
  for (var id in rLogic) {
    var rgid = parseInt(id, 10);
    ctab.rgroups.set(rgid, new rgroup.RGroup(rLogic[rgid]));
  }
  createRGroupAttachmentPointsFromAtoms(ctab);
  return ctab;
}
function parseRg2000(ctabLines, ignoreChiralFlag) {
  ctabLines = ctabLines.slice(7);
  if (ctabLines[0].trim() !== '$CTAB') throw new Error('RGFile format invalid');
  var i = 1;
  while (!ctabLines[i].startsWith('$')) i++;
  if (ctabLines[i].trim() !== '$END CTAB') {
    throw new Error('RGFile format invalid');
  }
  var coreLines = ctabLines.slice(1, i);
  ctabLines = ctabLines.slice(i + 1);
  var fragmentLines = {};
  while (true) {
    if (ctabLines.length === 0) throw new Error('Unexpected end of file');
    var line = ctabLines[0].trim();
    if (line === '$END MOL') {
      break;
    }
    if (line !== '$RGP') throw new Error('RGFile format invalid');
    var rgid = parseInt(ctabLines[1].trim(), 10);
    fragmentLines[rgid] = [];
    ctabLines = ctabLines.slice(2);
    while (true) {
      if (ctabLines.length === 0) throw new Error('Unexpected end of file');
      line = ctabLines[0].trim();
      if (line === '$END RGP') {
        ctabLines = ctabLines.slice(1);
        break;
      }
      if (line !== '$CTAB') throw new Error('RGFile format invalid');
      i = 1;
      while (!ctabLines[i].startsWith('$')) i++;
      if (ctabLines[i].trim() !== '$END CTAB') {
        throw new Error('RGFile format invalid');
      }
      fragmentLines[rgid].push(ctabLines.slice(1, i));
      ctabLines = ctabLines.slice(i + 1);
    }
  }
  var core = parseCTab(coreLines, ignoreChiralFlag);
  var frag = {};
  {
    for (var strId in fragmentLines) {
      var id = parseInt(strId, 10);
      frag[id] = [];
      var _iterator3 = _createForOfIteratorHelper(fragmentLines[id]),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var fragmentLine = _step3.value;
          frag[id].push(parseCTab(fragmentLine, ignoreChiralFlag));
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }
  return utils["default"].rgMerge(core, frag);
}
function parseRxn2000(ctabLines, shouldReactionRelayout, ignoreChiralFlag) {
  ctabLines = ctabLines.slice(4);
  var countsSplit = utils["default"].partitionLine(ctabLines[0], utils["default"].fmtInfo.rxnItemsPartition);
  var nReactants = countsSplit[0] - 0;
  var nProducts = countsSplit[1] - 0;
  var nAgents = countsSplit[2] - 0;
  ctabLines = ctabLines.slice(1);
  var mols = [];
  while (ctabLines.length > 0 && ctabLines[0].startsWith('$MOL')) {
    ctabLines = ctabLines.slice(1);
    var n = 0;
    while (n < ctabLines.length && !ctabLines[n].startsWith('$MOL')) n++;
    var lines = ctabLines.slice(0, n);
    var struct = void 0;
    if (lines[0].startsWith('$MDL')) {
      struct = parseRg2000(lines, ignoreChiralFlag);
    } else {
      struct = parseCTab(lines.slice(3), ignoreChiralFlag);
      struct.name = lines[0].trim();
    }
    mols.push(struct);
    ctabLines = ctabLines.slice(n);
  }
  return utils["default"].rxnMerge(mols, nReactants, nProducts, nAgents, shouldReactionRelayout);
}
function parseCTab(ctabLines, ignoreChiralFlag) {
  var countsSplit = utils["default"].partitionLine(ctabLines[0], utils["default"].fmtInfo.countsLinePartition);
  ctabLines = ctabLines.slice(1);
  return parseCTabV2000(ctabLines, countsSplit, ignoreChiralFlag);
}
function labelsListToIds(labels) {
  var ids = [];
  var _iterator4 = _createForOfIteratorHelper(labels),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var label = _step4.value;
      var element = elements.Elements.get(label.trim());
      if (element) {
        ids.push(element.number);
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  return ids;
}
function parsePropertyLineAtomList(hdr, lst) {
  var aid = utils["default"].parseDecimalInt(hdr[1]) - 1;
  var count = utils["default"].parseDecimalInt(hdr[2]);
  var notList = hdr[4].trim() === 'T';
  var ids = labelsListToIds(lst.slice(0, count));
  var ret = new pool.Pool();
  ret.set(aid, new atomList.AtomList({
    notList: notList,
    ids: ids
  }));
  return ret;
}
var v2000 = {
  parseCTabV2000: parseCTabV2000,
  parseRg2000: parseRg2000,
  parseRxn2000: parseRxn2000
};

exports["default"] = v2000;
//# sourceMappingURL=v2000.js.map
