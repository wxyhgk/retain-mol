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
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var atom = require('../../../domain/entities/atom.js');
var bond = require('../../../domain/entities/bond.js');
var functionalGroup = require('../../../domain/entities/functionalGroup.js');
var sgroup = require('../../../domain/entities/sgroup.js');
var struct = require('../../../domain/entities/struct.js');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var pile = require('../../../domain/entities/pile.js');
var pool = require('../../../domain/entities/pool.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var reatom = require('./reatom.js');
var rebond = require('./rebond.js');
var redatasgroupdata = require('./redatasgroupdata.js');
var reenhancedFlag = require('./reenhancedFlag.js');
var refrag = require('./refrag.js');
var reloop = require('./reloop.js');
var rergroup = require('./rergroup.js');
var rerxnarrow = require('./rerxnarrow.js');
var rerxnplus = require('./rerxnplus.js');
var resgroup = require('./resgroup.js');
var resimpleObject = require('./resimpleObject.js');
var retext = require('./retext.js');
var util = require('../util.js');
var rergroupAttachmentPoint = require('./rergroupAttachmentPoint.js');
var reImage = require('./reImage.js');
require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
var image = require('../../../domain/constants/image.js');
var multitailArrow = require('../../../domain/constants/multitailArrow.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var remultitailArrow = require('./remultitailArrow.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var ReStruct = function () {
  function ReStruct(molecule, render) {
    var _this = this;
    _classCallCheck__default["default"](this, ReStruct);
    _defineProperty__default["default"](this, "render", void 0);
    _defineProperty__default["default"](this, "molecule", void 0);
    _defineProperty__default["default"](this, "atoms", new Map());
    _defineProperty__default["default"](this, "bonds", new Map());
    _defineProperty__default["default"](this, "visibleAtoms", new Map());
    _defineProperty__default["default"](this, "visibleBonds", new Map());
    _defineProperty__default["default"](this, "reloops", new Map());
    _defineProperty__default["default"](this, "rxnPluses", new Map());
    _defineProperty__default["default"](this, "rxnArrows", new Map());
    _defineProperty__default["default"](this, "frags", new pool.Pool());
    _defineProperty__default["default"](this, "rgroups", new pool.Pool());
    _defineProperty__default["default"](this, "rgroupAttachmentPoints", new pool.Pool());
    _defineProperty__default["default"](this, "sgroups", new Map());
    _defineProperty__default["default"](this, "sgroupData", new Map());
    _defineProperty__default["default"](this, "enhancedFlags", new Map());
    _defineProperty__default["default"](this, "simpleObjects", new Map());
    _defineProperty__default["default"](this, "texts", new Map());
    _defineProperty__default["default"](this, "images", new Map());
    _defineProperty__default["default"](this, "multitailArrows", new Map());
    _defineProperty__default["default"](this, "initialized", false);
    _defineProperty__default["default"](this, "layers", {});
    _defineProperty__default["default"](this, "connectedComponents", new pool.Pool());
    _defineProperty__default["default"](this, "ccFragmentType", new pool.Pool());
    _defineProperty__default["default"](this, "structChanged", false);
    _defineProperty__default["default"](this, "needRecalculateVisibleAtomsAndBonds", false);
    _defineProperty__default["default"](this, "atomsChanged", new Map());
    _defineProperty__default["default"](this, "simpleObjectsChanged", new Map());
    _defineProperty__default["default"](this, "rxnArrowsChanged", new Map());
    _defineProperty__default["default"](this, "rxnPlusesChanged", new Map());
    _defineProperty__default["default"](this, "enhancedFlagsChanged", new Map());
    _defineProperty__default["default"](this, "bondsChanged", new Map());
    _defineProperty__default["default"](this, "textsChanged", new Map());
    _defineProperty__default["default"](this, "imagesChanged", new Map());
    _defineProperty__default["default"](this, "multitailArrowsChanged", new Map());
    _defineProperty__default["default"](this, "snappingBonds", []);
    _defineProperty__default["default"](this, "highlightOutlinePaths", []);
    this.render = render;
    this.molecule = molecule || new struct.Struct();
    this.initLayers();
    this.clearMarks();
    molecule.atoms.forEach(function (atom, aid) {
      _this.atoms.set(aid, new reatom["default"](atom));
    });
    molecule.bonds.forEach(function (bond, bid) {
      _this.bonds.set(bid, new rebond["default"](bond));
    });
    molecule.loops.forEach(function (loop, lid) {
      _this.reloops.set(lid, new reloop["default"](loop));
    });
    molecule.rxnPluses.forEach(function (item, id) {
      _this.rxnPluses.set(id, new rerxnplus["default"](item));
    });
    molecule.rxnArrows.forEach(function (item, id) {
      _this.rxnArrows.set(id, new rerxnarrow["default"](item));
    });
    molecule.simpleObjects.forEach(function (item, id) {
      _this.simpleObjects.set(id, new resimpleObject["default"](item));
    });
    molecule.texts.forEach(function (item, id) {
      _this.texts.set(id, new retext["default"](item));
    });
    molecule.frags.forEach(function (item, id) {
      _this.frags.set(id, new refrag["default"](item));
      if (item) _this.enhancedFlags.set(id, new reenhancedFlag["default"]());
    });
    molecule.rgroups.forEach(function (item, id) {
      _this.rgroups.set(id, new rergroup["default"](item));
    });
    molecule.rgroupAttachmentPoints.forEach(function (item, id) {
      var reAtom = _this.atoms.get(item.atomId);
      assert.assert(reAtom != null);
      _this.rgroupAttachmentPoints.set(id, new rergroupAttachmentPoint.ReRGroupAttachmentPoint(item, reAtom));
    });
    molecule.sgroups.forEach(function (item, id) {
      _this.sgroups.set(id, new resgroup["default"](item));
      if (item.type === 'DAT' && !item.data.attached) {
        _this.sgroupData.set(id, new redatasgroupdata["default"](item));
      }
    });
    molecule.images.forEach(function (item, id) {
      _this.images.set(id, new reImage.ReImage(item));
    });
    molecule.multitailArrows.forEach(function (item, id) {
      _this.multitailArrows.set(id, new remultitailArrow.ReMultitailArrow(item));
    });
  }
  _createClass__default["default"](ReStruct, [{
    key: "visibleRGroupAttachmentPoints",
    get: function get() {
      var _this2 = this;
      var sgroups = this.molecule.sgroups;
      var functionalGroups = this.molecule.functionalGroups;
      return this.rgroupAttachmentPoints.filter(function (_id, reItem) {
        var atomId = reItem.item.atomId;
        var atom = _this2.molecule.atoms.get(atomId);
        assert.assert(atom != null);
        return !functionalGroup.FunctionalGroup.isAtomInContractedFunctionalGroup(atom, sgroups, functionalGroups);
      });
    }
  }, {
    key: "connectedComponentRemoveAtom",
    value: function connectedComponentRemoveAtom(aid, reAtom) {
      var atom = reAtom || this.atoms.get(aid);
      if (!atom || atom.component < 0) return;
      var cc = this.connectedComponents.get(atom.component);
      if (!cc) return;
      cc["delete"](aid);
      if (cc.size < 1) this.connectedComponents["delete"](atom.component);
      atom.component = -1;
    }
  }, {
    key: "clearConnectedComponents",
    value: function clearConnectedComponents() {
      this.connectedComponents.clear();
      this.atoms.forEach(function (atom) {
        atom.component = -1;
      });
    }
  }, {
    key: "getConnectedComponent",
    value: function getConnectedComponent(aid, adjacentComponents) {
      var _this3 = this;
      var list = Array.isArray(aid) ? Array.from(aid) : [aid];
      var ids = new pile.Pile();
      while (list.length > 0) {
        var _aid = list.pop();
        if (_aid === undefined) break;
        ids.add(_aid);
        var atom = this.atoms.get(_aid);
        if (!atom) continue;
        if (atom.component >= 0) adjacentComponents.add(atom.component);
        atom.a.neighbors.forEach(function (neighbor) {
          var halfBond = _this3.molecule.halfBonds.get(neighbor);
          if (!halfBond) return;
          var neiId = halfBond.end;
          if (!ids.has(neiId)) list.push(neiId);
        });
      }
      return ids;
    }
  }, {
    key: "addConnectedComponent",
    value: function addConnectedComponent(idSet) {
      var _this4 = this;
      var compId = this.connectedComponents.add(idSet);
      var adjacentComponents = new pile.Pile();
      var aidSet = this.getConnectedComponent(Array.from(idSet), adjacentComponents);
      adjacentComponents["delete"](compId);
      var type = -1;
      aidSet.forEach(function (aid) {
        var atom = _this4.atoms.get(aid);
        if (!atom) return;
        atom.component = compId;
        if (atom.a.rxnFragmentType !== -1) type = atom.a.rxnFragmentType;
      });
      this.ccFragmentType.set(compId, type);
      return compId;
    }
  }, {
    key: "removeConnectedComponent",
    value: function removeConnectedComponent(ccid) {
      var _this$connectedCompon,
        _this5 = this;
      (_this$connectedCompon = this.connectedComponents.get(ccid)) === null || _this$connectedCompon === void 0 || _this$connectedCompon.forEach(function (aid) {
        var atom = _this5.atoms.get(aid);
        if (atom) atom.component = -1;
      });
      return this.connectedComponents["delete"](ccid);
    }
  }, {
    key: "assignConnectedComponents",
    value: function assignConnectedComponents() {
      var _this6 = this;
      this.atoms.forEach(function (atom, aid) {
        if (atom.component >= 0) return;
        var adjacentComponents = new pile.Pile();
        var idSet = _this6.getConnectedComponent(aid, adjacentComponents);
        adjacentComponents.forEach(function (ccid) {
          _this6.removeConnectedComponent(ccid);
        });
        _this6.addConnectedComponent(idSet);
      });
    }
  }, {
    key: "initLayers",
    value: function initLayers() {
      for (var group in generalEnumTypes.LayerMap) {
        this.layers[generalEnumTypes.LayerMap[group]] = this.render.paper.rect(0, 0, 10, 10).attr({
          "class": group + 'Layer',
          fill: '#000',
          opacity: '0.0'
        }).toFront();
      }
    }
  }, {
    key: "addReObjectPath",
    value: function addReObjectPath(group, visel, path) {
      var _this7 = this;
      var pos = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var visible = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (!path || !this.layers[group].node.parentNode) return;
      var paths = Array.isArray(path) ? path : [path];
      paths.forEach(function (path) {
        var offset = _this7.render.options.offset;
        var bb = visible ? box2Abs.Box2Abs.fromRelBox(util["default"].relBox(path.getBBox())) : null;
        var ext = pos && bb ? bb.translate(pos.negated()) : null;
        if (offset !== null) {
          path.translateAbs(offset.x, offset.y);
          bb = bb ? bb.translate(offset) : null;
        }
        visel.add(path, bb, ext);
        path.insertBefore(_this7.layers[generalEnumTypes.LayerMap[group]]);
      });
    }
  }, {
    key: "moveReObjectOnTopOfLayer",
    value: function moveReObjectOnTopOfLayer(visel, layerKey) {
      var layer = this.layers[layerKey];
      if (!layer) {
        return;
      }
      visel.paths.forEach(function (path) {
        path.insertBefore(layer);
      });
    }
  }, {
    key: "movePathOnTopOfLayer",
    value: function movePathOnTopOfLayer(path, layerKey) {
      var layer = this.layers[layerKey];
      if (!layer) {
        return;
      }
      path.insertBefore(layer);
    }
  }, {
    key: "clearMarks",
    value: function clearMarks() {
      var _this8 = this;
      Object.keys(ReStruct.maps).forEach(function (map) {
        _this8[map + 'Changed'] = new Map();
      });
      this.structChanged = false;
    }
  }, {
    key: "markItemRemoved",
    value: function markItemRemoved() {
      this.structChanged = true;
    }
  }, {
    key: "markBond",
    value: function markBond(bid, mark) {
      this.markItem('bonds', bid, mark);
    }
  }, {
    key: "markAtom",
    value: function markAtom(aid, mark) {
      this.markItem('atoms', aid, mark);
    }
  }, {
    key: "markRgroupAttachmentPoint",
    value: function markRgroupAttachmentPoint(rgAPid, mark) {
      this.markItem('rgroupAttachmentPoints', rgAPid, mark);
    }
  }, {
    key: "markItem",
    value: function markItem(map, id, mark) {
      var mapChanged = this[map + 'Changed'];
      var value = mapChanged.has(id) ? Math.max(mark, mapChanged.get(id)) : mark;
      mapChanged.set(id, value);
      if (this[map].has(id)) this.clearVisel(this[map].get(id).visel);
    }
  }, {
    key: "clearVisel",
    value: function clearVisel(visel) {
      visel.paths.forEach(function (path) {
        path.remove();
      });
      visel.clear();
    }
  }, {
    key: "eachItem",
    value: function eachItem(func) {
      var _this9 = this;
      Object.keys(ReStruct.maps).forEach(function (map) {
        _this9[map].forEach(func);
      });
    }
  }, {
    key: "getSelectionBoxCenter",
    value: function getSelectionBoxCenter(selection) {
      var _boundingBox, _selection$atoms;
      var boundingBox = null;
      var _iterator = _createForOfIteratorHelper((_selection$atoms = selection.atoms) !== null && _selection$atoms !== void 0 ? _selection$atoms : []),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var atomId = _step.value;
          var reAtom = this.atoms.get(atomId);
          if (!reAtom) continue;
          var atomPositionPoint = reAtom.a.pp;
          var atomBox = new box2Abs.Box2Abs(atomPositionPoint, atomPositionPoint);
          boundingBox = boundingBox == null ? atomBox : box2Abs.Box2Abs.union(boundingBox, atomBox);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var selectionExceptAtoms = _objectSpread({}, selection);
      delete selectionExceptAtoms.atoms;
      var selectionExceptAtomsBoundingBox = this.getBoundingBoxForSelection(selectionExceptAtoms);
      if (selectionExceptAtomsBoundingBox) {
        boundingBox = boundingBox ? box2Abs.Box2Abs.union(boundingBox, selectionExceptAtomsBoundingBox) : selectionExceptAtomsBoundingBox;
      }
      return (_boundingBox = boundingBox) === null || _boundingBox === void 0 ? void 0 : _boundingBox.centre();
    }
  }, {
    key: "getVBoxObj",
    value: function getVBoxObj(selection) {
      if (isSelectionEmpty(selection)) {
        selection = this.getAllElementsAsSelectionMap();
      }
      var boundingBox = this.getBoundingBoxForSelection(selection);
      boundingBox = boundingBox || new box2Abs.Box2Abs(0, 0, 0, 0);
      return boundingBox;
    }
  }, {
    key: "getAllElementsAsSelectionMap",
    value: function getAllElementsAsSelectionMap() {
      var _this0 = this;
      var selection = {};
      Object.keys(ReStruct.maps).forEach(function (map) {
        selection[map] = Array.from(_this0[map].keys());
      });
      return selection;
    }
  }, {
    key: "getBoundingBoxForSelection",
    value: function getBoundingBoxForSelection(selection) {
      var _this1 = this;
      var boundingBox = null;
      Object.keys(ReStruct.maps).forEach(function (elementKey) {
        var _selection$elementKey;
        (_selection$elementKey = selection[elementKey]) === null || _selection$elementKey === void 0 || _selection$elementKey.forEach(function (elementId) {
          var element = _this1[elementKey].get(elementId);
          if (element) {
            var box = element.getVBoxObj(_this1.render);
            if (box) {
              boundingBox = boundingBox ? box2Abs.Box2Abs.union(boundingBox, box) : box.clone();
            }
          }
        });
      });
      return boundingBox;
    }
  }, {
    key: "translate",
    value: function translate(d) {
      this.eachItem(function (item) {
        return item.visel.translate(d);
      });
    }
  }, {
    key: "scale",
    value: function scale(s) {
      this.eachItem(function (item) {
        return scaleVisel(item.visel, s);
      });
    }
  }, {
    key: "clearVisels",
    value: function clearVisels() {
      var _this10 = this;
      this.eachItem(function (item) {
        return _this10.clearVisel(item.visel);
      });
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.clearVisels();
      Object.values(this.layers).forEach(function (layer) {
        return layer.remove();
      });
      this.layers = {};
    }
  }, {
    key: "recalculateVisibleAtomsAndBonds",
    value: function recalculateVisibleAtomsAndBonds() {
      var _this11 = this;
      this.visibleAtoms = new Map();
      this.visibleBonds = new Map();
      this.atoms.forEach(function (atom$1, aid) {
        var _this11$molecule$getG;
        if ((!functionalGroup.FunctionalGroup.isAtomInContractedFunctionalGroup(atom$1.a, _this11.molecule.sgroups, _this11.molecule.functionalGroups) || ((_this11$molecule$getG = _this11.molecule.getGroupFromAtomId(aid)) === null || _this11$molecule$getG === void 0 ? void 0 : _this11$molecule$getG.getContractedPosition(_this11.molecule).atomId) === aid) && !atom.Atom.isHiddenLeavingGroupAtom(_this11.molecule, aid)) {
          _this11.visibleAtoms.set(aid, atom$1);
        }
      });
      this.bonds.forEach(function (bond$1, bid) {
        if (!functionalGroup.FunctionalGroup.isBondInContractedFunctionalGroup(bond$1.b, _this11.molecule.sgroups, _this11.molecule.functionalGroups) && !sgroup.SGroup.isBondInContractedSGroup(bond$1.b, _this11.molecule.sgroups) && !bond.Bond.isBondToHiddenLeavingGroup(_this11.molecule, bond$1.b)) {
          _this11.visibleBonds.set(bid, bond$1);
        }
      });
    }
  }, {
    key: "update",
    value: function update(force) {
      var _this12 = this;
      force = force || !this.initialized;
      if (force || this.needRecalculateVisibleAtomsAndBonds) {
        this.recalculateVisibleAtomsAndBonds();
        this.needRecalculateVisibleAtomsAndBonds = false;
      }
      Object.keys(ReStruct.maps).forEach(function (map) {
        var mapChanged = _this12[map + 'Changed'];
        if (force) {
          _this12[map].forEach(function (_item, id) {
            return mapChanged.set(id, 1);
          });
        } else {
          mapChanged.forEach(function (_value, id) {
            if (!_this12[map].has(id)) mapChanged["delete"](id);
          });
        }
      });
      this.atomsChanged.forEach(function (_value, aid) {
        return _this12.connectedComponentRemoveAtom(aid);
      });
      var emptyFrags = this.frags.filter(function (fid, frag) {
        return !frag.calcBBox(_this12.render.ctab, fid, _this12.render);
      });
      emptyFrags.forEach(function (frag, fid) {
        _this12.clearVisel(frag.visel);
        _this12.frags["delete"](fid);
        _this12.molecule.frags["delete"](fid);
      });
      Object.keys(ReStruct.maps).forEach(function (map) {
        var mapChanged = _this12[map + 'Changed'];
        mapChanged.forEach(function (_value, id) {
          if (_this12[map].has(id) && _this12[map].get(id).visel) {
            _this12.clearVisel(_this12[map].get(id).visel);
          }
          _this12.structChanged = _this12.structChanged || mapChanged.get(id) > 0;
        });
      });
      this.sgroups.forEach(function (sgroup) {
        _this12.clearVisel(sgroup.visel);
        sgroup.hovering = null;
        sgroup.selectionPlate = null;
      });
      this.frags.forEach(function (frag) {
        _this12.clearVisel(frag.visel);
      });
      this.rgroups.forEach(function (rgroup) {
        _this12.clearVisel(rgroup.visel);
      });
      if (force) {
        this.clearConnectedComponents();
        this.molecule.initHalfBonds();
        this.molecule.initNeighbors();
      }
      var atomsChangedArray = Array.from(this.atomsChanged.keys());
      this.molecule.updateHalfBonds(atomsChangedArray);
      this.molecule.sortNeighbors(atomsChangedArray);
      this.assignConnectedComponents();
      this.initialized = true;
      this.verifyLoops();
      var updLoops = force || this.structChanged;
      if (updLoops) this.updateLoops();
      this.showAtoms();
      this.showBonds();
      this.showRgroupAttachmentPoints();
      if (updLoops) this.showLoops();
      this.showReactionSymbols();
      this.showSGroups();
      this.showFragments();
      this.showRGroups();
      this.showEnhancedFlags();
      this.showSimpleObjects();
      this.showTexts();
      this.showImages();
      this.showMultitailArrows();
      this.showHighlightOutlines();
      this.clearMarks();
      return true;
    }
  }, {
    key: "showHighlightOutlines",
    value: function showHighlightOutlines() {
      var _this13 = this;
      this.highlightOutlinePaths.forEach(function (entry) {
        return entry.remove();
      });
      this.highlightOutlinePaths = [];
      var namespace = 'http://www.w3.org/2000/svg';
      this.molecule.highlights.forEach(function (highlight) {
        if (!highlight.outline) {
          return;
        }
        var plates = [];
        var add = function add(contour) {
          if (contour) {
            plates.push(contour);
          }
        };
        highlight.atoms.forEach(function (atomId) {
          var _this13$atoms$get;
          add((_this13$atoms$get = _this13.atoms.get(atomId)) === null || _this13$atoms$get === void 0 ? void 0 : _this13$atoms$get.getSelectionContour(_this13.render));
        });
        highlight.bonds.forEach(function (bondId) {
          var _this13$bonds$get;
          add((_this13$bonds$get = _this13.bonds.get(bondId)) === null || _this13$bonds$get === void 0 ? void 0 : _this13$bonds$get.getSelectionContour(_this13.render, true));
        });
        if (plates.length === 0) {
          return;
        }
        var parent = plates[0].node.parentNode;
        if (!parent) {
          plates.forEach(function (plate) {
            return plate.remove();
          });
          return;
        }
        var filterId = _this13.ensureHighlightOutlineFilter();
        var group = document.createElementNS(namespace, 'g');
        group.setAttribute('filter', "url(#".concat(filterId, ")"));
        group.setAttribute('pointer-events', 'none');
        plates.forEach(function (plate) {
          plate.node.setAttribute('fill', highlight.color);
          plate.node.setAttribute('stroke', 'none');
          group.appendChild(plate.node);
        });
        parent.appendChild(group);
        _this13.highlightOutlinePaths.push({
          remove: function remove() {
            plates.forEach(function (plate) {
              return plate.remove();
            });
            group.remove();
          }
        });
      });
    }
  }, {
    key: "ensureHighlightOutlineFilter",
    value: function ensureHighlightOutlineFilter() {
      var _this$render$options$;
      var filterId = 'ketcher-highlight-outline';
      var scale = (_this$render$options$ = this.render.options.microModeScale) !== null && _this$render$options$ !== void 0 ? _this$render$options$ : 100;
      var ringRadius = String(scale / 20);
      var svg = this.render.paper.canvas;
      if (!svg) {
        return filterId;
      }
      var existingDilate = svg.querySelector("#".concat(filterId, " feMorphology"));
      if (existingDilate) {
        existingDilate.setAttribute('radius', ringRadius);
        return filterId;
      }
      var namespace = 'http://www.w3.org/2000/svg';
      var defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS(namespace, 'defs');
        svg.insertBefore(defs, svg.firstChild);
      }
      var filter = document.createElementNS(namespace, 'filter');
      filter.setAttribute('id', filterId);
      filter.setAttribute('x', '-50%');
      filter.setAttribute('y', '-50%');
      filter.setAttribute('width', '200%');
      filter.setAttribute('height', '200%');
      var dilate = document.createElementNS(namespace, 'feMorphology');
      dilate.setAttribute('in', 'SourceGraphic');
      dilate.setAttribute('operator', 'dilate');
      dilate.setAttribute('radius', ringRadius);
      dilate.setAttribute('result', 'dilated');
      var ring = document.createElementNS(namespace, 'feComposite');
      ring.setAttribute('in', 'dilated');
      ring.setAttribute('in2', 'SourceAlpha');
      ring.setAttribute('operator', 'out');
      filter.appendChild(dilate);
      filter.appendChild(ring);
      defs.appendChild(filter);
      return filterId;
    }
  }, {
    key: "updateLoops",
    value: function updateLoops() {
      var _this14 = this;
      this.reloops.forEach(function (reloop) {
        _this14.clearVisel(reloop.visel);
      });
      var ret = this.molecule.findLoops();
      ret.bondsToMark.forEach(function (bid) {
        _this14.markBond(bid, 1);
      });
      ret.newLoops.forEach(function (loopId) {
        var loop = _this14.molecule.loops.get(loopId);
        if (loop === undefined) return;
        _this14.reloops.set(loopId, new reloop["default"](loop));
      });
    }
  }, {
    key: "showLoops",
    value: function showLoops() {
      var _this15 = this;
      var options = this.render.options;
      this.reloops.forEach(function (reloop, rlid) {
        reloop.show(_this15, rlid, options);
      });
    }
  }, {
    key: "showSimpleObjects",
    value: function showSimpleObjects() {
      var _this16 = this;
      var options = this.render.options;
      this.simpleObjectsChanged.forEach(function (_value, id) {
        var simpleObject = _this16.simpleObjects.get(id);
        if (simpleObject) simpleObject.show(_this16, options);
      });
    }
  }, {
    key: "showTexts",
    value: function showTexts() {
      var _this17 = this;
      var options = this.render.options;
      this.textsChanged.forEach(function (_value, id) {
        var text = _this17.texts.get(id);
        if (text) text.show(_this17, id, options);
      });
    }
  }, {
    key: "showReactionSymbols",
    value: function showReactionSymbols() {
      var _this18 = this;
      var options = this.render.options;
      this.rxnArrowsChanged.forEach(function (_value, id) {
        var arrow = _this18.rxnArrows.get(id);
        if (arrow) arrow.show(_this18, id, options);
      });
      this.rxnPlusesChanged.forEach(function (_value, id) {
        var plus = _this18.rxnPluses.get(id);
        if (plus) plus.show(_this18, id, options);
      });
    }
  }, {
    key: "showSGroups",
    value: function showSGroups() {
      var _this19 = this;
      this.molecule.sGroupForest.getSGroupsBFS().reverse().forEach(function (id) {
        var resgroup = _this19.sgroups.get(id);
        if (!resgroup) return;
        resgroup.show(_this19);
      });
    }
  }, {
    key: "showFragments",
    value: function showFragments() {
      var _this20 = this;
      this.frags.forEach(function (frag) {
        var path = frag.draw(_this20.render);
        if (path) {
          _this20.addReObjectPath(generalEnumTypes.LayerMap.data, frag.visel, path, null, true);
        }
      });
    }
  }, {
    key: "showRGroups",
    value: function showRGroups() {
      var _this21 = this;
      var options = this.render.options;
      this.rgroups.forEach(function (rgroup, id) {
        rgroup.show(_this21, id, options);
      });
    }
  }, {
    key: "loopRemove",
    value: function loopRemove(loopId) {
      var _this22 = this;
      var reloop = this.reloops.get(loopId);
      if (!reloop) {
        return;
      }
      this.clearVisel(reloop.visel);
      reloop.loop.hbs.forEach(function (hbid) {
        var hb = _this22.molecule.halfBonds.get(hbid);
        if (!hb) return;
        hb.loop = -1;
        _this22.markBond(hb.bid, 1);
        _this22.markAtom(hb.begin, 1);
      });
      this.reloops["delete"](loopId);
      this.molecule.loops["delete"](loopId);
    }
  }, {
    key: "verifyLoops",
    value: function verifyLoops() {
      var _this23 = this;
      this.reloops.forEach(function (reloop, rlid) {
        if (!reloop.isValid(_this23.molecule, rlid)) _this23.loopRemove(rlid);
      });
    }
  }, {
    key: "getRGroupAttachmentPointsVBoxByAtomIds",
    value: function getRGroupAttachmentPointsVBoxByAtomIds(atomsIds) {
      var _this24 = this;
      var allAtomAttachmentPointsVBox = null;
      atomsIds.forEach(function (atomId) {
        var attachmentPointIds = _this24.molecule.getRGroupAttachmentPointsByAtomId(atomId);
        var oneAtomAttachmentPointsVBox = attachmentPointIds.reduce(function (previousVBox, attachmentPointId) {
          var attachmentPoint = _this24.rgroupAttachmentPoints.get(attachmentPointId);
          assert.assert(attachmentPoint != null);
          var currentVBox = attachmentPoint.getVBoxObj(_this24.render);
          return previousVBox && currentVBox ? box2Abs.Box2Abs.union(previousVBox, currentVBox) : currentVBox;
        }, null);
        if (allAtomAttachmentPointsVBox && oneAtomAttachmentPointsVBox) {
          allAtomAttachmentPointsVBox = box2Abs.Box2Abs.union(allAtomAttachmentPointsVBox, oneAtomAttachmentPointsVBox);
        } else {
          var _allAtomAttachmentPoi;
          allAtomAttachmentPointsVBox = (_allAtomAttachmentPoi = allAtomAttachmentPointsVBox) !== null && _allAtomAttachmentPoi !== void 0 ? _allAtomAttachmentPoi : oneAtomAttachmentPointsVBox;
        }
      });
      return allAtomAttachmentPointsVBox;
    }
  }, {
    key: "showRgroupAttachmentPoints",
    value: function showRgroupAttachmentPoints() {
      var _this25 = this;
      this.rgroupAttachmentPoints.forEach(function (_value, id) {
        var rgroupAttachmentPoint = _this25.rgroupAttachmentPoints.get(id);
        if (rgroupAttachmentPoint !== null && rgroupAttachmentPoint !== void 0 && rgroupAttachmentPoint.visel) {
          _this25.clearVisel(rgroupAttachmentPoint.visel);
        }
        var attachedAtomId = rgroupAttachmentPoint === null || rgroupAttachmentPoint === void 0 ? void 0 : rgroupAttachmentPoint.item.atomId;
        var sgroup = _this25.molecule.getGroupFromAtomId(attachedAtomId);
        var isInsideContractedSGroup = Boolean(sgroup === null || sgroup === void 0 ? void 0 : sgroup.isContracted());
        if (isInsideContractedSGroup) {
          return;
        }
        rgroupAttachmentPoint === null || rgroupAttachmentPoint === void 0 || rgroupAttachmentPoint.show(_this25, id);
      });
    }
  }, {
    key: "showAtoms",
    value: function showAtoms() {
      var _this26 = this;
      var options = this.render.options;
      this.atomsChanged.forEach(function (_value, aid) {
        var atom = _this26.atoms.get(aid);
        if (atom) atom.show(_this26, aid, options);
      });
    }
  }, {
    key: "showEnhancedFlags",
    value: function showEnhancedFlags() {
      var _this27 = this;
      var options = this.render.options;
      this.enhancedFlagsChanged.forEach(function (_value, chid) {
        var flag = _this27.enhancedFlags.get(chid);
        if (flag) flag.show(_this27, chid, options);
      });
    }
  }, {
    key: "showBonds",
    value: function showBonds() {
      var _this28 = this;
      var options = this.render.options;
      this.bondsChanged.forEach(function (_value, bid) {
        var bond = _this28.bonds.get(bid);
        if (bond) {
          bond.show(_this28, bid, options);
        }
      });
    }
  }, {
    key: "showImages",
    value: function showImages() {
      var _this29 = this;
      var options = this.render.options;
      this.imagesChanged.forEach(function (_, id) {
        var image = _this29.images.get(id);
        if (image) {
          image.show(_this29, options);
        }
      });
    }
  }, {
    key: "showMultitailArrows",
    value: function showMultitailArrows() {
      var _this30 = this;
      this.multitailArrowsChanged.forEach(function (_, id) {
        var multitailArrow = _this30.multitailArrows.get(id);
        if (multitailArrow) {
          multitailArrow.show(_this30, _this30.render.options);
        }
      });
    }
  }, {
    key: "setSelection",
    value: function setSelection(selection) {
      var _this31 = this;
      var atoms = [];
      Object.keys(ReStruct.maps).forEach(function (map) {
        var _this31$map$values = _this31[map].values(),
          _this31$map$values2 = _slicedToArray__default["default"](_this31$map$values, 1),
          mapValues = _this31$map$values2[0];
        if (ReStruct.maps[map].isSelectable() || mapValues instanceof resgroup["default"]) {
          _this31[map].forEach(function (item, id) {
            var _item$item;
            if (item instanceof reatom["default"]) {
              var sgroup;
              var _iterator2 = _createForOfIteratorHelper(item.a.sgs.values()),
                _step2;
              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var sgId = _step2.value;
                  sgroup = sgId;
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
              atoms.push({
                selected: item.selected,
                sgroup: sgroup
              });
            }
            if (item instanceof resgroup["default"] && functionalGroup.FunctionalGroup.isContractedFunctionalGroup(item === null || item === void 0 || (_item$item = item.item) === null || _item$item === void 0 ? void 0 : _item$item.id, _this31.molecule.functionalGroups)) {
              var sGroupAtoms = atoms.filter(function (atom) {
                var _item$item2;
                return atom.sgroup === (item === null || item === void 0 || (_item$item2 = item.item) === null || _item$item2 === void 0 ? void 0 : _item$item2.id);
              });
              item.selected = sGroupAtoms.length > 0 && sGroupAtoms.some(function (atom) {
                return atom.selected;
              });
            }
            var selected = selection !== null && selection !== void 0 && selection[map] ? selection[map].indexOf(id) > -1 : item.selected;
            if (selection === null) {
              selected = false;
            }
            _this31.showItemSelection(item, selected);
          });
        }
      });
    }
  }, {
    key: "showItemSelection",
    value: function showItemSelection(item, selected) {
      var exists = isSelectionSvgObjectExists(item);
      item.selected = selected;
      if (item instanceof redatasgroupdata["default"]) item.sgroup.selected = selected;
      if (selected) {
        if (!exists) {
          var render = this.render;
          var options = render.options;
          var paper = render.paper;
          item.selectionPlate = item.makeSelectionPlate(this, paper, options);
          this.addReObjectPath(generalEnumTypes.LayerMap.selectionPlate, item.visel, item.selectionPlate);
          if (typeof item.makeAdditionalInfo === 'function') {
            item.additionalInfo = item.makeAdditionalInfo(this);
            this.addReObjectPath(generalEnumTypes.LayerMap.additionalInfo, item.visel, item.additionalInfo);
          }
        }
        if (item.selectionPlate) {
          var _item$additionalInfo, _item$cip, _item$showPoints;
          item.selectionPlate.show();
          (_item$additionalInfo = item.additionalInfo) === null || _item$additionalInfo === void 0 || _item$additionalInfo.show();
          (_item$cip = item.cip) === null || _item$cip === void 0 || _item$cip.rectangle.attr({
            fill: '#7f7',
            stroke: '#7f7'
          });
          (_item$showPoints = item.showPoints) === null || _item$showPoints === void 0 || _item$showPoints.call(item);
        }
      } else if (exists && item.selectionPlate) {
        var _item$hidePoints, _item$additionalInfo2, _item$cip2;
        item.selectionPlate.hide();
        (_item$hidePoints = item.hidePoints) === null || _item$hidePoints === void 0 || _item$hidePoints.call(item);
        (_item$additionalInfo2 = item.additionalInfo) === null || _item$additionalInfo2 === void 0 || _item$additionalInfo2.hide();
        (_item$cip2 = item.cip) === null || _item$cip2 === void 0 || _item$cip2.rectangle.attr({
          fill: '#fff',
          stroke: '#fff'
        });
      }
    }
  }, {
    key: "addSnappingBonds",
    value: function addSnappingBonds(bondId) {
      this.snappingBonds.push(bondId);
    }
  }, {
    key: "clearSnappingBonds",
    value: function clearSnappingBonds() {
      this.snappingBonds = [];
    }
  }, {
    key: "isSnappingBond",
    value: function isSnappingBond(bondId) {
      return this.snappingBonds.includes(bondId);
    }
  }]);
  return ReStruct;
}();
_defineProperty__default["default"](ReStruct, "maps", _defineProperty__default["default"](_defineProperty__default["default"]({
  atoms: reatom["default"],
  bonds: rebond["default"],
  rxnPluses: rerxnplus["default"],
  rxnArrows: rerxnarrow["default"],
  frags: refrag["default"],
  rgroups: rergroup["default"],
  rgroupAttachmentPoints: rergroupAttachmentPoint.ReRGroupAttachmentPoint,
  sgroupData: redatasgroupdata["default"],
  enhancedFlags: reenhancedFlag["default"],
  sgroups: resgroup["default"],
  reloops: reloop["default"],
  simpleObjects: resimpleObject["default"],
  texts: retext["default"]
}, image.IMAGE_KEY, reImage.ReImage), multitailArrow.MULTITAIL_ARROW_KEY, remultitailArrow.ReMultitailArrow));
function isSelectionEmpty(selection) {
  if (!selection) return true;
  var anySelection = Object.keys(ReStruct.maps).some(function (map) {
    return selection[map] && selection[map].length > 0;
  });
  return !anySelection;
}
function scaleRPath(path, scaleFactor) {
  if (path.type === 'set') {
    var pathItems = Array.from({
      length: path.length
    }, function (_, index) {
      return path[index];
    });
    for (var _i = 0, _pathItems = pathItems; _i < _pathItems.length; _i++) {
      var pathItem = _pathItems[_i];
      scaleRPath(pathItem, scaleFactor);
    }
  } else {
    if (typeof path.attrs !== 'undefined') {
      if ('font-size' in path.attrs) {
        path.attr('font-size', path.attrs['font-size'] * scaleFactor);
      } else if ('stroke-width' in path.attrs) {
        path.attr('stroke-width', path.attrs['stroke-width'] * scaleFactor);
      }
    }
    path.scale(scaleFactor, scaleFactor, 0, 0);
  }
}
function scaleVisel(visel, s) {
  var _iterator3 = _createForOfIteratorHelper(visel.paths),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var viselPath = _step3.value;
      scaleRPath(viselPath, s);
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
}
function isSelectionSvgObjectExists(item) {
  var _item$selectionPlate, _item$selectionPlate2, _item$selectionPlate3, _item$selectionPlate$;
  return item && item.selectionPlate !== null && (!((_item$selectionPlate = item.selectionPlate) !== null && _item$selectionPlate !== void 0 && _item$selectionPlate.items) && !((_item$selectionPlate2 = item.selectionPlate) !== null && _item$selectionPlate2 !== void 0 && _item$selectionPlate2.removed) || Array.isArray((_item$selectionPlate3 = item.selectionPlate) === null || _item$selectionPlate3 === void 0 ? void 0 : _item$selectionPlate3.items) && !((_item$selectionPlate$ = item.selectionPlate[0]) !== null && _item$selectionPlate$ !== void 0 && _item$selectionPlate$.removed));
}

exports["default"] = ReStruct;
//# sourceMappingURL=restruct.js.map
