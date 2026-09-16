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

var bond = require('../../entities/bond.js');
var rxnArrow = require('../../entities/rxnArrow.js');
var rxnPlus = require('../../entities/rxnPlus.js');
var struct = require('../../entities/struct.js');
var vec2 = require('../../entities/vec2.js');
var rgroup = require('../../entities/rgroup.js');
var fragment = require('../../entities/fragment.js');

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function paddedNum(number, width, precision) {
  var parsedNumber = parseFloat(number);
  var numStr = parsedNumber.toFixed(precision || 0).replace(',', '.');
  if (numStr.length > width) throw new Error('number does not fit');
  return numStr.padStart(width);
}
function parseDecimalInt(str) {
  var val = parseInt(str, 10);
  return isNaN(val) ? 0 : val;
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
function partitionLineFixed(str, itemLength, withspace) {
  var res = [];
  var step = withspace ? itemLength + 1 : itemLength;
  var shift = 0;
  while (shift < str.length) {
    res.push(str.slice(shift, shift + itemLength));
    shift += step;
  }
  return res;
}
var fmtInfo = {
  bondTypeMap: {
    1: bond.Bond.PATTERN.TYPE.SINGLE,
    2: bond.Bond.PATTERN.TYPE.DOUBLE,
    3: bond.Bond.PATTERN.TYPE.TRIPLE,
    4: bond.Bond.PATTERN.TYPE.AROMATIC,
    5: bond.Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE,
    6: bond.Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC,
    7: bond.Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC,
    8: bond.Bond.PATTERN.TYPE.ANY,
    9: bond.Bond.PATTERN.TYPE.DATIVE,
    10: bond.Bond.PATTERN.TYPE.HYDROGEN
  },
  bondStereoMap: {
    0: bond.Bond.PATTERN.STEREO.NONE,
    1: bond.Bond.PATTERN.STEREO.UP,
    4: bond.Bond.PATTERN.STEREO.EITHER,
    6: bond.Bond.PATTERN.STEREO.DOWN,
    3: bond.Bond.PATTERN.STEREO.CIS_TRANS
  },
  v30bondStereoMap: {
    0: bond.Bond.PATTERN.STEREO.NONE,
    1: bond.Bond.PATTERN.STEREO.UP,
    2: bond.Bond.PATTERN.STEREO.EITHER,
    3: bond.Bond.PATTERN.STEREO.DOWN
  },
  bondTopologyMap: {
    0: bond.Bond.PATTERN.TOPOLOGY.EITHER,
    1: bond.Bond.PATTERN.TOPOLOGY.RING,
    2: bond.Bond.PATTERN.TOPOLOGY.CHAIN
  },
  countsLinePartition: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
  atomLinePartition: [10, 10, 10, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  bondLinePartition: [3, 3, 3, 3, 3, 3, 3],
  atomListHeaderPartition: [3, 1, 1, 4, 1, 1],
  atomListHeaderLength: 11,
  atomListHeaderItemLength: 4,
  chargeMap: [null, +3, +2, +1, null, -1, -2, -3],
  valenceMap: [undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0],
  implicitHydrogenMap: [undefined, 0, 1, 2, 3, 4],
  v30atomPropMap: {
    CHG: 'charge',
    RAD: 'radical',
    MASS: 'isotope',
    VAL: 'explicitValence',
    HCOUNT: 'hCount',
    INVRET: 'invRet',
    SUBST: 'substitutionCount',
    UNSAT: 'unsaturatedAtom',
    RBCNT: 'ringBondCount'
  },
  rxnItemsPartition: [3, 3, 3]
};
var FRAGMENT = {
  NONE: 0,
  REACTANT: 1,
  PRODUCT: 2,
  AGENT: 3
};
function calculateAverageBondLength(mols) {
  var bondLengthData = {
    cnt: 0,
    totalLength: 0
  };
  var _iterator = _createForOfIteratorHelper(mols),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var mol = _step.value;
      var bondLengthDataMol = mol.getBondLengthData();
      bondLengthData.cnt += bondLengthDataMol.cnt;
      bondLengthData.totalLength += bondLengthDataMol.totalLength;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return bondLengthData.cnt === 0 ? 1 : bondLengthData.totalLength / bondLengthData.cnt;
}
function rescaleMolecules(mols) {
  var avgBondLength = calculateAverageBondLength(mols);
  var scaleFactor = 1 / avgBondLength;
  var _iterator2 = _createForOfIteratorHelper(mols),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var mol = _step2.value;
      mol.scale(scaleFactor);
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
function getFragmentType(index, nReactants, nProducts) {
  if (index < nReactants) {
    return FRAGMENT.REACTANT;
  } else if (index < nReactants + nProducts) {
    return FRAGMENT.PRODUCT;
  } else {
    return FRAGMENT.AGENT;
  }
}
function categorizeMolecules(mols, nReactants, nProducts) {
  var bbReact = [];
  var bbAgent = [];
  var bbProd = [];
  var molReact = [];
  var molAgent = [];
  var molProd = [];
  var _loop = function _loop() {
    var mol = mols[j];
    var bb = mol.getCoordBoundingBoxObj();
    if (!bb) return 1;
    var fragmentType = getFragmentType(j, nReactants, nProducts);
    if (fragmentType === FRAGMENT.REACTANT) {
      bbReact.push(bb);
      molReact.push(mol);
    } else if (fragmentType === FRAGMENT.AGENT) {
      bbAgent.push(bb);
      molAgent.push(mol);
    } else if (fragmentType === FRAGMENT.PRODUCT) {
      bbProd.push(bb);
      molProd.push(mol);
    }
    mol.atoms.forEach(function (atom) {
      atom.rxnFragmentType = fragmentType;
    });
  };
  for (var j = 0; j < mols.length; ++j) {
    if (_loop()) continue;
  }
  return {
    bbReact: bbReact,
    bbAgent: bbAgent,
    bbProd: bbProd,
    molReact: molReact,
    molAgent: molAgent,
    molProd: molProd
  };
}
function shiftMol(ret, mol, bb, xorig, over) {
  var d = new vec2.Vec2(xorig - bb.min.x, over ? 1 - bb.min.y : -(bb.min.y + bb.max.y) / 2);
  mol.atoms.forEach(function (atom) {
    atom.pp.add_(d);
  });
  mol.sgroups.forEach(function (item) {
    if (item.pp) item.pp.add_(d);
  });
  bb.min.add_(d);
  bb.max.add_(d);
  mol.mergeInto(ret);
  return bb.max.x - bb.min.x;
}
function layoutReactionFragments(ret, molReact, bbReact, molAgent, bbAgent, molProd, bbProd) {
  var xorig = 0;
  for (var j = 0; j < molReact.length; ++j) {
    xorig += shiftMol(ret, molReact[j], bbReact[j], xorig, false) + 2.0;
  }
  xorig += 2.0;
  for (var _j = 0; _j < molAgent.length; ++_j) {
    xorig += shiftMol(ret, molAgent[_j], bbAgent[_j], xorig, true) + 2.0;
  }
  xorig += 2.0;
  for (var _j2 = 0; _j2 < molProd.length; ++_j2) {
    xorig += shiftMol(ret, molProd[_j2], bbProd[_j2], xorig, false) + 2.0;
  }
}
function mergeWithoutLayout(ret, molReact, molAgent, molProd) {
  var _iterator3 = _createForOfIteratorHelper(molReact),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var mol = _step3.value;
      mol.mergeInto(ret);
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  var _iterator4 = _createForOfIteratorHelper(molAgent),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var _mol = _step4.value;
      _mol.mergeInto(ret);
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  var _iterator5 = _createForOfIteratorHelper(molProd),
    _step5;
  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var _mol2 = _step5.value;
      _mol2.mergeInto(ret);
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
}
function addPlusSigns(ret, boundingBoxes) {
  for (var j = 0; j < boundingBoxes.length - 1; ++j) {
    var bb1 = boundingBoxes[j];
    var bb2 = boundingBoxes[j + 1];
    var x = (bb1.max.x + bb2.min.x) / 2;
    var y = (bb1.max.y + bb1.min.y + bb2.max.y + bb2.min.y) / 4;
    ret.rxnPluses.add(new rxnPlus.RxnPlus({
      pp: new vec2.Vec2(x, y)
    }));
  }
}
function aggregateBoundingBoxes(boundingBoxes) {
  if (boundingBoxes.length === 0) return null;
  var bbAll = {
    max: new vec2.Vec2(boundingBoxes[0].max),
    min: new vec2.Vec2(boundingBoxes[0].min)
  };
  for (var j = 1; j < boundingBoxes.length; ++j) {
    bbAll.max = vec2.Vec2.max(bbAll.max, boundingBoxes[j].max);
    bbAll.min = vec2.Vec2.min(bbAll.min, boundingBoxes[j].min);
  }
  return bbAll;
}
function createReactionArrow(bb1, bb2) {
  var defaultArrowLength = 2;
  var defaultOffset = 3;
  if (!bb1 && !bb2) {
    return new rxnArrow.RxnArrow({
      mode: 'open-angle',
      pos: [new vec2.Vec2(0, 0), new vec2.Vec2(defaultArrowLength, 0)]
    });
  }
  var v1 = bb1 ? new vec2.Vec2(bb1.max.x, (bb1.max.y + bb1.min.y) / 2) : null;
  var v2 = bb2 ? new vec2.Vec2(bb2.min.x, (bb2.max.y + bb2.min.y) / 2) : null;
  if (!v1) v1 = new vec2.Vec2(v2.x - defaultOffset, v2.y);
  if (!v2) v2 = new vec2.Vec2(v1.x + defaultOffset, v1.y);
  var arrowCenter = vec2.Vec2.lc2(v1, 0.5, v2, 0.5);
  var arrowStart = new vec2.Vec2(arrowCenter.x - 0.5 * defaultArrowLength, arrowCenter.y, arrowCenter.z);
  var arrowEnd = new vec2.Vec2(arrowCenter.x + 0.5 * defaultArrowLength, arrowCenter.y, arrowCenter.z);
  return new rxnArrow.RxnArrow({
    mode: 'open-angle',
    pos: [arrowStart, arrowEnd]
  });
}
function rxnMerge(mols, nReactants, nProducts, nAgents, shouldReactionRelayout) {
  var ret = new struct.Struct();
  {
    rescaleMolecules(mols);
  }
  var _categorizeMolecules = categorizeMolecules(mols, nReactants, nProducts),
    bbReact = _categorizeMolecules.bbReact,
    bbAgent = _categorizeMolecules.bbAgent,
    bbProd = _categorizeMolecules.bbProd,
    molReact = _categorizeMolecules.molReact,
    molAgent = _categorizeMolecules.molAgent,
    molProd = _categorizeMolecules.molProd;
  if (shouldReactionRelayout) {
    layoutReactionFragments(ret, molReact, bbReact, molAgent, bbAgent, molProd, bbProd);
  } else {
    mergeWithoutLayout(ret, molReact, molAgent, molProd);
  }
  addPlusSigns(ret, bbReact);
  addPlusSigns(ret, bbProd);
  var bbReactAll = aggregateBoundingBoxes(bbReact);
  var bbProdAll = aggregateBoundingBoxes(bbProd);
  var arrow = createReactionArrow(bbReactAll, bbProdAll);
  ret.addRxnArrow(arrow);
  ret.isReaction = true;
  return ret;
}
function rgMerge(scaffold, rgroups) {
  var ret = new struct.Struct();
  scaffold.mergeInto(ret, null, null, false, true);
  Object.keys(rgroups).forEach(function (id) {
    var rgid = parseInt(id, 10);
    var _iterator6 = _createForOfIteratorHelper(rgroups[rgid]),
      _step6;
    try {
      var _loop2 = function _loop2() {
        var ctab = _step6.value;
        ctab.rgroups.set(rgid, new rgroup.RGroup());
        var frag = new fragment.Fragment();
        var frid = ctab.frags.add(frag);
        ctab.rgroups.get(rgid).frags.add(frid);
        ctab.atoms.forEach(function (atom) {
          atom.fragment = frid;
        });
        ctab.mergeInto(ret);
      };
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        _loop2();
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
  });
  return ret;
}
var utils = {
  fmtInfo: fmtInfo,
  paddedNum: paddedNum,
  parseDecimalInt: parseDecimalInt,
  partitionLine: partitionLine,
  partitionLineFixed: partitionLineFixed,
  rxnMerge: rxnMerge,
  rgMerge: rgMerge
};

exports["default"] = utils;
//# sourceMappingURL=utils.js.map
