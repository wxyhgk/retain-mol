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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import { Pool } from '../../entities/pool.modern.js';
import { SGroup } from '../../entities/sgroup.modern.js';
import { Vec2 } from '../../entities/vec2.modern.js';
import { SGroupAttachmentPoint } from '../../entities/sGroupAttachmentPoint.modern.js';
import utils from './utils.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../utilities/assert.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function readKeyValuePairs(str, valueString) {
  var ret = new Pool();
  var partition = utils.partitionLineFixed(str, 3, true);
  var count = utils.parseDecimalInt(partition[0]);
  for (var i = 0; i < count; ++i) {
    var key = utils.parseDecimalInt(partition[2 * i + 1]) - 1;
    var value = valueString ? partition[2 * i + 2].trim() : utils.parseDecimalInt(partition[2 * i + 2]);
    ret.set(key, value);
  }
  return ret;
}
function readKeyMultiValuePairs(str, valueString) {
  var ret = [];
  var partition = utils.partitionLineFixed(str, 3, true);
  var count = utils.parseDecimalInt(partition[0]);
  for (var i = 0; i < count; ++i) {
    ret.push([
    utils.parseDecimalInt(partition[2 * i + 1]) - 1, valueString ? partition[2 * i + 2].trim() : utils.parseDecimalInt(partition[2 * i + 2])
    ]);
  }
  return ret;
}
function postLoadMul(sgroup, mol, atomMap) {
  if (!mol || !atomMap) return;
  sgroup.data.mul = Number(sgroup.data.subscript);
  var atomReductionMap = {};
  sgroup.atoms = SGroup.filterAtoms(sgroup.atoms, atomMap);
  sgroup.patoms = SGroup.filterAtoms(sgroup.patoms, atomMap);
  for (var k = 1; k < sgroup.data.mul; ++k) {
    for (var m = 0; m < sgroup.patoms.length; ++m) {
      var raid = sgroup.atoms[k * sgroup.patoms.length + m];
      if (raid < 0) continue;
      if (sgroup.patoms[m] < 0) throw new Error('parent atom missing');
      atomReductionMap[raid] = sgroup.patoms[m];
    }
  }
  sgroup.patoms = SGroup.removeNegative(sgroup.patoms);
  var patomsMap = identityMap(sgroup.patoms);
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
  sgroup.atoms = sgroup.patoms;
  sgroup.patoms = null;
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
function postLoadDat(sgroup, mol) {
  if (!sgroup.data.absolute && mol) {
    if (!sgroup.pp) {
      throw new Error('SGroup pp is not set');
    }
    sgroup.pp = sgroup.pp.add(SGroup.getMassCentre(mol, sgroup.atoms));
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
      var _step2$value = _slicedToArray(_step2.value, 2),
        key = _step2$value[0],
        type = _step2$value[1];
      var sg = new SGroup(type);
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
  var sid = utils.parseDecimalInt(propData.slice(1, 4)) - 1;
  var num = utils.parseDecimalInt(propData.slice(4, 8));
  var part = toIntArray(utils.partitionLineFixed(propData.slice(8), 3, true));
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
  var split = utils.partitionLine(propData, [4, 31, 2, 20, 2, 3], false);
  var id = utils.parseDecimalInt(split[0]) - 1;
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
  var split = utils.partitionLine(propData, [10 , 10 , 4 , 1 , 1 , 1 , 3 , 3 , 3 , 3 , 2 , 3 , 2 ], false);
  var x = parseFloat(split[0]);
  var y = parseFloat(split[1]);
  var attached = split[3].trim() === 'A';
  var absolute = split[4].trim() === 'A';
  var showUnits = split[5].trim() === 'U';
  var nCharsRaw = split[7].trim();
  var nCharsToDisplay = nCharsRaw === 'ALL' ? -1 : utils.parseDecimalInt(nCharsRaw);
  var tagChar = split[10].trim();
  var daspPos = utils.parseDecimalInt(split[11].trim());
  sg.pp = new Vec2(x, -y);
  sg.data.attached = attached;
  sg.data.absolute = absolute;
  sg.data.showUnits = showUnits;
  sg.data.nCharsToDisplay = nCharsToDisplay;
  sg.data.tagChar = tagChar;
  sg.data.daspPos = daspPos;
}
function applyDataSGroupInfoLine(sGroups, propData) {
  var id = utils.parseDecimalInt(propData.substring(0, 4)) - 1;
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
  var id = utils.parseDecimalInt(propData.substring(0, 5)) - 1;
  var data = propData.substring(5);
  var sg = sGroups[id];
  applyDataSGroupData(sg, data, finalize);
}
function toIntArray(strArray) {
  var ret = [];
  for (var j = 0; j < strArray.length; ++j) {
    ret[j] = utils.parseDecimalInt(strArray[j]);
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
  var _utils$partitionLine = utils.partitionLine(ctabString.slice(0, 7), [1, 3, 3], false),
    _utils$partitionLine2 = _slicedToArray(_utils$partitionLine, 3),
    sss = _utils$partitionLine2[1],
    nn6 = _utils$partitionLine2[2];
  var chunksNumberInLine = utils.parseDecimalInt(nn6);
  assert(chunksNumberInLine <= 6);
  var sGroupId = utils.parseDecimalInt(sss) - 1;
  var attachmentPointsStr = ctabString.slice(7);
  var attachmentPoints = [];
  for (var i = 0; i < chunksNumberInLine; i++) {
    var CHUNK_SIZE = 11;
    var stringForParse = attachmentPointsStr.slice(i * CHUNK_SIZE);
    var CHUNK_PARTS_LENGTHS = [1, 3, 1, 3, 1, 2];
    var _utils$partitionLine3 = utils.partitionLine(stringForParse, CHUNK_PARTS_LENGTHS, false),
      _utils$partitionLine4 = _slicedToArray(_utils$partitionLine3, 6),
      iii = _utils$partitionLine4[1],
      ooo = _utils$partitionLine4[3],
      cc = _utils$partitionLine4[5];
    var atomId = utils.parseDecimalInt(iii) - 1;
    assert(atomId >= 0);
    var leaveAtomParsedId = utils.parseDecimalInt(ooo);
    var leaveAtomId = leaveAtomParsedId > 0 ? leaveAtomParsedId - 1 : undefined;
    attachmentPoints.push(new SGroupAttachmentPoint(atomId, leaveAtomId, cc));
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

export { sGroup as default };
//# sourceMappingURL=parseSGroup.modern.js.map
