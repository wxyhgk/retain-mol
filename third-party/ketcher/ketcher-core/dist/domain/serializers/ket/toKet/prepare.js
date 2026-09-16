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
var pile = require('../../../entities/pile.js');
var pool = require('../../../entities/pool.js');
var vec2 = require('../../../entities/vec2.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function prepareStructForKet(struct) {
  var ketNodes = [];
  var rgFrags = new Set();
  var _iterator = _createForOfIteratorHelper(struct.rgroups.entries()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray__default["default"](_step.value, 2),
        rgnumber = _step$value[0],
        rgroup = _step$value[1];
      rgroup.frags.forEach(function (frid) {
        return rgFrags.add(frid);
      });
      var fragsAtoms = Array.from(rgroup.frags.values()).reduce(function (res, frid) {
        return res.union(struct.getFragmentIds(frid));
      }, new pile.Pile());
      ketNodes.push({
        type: 'rgroup',
        fragment: struct.clone(fragsAtoms),
        center: getFragmentCenter(struct, fragsAtoms),
        data: {
          rgnumber: rgnumber,
          rgroup: rgroup
        }
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var filteredFragmentIds = Array.from(struct.frags.keys()).filter(function (fid) {
    return !rgFrags.has(fid);
  });
  addMolecules(ketNodes, filteredFragmentIds, struct);
  struct.rxnArrows.forEach(function (item) {
    ketNodes.push({
      type: 'arrow',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos,
        height: item.height
      },
      selected: item.getInitiallySelected()
    });
  });
  struct.rxnPluses.forEach(function (item) {
    ketNodes.push({
      type: 'plus',
      center: item.pp,
      data: {},
      selected: item.getInitiallySelected()
    });
  });
  struct.simpleObjects.forEach(function (item) {
    ketNodes.push({
      type: 'simpleObject',
      center: item.pos[0],
      data: {
        mode: item.mode,
        pos: item.pos
      },
      selected: item.getInitiallySelected()
    });
  });
  struct.texts.forEach(function (item) {
    ketNodes.push({
      type: 'text',
      center: item.position,
      data: {
        content: item.content,
        position: item.position,
        pos: item.pos
      },
      selected: item.getInitiallySelected()
    });
  });
  struct.images.forEach(function (image) {
    ketNodes.push(image.toKetNode());
  });
  struct.multitailArrows.forEach(function (multitailArrow) {
    ketNodes.push(multitailArrow.toKetNode());
  });
  ketNodes.forEach(function (ketNode) {
    if (ketNode.fragment) {
      var sgroups = Array.from(ketNode.fragment.sgroups.values());
      var filteredSGroups = sgroups.filter(function (sg) {
        return sg.atoms.every(function (atom) {
          return atom !== undefined;
        });
      });
      var filteredSGroupsMap = new pool.Pool();
      filteredSGroups.forEach(function (sg, index) {
        filteredSGroupsMap.set(index, sg);
      });
      ketNode.fragment.sgroups = filteredSGroupsMap;
    }
  });
  return ketNodes;
}
function getFragmentCenter(struct, atomSet) {
  var bb = struct.getCoordBoundingBox(atomSet);
  return vec2.Vec2.centre(bb.min, bb.max);
}
function addMolecules(ketNodes, fragmentIds, struct) {
  var sGroupFragmentsMap = generateSGroupFragmentsMap(ketNodes, fragmentIds, struct);
  var mergedFragments = pile.Pile.unionIntersections(Array.from(sGroupFragmentsMap.values()));
  mergedFragments.forEach(function (fragments) {
    var atomSet = new pile.Pile();
    fragments.forEach(function (fragmentId) {
      atomSet = atomSet.union(struct.getFragmentIds(fragmentId));
    });
    ketNodes.push({
      type: 'molecule',
      fragment: struct.clone(atomSet),
      center: getFragmentCenter(struct, atomSet)
    });
  });
}
function generateSGroupFragmentsMap(ketNodes, fragmentIds, struct) {
  var sGroupFragmentsMap = new Map();
  fragmentIds.forEach(function (fragmentId) {
    var atomsInFragment = struct.getFragmentIds(fragmentId);
    var hasAtomInSGroup = false;
    atomsInFragment.forEach(function (atomId) {
      var _struct$atoms$get;
      (_struct$atoms$get = struct.atoms.get(atomId)) === null || _struct$atoms$get === void 0 || _struct$atoms$get.sgs.forEach(function (sGroupId) {
        hasAtomInSGroup = true;
        var fragmentSet = sGroupFragmentsMap.get(sGroupId);
        if (fragmentSet) {
          fragmentSet.add(fragmentId);
        } else {
          sGroupFragmentsMap.set(sGroupId, new pile.Pile([fragmentId]));
        }
      });
    });
    if (!hasAtomInSGroup) {
      ketNodes.push({
        type: 'molecule',
        fragment: struct.clone(atomsInFragment),
        center: getFragmentCenter(struct, atomsInFragment)
      });
    }
  });
  return sGroupFragmentsMap;
}

exports.prepareStructForKet = prepareStructForKet;
//# sourceMappingURL=prepare.js.map
