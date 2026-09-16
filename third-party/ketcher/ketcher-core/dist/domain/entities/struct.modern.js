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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { Atom, radicalElectrons } from './atom.modern.js';
import { Bond } from './bond.modern.js';
import { Box2Abs } from './box2Abs.modern.js';
import { Elements } from '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import '../constants/monomers.modern.js';
import { Fragment } from './fragment.modern.js';
import { FunctionalGroup } from './functionalGroup.modern.js';
import { HalfBond } from './halfBond.modern.js';
import { Loop } from './loop.modern.js';
import { Pile } from './pile.modern.js';
import { Pool } from './pool.modern.js';
import { SGroup } from './sgroup.modern.js';
import { SGroupForest } from './sgroupForest.modern.js';
import { Vec2 } from './vec2.modern.js';
import { MonomerMicromolecule } from './monomerMicromolecule.modern.js';
import { isNumber } from 'lodash';
import { getStereoAtomsMap } from '../../application/editor/actions/helpers.modern.js';
import { rotateDelta, flipPointByCenter } from '../../application/editor/shared/utils.modern.js';
import { getAttachmentPointStereoBond } from '../helpers/getAttachmentPointStereoBond.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function arrayAddIfMissing(array, item) {
  var _iterator = _createForOfIteratorHelper(array),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var arrayItem = _step.value;
      if (arrayItem === item) return false;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  array.push(item);
  return true;
}
var Struct = function () {
  function Struct() {
    _classCallCheck(this, Struct);
    _defineProperty(this, "atoms", void 0);
    _defineProperty(this, "bonds", void 0);
    _defineProperty(this, "sgroups", void 0);
    _defineProperty(this, "halfBonds", void 0);
    _defineProperty(this, "loops", void 0);
    _defineProperty(this, "isReaction", void 0);
    _defineProperty(this, "rxnArrows", void 0);
    _defineProperty(this, "rxnPluses", void 0);
    _defineProperty(this, "frags", void 0);
    _defineProperty(this, "rgroups", void 0);
    _defineProperty(this, "rgroupAttachmentPoints", void 0);
    _defineProperty(this, "name", void 0);
    _defineProperty(this, "abbreviation", void 0);
    _defineProperty(this, "sGroupForest", void 0);
    _defineProperty(this, "simpleObjects", void 0);
    _defineProperty(this, "texts", void 0);
    _defineProperty(this, "functionalGroups", void 0);
    _defineProperty(this, "highlights", void 0);
    _defineProperty(this, "images", new Pool());
    _defineProperty(this, "multitailArrows", new Pool());
    _defineProperty(this, "nextArrowId", 0);
    this.atoms = new Pool();
    this.bonds = new Pool();
    this.sgroups = new Pool();
    this.halfBonds = new Pool();
    this.loops = new Pool();
    this.isReaction = false;
    this.rxnArrows = new Pool();
    this.rxnPluses = new Pool();
    this.frags = new Pool();
    this.rgroups = new Pool();
    this.rgroupAttachmentPoints = new Pool();
    this.name = '';
    this.abbreviation = '';
    this.sGroupForest = new SGroupForest();
    this.simpleObjects = new Pool();
    this.texts = new Pool();
    this.functionalGroups = new Pool();
    this.highlights = new Pool();
  }
  _createClass(Struct, [{
    key: "syncNextArrowId",
    value: function syncNextArrowId(arrowId) {
      this.nextArrowId = Math.max(this.nextArrowId, arrowId + 1);
    }
  }, {
    key: "ensureArrowId",
    value: function ensureArrowId(arrow) {
      var _arrow$arrowId;
      var arrowId = (_arrow$arrowId = arrow.arrowId) !== null && _arrow$arrowId !== void 0 ? _arrow$arrowId : this.nextArrowId;
      arrow.arrowId = arrowId;
      this.syncNextArrowId(arrowId);
      return arrow;
    }
  }, {
    key: "addRxnArrow",
    value: function addRxnArrow(item) {
      this.ensureArrowId(item);
      return this.rxnArrows.add(item);
    }
  }, {
    key: "setRxnArrow",
    value: function setRxnArrow(id, item) {
      this.ensureArrowId(item);
      this.rxnArrows.set(id, item);
    }
  }, {
    key: "addMultitailArrow",
    value: function addMultitailArrow(item) {
      this.ensureArrowId(item);
      return this.multitailArrows.add(item);
    }
  }, {
    key: "setMultitailArrow",
    value: function setMultitailArrow(id, item) {
      this.ensureArrowId(item);
      this.multitailArrows.set(id, item);
    }
  }, {
    key: "hasRxnProps",
    value: function hasRxnProps() {
      var _this$atoms$find;
      return !!((_this$atoms$find = this.atoms.find(function (_aid, atom) {
        return atom.hasRxnProps();
      })) !== null && _this$atoms$find !== void 0 ? _this$atoms$find : this.bonds.find(function (_bid, bond) {
        return bond.hasRxnProps();
      }));
    }
  }, {
    key: "hasRxnArrow",
    value: function hasRxnArrow() {
      return this.rxnArrows.size >= 1;
    }
  }, {
    key: "hasMultitailArrow",
    value: function hasMultitailArrow() {
      return this.multitailArrows.size >= 1;
    }
  }, {
    key: "hasRxnPluses",
    value: function hasRxnPluses() {
      return this.rxnPluses.size > 0;
    }
  }, {
    key: "isRxn",
    value: function isRxn() {
      return this.hasRxnArrow() || this.hasRxnPluses();
    }
  }, {
    key: "isBlank",
    value: function isBlank() {
      return this.atoms.size === 0 && this.rxnArrows.size === 0 && this.rxnPluses.size === 0 && this.simpleObjects.size === 0 && this.texts.size === 0 && this.images.size === 0 && this.multitailArrows.size === 0;
    }
  }, {
    key: "isSingleGroup",
    value: function isSingleGroup() {
      if (!this.sgroups.size || this.sgroups.size > 1) return false;
      var sgroup = this.sgroups.values().next().value;
      return sgroup !== undefined && this.atoms.size === sgroup.atoms.length;
    }
  }, {
    key: "clone",
    value: function clone(atomSet, bondSet, dropRxnSymbols, aidMap, simpleObjectsSet, textsSet, rgroupAttachmentPointSet, imagesSet, multitailArrowsSet, bidMap) {
      var needCloneAttachmentPoints = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : false;
      var cloneStruct = this.mergeInto(new Struct(), atomSet, bondSet, dropRxnSymbols, false, aidMap, simpleObjectsSet, textsSet, rgroupAttachmentPointSet, imagesSet, multitailArrowsSet, bidMap, needCloneAttachmentPoints);
      cloneStruct.findConnectedComponents();
      cloneStruct.setImplicitHydrogen(undefined, true);
      cloneStruct.setStereoLabelsToAtoms();
      cloneStruct.markFragments();
      return cloneStruct;
    }
  }, {
    key: "getScaffold",
    value: function getScaffold() {
      var _this = this;
      var atomSet = new Pile();
      this.atoms.forEach(function (_atom, aid) {
        atomSet.add(aid);
      });
      this.rgroups.forEach(function (rg) {
        rg.frags.forEach(function (_fnum, fid) {
          _this.atoms.forEach(function (atom, aid) {
            if (atom.fragment === fid) atomSet["delete"](aid);
          });
        });
      });
      return this.clone(atomSet);
    }
  }, {
    key: "getFragmentIds",
    value: function getFragmentIds(_fid) {
      var atomSet = new Pile();
      var fid = Array.isArray(_fid) ? _fid : [_fid];
      this.atoms.forEach(function (atom, aid) {
        if (fid.includes(atom.fragment)) atomSet.add(aid);
      });
      return atomSet;
    }
  }, {
    key: "getFragment",
    value: function getFragment(fid, aidMap) {
      return this.clone(this.getFragmentIds(fid), null, true, aidMap);
    }
  }, {
    key: "getFragmentOnly",
    value: function getFragmentOnly(fid, aidMap) {
      var atomSet = this.getFragmentIds(fid);
      var rgroupAttachmentPointSet = new Pile();
      this.rgroupAttachmentPoints.forEach(function (point, id) {
        if (atomSet.has(point.atomId)) {
          rgroupAttachmentPointSet.add(id);
        }
      });
      return this.clone(atomSet, null, true, aidMap, new Pile(), new Pile(), rgroupAttachmentPointSet, new Pile(), new Pile());
    }
  }, {
    key: "mergeInto",
    value: function mergeInto(cp, atomSet, bondSet, dropRxnSymbols, keepAllRGroups, aidMap, simpleObjectsSet, textsSet, rgroupAttachmentPointSet, imagesSet, multitailArrowsSet, bidMapEntity) {
      var _this2 = this;
      var needCloneAttachmentPoints = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : false;
      var atoms = atomSet !== null && atomSet !== void 0 ? atomSet : new Pile(this.atoms.keys());
      var bonds = bondSet !== null && bondSet !== void 0 ? bondSet : new Pile(this.bonds.keys());
      var simpleObjects = simpleObjectsSet !== null && simpleObjectsSet !== void 0 ? simpleObjectsSet : new Pile(this.simpleObjects.keys());
      var texts = textsSet !== null && textsSet !== void 0 ? textsSet : new Pile(this.texts.keys());
      var images = imagesSet !== null && imagesSet !== void 0 ? imagesSet : new Pile(this.images.keys());
      var multitailArrows = multitailArrowsSet !== null && multitailArrowsSet !== void 0 ? multitailArrowsSet : new Pile(this.multitailArrows.keys());
      var rgroupAttachmentPoints = rgroupAttachmentPointSet !== null && rgroupAttachmentPointSet !== void 0 ? rgroupAttachmentPointSet : new Pile(this.rgroupAttachmentPoints.keys());
      var aids = aidMap !== null && aidMap !== void 0 ? aidMap : new Map();
      var bidMap = bidMapEntity !== null && bidMapEntity !== void 0 ? bidMapEntity : new Map();
      bonds = bonds.filter(function (bid) {
        var bond = _this2.bonds.get(bid);
        return atoms.has(bond.begin) && atoms.has(bond.end);
      });
      var fidMask = new Pile();
      this.atoms.forEach(function (atom, aid) {
        if (atoms.has(aid)) fidMask.add(atom.fragment);
      });
      var fidMap = new Map();
      this.frags.forEach(function (_frag, fid) {
        if (fidMask.has(fid)) fidMap.set(fid, cp.frags.add(null));
      });
      var rgroupsIds = [];
      this.rgroups.forEach(function (rgroup, rgid) {
        var keepGroup = keepAllRGroups;
        if (!keepGroup) {
          rgroup.frags.forEach(function (_fnum, fid) {
            rgroupsIds.push(fid);
            if (fidMask.has(fid)) keepGroup = true;
          });
          if (!keepGroup) return;
        }
        var rg = cp.rgroups.get(rgid);
        if (rg) {
          rgroup.frags.forEach(function (_fnum, fid) {
            rgroupsIds.push(fid);
            if (fidMask.has(fid)) rg.frags.add(fidMap.get(fid));
          });
        } else {
          cp.rgroups.set(rgid, rgroup.clone(fidMap));
        }
      });
      this.atoms.forEach(function (atom, aid) {
        if (atoms.has(aid) && rgroupsIds.indexOf(atom.fragment) === -1) {
          aids.set(aid, cp.atoms.add(atom.clone(fidMap)));
        }
      });
      this.atoms.forEach(function (atom, aid) {
        if (atoms.has(aid) && rgroupsIds.indexOf(atom.fragment) !== -1) {
          aids.set(aid, cp.atoms.add(atom.clone(fidMap)));
        }
      });
      fidMap.forEach(function (newfid, oldfid) {
        var fragment = _this2.frags.get(oldfid);
        if (fragment && fragment instanceof Fragment) {
          cp.frags.set(newfid, _this2.frags.get(oldfid).clone(aids));
        }
      });
      this.bonds.forEach(function (bond, bid) {
        if (bonds.has(bid)) bidMap.set(bid, cp.bonds.add(bond.clone(aids)));
      });
      var sgroupIdMap = {};
      this.sgroups.forEach(function (sg, sgroupId) {
        if (sg.atoms.some(function (aid) {
          return !atoms.has(aid);
        })) return;
        var oldSgroup = sg;
        sg = oldSgroup instanceof MonomerMicromolecule ? MonomerMicromolecule.clone(oldSgroup, aids, needCloneAttachmentPoints) : SGroup.clone(sg, aids);
        var id = cp.sgroups.add(sg);
        sg.id = id;
        sgroupIdMap[sgroupId] = id;
        sg.atoms.forEach(function (aid) {
          var atom = cp.atoms.get(aid);
          if (atom) {
            atom.sgs.add(id);
          }
        });
        if (sg.type === 'DAT') cp.sGroupForest.insert(sg, -1, []);else cp.sGroupForest.insert(sg);
      });
      this.functionalGroups.forEach(function (fg) {
        if (fg.relatedSGroup.atoms.some(function (aid) {
          return !atoms.has(aid);
        })) return;
        var sgroup = cp.sgroups.get(sgroupIdMap[fg.relatedSGroupId]);
        fg = sgroup ? new FunctionalGroup(sgroup) : FunctionalGroup.clone(fg);
        cp.functionalGroups.add(fg);
      });
      simpleObjects.forEach(function (soid) {
        cp.simpleObjects.add(_this2.simpleObjects.get(soid).clone());
      });
      texts.forEach(function (id) {
        cp.texts.add(_this2.texts.get(id).clone());
      });
      images.forEach(function (id) {
        cp.images.add(_this2.images.get(id).clone());
      });
      multitailArrows.forEach(function (id) {
        cp.addMultitailArrow(_this2.multitailArrows.get(id).clone());
      });
      rgroupAttachmentPoints.forEach(function (id) {
        var rgroupAttachmentPoint = _this2.rgroupAttachmentPoints.get(id);
        assert(rgroupAttachmentPoint != null);
        cp.rgroupAttachmentPoints.add(rgroupAttachmentPoint.clone(aids));
      });
      if (!dropRxnSymbols) {
        cp.isReaction = this.isReaction;
        this.rxnArrows.forEach(function (item) {
          cp.addRxnArrow(item.clone());
        });
        this.rxnPluses.forEach(function (item) {
          cp.rxnPluses.add(item.clone());
        });
      }
      cp.name = this.name;
      return cp;
    }
  }, {
    key: "prepareLoopStructure",
    value: function prepareLoopStructure() {
      this.initHalfBonds();
      this.initNeighbors();
      this.updateHalfBonds(Array.from(this.atoms.keys()));
      this.sortNeighbors(Array.from(this.atoms.keys()));
      this.findLoops();
    }
  }, {
    key: "atomAddToSGroup",
    value: function atomAddToSGroup(sgid, aid) {
      SGroup.addAtom(this.sgroups.get(sgid), aid, this);
      this.atoms.get(aid).sgs.add(sgid);
    }
  }, {
    key: "calcConn",
    value: function calcConn(atom) {
      var includeAtomsInCollapsedSgroups = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var conn = 0;
      var _iterator2 = _createForOfIteratorHelper(atom.neighbors),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var neighborId = _step2.value;
          var hb = this.halfBonds.get(neighborId);
          var bond = this.bonds.get(hb.bid);
          if (Bond.isBondToHiddenLeavingGroup(this, bond, includeAtomsInCollapsedSgroups)) {
            continue;
          }
          switch (bond.type) {
            case Bond.PATTERN.TYPE.SINGLE:
              conn += 1;
              break;
            case Bond.PATTERN.TYPE.DOUBLE:
              conn += 2;
              break;
            case Bond.PATTERN.TYPE.TRIPLE:
              conn += 3;
              break;
            case Bond.PATTERN.TYPE.DATIVE:
            case Bond.PATTERN.TYPE.HYDROGEN:
              break;
            case Bond.PATTERN.TYPE.AROMATIC:
              if (atom.neighbors.length === 1) return [-1, true];
              return [atom.neighbors.length, true];
            default:
              return [-1, false];
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return [conn, false];
    }
  }, {
    key: "findBondId",
    value: function findBondId(begin, end) {
      return this.bonds.find(function (_bid, bond) {
        return bond.begin === begin && bond.end === end || bond.begin === end && bond.end === begin;
      });
    }
  }, {
    key: "initNeighbors",
    value: function initNeighbors() {
      var _this3 = this;
      this.atoms.forEach(function (atom) {
        atom.neighbors = [];
      });
      this.bonds.forEach(function (bond) {
        var a1 = _this3.atoms.get(bond.begin);
        var a2 = _this3.atoms.get(bond.end);
        a1.neighbors.push(bond.hb1);
        a2.neighbors.push(bond.hb2);
      });
    }
  }, {
    key: "bondInitHalfBonds",
    value: function bondInitHalfBonds(bid, bond) {
      var _bond;
      bond = (_bond = bond) !== null && _bond !== void 0 ? _bond : this.bonds.get(bid);
      bond.hb1 = 2 * bid;
      bond.hb2 = 2 * bid + 1;
      this.halfBonds.set(bond.hb1, new HalfBond(bond.begin, bond.end, bid));
      this.halfBonds.set(bond.hb2, new HalfBond(bond.end, bond.begin, bid));
      var hb1 = this.halfBonds.get(bond.hb1);
      var hb2 = this.halfBonds.get(bond.hb2);
      hb1.contra = bond.hb2;
      hb2.contra = bond.hb1;
    }
  }, {
    key: "halfBondUpdate",
    value: function halfBondUpdate(halfBondId) {
      var halfBond = this.halfBonds.get(halfBondId);
      var sgroup1 = this.getGroupFromAtomId(halfBond.begin);
      var sgroup2 = this.getGroupFromAtomId(halfBond.end);
      var startCoords;
      var endCoords;
      if (sgroup1 instanceof MonomerMicromolecule && sgroup1 !== sgroup2) {
        startCoords = sgroup1.isContracted() ? sgroup1.pp : this.atoms.get(halfBond.begin).pp;
      } else if (sgroup1 && sgroup1 !== sgroup2 && sgroup1.isContracted()) {
        var _sgroup1$getContracte;
        startCoords = (_sgroup1$getContracte = sgroup1.getContractedPosition(this).position) !== null && _sgroup1$getContracte !== void 0 ? _sgroup1$getContracte : this.atoms.get(halfBond.begin).pp;
      } else {
        startCoords = this.atoms.get(halfBond.begin).pp;
      }
      if (sgroup2 instanceof MonomerMicromolecule && sgroup1 !== sgroup2) {
        endCoords = sgroup2.isContracted() ? sgroup2.pp : this.atoms.get(halfBond.end).pp;
      } else if (sgroup2 && sgroup2 !== sgroup1 && sgroup2.isContracted()) {
        var _sgroup2$getContracte;
        endCoords = (_sgroup2$getContracte = sgroup2.getContractedPosition(this).position) !== null && _sgroup2$getContracte !== void 0 ? _sgroup2$getContracte : this.atoms.get(halfBond.end).pp;
      } else {
        endCoords = this.atoms.get(halfBond.end).pp;
      }
      var coordsDifference = Vec2.diff(endCoords, startCoords).normalized();
      halfBond.dir = Vec2.dist(endCoords, startCoords) > 1e-4 ? coordsDifference : new Vec2(1, 0);
      halfBond.norm = halfBond.dir.turnLeft();
      halfBond.ang = halfBond.dir.oxAngle();
      if (halfBond.loop < 0) halfBond.loop = -1;
    }
  }, {
    key: "initHalfBonds",
    value: function initHalfBonds() {
      var _this4 = this;
      this.halfBonds.clear();
      this.bonds.forEach(function (bond, bid) {
        _this4.bondInitHalfBonds(bid, bond);
      });
    }
  }, {
    key: "setHbNext",
    value: function setHbNext(hbid, next) {
      this.halfBonds.get(this.halfBonds.get(hbid).contra).next = next;
    }
  }, {
    key: "halfBondSetAngle",
    value: function halfBondSetAngle(hbid, left) {
      var hb = this.halfBonds.get(hbid);
      var hbl = this.halfBonds.get(left);
      hbl.rightCos = Vec2.dot(hbl.dir, hb.dir);
      hb.leftCos = Vec2.dot(hbl.dir, hb.dir);
      hbl.rightSin = Vec2.cross(hbl.dir, hb.dir);
      hb.leftSin = Vec2.cross(hbl.dir, hb.dir);
      hb.leftNeighbor = left;
      hbl.rightNeighbor = hbid;
    }
  }, {
    key: "atomAddNeighbor",
    value: function atomAddNeighbor(hbid) {
      var hb = this.halfBonds.get(hbid);
      var atom = this.atoms.get(hb.begin);
      var i;
      for (i = 0; i < atom.neighbors.length; ++i) {
        if (this.halfBonds.get(atom.neighbors[i]).ang > hb.ang) break;
      }
      atom.neighbors.splice(i, 0, hbid);
      var ir = atom.neighbors[(i + 1) % atom.neighbors.length];
      var il = atom.neighbors[(i + atom.neighbors.length - 1) % atom.neighbors.length];
      this.setHbNext(il, hbid);
      this.setHbNext(hbid, ir);
      this.halfBondSetAngle(hbid, il);
      this.halfBondSetAngle(ir, hbid);
    }
  }, {
    key: "atomSortNeighbors",
    value: function atomSortNeighbors(aid) {
      var _this5 = this;
      var atom = this.atoms.get(aid);
      var halfBonds = this.halfBonds;
      atom.neighbors.sort(function (nei, nei2) {
        return halfBonds.get(nei).ang - halfBonds.get(nei2).ang;
      });
      atom.neighbors.forEach(function (nei, i) {
        var nextNei = atom.neighbors[(i + 1) % atom.neighbors.length];
        _this5.halfBonds.get(_this5.halfBonds.get(nei).contra).next = nextNei;
        _this5.halfBondSetAngle(nextNei, nei);
      });
    }
  }, {
    key: "sortNeighbors",
    value: function sortNeighbors(list) {
      var _this6 = this;
      if (!list) {
        this.atoms.forEach(function (_atom, aid) {
          _this6.atomSortNeighbors(aid);
        });
      } else {
        list.forEach(function (aid) {
          _this6.atomSortNeighbors(aid);
        });
      }
    }
  }, {
    key: "atomUpdateHalfBonds",
    value: function atomUpdateHalfBonds(atomId) {
      var _this7 = this;
      this.atoms.get(atomId).neighbors.forEach(function (hbid) {
        _this7.halfBondUpdate(hbid);
        _this7.halfBondUpdate(_this7.halfBonds.get(hbid).contra);
      });
    }
  }, {
    key: "updateHalfBonds",
    value: function updateHalfBonds(list) {
      var _this8 = this;
      if (!list) {
        this.atoms.forEach(function (_atom, atomId) {
          _this8.atomUpdateHalfBonds(atomId);
        });
      } else {
        list.forEach(function (atomId) {
          _this8.atomUpdateHalfBonds(atomId);
        });
      }
    }
  }, {
    key: "sGroupsRecalcCrossBonds",
    value: function sGroupsRecalcCrossBonds() {
      var _this9 = this;
      this.sgroups.forEach(function (sg) {
        sg.xBonds = [];
        sg.neiAtoms = [];
      });
      this.bonds.forEach(function (bond, bid) {
        var a1 = _this9.atoms.get(bond.begin);
        var a2 = _this9.atoms.get(bond.end);
        a1.sgs.forEach(function (sgid) {
          if (!a2.sgs.has(sgid)) {
            var sg = _this9.sgroups.get(sgid);
            sg.xBonds.push(bid);
            arrayAddIfMissing(sg.neiAtoms, bond.end);
          }
        });
        a2.sgs.forEach(function (sgid) {
          if (!a1.sgs.has(sgid)) {
            var sg = _this9.sgroups.get(sgid);
            sg.xBonds.push(bid);
            arrayAddIfMissing(sg.neiAtoms, bond.begin);
          }
        });
      });
    }
  }, {
    key: "sGroupDelete",
    value: function sGroupDelete(sgid) {
      var _this0 = this;
      this.sgroups.get(sgid).atoms.forEach(function (atom) {
        _this0.atoms.get(atom).sgs["delete"](sgid);
      });
      this.sGroupForest.remove(sgid);
      this.sgroups["delete"](sgid);
    }
  }, {
    key: "atomSetPos",
    value: function atomSetPos(id, pp) {
      var item = this.atoms.get(id);
      item.pp = pp;
    }
  }, {
    key: "rxnPlusSetPos",
    value: function rxnPlusSetPos(id, pp) {
      var item = this.rxnPluses.get(id);
      item.pp = pp;
    }
  }, {
    key: "rxnArrowSetPos",
    value: function rxnArrowSetPos(id, pos) {
      var item = this.rxnArrows.get(id);
      if (item) {
        item.pos = pos;
      }
    }
  }, {
    key: "simpleObjectSetPos",
    value: function simpleObjectSetPos(id, pos) {
      var item = this.simpleObjects.get(id);
      item.pos = pos;
    }
  }, {
    key: "textSetPosition",
    value: function textSetPosition(id, position) {
      var item = this.texts.get(id);
      if (item) {
        item.position = position;
      }
    }
  }, {
    key: "getCoordBoundingBox",
    value: function getCoordBoundingBox(atomSet) {
      var _bb;
      var bb = null;
      function extend(pp) {
        var points = Array.isArray(pp) ? pp : [pp];
        if (points.length === 0) {
          return;
        }
        if (!bb) {
          bb = {
            min: new Vec2(points[0]),
            max: new Vec2(points[0])
          };
        }
        var boundingBox = bb;
        points.forEach(function (vec) {
          boundingBox.min = Vec2.min(boundingBox.min, vec);
          boundingBox.max = Vec2.max(boundingBox.max, vec);
        });
      }
      var global = !atomSet || atomSet.size === 0;
      this.atoms.forEach(function (atom, aid) {
        if (global || atomSet.has(aid)) extend(atom.pp);
      });
      if (global) {
        this.rxnPluses.forEach(function (item) {
          extend(item.pp);
        });
        this.rxnArrows.forEach(function (item) {
          extend(item.pos);
        });
        this.simpleObjects.forEach(function (item) {
          extend(item.pos);
        });
        this.texts.forEach(function (item) {
          extend(item.position);
        });
      }
      return (_bb = bb) !== null && _bb !== void 0 ? _bb : {
        min: new Vec2(0, 0),
        max: new Vec2(1, 1)
      };
    }
  }, {
    key: "getCoordBoundingBoxObj",
    value: function getCoordBoundingBoxObj() {
      var _bb2;
      var bb = null;
      function extend(pp) {
        if (!bb) {
          bb = {
            min: new Vec2(pp),
            max: new Vec2(pp)
          };
        } else {
          bb.min = Vec2.min(bb.min, pp);
          bb.max = Vec2.max(bb.max, pp);
        }
      }
      this.atoms.forEach(function (atom) {
        extend(atom.pp);
      });
      return (_bb2 = bb) !== null && _bb2 !== void 0 ? _bb2 : {
        min: new Vec2(0, 0),
        max: new Vec2(1, 1)
      };
    }
  }, {
    key: "getBondLengthData",
    value: function getBondLengthData() {
      var _this1 = this;
      var totalLength = 0;
      var cnt = 0;
      this.bonds.forEach(function (bond) {
        totalLength += Vec2.dist(_this1.atoms.get(bond.begin).pp, _this1.atoms.get(bond.end).pp);
        cnt++;
      });
      return {
        cnt: cnt,
        totalLength: totalLength
      };
    }
  }, {
    key: "getAvgBondLength",
    value: function getAvgBondLength() {
      var bld = this.getBondLengthData();
      return bld.cnt > 0 ? bld.totalLength / bld.cnt : -1;
    }
  }, {
    key: "getAvgClosestAtomDistance",
    value: function getAvgClosestAtomDistance() {
      var totalDist = 0;
      var minDist;
      var dist = 0;
      var keys = Array.from(this.atoms.keys());
      var k;
      var j;
      for (k = 0; k < keys.length; ++k) {
        minDist = -1;
        for (j = 0; j < keys.length; ++j) {
          if (j === k) continue;
          dist = Vec2.dist(this.atoms.get(keys[j]).pp, this.atoms.get(keys[k]).pp);
          if (minDist < 0 || minDist > dist) minDist = dist;
        }
        totalDist += minDist;
      }
      return keys.length > 0 ? totalDist / keys.length : -1;
    }
  }, {
    key: "checkBondExists",
    value: function checkBondExists(begin, end) {
      var key = this.bonds.find(function (_bid, bond) {
        return bond.begin === begin && bond.end === end || bond.end === begin && bond.begin === end;
      });
      return key !== undefined;
    }
  }, {
    key: "findConnectedComponent",
    value: function findConnectedComponent(firstaid) {
      var _this10 = this;
      var list = [firstaid];
      var ids = new Pile();
      while (list.length > 0) {
        var aid = list.pop();
        var atom = this.atoms.get(aid);
        if (this.isAtomFromMacromolecule(aid)) {
          continue;
        }
        ids.add(aid);
        atom.neighbors.forEach(function (nei) {
          var neiId = _this10.halfBonds.get(nei).end;
          if (!ids.has(neiId)) list.push(neiId);
        });
      }
      return ids;
    }
  }, {
    key: "findConnectedComponents",
    value: function findConnectedComponents(discardExistingFragments) {
      var _this11 = this;
      if (!this.halfBonds.size) {
        this.initHalfBonds();
        this.initNeighbors();
        this.updateHalfBonds(Array.from(this.atoms.keys()));
        this.sortNeighbors(Array.from(this.atoms.keys()));
      }
      var addedAtoms = new Pile();
      var components = [];
      this.atoms.forEach(function (atom, aid) {
        if ((discardExistingFragments || atom.fragment < 0) && !addedAtoms.has(aid) && !_this11.isAtomFromMacromolecule(aid)) {
          var component = _this11.findConnectedComponent(aid);
          components.push(component);
          addedAtoms = addedAtoms.union(component);
        }
      });
      return components;
    }
  }, {
    key: "markFragment",
    value: function markFragment(idSet, properties) {
      var _this12 = this;
      var frag = new Fragment([], undefined, properties);
      var fid = this.frags.add(frag);
      idSet.forEach(function (aid) {
        var atom = _this12.atoms.get(aid);
        if (atom.stereoLabel) frag.updateStereoAtom(_this12, aid, fid, true);
        atom.fragment = fid;
      });
    }
  }, {
    key: "clearFragments",
    value: function clearFragments() {
      this.atoms.forEach(function (atom) {
        atom.fragment = -1;
      });
      this.frags.clear();
    }
  }, {
    key: "markFragments",
    value: function markFragments(properties) {
      var _this13 = this;
      var components = this.findConnectedComponents();
      components.forEach(function (comp) {
        var _comp = _slicedToArray(comp, 1),
          firstAtom = _comp[0];
        var sgroup = _this13.getGroupFromAtomId(firstAtom);
        if (sgroup instanceof MonomerMicromolecule) {
          return;
        }
        _this13.markFragment(comp, properties);
      });
    }
  }, {
    key: "scale",
    value: function scale(_scale) {
      if (_scale === 1) return;
      this.atoms.forEach(function (atom) {
        atom.pp = atom.pp.scaled(_scale);
      });
      this.rxnPluses.forEach(function (item) {
        item.pp = item.pp.scaled(_scale);
      });
      this.rxnArrows.forEach(function (item) {
        item.pos = item.pos.map(function (p) {
          return p.scaled(_scale);
        });
      });
      this.sgroups.forEach(function (item) {
        var _item$pp$scaled, _item$pp;
        if (item instanceof MonomerMicromolecule) {
          return;
        }
        item.pp = (_item$pp$scaled = (_item$pp = item.pp) === null || _item$pp === void 0 ? void 0 : _item$pp.scaled(_scale)) !== null && _item$pp$scaled !== void 0 ? _item$pp$scaled : null;
      });
      this.texts.forEach(function (item) {
        item.pos = item.pos.map(function (p) {
          return p.scaled(_scale);
        });
        item.position = item.position.scaled(_scale);
      });
      this.simpleObjects.forEach(function (simpleObjects) {
        simpleObjects.pos = simpleObjects.pos.map(function (p) {
          return p.scaled(_scale);
        });
      });
      this.images.forEach(function (image) {
        return image.rescaleSize(_scale);
      });
      this.multitailArrows.forEach(function (multitailArrow) {
        return multitailArrow.rescaleSize(_scale);
      });
      this.frags.forEach(function (fragment) {
        if (fragment !== null && fragment !== void 0 && fragment.enhancedStereoFlag && fragment !== null && fragment !== void 0 && fragment.stereoFlagPosition) {
          var _fragment$stereoFlagP;
          fragment.stereoFlagPosition = (_fragment$stereoFlagP = fragment.stereoFlagPosition) === null || _fragment$stereoFlagP === void 0 ? void 0 : _fragment$stereoFlagP.scaled(_scale);
        }
      });
    }
  }, {
    key: "scaleMonomerMicromoleculeSgroups",
    value: function scaleMonomerMicromoleculeSgroups(scale) {
      if (scale === 1) return;
      this.sgroups.forEach(function (item) {
        var _item$pp$scaled2, _item$pp2;
        if (!(item instanceof MonomerMicromolecule)) {
          return;
        }
        item.pp = (_item$pp$scaled2 = (_item$pp2 = item.pp) === null || _item$pp2 === void 0 ? void 0 : _item$pp2.scaled(scale)) !== null && _item$pp$scaled2 !== void 0 ? _item$pp$scaled2 : null;
      });
    }
  }, {
    key: "rescale",
    value: function rescale() {
      var avg = this.getAvgBondLength();
      if (avg <= 0) {
        return;
      }
      if (avg < 1e-3) avg = 1;
      var scale = 1 / avg;
      this.scale(scale);
    }
  }, {
    key: "loopHasSelfIntersections",
    value: function loopHasSelfIntersections(hbs) {
      var _iterator3 = _createForOfIteratorHelper(hbs.entries()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
            i = _step3$value[0],
            halfBondId = _step3$value[1];
          var hbi = this.halfBonds.get(halfBondId);
          var ai = this.atoms.get(hbi.begin).pp;
          var bi = this.atoms.get(hbi.end).pp;
          var set = new Pile([hbi.begin, hbi.end]);
          var _iterator4 = _createForOfIteratorHelper(hbs.slice(i + 2)),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var hbjId = _step4.value;
              var hbj = this.halfBonds.get(hbjId);
              if (set.has(hbj.begin) || set.has(hbj.end)) continue;
              var aj = this.atoms.get(hbj.begin).pp;
              var bj = this.atoms.get(hbj.end).pp;
              if (Box2Abs.segmentIntersection(ai, bi, aj, bj)) return true;
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return false;
    }
  }, {
    key: "partitionLoop",
    value: function partitionLoop(loop) {
      var subloops = [];
      var continueFlag = true;
      while (continueFlag) {
        var atomToHalfBond = {};
        continueFlag = false;
        var _iterator5 = _createForOfIteratorHelper(loop.entries()),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var _step5$value = _slicedToArray(_step5.value, 2),
              index = _step5$value[0],
              hbid = _step5$value[1];
            var aid1 = this.halfBonds.get(hbid).begin;
            var aid2 = this.halfBonds.get(hbid).end;
            if (aid2 in atomToHalfBond) {
              var s = atomToHalfBond[aid2];
              var subloop = loop.slice(s, index + 1);
              subloops.push(subloop);
              if (index < loop.length) {
                loop.splice(s, index - s + 1);
              }
              continueFlag = true;
              break;
            }
            atomToHalfBond[aid1] = index;
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
        if (!continueFlag) subloops.push(loop);
      }
      return subloops;
    }
  }, {
    key: "halfBondAngle",
    value: function halfBondAngle(hbid1, hbid2) {
      var hba = this.halfBonds.get(hbid1);
      var hbb = this.halfBonds.get(hbid2);
      return Math.atan2(Vec2.cross(hba.dir, hbb.dir), Vec2.dot(hba.dir, hbb.dir));
    }
  }, {
    key: "loopIsConvex",
    value: function loopIsConvex(loop) {
      var _this14 = this;
      return loop.every(function (item, k, loopArr) {
        var angle = _this14.halfBondAngle(item, loopArr[(k + 1) % loopArr.length]);
        return angle <= 0;
      });
    }
  }, {
    key: "loopIsInner",
    value: function loopIsInner(loop) {
      var _this15 = this;
      var totalAngle = 2 * Math.PI;
      loop.forEach(function (hbida, k, loopArr) {
        var hbidb = loopArr[(k + 1) % loopArr.length];
        var hbb = _this15.halfBonds.get(hbidb);
        var angle = _this15.halfBondAngle(hbida, hbidb);
        totalAngle += hbb.contra === hbida ? Math.PI : angle;
      });
      return Math.abs(totalAngle) < Math.PI;
    }
  }, {
    key: "findLoops",
    value: function findLoops() {
      var _this16 = this;
      var newLoops = [];
      var bondsToMark = new Pile();
      var hbIdNext;
      var c;
      var loop;
      this.halfBonds.forEach(function (hb, hbId) {
        if (hb.loop !== -1) return;
        for (hbIdNext = hbId, c = 0, loop = []; c <= _this16.halfBonds.size; hbIdNext = _this16.halfBonds.get(hbIdNext).next, ++c) {
          if (!(c > 0 && hbIdNext === hbId)) {
            loop.push(hbIdNext);
            continue;
          }
          var subloops = _this16.partitionLoop(loop);
          subloops.forEach(function (loop) {
            var loopId;
            if (_this16.loopIsInner(loop) && !_this16.loopHasSelfIntersections(loop)) {
              loopId = Math.min.apply(Math, _toConsumableArray(loop));
              _this16.loops.set(loopId, new Loop(loop, _this16, _this16.loopIsConvex(loop)));
            } else {
              loopId = -2;
            }
            loop.forEach(function (hbid) {
              _this16.halfBonds.get(hbid).loop = loopId;
              bondsToMark.add(_this16.halfBonds.get(hbid).bid);
            });
            if (loopId >= 0) newLoops.push(loopId);
          });
          break;
        }
      });
      return {
        newLoops: newLoops,
        bondsToMark: Array.from(bondsToMark)
      };
    }
  }, {
    key: "calcImplicitHydrogen",
    value: function calcImplicitHydrogen(aid) {
      var _atom$charge;
      var includeAtomsInCollapsedSgroups = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (Atom.isHiddenLeavingGroupAtom(this, aid)) {
        return;
      }
      var atom = this.atoms.get(aid);
      var charge = (_atom$charge = atom.charge) !== null && _atom$charge !== void 0 ? _atom$charge : 0;
      var _this$calcConn = this.calcConn(atom, includeAtomsInCollapsedSgroups),
        _this$calcConn2 = _slicedToArray(_this$calcConn, 2),
        conn = _this$calcConn2[0],
        isAromatic = _this$calcConn2[1];
      var correctConn = conn;
      atom.badConn = false;
      if (isAromatic) {
        if (atom.label === 'C' && charge === 0) {
          if (conn === 3) {
            atom.implicitH = -radicalElectrons(atom.radical);
            return;
          }
          if (conn === 2) {
            atom.implicitH = 1 - radicalElectrons(atom.radical);
            return;
          }
        } else if (atom.label === 'O' && charge === 0 || atom.label === 'N' && charge === 0 && conn === 3 || atom.label === 'N' && charge === 1 && conn === 3 || atom.label === 'S' && charge === 0 && conn === 3 || !atom.implicitH) {
          atom.implicitH = 0;
          return;
        } else if (!atom.hasImplicitH) {
          correctConn++;
        }
      }
      if (correctConn < 0 || atom.isQuery() || atom.attachmentPoints) {
        atom.implicitH = 0;
        return;
      }
      if (atom.explicitValence >= 0) {
        var elem = Elements.get(atom.label);
        atom.implicitH = elem ? atom.explicitValence - atom.calcValenceMinusHyd(correctConn) : 0;
        if (atom.implicitH < 0) {
          atom.implicitH = 0;
          atom.badConn = true;
        }
      } else {
        atom.calcValence(correctConn);
      }
    }
  }, {
    key: "setImplicitHydrogen",
    value: function setImplicitHydrogen(list) {
      var _this17 = this;
      var includeAtomsInCollapsedSgroups = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.sgroups.forEach(function (item) {
        if (item.data.fieldName === 'MRV_IMPLICIT_H') {
          _this17.atoms.get(item.atoms[0]).hasImplicitH = true;
        }
      });
      if (!list) {
        this.atoms.forEach(function (_atom, aid) {
          _this17.calcImplicitHydrogen(aid, includeAtomsInCollapsedSgroups);
        });
      } else {
        list.forEach(function (aid) {
          if (_this17.atoms.get(aid)) {
            _this17.calcImplicitHydrogen(aid, includeAtomsInCollapsedSgroups);
          }
        });
      }
    }
  }, {
    key: "setStereoLabelsToAtoms",
    value: function setStereoLabelsToAtoms() {
      var _this18 = this;
      var stereAtomsMap = getStereoAtomsMap(this, Array.from(this.bonds.values()));
      this.atoms.forEach(function (atom, id) {
        var _this18$atomGetNeighb;
        if ((_this18 === null || _this18 === void 0 || (_this18$atomGetNeighb = _this18.atomGetNeighbors(id)) === null || _this18$atomGetNeighb === void 0 ? void 0 : _this18$atomGetNeighb.length) === 0) {
          atom.stereoLabel = null;
          atom.stereoParity = 0;
        } else {
          var stereoProp = stereAtomsMap.get(id);
          if (stereoProp) {
            atom.stereoLabel = stereoProp.stereoLabel;
            atom.stereoParity = stereoProp.stereoParity;
          }
        }
      });
    }
  }, {
    key: "atomGetNeighbors",
    value: function atomGetNeighbors(aid) {
      var _this$atoms$get,
        _this19 = this;
      return (_this$atoms$get = this.atoms.get(aid)) === null || _this$atoms$get === void 0 ? void 0 : _this$atoms$get.neighbors.map(function (nei) {
        var hb = _this19.halfBonds.get(nei);
        return {
          aid: hb.end,
          bid: hb.bid
        };
      });
    }
  }, {
    key: "getComponents",
    value: function getComponents() {
      var _this20 = this;
      var connectedComponents = this.findConnectedComponents(true);
      var barriers = [];
      var arrowPos = null;
      this.rxnArrows.forEach(function (item) {
        arrowPos = item.center().x;
      });
      this.rxnPluses.forEach(function (item) {
        barriers.push(item.pp.x);
      });
      if (arrowPos !== null) barriers.push(arrowPos);
      barriers.sort(function (a, b) {
        return a - b;
      });
      var components = [];
      connectedComponents.forEach(function (component) {
        var _components$j;
        var bb = _this20.getCoordBoundingBox(component);
        var c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
        var j = 0;
        while (c.x > barriers[j]) ++j;
        var existingComponent = (_components$j = components[j]) !== null && _components$j !== void 0 ? _components$j : new Pile();
        components[j] = existingComponent.union(component);
      });
      var reactants = [];
      var products = [];
      components.forEach(function (component) {
        var _arrowPos;
        if (!component) {
          return;
        }
        var rxnFragmentType = _this20.defineRxnFragmentTypeForAtomset(component, (_arrowPos = arrowPos) !== null && _arrowPos !== void 0 ? _arrowPos : 0);
        if (rxnFragmentType === 1) reactants.push(component);else products.push(component);
      });
      return {
        reactants: reactants,
        products: products
      };
    }
  }, {
    key: "defineRxnFragmentTypeForAtomset",
    value: function defineRxnFragmentTypeForAtomset(atomset, arrowpos) {
      var bb = this.getCoordBoundingBox(atomset);
      var c = Vec2.lc2(bb.min, 0.5, bb.max, 0.5);
      return c.x < arrowpos ? 1 : 2;
    }
  }, {
    key: "getBondFragment",
    value: function getBondFragment(bid) {
      var _this$bonds$get, _this$atoms$get2;
      var aid = (_this$bonds$get = this.bonds.get(bid)) === null || _this$bonds$get === void 0 ? void 0 : _this$bonds$get.begin;
      return aid && ((_this$atoms$get2 = this.atoms.get(aid)) === null || _this$atoms$get2 === void 0 ? void 0 : _this$atoms$get2.fragment);
    }
  }, {
    key: "bindSGroupsToFunctionalGroups",
    value: function bindSGroupsToFunctionalGroups() {
      var _this21 = this;
      this.sgroups.forEach(function (sgroup) {
        if (FunctionalGroup.isFunctionalGroup(sgroup) || SGroup.isSuperAtom(sgroup)) {
          _this21.functionalGroups.add(new FunctionalGroup(sgroup));
        }
      });
    }
  }, {
    key: "getGroupIdFromAtomId",
    value: function getGroupIdFromAtomId(atomId) {
      var _this$atoms$get$sgs$v, _this$atoms$get3;
      var firstSgroupId = _toConsumableArray((_this$atoms$get$sgs$v = (_this$atoms$get3 = this.atoms.get(atomId)) === null || _this$atoms$get3 === void 0 ? void 0 : _this$atoms$get3.sgs.values()) !== null && _this$atoms$get$sgs$v !== void 0 ? _this$atoms$get$sgs$v : [])[0];
      return isNumber(firstSgroupId) ? firstSgroupId : null;
    }
  }, {
    key: "getGroupIdFromAtomIdBySgroups",
    value: function getGroupIdFromAtomIdBySgroups(atomId) {
      for (var _i = 0, _Array$from = Array.from(this.sgroups); _i < _Array$from.length; _i++) {
        var _Array$from$_i = _slicedToArray(_Array$from[_i], 2),
          groupId = _Array$from$_i[0],
          sgroup = _Array$from$_i[1];
        if (sgroup.atoms.includes(atomId)) return groupId;
      }
      return null;
    }
  }, {
    key: "getGroupFromAtomId",
    value: function getGroupFromAtomId(atomId) {
      var _this$sgroups;
      if (!isNumber(atomId)) {
        return undefined;
      }
      var sgroupId = this.getGroupIdFromAtomId(atomId);
      return isNumber(sgroupId) ? (_this$sgroups = this.sgroups) === null || _this$sgroups === void 0 ? void 0 : _this$sgroups.get(sgroupId) : undefined;
    }
  }, {
    key: "getGroupFromAtomIdBySgroups",
    value: function getGroupFromAtomIdBySgroups(atomId) {
      var _this$sgroups2;
      if (!isNumber(atomId)) {
        return undefined;
      }
      var sgroupId = this.getGroupIdFromAtomIdBySgroups(atomId);
      return (_this$sgroups2 = this.sgroups) === null || _this$sgroups2 === void 0 ? void 0 : _this$sgroups2.get(sgroupId);
    }
  }, {
    key: "getGroupIdFromBondId",
    value: function getGroupIdFromBondId(bondId) {
      var bond = this.bonds.get(bondId);
      if (!bond) return null;
      for (var _i2 = 0, _Array$from2 = Array.from(this.sgroups); _i2 < _Array$from2.length; _i2++) {
        var _Array$from2$_i = _slicedToArray(_Array$from2[_i2], 2),
          groupId = _Array$from2$_i[0],
          sgroup = _Array$from2$_i[1];
        if (sgroup.atoms.includes(bond.begin) || sgroup.atoms.includes(bond.end)) {
          return groupId;
        }
      }
      return null;
    }
  }, {
    key: "getGroupFromBondId",
    value: function getGroupFromBondId(atomId) {
      var _this$sgroups3;
      var sgroupId = this.getGroupIdFromBondId(atomId);
      if (!isNumber(sgroupId)) {
        return;
      }
      return (_this$sgroups3 = this.sgroups) === null || _this$sgroups3 === void 0 ? void 0 : _this$sgroups3.get(sgroupId);
    }
  }, {
    key: "getGroupsIdsFromBondId",
    value: function getGroupsIdsFromBondId(bondId) {
      var bond = this.bonds.get(bondId);
      if (!bond) return [];
      var groupsIds = [];
      for (var _i3 = 0, _Array$from3 = Array.from(this.sgroups); _i3 < _Array$from3.length; _i3++) {
        var _Array$from3$_i = _slicedToArray(_Array$from3[_i3], 2),
          groupId = _Array$from3$_i[0],
          sgroup = _Array$from3$_i[1];
        if (sgroup.atoms.includes(bond.begin) || sgroup.atoms.includes(bond.end)) {
          groupsIds.push(groupId);
        }
      }
      return groupsIds;
    }
  }, {
    key: "getBondIdByHalfBond",
    value: function getBondIdByHalfBond(halfBondId) {
      var halfBond = this.halfBonds.get(halfBondId);
      if (halfBond) {
        return halfBond.bid;
      }
      return undefined;
    }
  }, {
    key: "getSelectedVisibleAtoms",
    value: function getSelectedVisibleAtoms(selection) {
      var _selection$atoms,
        _this22 = this;
      return (selection === null || selection === void 0 || (_selection$atoms = selection.atoms) === null || _selection$atoms === void 0 ? void 0 : _selection$atoms.filter(function (atomId) {
        var atom = _this22.atoms.get(atomId);
        if (!atom) {
          return false;
        }
        var isAtomNotInContractedGroup = !FunctionalGroup.isAtomInContractedFunctionalGroup(atom, _this22.sgroups, _this22.functionalGroups);
        if (isAtomNotInContractedGroup) {
          return true;
        }
        var groupId = _this22.getGroupIdFromAtomId(atomId);
        var sgroup = _this22.sgroups.get(groupId);
        return (sgroup === null || sgroup === void 0 ? void 0 : sgroup.getAttachmentAtomId()) === atomId;
      })) || [];
    }
  }, {
    key: "getRGroupAttachmentPointsByAtomId",
    value: function getRGroupAttachmentPointsByAtomId(atomId) {
      var rgroupAttachmentPoints = this.rgroupAttachmentPoints.filter(function (_id, attachmentPoint) {
        return attachmentPoint.atomId === atomId;
      });
      return _toConsumableArray(rgroupAttachmentPoints.keys());
    }
  }, {
    key: "isAtomFromMacromolecule",
    value: function isAtomFromMacromolecule(atomId) {
      var sgroup = this.getGroupFromAtomId(atomId);
      return sgroup instanceof MonomerMicromolecule;
    }
  }, {
    key: "isBondFromMacromolecule",
    value: function isBondFromMacromolecule(bondOrBondId) {
      var bond = bondOrBondId instanceof Bond ? bondOrBondId : this.bonds.get(bondOrBondId);
      assert(bond);
      return this.isAtomFromMacromolecule(bond.begin) || this.isAtomFromMacromolecule(bond.end);
    }
  }, {
    key: "isFunctionalGroupFromMacromolecule",
    value: function isFunctionalGroupFromMacromolecule(functionalGroupId) {
      var functionalGroup = this.functionalGroups.get(functionalGroupId);
      return (functionalGroup === null || functionalGroup === void 0 ? void 0 : functionalGroup.relatedSGroup) instanceof MonomerMicromolecule;
    }
  }, {
    key: "isTargetFromMacromolecule",
    value: function isTargetFromMacromolecule(target) {
      return target && (target.map === 'functionalGroups' && this.isFunctionalGroupFromMacromolecule(target.id) || target.map === 'atoms' && this.isAtomFromMacromolecule(target.id) || target.map === 'bonds' && this.isBondFromMacromolecule(target.id));
    }
  }, {
    key: "disableInitiallySelected",
    value: function disableInitiallySelected() {
      this.atoms.changeInitiallySelectedPropertiesForPool(true);
      this.bonds.changeInitiallySelectedPropertiesForPool(true);
      this.rxnPluses.changeInitiallySelectedPropertiesForPool(true);
      this.rxnArrows.changeInitiallySelectedPropertiesForPool(true);
      this.texts.changeInitiallySelectedPropertiesForPool(true);
    }
  }, {
    key: "enableInitiallySelected",
    value: function enableInitiallySelected() {
      this.atoms.changeInitiallySelectedPropertiesForPool();
      this.bonds.changeInitiallySelectedPropertiesForPool();
      this.rxnPluses.changeInitiallySelectedPropertiesForPool();
      this.rxnArrows.changeInitiallySelectedPropertiesForPool();
      this.texts.changeInitiallySelectedPropertiesForPool();
    }
  }, {
    key: "applyMonomersTransformations",
    value: function applyMonomersTransformations() {
      var _this23 = this;
      var scaleFactor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      this.scaleMonomerMicromoleculeSgroups(scaleFactor);
      var atomToBonds = new Map();
      this.bonds.forEach(function (bond, bondId) {
        for (var _i4 = 0, _arr = [bond.begin, bond.end]; _i4 < _arr.length; _i4++) {
          var _atomToBonds$get;
          var atomId = _arr[_i4];
          var list = (_atomToBonds$get = atomToBonds.get(atomId)) !== null && _atomToBonds$get !== void 0 ? _atomToBonds$get : [];
          list.push(bondId);
          atomToBonds.set(atomId, list);
        }
      });
      this.sgroups.forEach(function (sGroup) {
        var _sGroup$monomer$monom, _sGroup$monomer$monom2;
        if (!(sGroup instanceof MonomerMicromolecule)) {
          return;
        }
        var center = sGroup.pp;
        if (!center) {
          return;
        }
        var rotateValue = (_sGroup$monomer$monom = sGroup.monomer.monomerItem.transformation) === null || _sGroup$monomer$monom === void 0 ? void 0 : _sGroup$monomer$monom.rotate;
        if (rotateValue) {
          sGroup.atoms.forEach(function (atomId) {
            var atom = _this23.atoms.get(atomId);
            if (!atom) {
              return;
            }
            atom.pp = atom.pp.add(rotateDelta(atom.pp, center, rotateValue));
          });
        }
        var flipValue = (_sGroup$monomer$monom2 = sGroup.monomer.monomerItem.transformation) === null || _sGroup$monomer$monom2 === void 0 ? void 0 : _sGroup$monomer$monom2.flip;
        if (flipValue) {
          sGroup.atoms.forEach(function (atomId) {
            var atom = _this23.atoms.get(atomId);
            if (!atom) {
              return;
            }
            atom.pp = atom.pp.add(flipPointByCenter(atom.pp, center, flipValue));
          });
          var sGroupBonds = new Set(sGroup.atoms.flatMap(function (atomId) {
            var _atomToBonds$get2;
            return (_atomToBonds$get2 = atomToBonds.get(atomId)) !== null && _atomToBonds$get2 !== void 0 ? _atomToBonds$get2 : [];
          }));
          sGroupBonds.forEach(function (bondId) {
            var bond = _this23.bonds.get(bondId);
            if (!bond || bond.type !== Bond.PATTERN.TYPE.SINGLE) {
              return;
            }
            if (bond.stereo === Bond.PATTERN.STEREO.UP || bond.stereo === Bond.PATTERN.STEREO.DOWN) {
              bond.stereo = bond.stereo === Bond.PATTERN.STEREO.UP ? Bond.PATTERN.STEREO.DOWN : Bond.PATTERN.STEREO.UP;
            }
          });
        }
      });
    }
  }, {
    key: "applyStereoBondsToExpandedMonomers",
    value: function applyStereoBondsToExpandedMonomers() {
      var _this24 = this;
      var expandedMonomers = [];
      this.sgroups.forEach(function (sgroup) {
        if (sgroup instanceof MonomerMicromolecule && sgroup.isExpanded()) {
          expandedMonomers.push(sgroup);
        }
      });
      if (expandedMonomers.length < 2) {
        return;
      }
      var _loop = function _loop() {
        var firstMonomer = expandedMonomers[i];
        var firstMonomerAtoms = new Set(SGroup.getAtoms(_this24, firstMonomer));
        var firstMonomerAttachmentPoints = firstMonomer.getAttachmentPoints();
        var _loop2 = function _loop2() {
          var secondMonomer = expandedMonomers[j];
          var secondMonomerAtoms = new Set(SGroup.getAtoms(_this24, secondMonomer));
          var secondMonomerAttachmentPoints = secondMonomer.getAttachmentPoints();
          _this24.bonds.forEach(function (bond, bondId) {
            var firstMonomerHasBondBegin = firstMonomerAtoms.has(bond.begin);
            var firstMonomerHasBondEnd = firstMonomerAtoms.has(bond.end);
            var secondMonomerHasBondBegin = secondMonomerAtoms.has(bond.begin);
            var secondMonomerHasBondEnd = secondMonomerAtoms.has(bond.end);
            var isBondConnectinBothMonomers = firstMonomerHasBondBegin && secondMonomerHasBondEnd || firstMonomerHasBondEnd && secondMonomerHasBondBegin;
            if (!isBondConnectinBothMonomers) {
              return;
            }
            var firstMonomerAtom = firstMonomerHasBondBegin ? bond.begin : bond.end;
            var secondMonomerAtom = secondMonomerHasBondBegin ? bond.begin : bond.end;
            var firstMonomerAttachmentPointInConnection = firstMonomerAttachmentPoints.find(function (attachmentPoint) {
              return attachmentPoint.atomId === firstMonomerAtom;
            });
            var secondMonomerAttachmentPointInConnection = secondMonomerAttachmentPoints.find(function (attachmentPoint) {
              return attachmentPoint.atomId === secondMonomerAtom;
            });
            if (!firstMonomerAttachmentPointInConnection || !secondMonomerAttachmentPointInConnection) {
              return;
            }
            var firstMonomerAttachmentPointBondStereo = getAttachmentPointStereoBond(firstMonomer, firstMonomerAttachmentPointInConnection);
            var secondMonomerAttachmentPointBondStereo = getAttachmentPointStereoBond(secondMonomer, secondMonomerAttachmentPointInConnection);
            var firstMonomerHasStereoBondOnAttachmentPoint = firstMonomerAttachmentPointBondStereo !== null && firstMonomerAttachmentPointBondStereo !== Bond.PATTERN.STEREO.NONE;
            var secondMonomerHasStereoBondOnAttachmentPoint = secondMonomerAttachmentPointBondStereo !== null && secondMonomerAttachmentPointBondStereo !== Bond.PATTERN.STEREO.NONE;
            if (firstMonomerHasStereoBondOnAttachmentPoint && !secondMonomerHasStereoBondOnAttachmentPoint) {
              if (bond.begin !== firstMonomerAtom) {
                _this24.flipBondAndSetStereo(bondId, bond, firstMonomerAttachmentPointBondStereo);
              } else {
                bond.stereo = firstMonomerAttachmentPointBondStereo;
              }
            } else if (!firstMonomerHasStereoBondOnAttachmentPoint && secondMonomerHasStereoBondOnAttachmentPoint) {
              if (bond.begin !== secondMonomerAtom) {
                _this24.flipBondAndSetStereo(bondId, bond, secondMonomerAttachmentPointBondStereo);
              } else {
                bond.stereo = secondMonomerAttachmentPointBondStereo;
              }
            } else if (firstMonomerHasStereoBondOnAttachmentPoint && secondMonomerHasStereoBondOnAttachmentPoint) {
              bond.stereo = Bond.PATTERN.STEREO.NONE;
            }
          });
        };
        for (var j = i + 1; j < expandedMonomers.length; j++) {
          _loop2();
        }
      };
      for (var i = 0; i < expandedMonomers.length; i++) {
        _loop();
      }
    }
  }, {
    key: "flipBondAndSetStereo",
    value: function flipBondAndSetStereo(bondId, bond, stereo) {
      this.bonds["delete"](bondId);
      var newBond = new Bond(_objectSpread(_objectSpread({}, bond), {}, {
        begin: bond.end,
        end: bond.begin,
        stereo: stereo,
        beginSuperatomAttachmentPointNumber: bond.endSuperatomAttachmentPointNumber,
        endSuperatomAttachmentPointNumber: bond.beginSuperatomAttachmentPointNumber
      }));
      this.bonds.set(bondId, newBond);
      this.bondInitHalfBonds(bondId);
      var newBondObj = this.bonds.get(bondId);
      if (newBondObj !== null && newBondObj !== void 0 && newBondObj.hb1 && newBondObj !== null && newBondObj !== void 0 && newBondObj.hb2) {
        this.halfBondUpdate(newBondObj.hb1);
        this.halfBondUpdate(newBondObj.hb2);
        this.atomAddNeighbor(newBondObj.hb1);
        this.atomAddNeighbor(newBondObj.hb2);
      }
    }
  }]);
  return Struct;
}();

export { Struct };
//# sourceMappingURL=struct.modern.js.map
