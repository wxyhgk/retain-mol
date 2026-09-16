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
import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Box2Abs } from './box2Abs.modern.js';
import { Pile } from './pile.modern.js';
import '../helpers/functionalGroupsProvider.modern.js';
import { SaltsAndSolventsProvider } from '../helpers/saltsAndSolventsProvider.modern.js';
import '../constants/generics.modern.js';
import '../helpers/attachmentPointCalculations.modern.js';
import { Vec2 } from './vec2.modern.js';
import { SgContexts } from '../../application/editor/shared/constants.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { isNumber } from 'lodash';
import { getAtomPositions, geometricCenter } from './geometry.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var SUPERATOM_CLASS;
(function (SUPERATOM_CLASS) {
  SUPERATOM_CLASS["SUGAR"] = "SUGAR";
  SUPERATOM_CLASS["BASE"] = "BASE";
  SUPERATOM_CLASS["PHOSPHATE"] = "PHOSPHATE";
})(SUPERATOM_CLASS || (SUPERATOM_CLASS = {}));
var SGroupBracketParams = _createClass(function SGroupBracketParams(c, d, w, h) {
  _classCallCheck(this, SGroupBracketParams);
  _defineProperty(this, "c", void 0);
  _defineProperty(this, "d", void 0);
  _defineProperty(this, "n", void 0);
  _defineProperty(this, "w", void 0);
  _defineProperty(this, "h", void 0);
  this.c = c;
  this.d = d;
  this.n = d.rotateSC(1, 0);
  this.w = w;
  this.h = h;
});
var SGroup = function () {
  function SGroup(type) {
    _classCallCheck(this, SGroup);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "label", void 0);
    _defineProperty(this, "bracketBox", void 0);
    _defineProperty(this, "bracketDirection", void 0);
    _defineProperty(this, "areas", void 0);
    _defineProperty(this, "hover", void 0);
    _defineProperty(this, "hovering", void 0);
    _defineProperty(this, "selected", void 0);
    _defineProperty(this, "selectionPlate", void 0);
    _defineProperty(this, "atoms", void 0);
    _defineProperty(this, "atomSet", void 0);
    _defineProperty(this, "parentAtomSet", void 0);
    _defineProperty(this, "patoms", void 0);
    _defineProperty(this, "allAtoms", void 0);
    _defineProperty(this, "bonds", void 0);
    _defineProperty(this, "xBonds", void 0);
    _defineProperty(this, "neiAtoms", void 0);
    _defineProperty(this, "pp", void 0);
    _defineProperty(this, "data", void 0);
    _defineProperty(this, "dataArea", void 0);
    _defineProperty(this, "functionalGroup", void 0);
    _defineProperty(this, "attachmentPoints", void 0);
    this.type = type;
    this.id = -1;
    this.label = -1;
    this.bracketBox = null;
    this.bracketDirection = new Vec2(1, 0);
    this.areas = [];
    this.hover = false;
    this.hovering = null;
    this.selected = false;
    this.selectionPlate = null;
    this.atoms = [];
    this.atomSet = new Pile();
    this.parentAtomSet = new Pile();
    this.patoms = [];
    this.allAtoms = false;
    this.bonds = [];
    this.xBonds = [];
    this.neiAtoms = [];
    this.attachmentPoints = [];
    this.pp = null;
    this.dataArea = null;
    this.data = {
      mul: 1,
      connectivity: 'ht',
      name: '',
      nucleotideComponent: '',
      subscript: '',
      expanded: false,
      attached: false,
      absolute: true,
      showUnits: false,
      nCharsToDisplay: -1,
      nCharnCharsToDisplay: -1,
      tagChar: '',
      daspPos: 1,
      fieldType: 'F',
      fieldName: '',
      fieldValue: '',
      units: '',
      query: '',
      queryOp: ''
    };
  }
  _createClass(SGroup, [{
    key: "getAttr",
    value: function getAttr(attr) {
      return this.data[attr];
    }
  }, {
    key: "setFunctionalGroup",
    value: function setFunctionalGroup(functionalGroup) {
      this.functionalGroup = functionalGroup;
    }
  }, {
    key: "getAttrs",
    value: function getAttrs() {
      var _this = this;
      var attrs = {};
      Object.keys(this.data).forEach(function (attr) {
        attrs[attr] = _this.data[attr];
      });
      return attrs;
    }
  }, {
    key: "setAttr",
    value: function setAttr(attr, value) {
      var oldValue = this.data[attr];
      this.data[attr] = value;
      return oldValue;
    }
  }, {
    key: "checkAttr",
    value: function checkAttr(attr, value) {
      return this.data[attr] === value;
    }
  }, {
    key: "updateOffset",
    value: function updateOffset(offset) {
      assert(this.bracketBox, 'SGroup.updateOffset: bracketBox is required');
      this.pp = Vec2.sum(this.bracketBox.p1, offset);
    }
  }, {
    key: "isExpanded",
    value: function isExpanded() {
      if (SGroup.isSuperAtom(this)) {
        return Boolean(this.data.expanded);
      } else {
        return true;
      }
    }
  }, {
    key: "isContracted",
    value: function isContracted() {
      return !this.isExpanded();
    }
  }, {
    key: "calculatePP",
    value: function calculatePP(struct) {
      var topLeftPoint;
      var isAtomContext = this.data.context === SgContexts.Atom;
      var isBondContent = this.data.context === SgContexts.Bond;
      if (isAtomContext || isBondContent) {
        var contentBoxes = [];
        this.atoms.forEach(function (aid) {
          var atom = struct.atoms.get(aid);
          assert(atom, "SGroup.calculatePP: atom ".concat(aid, " is not found"));
          var pos = new Vec2(atom.pp);
          var ext = new Vec2(0.05 * 3, 0.05 * 3);
          var bba = new Box2Abs(pos, pos).extend(ext, ext);
          contentBoxes.push(bba);
        });
        var contentBB = contentBoxes.reduce(function (contentBounds, bba) {
          var bbb = null;
          [bba.p0.x, bba.p1.x].forEach(function (x) {
            [bba.p0.y, bba.p1.y].forEach(function (y) {
              var v = new Vec2(x, y);
              bbb = !bbb ? new Box2Abs(v, v) : bbb.include(v);
            });
          });
          assert(bbb, 'SGroup.calculatePP: failed to build atom bounding box');
          return !contentBounds ? bbb : Box2Abs.union(contentBounds, bbb);
        }, null);
        assert(contentBB, 'SGroup.calculatePP: content bounding box is required');
        topLeftPoint = isBondContent ? contentBB.centre() : contentBB.p0;
      } else {
        assert(this.bracketBox, 'SGroup.calculatePP: bracketBox is required');
        topLeftPoint = this.bracketBox.p1.add(new Vec2(0.5, 0.5));
      }
      var sgroups = Array.from(struct.sgroups.values());
      for (var _i = 0, _sgroups = sgroups; _i < _sgroups.length; _i++) {
        _sgroups[_i];
        if (!descriptorIntersects(sgroups, topLeftPoint)) break;
        topLeftPoint = topLeftPoint.add(new Vec2(0, 0.5));
      }
      if (this.data.fieldName === 'INDIGO_CIP_DESC') {
        if (this.atoms.length === 1) {
          var _struct$atoms$get;
          var sAtom = this.atoms[0];
          var sAtomPP = (_struct$atoms$get = struct.atoms.get(sAtom)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.pp;
          if (sAtomPP) {
            topLeftPoint = sAtomPP;
          }
        } else {
          topLeftPoint = SGroup.getMassCentre(struct, this.atoms);
        }
      }
      this.pp = topLeftPoint;
    }
  }, {
    key: "isGroupAttached",
    value: function isGroupAttached(struct) {
      return this.getConnectionPointsCount(struct) >= 1;
    }
  }, {
    key: "addAttachmentPoint",
    value: function addAttachmentPoint(attachmentPoint) {
      var validateUniqueness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var isAttachmentPointAlreadyExist = this.attachmentPoints.some(function (_ref) {
        var atomId = _ref.atomId,
          leaveAtomId = _ref.leaveAtomId;
        return attachmentPoint.atomId === atomId && attachmentPoint.leaveAtomId === leaveAtomId;
      });
      if (isAttachmentPointAlreadyExist && validateUniqueness) {
        throw new Error('The same attachment point cannot be added to an S-group more than once');
      }
      this.attachmentPoints.push(attachmentPoint);
    }
  }, {
    key: "addAttachmentPoints",
    value: function addAttachmentPoints(attachmentPoints) {
      var validateUniqueness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var _iterator = _createForOfIteratorHelper(attachmentPoints),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var attachmentPoint = _step.value;
          this.addAttachmentPoint(attachmentPoint, validateUniqueness);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "removeAttachmentPoint",
    value: function removeAttachmentPoint(attachmentPoint) {
      var index = this.attachmentPoints.indexOf(attachmentPoint);
      if (index !== -1) {
        this.attachmentPoints.splice(index, 1);
        return true;
      }
      return false;
    }
  }, {
    key: "getAttachmentPoints",
    value: function getAttachmentPoints() {
      return this.attachmentPoints;
    }
  }, {
    key: "getConnectionPointsCount",
    value: function getConnectionPointsCount(struct) {
      var connectionAtoms = new Set();
      var _iterator2 = _createForOfIteratorHelper(this.atoms),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _struct$atomGetNeighb;
          var atomId = _step2.value;
          var neighbors = (_struct$atomGetNeighb = struct.atomGetNeighbors(atomId)) !== null && _struct$atomGetNeighb !== void 0 ? _struct$atomGetNeighb : [];
          var _iterator3 = _createForOfIteratorHelper(neighbors),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var aid = _step3.value.aid;
              if (!this.atoms.includes(aid)) {
                connectionAtoms.add(atomId);
                break;
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return connectionAtoms.size;
    }
  }, {
    key: "isNotContractible",
    value: function isNotContractible(struct) {
      return this.getConnectionPointsCount(struct) > 1;
    }
  }, {
    key: "getAttachmentAtomId",
    value: function getAttachmentAtomId() {
      var _this$attachmentPoint;
      return (_this$attachmentPoint = this.attachmentPoints[0]) === null || _this$attachmentPoint === void 0 ? void 0 : _this$attachmentPoint.atomId;
    }
  }, {
    key: "getContractedPosition",
    value: function getContractedPosition(struct) {
      var _this$attachmentPoint2;
      var atomId = (_this$attachmentPoint2 = this.attachmentPoints[0]) === null || _this$attachmentPoint2 === void 0 ? void 0 : _this$attachmentPoint2.atomId;
      if (!struct.atoms.has(atomId)) {
        atomId = this.atoms[0];
      }
      var positions = getAtomPositions(this.atoms, struct.atoms);
      if (positions.length > 0) {
        return {
          atomId: atomId,
          position: geometricCenter(positions)
        };
      }
      var atom = struct.atoms.get(atomId);
      assert(atom, "SGroup.getContractedPosition: atom ".concat(atomId, " is not found"));
      return {
        atomId: atomId,
        position: atom.pp
      };
    }
  }, {
    key: "cloneAttachmentPoints",
    value: function cloneAttachmentPoints(atomIdMap) {
      return this.attachmentPoints.map(function (point) {
        return point.clone(atomIdMap);
      });
    }
  }, {
    key: "isSuperatomWithoutLabel",
    get: function get() {
      return this.type === SGroup.TYPES.SUP && !this.data.name && !this.data["class"];
    }
  }, {
    key: "isMonomer",
    get: function get() {
      return false;
    }
  }], [{
    key: "getOffset",
    value: function getOffset(sgroup) {
      if (!(sgroup !== null && sgroup !== void 0 && sgroup.pp) || !sgroup.bracketBox) return null;
      return Vec2.diff(sgroup.pp, sgroup.bracketBox.p1);
    }
  }, {
    key: "isSaltOrSolvent",
    value: function isSaltOrSolvent(moleculeName) {
      var saltsAndSolventsProvider = SaltsAndSolventsProvider.getInstance();
      var saltsAndSolvents = saltsAndSolventsProvider.getSaltsAndSolventsList();
      return saltsAndSolvents.some(function (_ref2) {
        var name = _ref2.name,
          abbreviation = _ref2.abbreviation;
        return name === moleculeName || moleculeName === abbreviation;
      });
    }
  }, {
    key: "isAtomInSaltOrSolvent",
    value: function isAtomInSaltOrSolvent(atomId, sgroupsOnCanvas) {
      var _this2 = this;
      var onlySaltsOrSolvents = sgroupsOnCanvas.filter(function (sgroup) {
        return _this2.isSaltOrSolvent(sgroup.data.name);
      });
      return onlySaltsOrSolvents.some(function (_ref3) {
        var atoms = _ref3.atoms;
        return atoms.some(function (atomIdInSaltOrSolvent) {
          return atomIdInSaltOrSolvent === atomId;
        });
      });
    }
  }, {
    key: "isBondInSaltOrSolvent",
    value: function isBondInSaltOrSolvent(bondId, sgroupsOnCanvas) {
      var _this3 = this;
      var onlySaltsOrSolvents = sgroupsOnCanvas.filter(function (sgroup) {
        return _this3.isSaltOrSolvent(sgroup.data.name);
      });
      return onlySaltsOrSolvents.some(function (_ref4) {
        var bonds = _ref4.bonds;
        return (bonds !== null && bonds !== void 0 ? bonds : []).some(function (bondIdInSaltOrSolvent) {
          return bondIdInSaltOrSolvent === bondId;
        });
      });
    }
  }, {
    key: "filterAtoms",
    value: function filterAtoms(atoms, map) {
      var newAtoms = [];
      if (!atoms) {
        return newAtoms;
      }
      var _iterator4 = _createForOfIteratorHelper(atoms),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var aid = _step4.value;
          if (typeof map[aid] !== 'number') newAtoms.push(aid);else if (map[aid] >= 0) newAtoms.push(map[aid]);else newAtoms.push(-1);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      return newAtoms;
    }
  }, {
    key: "removeNegative",
    value: function removeNegative(atoms) {
      var newAtoms = [];
      var _iterator5 = _createForOfIteratorHelper(atoms),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var atom = _step5.value;
          if (atom >= 0) newAtoms.push(atom);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return newAtoms;
    }
  }, {
    key: "filter",
    value: function filter(_mol, sg, atomMap) {
      sg.atoms = SGroup.removeNegative(SGroup.filterAtoms(sg.atoms, atomMap));
    }
  }, {
    key: "clone",
    value: function clone(sgroup, aidMap) {
      var cp = new SGroup(sgroup.type);
      Object.keys(sgroup.data).forEach(function (field) {
        cp.data[field] = sgroup.data[field];
      });
      cp.atoms = sgroup.atoms.map(function (elem) {
        var remappedAtomId = aidMap.get(elem);
        assert(remappedAtomId !== undefined, "SGroup.clone: missing remapped atom id for ".concat(elem));
        return remappedAtomId;
      });
      cp.pp = sgroup.pp;
      cp.bracketBox = sgroup.bracketBox;
      cp.patoms = null;
      cp.allAtoms = sgroup.allAtoms;
      cp.data.expanded = sgroup.data.expanded;
      cp.addAttachmentPoints(sgroup.cloneAttachmentPoints(aidMap));
      return cp;
    }
  }, {
    key: "addAtom",
    value: function addAtom(sgroup, aid, struct) {
      sgroup.atoms.push(aid);
      if (sgroup.isNotContractible(struct)) {
        sgroup.setAttr('expanded', true);
      }
    }
  }, {
    key: "removeAtom",
    value: function removeAtom(sgroup, aid) {
      if (!sgroup) {
        return;
      }
      var index = sgroup.atoms.indexOf(aid);
      if (index !== -1) {
        sgroup.atoms.splice(index, 1);
      }
    }
  }, {
    key: "getCrossBonds",
    value: function getCrossBonds(mol, parentAtomSet) {
      var crossBonds = {};
      mol.bonds.forEach(function (bond, bid) {
        if (parentAtomSet.has(bond.begin) && !parentAtomSet.has(bond.end)) {
          if (!crossBonds[bond.begin]) {
            crossBonds[bond.begin] = [];
          }
          crossBonds[bond.begin].push(bid);
        } else if (parentAtomSet.has(bond.end) && !parentAtomSet.has(bond.begin)) {
          if (!crossBonds[bond.end]) {
            crossBonds[bond.end] = [];
          }
          crossBonds[bond.end].push(bid);
        }
      });
      return crossBonds;
    }
  }, {
    key: "bracketPos",
    value: function bracketPos(sGroup, mol, remol, render) {
      var _window$ketcher;
      var BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);
      var PADDING_VECTOR = !SGroup.isCOPGroup(sGroup) ? new Vec2(0.2, 0.4) : new Vec2(1.2, 1.2);
      var atoms = sGroup.atoms;
      var braketBox = null;
      var contentBoxes = [];
      var getAtom = function getAtom(aid) {
        if (remol && render) {
          return remol.atoms.get(aid);
        }
        return mol.atoms.get(aid);
      };
      sGroup.bracketDirection = new Vec2(1, 0);
      atoms.forEach(function (aid) {
        var atom = getAtom(aid);
        if (!atom) return;
        var structBoundingBox = null;
        if ('getVBoxObj' in atom && atom.getVBoxObj && render) {
          structBoundingBox = atom.getVBoxObj(render);
        } else if (atom.pp) {
          var position = new Vec2(atom.pp);
          structBoundingBox = new Box2Abs(position, position);
        }
        if (!structBoundingBox) return;
        contentBoxes.push(structBoundingBox.extend(BORDER_EXT, BORDER_EXT));
      });
      contentBoxes.forEach(function (bba) {
        braketBox = !braketBox ? bba : Box2Abs.union(braketBox, bba);
      });
      var currentRender = render !== null && render !== void 0 ? render : (_window$ketcher = window.ketcher) === null || _window$ketcher === void 0 || (_window$ketcher = _window$ketcher.editor) === null || _window$ketcher === void 0 ? void 0 : _window$ketcher.render;
      assert(currentRender, 'SGroup.bracketPos: render instance is required');
      var attachmentPointsVBox = currentRender.ctab.getRGroupAttachmentPointsVBoxByAtomIds(atoms);
      attachmentPointsVBox = attachmentPointsVBox ? attachmentPointsVBox.extend(BORDER_EXT, BORDER_EXT) : attachmentPointsVBox;
      braketBox = attachmentPointsVBox && braketBox ? Box2Abs.union(braketBox, attachmentPointsVBox) : braketBox;
      if (braketBox) braketBox = braketBox.extend(PADDING_VECTOR, PADDING_VECTOR);
      sGroup.bracketBox = braketBox;
    }
  }, {
    key: "getBracketParameters",
    value: function getBracketParameters(mol, crossBondsPerAtom, atomSet, bb, d, n) {
      var brackets = [];
      var crossBondsPerAtomValues = Object.values(crossBondsPerAtom);
      var crossBonds = crossBondsPerAtomValues.flat();
      if (crossBonds.length < 2) {
        (function () {
          d = d || new Vec2(1, 0);
          n = n || d.rotateSC(1, 0);
          var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
          var cl = Vec2.lc2(d, bb.p0.x, n, 0.5 * (bb.p0.y + bb.p1.y));
          var cr = Vec2.lc2(d, bb.p1.x, n, 0.5 * (bb.p0.y + bb.p1.y));
          var bracketHeight = bb.sz().y;
          brackets.push(new SGroupBracketParams(cl, d.negated(), bracketWidth, bracketHeight), new SGroupBracketParams(cr, d, bracketWidth, bracketHeight));
        })();
      } else if (crossBonds.length === 2 && crossBondsPerAtomValues.length === 2) {
        (function () {
          var b1 = mol.bonds.get(crossBonds[0]);
          var b2 = mol.bonds.get(crossBonds[1]);
          assert(b1, "SGroup.getBracketParameters: first cross-bond ".concat(crossBonds[0], " is not found"));
          assert(b2, "SGroup.getBracketParameters: second cross-bond ".concat(crossBonds[1], " is not found"));
          var cl0 = b1.getCenter(mol);
          var cr0 = b2.getCenter(mol);
          var dr = Vec2.diff(cr0, cl0).normalized();
          var dl = dr.negated();
          var bracketWidth = 0.25;
          var bracketHeight = 1.5;
          brackets.push(new SGroupBracketParams(cl0.addScaled(dl, 0), dl, bracketWidth, bracketHeight), new SGroupBracketParams(cr0.addScaled(dr, 0), dr, bracketWidth, bracketHeight));
        })();
      } else {
        (function () {
          var _iterator6 = _createForOfIteratorHelper(crossBonds),
            _step6;
          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var crossBondId = _step6.value;
              var b = mol.bonds.get(crossBondId);
              assert(b, "SGroup.getBracketParameters: cross-bond ".concat(crossBondId, " is not found"));
              var c = b.getCenter(mol);
              var _d = atomSet.has(b.begin) ? b.getDir(mol) : b.getDir(mol).negated();
              brackets.push(new SGroupBracketParams(c, _d, 0.2, 1.0));
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        })();
      }
      return brackets;
    }
  }, {
    key: "getObjBBox",
    value: function getObjBBox(atoms, mol) {
      var _mol$atoms$get;
      var useCollapsedSgroupsPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var a0 = (_mol$atoms$get = mol.atoms.get(atoms[0])) === null || _mol$atoms$get === void 0 ? void 0 : _mol$atoms$get.pp;
      assert(a0, "SGroup.getObjBBox: atom ".concat(atoms[0], " position is not found"));
      var bb = new Box2Abs(a0, a0);
      var _iterator7 = _createForOfIteratorHelper(atoms.slice(1)),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var aid = _step7.value;
          var atom = mol.atoms.get(aid);
          assert(atom, "SGroup.getObjBBox: atom ".concat(aid, " is not found"));
          var sgroupId = atom.sgs.values().next().value;
          var sgroup = isNumber(sgroupId) ? mol.sgroups.get(sgroupId) : undefined;
          var p = useCollapsedSgroupsPosition && sgroup && !sgroup.isExpanded() ? sgroup.getContractedPosition(mol).position : atom.pp;
          bb = bb.include(p);
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
      return bb;
    }
  }, {
    key: "getAtoms",
    value: function getAtoms(mol, sg) {
      if (sg && !sg.allAtoms) {
        return sg.atoms;
      }
      var atoms = [];
      mol.atoms.forEach(function (_atom, aid) {
        atoms.push(aid);
      });
      return atoms;
    }
  }, {
    key: "getBonds",
    value: function getBonds(mol, sg) {
      var atoms = SGroup.getAtoms(mol, sg);
      var bonds = [];
      mol.bonds.forEach(function (bond, bid) {
        if (atoms.indexOf(bond.begin) >= 0 && atoms.indexOf(bond.end) >= 0) {
          bonds.push(bid);
        }
      });
      return bonds;
    }
  }, {
    key: "prepareMulForSaving",
    value: function prepareMulForSaving(sgroup, mol) {
      sgroup.atoms.sort(function (a, b) {
        return a - b;
      });
      sgroup.atomSet = new Pile(sgroup.atoms);
      sgroup.parentAtomSet = new Pile(sgroup.atomSet);
      var inBonds = [];
      var xBonds = [];
      mol.bonds.forEach(function (bond, bid) {
        if (sgroup.parentAtomSet.has(bond.begin) && sgroup.parentAtomSet.has(bond.end)) {
          inBonds.push(bid);
        } else if (sgroup.parentAtomSet.has(bond.begin) || sgroup.parentAtomSet.has(bond.end)) {
          xBonds.push(bid);
        }
      });
      if (xBonds.length !== 0 && xBonds.length !== 2) {
        throw Error('Unsupported cross-bonds number');
      }
      var xAtom1 = -1;
      var xAtom2 = -1;
      var crossBond = null;
      if (xBonds.length === 2) {
        var bond1 = mol.bonds.get(xBonds[0]);
        assert(bond1, "SGroup.prepareMulForSaving: first cross-bond ".concat(xBonds[0], " is not found"));
        xAtom1 = sgroup.parentAtomSet.has(bond1.begin) ? bond1.begin : bond1.end;
        var bond2 = mol.bonds.get(xBonds[1]);
        assert(bond2, "SGroup.prepareMulForSaving: second cross-bond ".concat(xBonds[1], " is not found"));
        xAtom2 = sgroup.parentAtomSet.has(bond2.begin) ? bond2.begin : bond2.end;
        crossBond = bond2;
      }
      var tailAtom = xAtom2;
      var newAtoms = [];
      var _loop = function _loop() {
        var amap = {};
        sgroup.atoms.forEach(function (aid) {
          var atom = mol.atoms.get(aid);
          assert(atom, "SGroup.prepareMulForSaving: atom ".concat(aid, " is not found"));
          var aid2 = mol.atoms.add(atom.clone());
          newAtoms.push(aid2);
          sgroup.atomSet.add(aid2);
          amap[aid] = aid2;
        });
        inBonds.forEach(function (bid) {
          var bond = mol.bonds.get(bid);
          assert(bond, "SGroup.prepareMulForSaving: bond ".concat(bid, " is not found"));
          var newBond = bond.clone();
          newBond.begin = amap[newBond.begin];
          newBond.end = amap[newBond.end];
          mol.bonds.add(newBond);
        });
        if (crossBond !== null) {
          var newCrossBond = crossBond.clone();
          newCrossBond.begin = tailAtom;
          newCrossBond.end = amap[xAtom1];
          mol.bonds.add(newCrossBond);
          tailAtom = amap[xAtom2];
        }
      };
      for (var j = 0; j < sgroup.data.mul - 1; j++) {
        _loop();
      }
      if (tailAtom >= 0) {
        var xBond2 = mol.bonds.get(xBonds[1]);
        assert(xBond2, "SGroup.prepareMulForSaving: cross-bond ".concat(xBonds[1], " is not found"));
        if (xBond2.begin === xAtom2) xBond2.begin = tailAtom;else xBond2.end = tailAtom;
      }
      sgroup.bonds = xBonds;
      newAtoms.forEach(function (aid) {
        mol.sGroupForest.getPathToRoot(sgroup.id).reverse().forEach(function (sgid) {
          mol.atomAddToSGroup(sgid, aid);
        });
      });
    }
  }, {
    key: "getMassCentre",
    value: function getMassCentre(mol, atoms) {
      var c = new Vec2();
      var _iterator8 = _createForOfIteratorHelper(atoms),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var atomId = _step8.value;
          var atom = mol.atoms.get(atomId);
          assert(atom, "SGroup.getMassCentre: atom ".concat(atomId, " is not found"));
          c = c.addScaled(atom.pp, 1.0 / atoms.length);
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
      return c;
    }
  }, {
    key: "isBondInContractedSGroup",
    value: function isBondInContractedSGroup(bond, sGroups) {
      return _toConsumableArray(sGroups.values()).some(function (sGroupOrReSGroup) {
        var _sGroup$atoms;
        var sGroup = 'item' in sGroupOrReSGroup ? sGroupOrReSGroup.item : sGroupOrReSGroup;
        var atomsInSGroup = (_sGroup$atoms = sGroup === null || sGroup === void 0 ? void 0 : sGroup.atoms) !== null && _sGroup$atoms !== void 0 ? _sGroup$atoms : [];
        return (sGroup === null || sGroup === void 0 ? void 0 : sGroup.isContracted()) && atomsInSGroup.includes(bond === null || bond === void 0 ? void 0 : bond.begin) && atomsInSGroup.includes(bond === null || bond === void 0 ? void 0 : bond.end);
      });
    }
  }, {
    key: "isSuperAtom",
    value: function isSuperAtom(sGroup) {
      if (!sGroup) {
        return false;
      }
      return (sGroup === null || sGroup === void 0 ? void 0 : sGroup.type) === SGroup.TYPES.SUP;
    }
  }, {
    key: "isDataSGroup",
    value: function isDataSGroup(sGroup) {
      return sGroup.type === SGroup.TYPES.DAT;
    }
  }, {
    key: "isQuerySGroup",
    value: function isQuerySGroup(sGroup) {
      return sGroup.type === SGroup.TYPES.queryComponent;
    }
  }, {
    key: "isSRUSGroup",
    value: function isSRUSGroup(sGroup) {
      return sGroup.type === SGroup.TYPES.SRU;
    }
  }, {
    key: "isMulSGroup",
    value: function isMulSGroup(sGroup) {
      return sGroup.type === SGroup.TYPES.MUL;
    }
  }, {
    key: "isCOPGroup",
    value: function isCOPGroup(sGroup) {
      return sGroup.type === SGroup.TYPES.COP;
    }
  }]);
  return SGroup;
}();
_defineProperty(SGroup, "TYPES", {
  SUP: 'SUP',
  MUL: 'MUL',
  SRU: 'SRU',
  MON: 'MON',
  MER: 'MER',
  COP: 'COP',
  CRO: 'CRO',
  MOD: 'MOD',
  GRA: 'GRA',
  COM: 'COM',
  MIX: 'MIX',
  FOR: 'FOR',
  DAT: 'DAT',
  ANY: 'ANY',
  GEN: 'GEN',
  queryComponent: 'queryComponent',
  nucleotideComponent: 'nucleotideComponent'
});
_defineProperty(SGroup, "isAtomInContractedSGroup", function (atom, sGroups) {
  var contractedSGroup = [];
  sGroups.forEach(function (sGroupOrReSGroup) {
    var sGroup = 'item' in sGroupOrReSGroup ? sGroupOrReSGroup.item : sGroupOrReSGroup;
    if (sGroup.isContracted()) {
      contractedSGroup.push(sGroup.id);
    }
  });
  return contractedSGroup.some(function (sg) {
    return atom.sgs.has(sg);
  });
});
function descriptorIntersects(sgroups, topLeftPoint) {
  return sgroups.some(function (sg) {
    if (!sg.pp) return false;
    var sgBottomRightPoint = sg.pp.add(new Vec2(0.5, 0.5));
    var bottomRightPoint = topLeftPoint.add(new Vec2(0.5, 0.5));
    return Box2Abs.segmentIntersection(sg.pp, sgBottomRightPoint, topLeftPoint, bottomRightPoint);
  });
}

export { SGroup, SGroupBracketParams, SUPERATOM_CLASS };
//# sourceMappingURL=sgroup.modern.js.map
