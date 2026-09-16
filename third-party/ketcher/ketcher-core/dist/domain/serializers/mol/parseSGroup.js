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
var pool = require('../../entities/pool.js');
var sgroup = require('../../entities/sgroup.js');
var vec2 = require('../../entities/vec2.js');
var sGroupAttachmentPoint = require('../../entities/sGroupAttachmentPoint.js');
var utils = require('./utils.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function readKeyValuePairs(str, valueString) {
  var ret = new pool.Pool();
  var partition = utils["default"].partitionLineFixed(str, 3, true);
  var count = utils["default"].parseDecimalInt(partition[0]);
  for (var i = 0; i < count; ++i) {
    var key = utils["default"].parseDecimalInt(partition[2 * i + 1]) - 1;
    var value = valueString ? partition[2 * i + 2].trim() : utils["default"].parseDecimalInt(partition[2 * i + 2]);
    ret.set(key, value);
  }
  return ret;
}
function readKeyMultiValuePairs(str, valueString) {
  var ret = [];
  var partition = utils["default"].partitionLineFixed(str, 3, true);
  var count = utils["default"].parseDecimalInt(partition[0]);
  for (var i = 0; i < count; ++i) {
    ret.push([
    utils["default"].parseDecimalInt(partition[2 * i + 1]) - 1, valueString ? partition[2 * i + 2].trim() : utils["default"].parseDecimalInt(partition[2 * i + 2])
    ]);
  }
  return ret;
}
function postLoadMul(sgroup$1, mol, atomMap) {
  if (!mol || !atomMap) return;
  sgroup$1.data.mul = Number(sgroup$1.data.subscript);
  var atomReductionMap = {};
  sgroup$1.atoms = sgroup.SGroup.filterAtoms(sgroup$1.atoms, atomMap);
  sgroup$1.patoms = sgroup.SGroup.filterAtoms(sgroup$1.patoms, atomMap);
  for (var k = 1; k < sgroup$1.data.mul; ++k) {
    for (var m = 0; m < sgroup$1.patoms.length; ++m) {
      var raid = sgroup$1.atoms[k * sgroup$1.patoms.length + m];
      if (raid < 0) continue;
      if (sgroup$1.patoms[m] < 0) throw new Error('parent atom missing');
      atomReductionMap[raid] = sgroup$1.patoms[m];
    }
  }
  sgroup$1.patoms = sgroup.SGroup.removeNegative(sgroup$1.patoms);
  var patomsMap = identityMap(sgroup$1.patoms);
  var bondsToRemove = [];
  mol.bonds.forEach(function (bond, bid) {
    var beginIn = bond.begin in atomReductionMap;
    var endIn = bond.end in atomReductionMap;
    var endInPatoms = bond.end in patomsMap;
    var beginInPatoms = bond.begin in patomsMap;
    if (beginIn && endIn || beginIn && endInPatoms || endIn && beginInPatoms) {
      bondsToRemove.push(bid);
    } else if (beginIn) bond.begin = atomReductionMap[bond.begin];else if (endIn) bond.end = atomReductionMap[bond.end];
  });
  for (var _i = 0, _bondsToRemove = bondsToRemove; _i < _bondsToRemove.length; _i++) {
    var bondId = _bondsToRemove[_i];
    mol.bonds["delete"](bondId);
  }
  for (var a in atomReductionMap) {
    mol.atoms["delete"](+a);
    atomMap[a] = -1;
  }
  sgroup$1.atoms = sgroup$1.patoms;
  sgroup$1.patoms = null;
}
function postLoadSru(sgroup) {
  sgroup.data.connectivity = (sgroup.data.connectivity || 'EU').trim().toLowerCase();
  sgroup.data.subtype = (sgroup.data.subtype || '').trim().toLowerCase();
}
function postLoadSup(sgroup) {
  sgroup.data.name = (sgroup.data.subscript || '').trim();
  sgroup.data.subscript = '';
}
function postLoadGen(sgroup, _mol, _atomMap) {
  sgroup.data.connectivity = (sgroup.data.connectivity || 'eu').trim().toLowerCase();
  sgroup.data.subtype = (sgroup.data.subtype || '').trim().toLowerCase();
}
function postLoadDat(sgroup$1, mol) {
  if (!sgroup$1.data.absolute && mol) {
    if (!sgroup$1.pp) {
      throw new Error('SGroup pp is not set');
    }
    sgroup$1.pp = sgroup$1.pp.add(sgroup.SGroup.getMassCentre(mol, sgroup$1.atoms));
  }
}
function postLoadMon(_sgroup) {
}
function postLoadMer(_sgroup) {
}
function postLoadCop(sgroup) {
  postLoadGen(sgroup);
}
function postLoadCro(_sgroup) {
}
function postLoadMod(_sgroup) {
}
function postLoadGra(_sgroup) {
}
function postLoadCom(_sgroup) {
}
function postLoadMix(_sgroup) {
}
function postLoadFor(_sgroup) {
}
function postLoadAny(_sgroup) {
}
var postLoadMap = {
  SUP: postLoadSup,
  MUL: postLoadMul,
  SRU: postLoadSru,
  MON: postLoadMon,
  MER: postLoadMer,
  COP: postLoadCop,
  CRO: postLoadCro,
  MOD: postLoadMod,
  GRA: postLoadGra,
  COM: postLoadCom,
  MIX: postLoadMix,
  FOR: postLoadFor,
  DAT: postLoadDat,
  ANY: postLoadAny,
  GEN: postLoadGen
};
var allowedSGroupTypes = new Set(Object.keys(postLoadMap));
function loadSGroup(mol, sg, atomMap) {
  sg.id = mol.sgroups.add(sg);
  if (allowedSGroupTypes.has(sg.type)) {
    var handler = postLoadMap[sg.type];
    if (typeof handler === 'function') {
      handler(sg, mol, atomMap);
    }
  }
  var _iterator = _createForOfIteratorHelper(sg.atoms),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var atomId = _step.value;
      var atom = mol.atoms.get(atomId);
      if (atom) atom.sgs.add(sg.id);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (sg.type === 'DAT') mol.sGroupForest.insert(sg, -1, []);else mol.sGroupForest.insert(sg);
  return sg.id;
}
function initSGroup(sGroups, propData) {
  var kv = readKeyValuePairs(propData, true);
  var _iterator2 = _createForOfIteratorHelper(kv),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var _step2$value = _slicedToArray__default["default"](_step2.value, 2),
        key = _step2$value[0],
        type = _step2$value[1];
      var sg = new sgroup.SGroup(type);
      sg.number = key;
      sGroups[key] = sg;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
function applySGroupProp(sGroups, propName, propData, numeric, core) {
  var kv = readKeyValuePairs(propData, !numeric);
  var _iterator3 = _createForOfIteratorHelper(kv.keys()),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var key = _step3.value;
      (core ? sGroups[key] : sGroups[key].data)[propName] = kv.get(key);
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
}
function applySGroupArrayProp(sGroups, propName, propData, shift) {
  var sid = utils["default"].parseDecimalInt(propData.slice(1, 4)) - 1;
  var num = utils["default"].parseDecimalInt(propData.slice(4, 8));
  var part = toIntArray(utils["default"].partitionLineFixed(propData.slice(8), 3, true));
  if (part.length !== num) throw new Error('File format invalid');
  if (shift) part = part.map(function (v) {
    return v + shift;
  });
  sGroups[sid][propName] = sGroups[sid][propName].concat(part);
}
function applyDataSGroupName(sg, name) {
  sg.data.fieldName = name;
}
function applyDataSGroupExpand(sg, expanded) {
  sg.data.expanded = expanded;
}
function applyDataSGroupQuery(sg, query) {
  sg.data.query = query;
}
function applyDataSGroupQueryOp(sg, queryOp) {
  sg.data.queryOp = queryOp;
}
function applyDataSGroupDesc(sGroups, propData) {
  var split = utils["default"].partitionLine(propData, [4, 31, 2, 20, 2, 3], false);
  var id = utils["default"].parseDecimalInt(split[0]) - 1;
  var fieldName = split[1].trim();
  var fieldType = split[2].trim();
  var units = split[3].trim();
  var query = split[4].trim();
  var queryOp = split[5].trim();
  var sGroup = sGroups[id];
  sGroup.data.fieldType = fieldType;
  sGroup.data.fieldName = fieldName;
  sGroup.data.units = units;
  sGroup.data.query = query;
  sGroup.data.queryOp = queryOp;
}
function applyDataSGroupInfo(sg, propData) {
  var split = utils["default"].partitionLine(propData, [10 , 10 , 4 , 1 , 1 , 1 , 3 , 3 , 3 , 3 , 2 , 3 , 2 ], false);
  var x = parseFloat(split[0]);
  var y = parseFloat(split[1]);
  var attached = split[3].trim() === 'A';
  var absolute = split[4].trim() === 'A';
  var showUnits = split[5].trim() === 'U';
  var nCharsRaw = split[7].trim();
  var nCharsToDisplay = nCharsRaw === 'ALL' ? -1 : utils["default"].parseDecimalInt(nCharsRaw);
  var tagChar = split[10].trim();
  var daspPos = utils["default"].parseDecimalInt(split[11].trim());
  sg.pp = new vec2.Vec2(x, -y);
  sg.data.attached = attached;
  sg.data.absolute = absolute;
  sg.data.showUnits = showUnits;
  sg.data.nCharsToDisplay = nCharsToDisplay;
  sg.data.tagChar = tagChar;
  sg.data.daspPos = daspPos;
}
function applyDataSGroupInfoLine(sGroups, propData) {
  var id = utils["default"].parseDecimalInt(propData.substring(0, 4)) - 1;
  var sg = sGroups[id];
  applyDataSGroupInfo(sg, propData.substring(5));
}
function applyDataSGroupData(sg, data, finalize) {
  sg.data.fieldValue = (sg.data.fieldValue || '') + data;
  if (finalize) {
    sg.data.fieldValue = trimRight(sg.data.fieldValue);
    if (sg.data.fieldValue.startsWith('"') && sg.data.fieldValue.endsWith('"')) {
      sg.data.fieldValue = sg.data.fieldValue.substring(1, sg.data.fieldValue.length - 1);
    }
  }
}
function applyDataSGroupDataLine(sGroups, propData, finalize) {
  var id = utils["default"].parseDecimalInt(propData.substring(0, 5)) - 1;
  var data = propData.substring(5);
  var sg = sGroups[id];
  applyDataSGroupData(sg, data, finalize);
}
function toIntArray(strArray) {
  var ret = [];
  for (var j = 0; j < strArray.length; ++j) {
    ret[j] = utils["default"].parseDecimalInt(strArray[j]);
  }
  return ret;
}
function trimRight(str) {
  return str.trimEnd();
}
function identityMap(array) {
  var map = {};
  var _iterator4 = _createForOfIteratorHelper(array),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var item = _step4.value;
      map[item] = item;
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  return map;
}
function parseSGroupSAPLineV2000(ctabString) {
  var _utils$partitionLine = utils["default"].partitionLine(ctabString.slice(0, 7), [1, 3, 3], false),
    _utils$partitionLine2 = _slicedToArray__default["default"](_utils$partitionLine, 3),
    sss = _utils$partitionLine2[1],
    nn6 = _utils$partitionLine2[2];
  var chunksNumberInLine = utils["default"].parseDecimalInt(nn6);
  assert.assert(chunksNumberInLine <= 6);
  var sGroupId = utils["default"].parseDecimalInt(sss) - 1;
  var attachmentPointsStr = ctabString.slice(7);
  var attachmentPoints = [];
  for (var i = 0; i < chunksNumberInLine; i++) {
    var CHUNK_SIZE = 11;
    var stringForParse = attachmentPointsStr.slice(i * CHUNK_SIZE);
    var CHUNK_PARTS_LENGTHS = [1, 3, 1, 3, 1, 2];
    var _utils$partitionLine3 = utils["default"].partitionLine(stringForParse, CHUNK_PARTS_LENGTHS, false),
      _utils$partitionLine4 = _slicedToArray__default["default"](_utils$partitionLine3, 6),
      iii = _utils$partitionLine4[1],
      ooo = _utils$partitionLine4[3],
      cc = _utils$partitionLine4[5];
    var atomId = utils["default"].parseDecimalInt(iii) - 1;
    assert.assert(atomId >= 0);
    var leaveAtomParsedId = utils["default"].parseDecimalInt(ooo);
    var leaveAtomId = leaveAtomParsedId > 0 ? leaveAtomParsedId - 1 : undefined;
    attachmentPoints.push(new sGroupAttachmentPoint.SGroupAttachmentPoint(atomId, leaveAtomId, cc));
  }
  return {
    sGroupId: sGroupId,
    attachmentPoints: attachmentPoints
  };
}
var sGroup = {
  readKeyValuePairs: readKeyValuePairs,
  readKeyMultiValuePairs: readKeyMultiValuePairs,
  loadSGroup: loadSGroup,
  initSGroup: initSGroup,
  applySGroupProp: applySGroupProp,
  applySGroupArrayProp: applySGroupArrayProp,
  applyDataSGroupName: applyDataSGroupName,
  applyDataSGroupQuery: applyDataSGroupQuery,
  applyDataSGroupQueryOp: applyDataSGroupQueryOp,
  applyDataSGroupDesc: applyDataSGroupDesc,
  applyDataSGroupInfo: applyDataSGroupInfo,
  applyDataSGroupData: applyDataSGroupData,
  applyDataSGroupInfoLine: applyDataSGroupInfoLine,
  applyDataSGroupDataLine: applyDataSGroupDataLine,
  applyDataSGroupExpand: applyDataSGroupExpand,
  parseSGroupSAPLineV2000: parseSGroupSAPLineV2000
};

exports["default"] = sGroup;
//# sourceMappingURL=parseSGroup.js.map
