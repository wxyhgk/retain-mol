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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var atom = require('../../../domain/entities/atom.js');
var bond = require('../../../domain/entities/bond.js');
var functionalGroup = require('../../../domain/entities/functionalGroup.js');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var fragment = require('../../../domain/entities/fragment.js');
var vec2 = require('../../../domain/entities/vec2.js');
var elementColor = require('../../../domain/constants/elementColor.js');
var elements = require('../../../domain/constants/elements.js');
require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
var attachmentPointCalculations = require('../../../domain/helpers/attachmentPointCalculations.js');
var draw = require('../draw.js');
var util = require('../util.js');
var toFixed = require('../../../utilities/toFixed.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');
var render_constants = require('../render.constants.js');
var monomerMicromolecule = require('../../../domain/entities/monomerMicromolecule.js');
var monomers = require('../../../domain/types/monomers.js');
require('../../../domain/types/entities.js');
var constants = require('./constants.js');
var resgroup = require('./resgroup.js');
var attachmentPointTooltips = require('../../../domain/helpers/attachmentPointTooltips.js');
var showHydrogenLabels = require('./showHydrogenLabels.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var StereoLabelMinOpacity = 0.3;
var DEFAULT_ATOM_COLOR = '#000';
var DEFAULT_STEREO_COLOR = '#000';
var MAX_LABEL_LENGTH = 8;
exports.ShowHydrogenLabelNames = void 0;
(function (ShowHydrogenLabelNames) {
  ShowHydrogenLabelNames["Off"] = "Off";
  ShowHydrogenLabelNames["Hetero"] = "Hetero";
  ShowHydrogenLabelNames["Terminal"] = "Terminal";
  ShowHydrogenLabelNames["TerminalAndHetero"] = "Terminal and Hetero";
  ShowHydrogenLabelNames["On"] = "On";
})(exports.ShowHydrogenLabelNames || (exports.ShowHydrogenLabelNames = {}));
var ReAtom = function (_ReObject) {
  _inherits__default["default"](ReAtom, _ReObject);
  function ReAtom(_atom) {
    var _this;
    _classCallCheck__default["default"](this, ReAtom);
    _this = _callSuper(this, ReAtom, ['atom']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "a", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "showLabel", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "showInfoLabel", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "hydrogenOnTheLeft", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "color", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "component", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "label", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "infoLabel", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "cip", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "expandedMonomerAttachmentPoints", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "isPlateShouldBeHidden", function (atom$1, render) {
      var sgroups = render.ctab.sgroups;
      var functionalGroups = render.ctab.molecule.functionalGroups;
      var struct = render.ctab.molecule;
      var atomId = struct.atoms.keyOf(atom$1);
      return functionalGroup.FunctionalGroup.isAtomInContractedFunctionalGroup(atom$1, sgroups, functionalGroups) || atom.Atom.isHiddenLeavingGroupAtom(struct, atomId);
    });
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "makeHighlightePlate", function (restruct, style) {
      var highlightPadding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -2;
      var atom = _this.a;
      var render = restruct.render;
      if (_this.isPlateShouldBeHidden(atom, render)) {
        return null;
      }
      return _this.getSelectionContour(render, highlightPadding).attr(style);
    });
    _this.a = _atom;
    _this.showLabel = false;
    _this.showInfoLabel = false;
    _this.hydrogenOnTheLeft = false;
    _this.color = '#000000';
    _this.component = -1;
    return _this;
  }
  _createClass__default["default"](ReAtom, [{
    key: "getVBoxObj",
    value: function getVBoxObj(render) {
      if (this.visel.boundingBox) {
        return reobject["default"].prototype.getVBoxObj.call(this, render);
      }
      return new box2Abs.Box2Abs(this.a.pp, this.a.pp);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var drawOutline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var ret = this.makeHoverPlate(render, drawOutline);
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.atom, this.visel, ret);
      this.attachHighlightTriggerForAttachmentPointAtom(ret, render);
      this.drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(render, drawOutline);
      return ret;
    }
  }, {
    key: "attachHighlightTriggerForAttachmentPointAtom",
    value: function attachHighlightTriggerForAttachmentPointAtom(hoverElement, render) {
      if (!render.monomerCreationState) {
        return;
      }
      var atomId = render.ctab.molecule.atoms.keyOf(this.a);
      if (atomId === null) {
        return;
      }
      var assignedAttachmentPoints = render.monomerCreationState.assignedAttachmentPoints;
      var attachmentPointEntry = Array.from(assignedAttachmentPoints.entries()).find(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          atomsPair = _ref2[1];
        var _atomsPair = _slicedToArray__default["default"](atomsPair, 2),
          attachmentAtomId = _atomsPair[0],
          leavingAtomId = _atomsPair[1];
        return attachmentAtomId === atomId || leavingAtomId === atomId;
      });
      if (attachmentPointEntry && hoverElement) {
        var _attachmentPointEntry = _slicedToArray__default["default"](attachmentPointEntry, 1),
          attachmentPointName = _attachmentPointEntry[0];
        hoverElement.hover(function () {
          window.dispatchEvent(new CustomEvent('highlightAttachmentPointControls', {
            detail: attachmentPointName
          }));
        }, function () {
          window.dispatchEvent(new CustomEvent('resetHighlightAttachmentPointControls', {
            detail: attachmentPointName
          }));
        });
      }
    }
  }, {
    key: "drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard",
    value: function drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(render) {
      var drawOutline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (!render.monomerCreationState || !drawOutline) {
        return;
      }
      var _render$monomerCreati = render.monomerCreationState,
        potentialAttachmentPoints = _render$monomerCreati.potentialAttachmentPoints,
        assignedAttachmentPoints = _render$monomerCreati.assignedAttachmentPoints;
      var atomId = render.ctab.molecule.atoms.keyOf(this.a);
      if (atomId === null) {
        return;
      }
      var potentialLeavingGroups = Array.from(potentialAttachmentPoints.values());
      var isAtomInAssignedAttachmentPoint = Array.from(assignedAttachmentPoints.values()).some(function (atomsPair) {
        var _atomsPair2 = _slicedToArray__default["default"](atomsPair, 2),
          attachmentAtomId = _atomsPair2[0],
          leavingAtomId = _atomsPair2[1];
        return attachmentAtomId === atomId || leavingAtomId === atomId;
      });
      if (isAtomInAssignedAttachmentPoint) {
        return;
      }
      var isPotentialAttachmentPointAtom = potentialAttachmentPoints.has(atomId) || this.a.implicitH > 0 || potentialLeavingGroups.some(function (leavingAtomIds) {
        return leavingAtomIds.has(atomId);
      });
      if (isPotentialAttachmentPointAtom) {
        var path = this.makeHighlightePlate(render.ctab, {
          stroke: '#43B5C0',
          'stroke-dasharray': '- '
        });
        render.ctab.addReObjectPath(generalEnumTypes.LayerMap.atom, this.visel, path);
      }
    }
  }, {
    key: "setHover",
    value: function setHover(hover, render) {
      var _this$expandedMonomer2;
      var drawOutline = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      _get__default["default"](_getPrototypeOf__default["default"](ReAtom.prototype), "setHover", this).call(this, hover, render, drawOutline);
      if (!hover || this.selected) {
        var _this$expandedMonomer;
        (_this$expandedMonomer = this.expandedMonomerAttachmentPoints) === null || _this$expandedMonomer === void 0 || _this$expandedMonomer.hide();
        return;
      }
      if ((_this$expandedMonomer2 = this.expandedMonomerAttachmentPoints) !== null && _this$expandedMonomer2 !== void 0 && _this$expandedMonomer2.removed) {
        this.expandedMonomerAttachmentPoints = undefined;
      }
      if (this.expandedMonomerAttachmentPoints) {
        this.expandedMonomerAttachmentPoints.show();
      } else {
        this.expandedMonomerAttachmentPoints = this.makeMonomerAttachmentPointHighlightPlate(render);
      }
      return this.hover;
    }
  }, {
    key: "makeMonomerAttachmentPointHighlightPlate",
    value: function makeMonomerAttachmentPointHighlightPlate(render) {
      var _struct$atoms$keyOf;
      var restruct = render.ctab;
      var struct = restruct.molecule;
      var aid = (_struct$atoms$keyOf = struct.atoms.keyOf(this.a)) !== null && _struct$atoms$keyOf !== void 0 ? _struct$atoms$keyOf : undefined;
      var sgroup = struct.getGroupFromAtomId(aid);
      if (!(sgroup instanceof monomerMicromolecule.MonomerMicromolecule)) {
        return;
      }
      var style;
      if (atom.Atom.isSuperatomAttachmentAtom(struct, aid)) {
        style = {
          fill: 'none',
          stroke: '#4da3f8',
          'stroke-width': '2px'
        };
      }
      if (atom.Atom.isSuperatomLeavingGroupAtom(struct, aid)) {
        style = {
          fill: '#fff8c5',
          stroke: '#f8dc8f',
          'stroke-width': '2px'
        };
      }
      if (style) {
        var path = this.makeHighlightePlate(restruct, style, -4);
        restruct.addReObjectPath(generalEnumTypes.LayerMap.atom, this.visel, path);
        return path;
      }
    }
  }, {
    key: "getLabeledSelectionContour",
    value: function getLabeledSelectionContour(render) {
      var highlightPadding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var paper = render.paper,
        restruct = render.ctab,
        options = render.options;
      var fontszInPx = options.fontszInPx,
        radiusScaleFactor = options.radiusScaleFactor;
      var padding = fontszInPx * radiusScaleFactor + highlightPadding;
      var radius = fontszInPx * radiusScaleFactor * 2 + highlightPadding;
      var box = this.getVBoxObj(restruct.render);
      if (!box) {
        return this.getUnlabeledSelectionContour(render, highlightPadding);
      }
      var ps1 = scale.Scale.modelToCanvas(box.p0, restruct.render.options);
      var ps2 = scale.Scale.modelToCanvas(box.p1, restruct.render.options);
      var width = ps2.x - ps1.x;
      var height = fontszInPx * 1.23;
      return paper.rect(ps1.x - padding, ps1.y - padding, width + padding * 2, height + padding * 2, radius);
    }
  }, {
    key: "getUnlabeledSelectionContour",
    value: function getUnlabeledSelectionContour(render) {
      var highlightPadding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var paper = render.paper,
        options = render.options;
      var atomSelectionPlateRadius = options.atomSelectionPlateRadius;
      var ps = scale.Scale.modelToCanvas(this.a.pp, options);
      return paper.circle(ps.x, ps.y, atomSelectionPlateRadius + highlightPadding);
    }
  }, {
    key: "getSelectionContour",
    value: function getSelectionContour(render) {
      var _this$a$pseudo;
      var highlightPadding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var hasLabel = ((_this$a$pseudo = this.a.pseudo) === null || _this$a$pseudo === void 0 ? void 0 : _this$a$pseudo.length) > 1 && !getQueryAttrsText(this) || this.showLabel && this.a.implicitH !== 0 || this.a.atomList !== null;
      return hasLabel ? this.getLabeledSelectionContour(render, highlightPadding) : this.getUnlabeledSelectionContour(render, highlightPadding);
    }
  }, {
    key: "makeHoverPlate",
    value: function makeHoverPlate(render) {
      var drawOutline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var atom = this.a;
      var options = render.options;
      if (this.isPlateShouldBeHidden(atom, render)) {
        return null;
      }
      return this.getSelectionContour(render).attr(drawOutline ? options.hoverStyle : {
        fill: options.hoverStyle.fill,
        stroke: 'none'
      });
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct) {
      var atom = this.a;
      var render = restruct.render;
      var options = render.options;
      if (this.isPlateShouldBeHidden(atom, render)) {
        return null;
      }
      return this.getSelectionContour(render).attr(options.selectionStyle);
    }
  }, {
    key: "createInvisibleAtomTarget",
    value: function createInvisibleAtomTarget(restruct, render, position) {
      var invisibleAtomTarget = this.getSelectionContour(render).attr({
        opacity: 0,
        fill: DEFAULT_ATOM_COLOR,
        stroke: 'none',
        'stroke-width': 0
      });
      restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, invisibleAtomTarget, position);
      return invisibleAtomTarget;
    }
  }, {
    key: "isNeedShiftForCharge",
    value: function isNeedShiftForCharge(showCharge, bondLength) {
      var MIN_BOND_LENGTH = 24;
      var isBondLengthTooShort = bondLength <= MIN_BOND_LENGTH;
      var hasCharge = this.a.charge !== null && this.a.charge !== 0;
      return showCharge && isBondLengthTooShort && hasCharge;
    }
  }, {
    key: "getRatio",
    value: function getRatio(renderOptions, bondLen) {
      var _renderOptions$fontsz;
      var DEFAULT_BOND_LENGTH = 40;
      var DEFAULT_SUB_FONT_SIZE = 13;
      var subFontSize = (_renderOptions$fontsz = renderOptions.fontszsubInPx) !== null && _renderOptions$fontsz !== void 0 ? _renderOptions$fontsz : DEFAULT_SUB_FONT_SIZE;
      if (!bondLen) return 1;
      var showCharge = renderOptions.showCharge;
      var isNeedShift = this.isNeedShiftForCharge(showCharge, bondLen);
      if (!isNeedShift) {
        return 1;
      }
      var DEFAULT_PROPORTION = DEFAULT_BOND_LENGTH / DEFAULT_SUB_FONT_SIZE;
      var currentProportion = bondLen / subFontSize;
      var ratio = currentProportion / DEFAULT_PROPORTION;
      return ratio;
    }
  }, {
    key: "getShiftedSegmentPosition",
    value: function getShiftedSegmentPosition(renderOptions, direction, _atomPosition) {
      var bondLen = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var atomPosition = scale.Scale.modelToCanvas(_atomPosition !== null && _atomPosition !== void 0 ? _atomPosition : this.a.pp, renderOptions);
      var atomSymbolShift = 0;
      var exts = this.visel.exts;
      var ratio = this.getRatio(renderOptions, bondLen);
      var _iterator = _createForOfIteratorHelper(exts),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ext = _step.value;
          var box = ext.translate(atomPosition);
          var shiftRayBox = util["default"].shiftRayBox(atomPosition, direction, box);
          var shift = shiftRayBox * ratio;
          atomSymbolShift = Math.max(atomSymbolShift, shift);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      if (bondLen) {
        var maxShift = Math.max(bondLen / 2 - 3 * renderOptions.lineWidth, 0);
        atomSymbolShift = Math.min(atomSymbolShift, maxShift);
      }
      if (atomSymbolShift > 0) {
        return atomPosition.addScaled(direction, atomSymbolShift + 3 * renderOptions.lineWidth);
      } else {
        return atomPosition;
      }
    }
  }, {
    key: "hasAttachmentPoint",
    value: function hasAttachmentPoint() {
      return Boolean(this.a.attachmentPoints);
    }
  }, {
    key: "show",
    value: function show(restruct, aid, options) {
      var _restruct$atoms$get, _label$path, _label, _atomElement$node, _atomElement$node2, _this$a, _atomElement$node3, _atomElement$node4, _this$a$label, _atomElement$node5, _this$a$charge, _atomElement$node6, _this$a$isotope, _atomElement$node7, _this$a$valence, _atomElement$node8, _this$a$radical, _atomElement$node9, _this$a$ringBondCount, _atomElement$node0, _this$a$hCount, _atomElement$node1, _this$a$substitutionC, _atomElement$node10, _this$a$unsaturatedAt, _atomElement$node11, _this$a$queryProperti, _atomElement$node12, _this$a$implicitHCoun, _atomElement$node13, _this$a$queryProperti2, _atomElement$node14, _this$a$queryProperti3, _atomElement$node15, _this$a$queryProperti4, _atomElement$node16, _this$a$queryProperti5, _atomElement$node17, _this$a$invRet, _atomElement$node18, _this$a$exactChangeFl, _atomElement$node19, _this$a$queryProperti6;
      var struct = restruct.molecule;
      var atom$1 = struct.atoms.get(aid);
      if (!atom$1) {
        return;
      }
      var sgroups = struct.sgroups;
      var functionalGroups = struct.functionalGroups;
      var render = restruct.render;
      var ps = scale.Scale.modelToCanvas(this.a.pp, render.options);
      var sgroup = restruct.molecule.getGroupFromAtomId(aid);
      if (functionalGroup.FunctionalGroup.isAtomInContractedFunctionalGroup(atom$1, sgroups, functionalGroups)) {
        if (sgroup) {
          var _sgroup$getContracted = sgroup.getContractedPosition(restruct.molecule),
            contractedAtomId = _sgroup$getContracted.atomId,
            contractedPosition = _sgroup$getContracted.position;
          var isPositionAtom = contractedAtomId === aid;
          if (isPositionAtom) {
            var _sgroup$data, _ref3, _sgroup$data$name, _sgroup$data2, _path$node, _path$node2, _path$node3, _path$node4, _path$node5;
            var position = scale.Scale.modelToCanvas(contractedPosition, render.options);
            var fontFamily = options.font.substr(options.font.indexOf(' ') + 1, options.font.length);
            var superatomClass = (_sgroup$data = sgroup.data) === null || _sgroup$data === void 0 ? void 0 : _sgroup$data["class"];
            var sGroupName = (_ref3 = (_sgroup$data$name = (_sgroup$data2 = sgroup.data) === null || _sgroup$data2 === void 0 ? void 0 : _sgroup$data2.name) !== null && _sgroup$data$name !== void 0 ? _sgroup$data$name : superatomClass ? resgroup.SUPERATOM_CLASS_TEXT[superatomClass] : '') !== null && _ref3 !== void 0 ? _ref3 : '';
            var path = render.paper.text(position.x, position.y, sGroupName).attr({
              'font-weight': 700,
              'font-size': options.fontszInPx,
              'font-family': fontFamily
            });
            (_path$node = path.node) === null || _path$node === void 0 || _path$node.setAttribute('data-testid', 's-group-label');
            (_path$node2 = path.node) === null || _path$node2 === void 0 || _path$node2.setAttribute('data-label-text', sGroupName);
            (_path$node3 = path.node) === null || _path$node3 === void 0 || _path$node3.setAttribute('data-sgroup-id', sgroup.id);
            (_path$node4 = path.node) === null || _path$node4 === void 0 || _path$node4.setAttribute('data-sgroup-name', sGroupName);
            (_path$node5 = path.node) === null || _path$node5 === void 0 || _path$node5.setAttribute('data-sgroup-type', sgroup.type);
            restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, path, position, true);
          }
          return;
        }
      }
      if (atom.Atom.isHiddenLeavingGroupAtom(struct, aid)) {
        return;
      }
      this.hydrogenOnTheLeft = shouldHydrogenBeOnLeft(restruct.molecule, this);
      this.showLabel = isLabelVisible(restruct, render.options, this);
      this.color = 'black';
      var delta = 0;
      var rightMargin = 0;
      var leftMargin = 0;
      var implh = 0;
      var isHydrogen = false;
      var label;
      var index = null;
      if (this.showLabel) {
        var data = buildLabel(this, render.paper, ps, options, aid, sgroup);
        delta = 0.5 * options.lineWidth;
        label = data.label;
        rightMargin = data.rightMargin;
        leftMargin = data.leftMargin;
        implh = Math.floor(this.a.implicitH);
        isHydrogen = label.text === 'H';
        if (label.background) {
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, label.background, ps, true);
        }
        restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, label.path, ps, true);
      }
      if (options.showAtomIds) {
        var _text = aid.toString();
        var idPos = this.hydrogenOnTheLeft ? vec2.Vec2.lc(ps, 1, new vec2.Vec2({
          x: -2,
          y: 0,
          z: 0
        }), 6) : vec2.Vec2.lc(ps, 1, new vec2.Vec2({
          x: 2,
          y: 0,
          z: 0
        }), 6);
        if (this.showLabel) {
          idPos = vec2.Vec2.lc(idPos, 1, new vec2.Vec2({
            x: 1,
            y: -3,
            z: 0
          }), 6);
        }
        var _path = render.paper.text(idPos.x, idPos.y, _text).attr({
          font: options.font,
          'font-size': options.fontszsubInPx,
          fill: '#070'
        });
        var rbb = util["default"].relBox(_path.getBBox());
        draw["default"].recenterText(_path, rbb);
        index = {
          text: _text,
          path: _path,
          rbb: rbb
        };
        restruct.addReObjectPath(generalEnumTypes.LayerMap.indices, this.visel, index.path, ps);
      }
      if (this.showLabel) {
        var hydroIndex = null;
        if (isHydrogen && implh > 0) {
          hydroIndex = showHydroIndex(this, render, implh, rightMargin);
          rightMargin += hydroIndex.rbb.width + delta;
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, hydroIndex.path, ps, true);
        }
        if (this.a.radical !== 0) {
          var radical = showRadical(this, render);
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, radical.path, ps, true);
        }
        if (this.a.isotope !== null) {
          var isotope = showIsotope(this, render, leftMargin);
          leftMargin -= isotope.rbb.width + delta;
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, isotope.path, ps, true);
        }
        var isPreviewMode = options.usageInMacromolecule === render_constants.UsageInMacromolecule.MonomerPreview || options.usageInMacromolecule === render_constants.UsageInMacromolecule.BondPreview || options.usageInMacromolecule === render_constants.UsageInMacromolecule.MonomerConnectionsModal || options.usageInMacromolecule === undefined && !sgroup;
        var isLeavingGroupAtom = this.a.rglabel !== null && this.a.rglabel !== 0;
        var shouldHideHydrogenInPreview = isPreviewMode && isLeavingGroupAtom;
        if (!isHydrogen && !this.a.alias && implh > 0 && displayHydrogen(struct, this, options.showHydrogenLabels) && !shouldHideHydrogenInPreview) {
          var _data = showHydrogen(this, render, implh, {
            hydroIndex: hydroIndex,
            rightMargin: rightMargin,
            leftMargin: leftMargin
          });
          var hydrogen = _data.hydrogen;
          hydroIndex = _data.hydroIndex;
          rightMargin = _data.rightMargin;
          leftMargin = _data.leftMargin;
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, hydrogen.path, ps, true);
          if (hydroIndex != null) {
            restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, hydroIndex.path, ps, true);
          }
        }
        if (this.a.charge === 0) {
          this.a.charge = null;
        }
        if (this.a.charge && options.showCharge) {
          var charge = showCharge(this, render, rightMargin);
          rightMargin += charge.rbb.width + delta;
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, charge.path, ps, true);
        }
        if (this.a.explicitValence >= 0 && options.showValence) {
          var valence = showExplicitValence(this, render, rightMargin);
          rightMargin += valence.rbb.width + delta;
          restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, valence.path, ps, true);
        }
        if (this.a.badConn && options.showValenceWarnings) {
          var warning = showWarning(this, render, leftMargin, rightMargin);
          restruct.addReObjectPath(generalEnumTypes.LayerMap.warnings, this.visel, warning.path, ps, true);
        }
        if (index && label) {
          pathAndRBoxTranslate(index.path, index.rbb, -0.5 * label.rbb.width - 0.5 * index.rbb.width - delta, 0.3 * label.rbb.height);
        }
      }
      if (render.monomerCreationState) {
        var _render$monomerCreati2 = render.monomerCreationState,
          allAssignedAttachmentPoints = _render$monomerCreati2.assignedAttachmentPoints,
          visibleAssignedAttachmentPoints = _render$monomerCreati2.visibleAssignedAttachmentPoints,
          problematicAttachmentPoints = _render$monomerCreati2.problematicAttachmentPoints,
          problematicAtoms = _render$monomerCreati2.problematicAtoms,
          connectionAttachmentPoints = _render$monomerCreati2.connectionAttachmentPoints;
        var assignedAttachmentPoints = visibleAssignedAttachmentPoints !== null && visibleAssignedAttachmentPoints !== void 0 ? visibleAssignedAttachmentPoints : allAssignedAttachmentPoints;
        var _restruct = render.ctab;
        var _struct = _restruct.molecule;
        var _aid = _struct.atoms.keyOf(this.a);
        if (_aid !== null) {
          var _Array$from$reduce = Array.from(assignedAttachmentPoints.values()).reduce(function (acc, currentPair) {
              var attachmentAtomsIds = acc[0];
              var attachmentAtomId = currentPair[0];
              if (!attachmentAtomsIds.includes(attachmentAtomId)) {
                attachmentAtomsIds = attachmentAtomsIds.concat(attachmentAtomId);
              }
              var leavingAtomsIds = acc[1];
              var leavingAtomId = currentPair[1];
              if (!leavingAtomsIds.includes(leavingAtomId)) {
                leavingAtomsIds = leavingAtomsIds.concat(leavingAtomId);
              }
              return [attachmentAtomsIds, leavingAtomsIds];
            }, [[], []]),
            _Array$from$reduce2 = _slicedToArray__default["default"](_Array$from$reduce, 2),
            attachmentAtoms = _Array$from$reduce2[0],
            leavingGroups = _Array$from$reduce2[1];
          var style;
          if (attachmentAtoms.includes(_aid)) {
            style = {
              fill: 'none',
              stroke: '#4da3f8',
              'stroke-width': '2px'
            };
          } else if (leavingGroups.includes(_aid)) {
            style = {
              fill: '#fff8c5',
              stroke: '#f8dc8f',
              'stroke-width': '2px'
            };
          }
          if (style) {
            var _path2 = this.makeHighlightePlate(_restruct, style, -4);
            _restruct.addReObjectPath(generalEnumTypes.LayerMap.atom, this.visel, _path2);
          }
          if (problematicAtoms !== null && problematicAtoms !== void 0 && problematicAtoms.has(_aid)) {
            var _path3 = this.makeHighlightePlate(_restruct, {
              fill: 'none',
              stroke: '#F40724',
              'stroke-width': '2px'
            }, -4);
            _restruct.addReObjectPath(generalEnumTypes.LayerMap.atom, this.visel, _path3);
          }
          var attachmentPointName = Array.from(assignedAttachmentPoints.keys()).find(function (key) {
            var atomsPair = assignedAttachmentPoints.get(key);
            assert.assert(atomsPair);
            return atomsPair[1] === _aid;
          });
          if (attachmentPointName) {
            var _render$monomerCreati3;
            var atomsPair = assignedAttachmentPoints.get(attachmentPointName);
            assert.assert(atomsPair);
            var _atomsPair3 = _slicedToArray__default["default"](atomsPair, 2),
              attachmentAtomId = _atomsPair3[0],
              leavingGroupAtomId = _atomsPair3[1];
            var attachmentAtom = _struct.atoms.get(attachmentAtomId);
            var leavingGroupAtom = _struct.atoms.get(leavingGroupAtomId);
            assert.assert(attachmentAtom);
            assert.assert(leavingGroupAtom);
            var attachmentPos = attachmentAtom.pp;
            var leavingGroupPos = leavingGroupAtom.pp;
            var direction = leavingGroupPos.sub(attachmentPos).normalized();
            var shiftedPos = this.getShiftedSegmentPosition(render.options, direction, leavingGroupPos);
            var labelPos = shiftedPos.addScaled(direction, 8);
            var isProblematic = problematicAttachmentPoints.has(attachmentPointName);
            var rLabelElement = render.paper.text(labelPos.x, labelPos.y, attachmentPointName).attr({
              font: options.font,
              'font-size': options.fontszsubInPx,
              fill: isProblematic ? '#F40724' : '#333333',
              'font-weight': '700',
              cursor: 'pointer'
            });
            var selectedClass = (_render$monomerCreati3 = render.monomerCreationState) === null || _render$monomerCreati3 === void 0 ? void 0 : _render$monomerCreati3.selectedMonomerClass;
            var apTooltip = attachmentPointTooltips.getAttachmentPointTooltip(selectedClass, attachmentPointName);
            if (apTooltip) {
              addTooltip(rLabelElement.node, apTooltip);
            }
            var labelBBox = rLabelElement.getBBox();
            var bgRadius = Math.max(labelBBox.width, labelBBox.height) / 2 + 5;
            var background = render.paper.circle(labelPos.x, labelPos.y, bgRadius).attr({
              fill: '#167782',
              stroke: 'none',
              cursor: 'pointer',
              opacity: 0
            });
            if (apTooltip) {
              var _background$node;
              (_background$node = background.node) === null || _background$node === void 0 || _background$node.setAttribute('data-tooltip', apTooltip);
            }
            if (isProblematic) {
              background.attr({
                fill: 'none',
                stroke: '#F40724',
                'stroke-width': '2px',
                opacity: 1
              });
            }
            var labelGroup = render.paper.set();
            labelGroup.push(background, rLabelElement);
            labelGroup.forEach(function (element) {
              var _element$node, _element$node2;
              (_element$node = element.node) === null || _element$node === void 0 || _element$node.setAttribute('data-attachment-point-alias', attachmentPointName);
              (_element$node2 = element.node) === null || _element$node2 === void 0 || _element$node2.setAttribute('data-testid', 'monomer-attachment-point');
            });
            labelGroup.hover(
            function () {
              assert.assert(render.monomerCreationState);
              if (render.monomerCreationState.clickedAttachmentPoint === attachmentPointName || isProblematic) {
                return;
              }
              background.attr({
                opacity: 1
              });
              rLabelElement.attr({
                fill: '#ffffff'
              });
              window.dispatchEvent(new CustomEvent('highlightAttachmentPointControls', {
                detail: attachmentPointName
              }));
            },
            function () {
              assert.assert(render.monomerCreationState);
              if (render.monomerCreationState.clickedAttachmentPoint === attachmentPointName || isProblematic) {
                return;
              }
              background.attr({
                opacity: 0
              });
              rLabelElement.attr({
                fill: '#333333'
              });
              window.dispatchEvent(new CustomEvent('resetHighlightAttachmentPointControls', {
                detail: attachmentPointName
              }));
            });
            labelGroup.mousedown(function (event) {
              event.stopPropagation();
              if (event.button !== 2) {
                return;
              }
              assert.assert(render.monomerCreationState);
              render.monomerCreationState.clickedAttachmentPoint = attachmentPointName;
              background.attr({
                opacity: 1
              });
              rLabelElement.attr({
                fill: '#ffffff'
              });
            });
            _restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, labelGroup, ps, false);
          }
          if (connectionAttachmentPoints) {
            var isConnectionAtom = Array.from(connectionAttachmentPoints.values()).some(function (_ref4) {
              var _ref5 = _slicedToArray__default["default"](_ref4, 1),
                connectionAtomId = _ref5[0];
              return connectionAtomId === _aid;
            });
            if (isConnectionAtom) {
              var ringPath = this.makeHighlightePlate(_restruct, {
                fill: 'none',
                stroke: '#4da3f8',
                'stroke-width': '2px'
              }, -4);
              _restruct.addReObjectPath(generalEnumTypes.LayerMap.atom, this.visel, ringPath);
              var hitArea = render.paper.circle(ps.x, ps.y, 10).attr({
                fill: '#4da3f8',
                stroke: 'none',
                opacity: 0,
                cursor: 'pointer'
              });
              var connectionApNames = Array.from(connectionAttachmentPoints.entries()).filter(function (_ref6) {
                var _ref7 = _slicedToArray__default["default"](_ref6, 2),
                  _ref7$ = _slicedToArray__default["default"](_ref7[1], 1),
                  caid = _ref7$[0];
                return caid === _aid;
              }).map(function (_ref8) {
                var _ref9 = _slicedToArray__default["default"](_ref8, 1),
                  apName = _ref9[0];
                return apName;
              });
              hitArea.hover(function () {
                hitArea.attr({
                  opacity: 0.15
                });
                connectionApNames.forEach(function (apName) {
                  window.dispatchEvent(new CustomEvent('highlightAttachmentPointControls', {
                    detail: apName
                  }));
                });
              }, function () {
                hitArea.attr({
                  opacity: 0
                });
                connectionApNames.forEach(function (apName) {
                  window.dispatchEvent(new CustomEvent('resetHighlightAttachmentPointControls', {
                    detail: apName
                  }));
                });
              });
              _restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, hitArea, ps, false);
            }
          }
        }
      }
      this.setHover(this.hover, render);
      var stereoLabel = this.a.stereoLabel;
      var aamText = getAamText(this);
      var customQueryText = checkIsSmartPropertiesExist(this.a) ? getOnlyQueryAttributesCustomQuery(this.a) : getQueryAttrsText(this);
      var shortenCustomQueryText = customQueryText;
      var customQueryTooltipText;
      if (shortenCustomQueryText.length > MAX_LABEL_LENGTH) {
        customQueryTooltipText = shortenCustomQueryText;
        shortenCustomQueryText = "".concat(shortenCustomQueryText.substring(0, MAX_LABEL_LENGTH), "...");
      }
      var fragmentId = Number((_restruct$atoms$get = restruct.atoms.get(aid)) === null || _restruct$atoms$get === void 0 ? void 0 : _restruct$atoms$get.a.fragment);
      var fragment = restruct.molecule.frags.get(fragmentId);
      var displayStereoLabel = shouldDisplayStereoLabel(stereoLabel, options.stereoLabelStyle, options.ignoreChiralFlag, fragment === null || fragment === void 0 ? void 0 : fragment.enhancedStereoFlag);
      var text = '';
      if (displayStereoLabel) {
        text = "".concat(stereoLabel, "\n");
      }
      if (shortenCustomQueryText.length > 0) {
        text += "".concat(shortenCustomQueryText, "\n");
      }
      if (aamText.length > 0) {
        text += ".".concat(aamText, ".");
      }
      if (text.length > 0) {
        var elem = elements.Elements.get(this.a.label);
        var aamPath = render.paper.text(ps.x, ps.y, text).attr({
          font: options.font,
          'font-size': options.fontszsubInPx,
          fill: options.atomColoring && elem ? elementColor.ElementColor[this.a.label] : DEFAULT_ATOM_COLOR
        });
        if (stereoLabel) {
          var color = getStereoAtomColor(render.options, stereoLabel);
          if (color !== undefined) {
            aamPath.node.childNodes[0].setAttribute('fill', color);
          }
          var opacity = getStereoAtomOpacity(render.options, stereoLabel);
          aamPath.node.childNodes[0].setAttribute('fill-opacity', opacity);
        }
        var aamBox = util["default"].relBox(aamPath.getBBox());
        draw["default"].recenterText(aamPath, aamBox);
        var visel = this.visel;
        var t = 3;
        var dir = this.bisectLargestSector(restruct.molecule);
        var _iterator2 = _createForOfIteratorHelper(visel.exts),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var ext = _step2.value;
            t = Math.max(t, util["default"].shiftRayBox(ps, dir, ext.translate(ps)));
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        t += util["default"].shiftRayBox(ps, dir.negated(), box2Abs.Box2Abs.fromRelBox(aamBox));
        dir = dir.scaled(8 + t);
        pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
        restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, aamPath, ps, true);
        if (customQueryTooltipText) {
          addTooltip(aamPath.node, customQueryTooltipText);
        }
      }
      var highlights = restruct.molecule.highlights;
      var isHighlighted = false;
      var highlightColor = '';
      var highlightOutline = false;
      highlights.forEach(function (highlight) {
        var _highlight$atoms;
        var hasCurrentHighlight = (_highlight$atoms = highlight.atoms) === null || _highlight$atoms === void 0 ? void 0 : _highlight$atoms.includes(aid);
        isHighlighted = isHighlighted || hasCurrentHighlight;
        if (hasCurrentHighlight) {
          highlightColor = highlight.color;
          highlightOutline = highlight.outline;
        }
      });
      if (isHighlighted && !highlightOutline) {
        var _style = {
          fill: highlightColor,
          stroke: 'none'
        };
        var _path4 = this.makeHighlightePlate(restruct, _style);
        restruct.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, _path4);
      }
      if (atom$1.cip) {
        var paper = render.paper;
        var _options = render.options;
        var _ps = scale.Scale.modelToCanvas(this.a.pp, _options);
        var cipText = paper.text(_ps.x, _ps.y, "(".concat(this.a.cip, ")")).attr({
          font: _options.font,
          'font-size': Math.floor(_options.fontszInPx * 0.8),
          'pointer-events': 'none'
        });
        var cipTextBBox = cipText.getBBox();
        var rect = paper.rect(cipTextBBox.x - 1, cipTextBBox.y - 1, cipTextBBox.width + 2, cipTextBBox.height + 2, 3, 3).attr({
          stroke: 'none'
        });
        var cipGroup = paper.set();
        cipGroup.push(rect, cipText);
        var cipGroupRelBox = util["default"].relBox(cipGroup.getBBox());
        var baseDistance = 3;
        var _direction = this.bisectLargestSector(render.ctab.molecule);
        var _iterator3 = _createForOfIteratorHelper(this.visel.exts),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _ext = _step3.value;
            baseDistance = Math.max(baseDistance, util["default"].shiftRayBox(_ps, _direction, _ext.translate(_ps)));
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        var shiftDistance = baseDistance + util["default"].shiftRayBox(_ps, _direction.negated(), box2Abs.Box2Abs.fromRelBox(cipTextBBox));
        var shiftVector = _direction.scaled(3 + shiftDistance);
        pathAndRBoxTranslate(cipGroup, cipGroupRelBox, shiftVector.x, shiftVector.y);
        render.ctab.addReObjectPath(generalEnumTypes.LayerMap.additionalInfo, this.visel, cipGroup, _ps, false);
        this.cip = {
          path: cipGroup,
          text: cipText,
          rectangle: rect
        };
      }
      if (this.showLabel && this.showInfoLabel) {
        var _path5 = render.paper.text(ps.x, ps.y, this.infoLabel).attr({
          font: options.font,
          'font-size': options.fontszsubInPx * 0.75,
          fill: '#309BBF'
        });
        var bbTooltip = _path5.getBBox();
        var paddingX = 5;
        var paddingY = 2;
        var halfWidthInfoLabel = bbTooltip.width / 2 + paddingX;
        var halfHeightInfoLabel = bbTooltip.height / 2 + paddingY;
        _path5.translateAbs(rightMargin + halfWidthInfoLabel, -_path5.getBBox().height / 2 - halfHeightInfoLabel);
        var _rect = render.paper.rect(bbTooltip.x - paddingX, bbTooltip.y - paddingY, bbTooltip.width + paddingX * 2, bbTooltip.height + paddingY * 2, 6).attr({
          fill: '#CDF1FC',
          stroke: 'none'
        });
        restruct.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, [_rect, _path5], ps, true);
      }
      var atomElement = (_label$path = (_label = label) === null || _label === void 0 ? void 0 : _label.path) !== null && _label$path !== void 0 ? _label$path : this.createInvisibleAtomTarget(restruct, render, ps);
      atomElement === null || atomElement === void 0 || (_atomElement$node = atomElement.node) === null || _atomElement$node === void 0 || _atomElement$node.setAttribute('data-testid', 'atom');
      atomElement === null || atomElement === void 0 || (_atomElement$node2 = atomElement.node) === null || _atomElement$node2 === void 0 || _atomElement$node2.setAttribute('data-atom-id', restruct.molecule.atoms.keyOf((_this$a = this.a) !== null && _this$a !== void 0 ? _this$a : ''));
      atomElement === null || atomElement === void 0 || (_atomElement$node3 = atomElement.node) === null || _atomElement$node3 === void 0 || _atomElement$node3.setAttribute('data-atom-type', getAtomType(this.a));
      atomElement === null || atomElement === void 0 || (_atomElement$node4 = atomElement.node) === null || _atomElement$node4 === void 0 || _atomElement$node4.setAttribute('data-atomLabel', (_this$a$label = this.a.label) !== null && _this$a$label !== void 0 ? _this$a$label : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node5 = atomElement.node) === null || _atomElement$node5 === void 0 || _atomElement$node5.setAttribute('data-atomCharge', (_this$a$charge = this.a.charge) !== null && _this$a$charge !== void 0 ? _this$a$charge : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node6 = atomElement.node) === null || _atomElement$node6 === void 0 || _atomElement$node6.setAttribute('data-atomIsotopeAtomicMass', (_this$a$isotope = this.a.isotope) !== null && _this$a$isotope !== void 0 ? _this$a$isotope : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node7 = atomElement.node) === null || _atomElement$node7 === void 0 || _atomElement$node7.setAttribute('data-atomValence', (_this$a$valence = this.a.valence) !== null && _this$a$valence !== void 0 ? _this$a$valence : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node8 = atomElement.node) === null || _atomElement$node8 === void 0 || _atomElement$node8.setAttribute('data-atomRadical', (_this$a$radical = this.a.radical) !== null && _this$a$radical !== void 0 ? _this$a$radical : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node9 = atomElement.node) === null || _atomElement$node9 === void 0 || _atomElement$node9.setAttribute('data-atomRingBondCount', (_this$a$ringBondCount = this.a.ringBondCount) !== null && _this$a$ringBondCount !== void 0 ? _this$a$ringBondCount : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node0 = atomElement.node) === null || _atomElement$node0 === void 0 || _atomElement$node0.setAttribute('data-atomHCount', (_this$a$hCount = this.a.hCount) !== null && _this$a$hCount !== void 0 ? _this$a$hCount : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node1 = atomElement.node) === null || _atomElement$node1 === void 0 || _atomElement$node1.setAttribute('data-atomSubstitutionCount', (_this$a$substitutionC = this.a.substitutionCount) !== null && _this$a$substitutionC !== void 0 ? _this$a$substitutionC : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node10 = atomElement.node) === null || _atomElement$node10 === void 0 || _atomElement$node10.setAttribute('data-atomUnsaturated', (_this$a$unsaturatedAt = this.a.unsaturatedAtom) !== null && _this$a$unsaturatedAt !== void 0 ? _this$a$unsaturatedAt : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node11 = atomElement.node) === null || _atomElement$node11 === void 0 || _atomElement$node11.setAttribute('data-atomAromaticity', (_this$a$queryProperti = this.a.queryProperties.aromaticity) !== null && _this$a$queryProperti !== void 0 ? _this$a$queryProperti : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node12 = atomElement.node) === null || _atomElement$node12 === void 0 || _atomElement$node12.setAttribute('data-atomImplicitHCount', (_this$a$implicitHCoun = this.a.implicitHCount) !== null && _this$a$implicitHCoun !== void 0 ? _this$a$implicitHCoun : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node13 = atomElement.node) === null || _atomElement$node13 === void 0 || _atomElement$node13.setAttribute('data-atomRingMembership', (_this$a$queryProperti2 = this.a.queryProperties.ringMembership) !== null && _this$a$queryProperti2 !== void 0 ? _this$a$queryProperti2 : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node14 = atomElement.node) === null || _atomElement$node14 === void 0 || _atomElement$node14.setAttribute('data-atomRingSize', (_this$a$queryProperti3 = this.a.queryProperties.ringSize) !== null && _this$a$queryProperti3 !== void 0 ? _this$a$queryProperti3 : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node15 = atomElement.node) === null || _atomElement$node15 === void 0 || _atomElement$node15.setAttribute('data-atomConnectivity', (_this$a$queryProperti4 = this.a.queryProperties.connectivity) !== null && _this$a$queryProperti4 !== void 0 ? _this$a$queryProperti4 : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node16 = atomElement.node) === null || _atomElement$node16 === void 0 || _atomElement$node16.setAttribute('data-atomChirality', (_this$a$queryProperti5 = this.a.queryProperties.chirality) !== null && _this$a$queryProperti5 !== void 0 ? _this$a$queryProperti5 : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node17 = atomElement.node) === null || _atomElement$node17 === void 0 || _atomElement$node17.setAttribute('data-atomInversion', (_this$a$invRet = this.a.invRet) !== null && _this$a$invRet !== void 0 ? _this$a$invRet : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node18 = atomElement.node) === null || _atomElement$node18 === void 0 || _atomElement$node18.setAttribute('data-atomExactChange', (_this$a$exactChangeFl = this.a.exactChangeFlag) !== null && _this$a$exactChangeFl !== void 0 ? _this$a$exactChangeFl : '');
      atomElement === null || atomElement === void 0 || (_atomElement$node19 = atomElement.node) === null || _atomElement$node19 === void 0 || _atomElement$node19.setAttribute('data-atomCustomQuery', (_this$a$queryProperti6 = this.a.queryProperties.customQuery) !== null && _this$a$queryProperti6 !== void 0 ? _this$a$queryProperti6 : '');
    }
  }, {
    key: "getLargestSectorFromNeighbors",
    value: function getLargestSectorFromNeighbors(struct) {
      var angles = [];
      this.a.neighbors.forEach(function (halfBondId) {
        var halfBond = struct.halfBonds.get(halfBondId);
        if (halfBond) {
          angles.push(halfBond.ang);
        }
      });
      angles = angles.sort(function (a, b) {
        return a - b;
      });
      var largeAngles = [];
      var _iterator4 = _createForOfIteratorHelper(angles.entries()),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _step4$value = _slicedToArray__default["default"](_step4.value, 2),
            index = _step4$value[0],
            angle = _step4$value[1];
          if (index < angles.length - 1) {
            largeAngles.push(angles[(index + 1) % angles.length] - angle);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      largeAngles.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI);
      var largestAngle = 0;
      var neighborAngle = -Math.PI / 2;
      var _iterator5 = _createForOfIteratorHelper(angles.entries()),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _step5$value = _slicedToArray__default["default"](_step5.value, 2),
            _index = _step5$value[0],
            _angle = _step5$value[1];
          if (largeAngles[_index] > largestAngle) {
            largestAngle = largeAngles[_index];
            neighborAngle = _angle;
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return {
        neighborAngle: neighborAngle,
        largestAngle: largestAngle
      };
    }
  }, {
    key: "bisectLargestSector",
    value: function bisectLargestSector(struct) {
      var _this$getLargestSecto = this.getLargestSectorFromNeighbors(struct),
        largestAngle = _this$getLargestSecto.largestAngle,
        neighborAngle = _this$getLargestSecto.neighborAngle;
      var bisectAngle = neighborAngle + largestAngle / 2;
      return newVectorFromAngle(bisectAngle);
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReAtom;
}(reobject["default"]);
function getStereoAtomColor(options, stereoLabel) {
  if (!stereoLabel || options.colorStereogenicCenters === generalEnumTypes.StereoColoringType.Off || options.colorStereogenicCenters === generalEnumTypes.StereoColoringType.BondsOnly) {
    return DEFAULT_STEREO_COLOR;
  }
  return getColorFromStereoLabel(options, stereoLabel);
}
function getColorFromStereoLabel(options, stereoLabel) {
  var _stereoLabel$match$, _stereoLabel$match, _options$colorOfAndCe, _options$colorOfOrCen;
  var stereoLabelType = (_stereoLabel$match$ = (_stereoLabel$match = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match === void 0 ? void 0 : _stereoLabel$match[0]) !== null && _stereoLabel$match$ !== void 0 ? _stereoLabel$match$ : '';
  switch (stereoLabelType) {
    case atom.StereoLabel.And:
      return (_options$colorOfAndCe = options.colorOfAndCenters) !== null && _options$colorOfAndCe !== void 0 ? _options$colorOfAndCe : DEFAULT_STEREO_COLOR;
    case atom.StereoLabel.Or:
      return (_options$colorOfOrCen = options.colorOfOrCenters) !== null && _options$colorOfOrCen !== void 0 ? _options$colorOfOrCen : DEFAULT_STEREO_COLOR;
    case atom.StereoLabel.Abs:
      return options.colorOfAbsoluteCenters;
    default:
      return DEFAULT_STEREO_COLOR;
  }
}
function getStereoAtomOpacity(options, stereoLabel) {
  var _stereoLabel$match$2, _stereoLabel$match2;
  var stereoLabelType = (_stereoLabel$match$2 = (_stereoLabel$match2 = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match2 === void 0 ? void 0 : _stereoLabel$match2[0]) !== null && _stereoLabel$match$2 !== void 0 ? _stereoLabel$match$2 : '';
  var stereoLabelNumber = +stereoLabel.replace(stereoLabelType, '');
  if (!options.autoFadeOfStereoLabels || stereoLabelType === atom.StereoLabel.Abs || options.colorStereogenicCenters === generalEnumTypes.StereoColoringType.Off || options.colorStereogenicCenters === generalEnumTypes.StereoColoringType.BondsOnly) {
    return 1;
  }
  return Math.max(1 - (stereoLabelNumber - 1) / 10, StereoLabelMinOpacity);
}
function shouldDisplayStereoLabel(stereoLabel, labelStyle, ignoreChiralFlag, flag) {
  var _stereoLabel$match$3, _stereoLabel$match3;
  if (!stereoLabel) {
    return false;
  }
  var stereoLabelType = (_stereoLabel$match$3 = (_stereoLabel$match3 = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match3 === void 0 ? void 0 : _stereoLabel$match3[0]) !== null && _stereoLabel$match$3 !== void 0 ? _stereoLabel$match$3 : '';
  if (ignoreChiralFlag && stereoLabelType === atom.StereoLabel.Abs) {
    return false;
  }
  if (ignoreChiralFlag && stereoLabelType !== atom.StereoLabel.Abs) {
    return true;
  }
  switch (labelStyle) {
    case generalEnumTypes.StereoLabelStyleType.Off:
      return false;
    case generalEnumTypes.StereoLabelStyleType.On:
      return true;
    case generalEnumTypes.StereoLabelStyleType.Classic:
      return !!(flag === fragment.StereoFlag.Mixed || stereoLabelType === atom.StereoLabel.Or);
    case generalEnumTypes.StereoLabelStyleType.IUPAC:
      return !!(flag === fragment.StereoFlag.Mixed && stereoLabelType !== atom.StereoLabel.Abs);
    default:
      return true;
  }
}
function isLabelVisible(restruct, options, atom) {
  var isAttachmentPointAtom = Boolean(atom.a.attachmentPoints);
  var isCarbon = atom.a.label.toLowerCase() === 'c';
  var visibleNeighbors = getVisibleNeighborHalfBondIds(restruct.molecule, atom);
  var visibleTerminal = options.showHydrogenLabels !== showHydrogenLabels.ShowHydrogenLabels.Off && options.showHydrogenLabels !== showHydrogenLabels.ShowHydrogenLabels.Hetero;
  var neighborsLength = visibleNeighbors.length === 0 || visibleNeighbors.length < 2 && visibleTerminal;
  if (isAttachmentPointAtom && isCarbon) {
    return false;
  }
  var shouldBeVisible = neighborsLength || options.carbonExplicitly || options.showHydrogenLabels === showHydrogenLabels.ShowHydrogenLabels.On || atom.a.alias || atom.a.isotope !== null || atom.a.radical !== 0 || atom.a.charge !== null || atom.a.explicitValence >= 0 || atom.a.atomList !== null || atom.a.rglabel !== null || atom.a.badConn && options.showValenceWarnings || atom.a.label.toLowerCase() !== 'c';
  if (shouldBeVisible) return true;
  if (visibleNeighbors.length === 2) {
    var nei1 = visibleNeighbors[0];
    var nei2 = visibleNeighbors[1];
    var hb1 = restruct.molecule.halfBonds.get(nei1);
    var hb2 = restruct.molecule.halfBonds.get(nei2);
    if (!hb1 || !hb2) return false;
    var bond1 = restruct.bonds.get(hb1.bid);
    var bond2 = restruct.bonds.get(hb2.bid);
    if (!bond1 || !bond2) return false;
    var sameNotStereo = bond1.b.type === bond2.b.type && bond1.b.stereo === bond.Bond.PATTERN.STEREO.NONE && bond2.b.stereo === bond.Bond.PATTERN.STEREO.NONE;
    if (sameNotStereo && Math.abs(vec2.Vec2.cross(hb1.dir, hb2.dir)) < 0.2) {
      return true;
    }
  }
  return false;
}
function displayHydrogen(struct, atom, hydrogenLabels) {
  var _atom$label, _atom$label2;
  var visibleNeighbors = getVisibleNeighborHalfBondIds(struct, atom);
  return hydrogenLabels === showHydrogenLabels.ShowHydrogenLabels.On || hydrogenLabels === showHydrogenLabels.ShowHydrogenLabels.Terminal && visibleNeighbors.length < 2 || hydrogenLabels === showHydrogenLabels.ShowHydrogenLabels.Hetero && ((_atom$label = atom.label) === null || _atom$label === void 0 ? void 0 : _atom$label.text.toLowerCase()) !== 'c' || hydrogenLabels === showHydrogenLabels.ShowHydrogenLabels.TerminalAndHetero && (visibleNeighbors.length < 2 || ((_atom$label2 = atom.label) === null || _atom$label2 === void 0 ? void 0 : _atom$label2.text.toLowerCase()) !== 'c');
}
function shouldHydrogenBeOnLeft(struct, atom) {
  var visibleNeighbors = getVisibleNeighborHalfBondIds(struct, atom);
  if (visibleNeighbors.length === 0) {
    if (atom.a.label === 'D' || atom.a.label === 'T') {
      return false;
    } else {
      var element = elements.Elements.get(atom.a.label);
      return !element || Boolean(element.leftH);
    }
  }
  if (visibleNeighbors.length === 1) {
    var _neighborHalfBond$dir;
    var neighbor = visibleNeighbors[0];
    var neighborHalfBond = struct.halfBonds.get(neighbor);
    var neighborDirX = (_neighborHalfBond$dir = neighborHalfBond === null || neighborHalfBond === void 0 ? void 0 : neighborHalfBond.dir.x) !== null && _neighborHalfBond$dir !== void 0 ? _neighborHalfBond$dir : 0;
    return neighborDirX > 0;
  }
  return false;
}
function getVisibleNeighborHalfBondIds(struct, atom) {
  return atom.a.neighbors.filter(function (neighborHalfBondId) {
    var halfBond = struct.halfBonds.get(neighborHalfBondId);
    if (!halfBond) {
      return false;
    }
    var bond$1 = struct.bonds.get(halfBond.bid);
    return !bond$1 || !bond.Bond.isBondToHiddenLeavingGroup(struct, bond$1);
  });
}
function getOnlyQueryAttributesCustomQuery(atom) {
  var _atom$queryProperties;
  var queryText = (_atom$queryProperties = atom.queryProperties.customQuery) !== null && _atom$queryProperties !== void 0 ? _atom$queryProperties : getAtomCustomQuery(atom, true);
  return queryText;
}
function addTooltip(node, text) {
  var tooltip = text.split(/(?<=[;,])/).join(' ');
  node.childNodes[0].setAttribute('data-tooltip', util["default"].escapeHtml(tooltip));
}
function buildLabel(atom, paper, ps, options, atomId, sgroup) {
  var _connectedMonomerAtta;
  var atomColoring = options.atomColoring,
    font = options.font,
    fontszInPx = options.fontszInPx,
    currentlySelectedMonomerAttachmentPoint = options.currentlySelectedMonomerAttachmentPoint,
    connectedMonomerAttachmentPoints = options.connectedMonomerAttachmentPoints,
    usageInMacromolecule = options.usageInMacromolecule;
  var text = getLabelText(atom.a, atomId, sgroup, options) || 'R#';
  var tooltip = null;
  if (text === atom.a.label) {
    var element = elements.Elements.get(text);
    if (atomColoring && element) {
      var _ElementColor$text;
      atom.color = (_ElementColor$text = elementColor.ElementColor[text]) !== null && _ElementColor$text !== void 0 ? _ElementColor$text : DEFAULT_ATOM_COLOR;
    }
  }
  var shouldStyleLabel = usageInMacromolecule !== undefined;
  var isMonomerAttachmentPoint = monomers.attachmentPointNames.includes(text);
  var isMonomerAttachmentPointSelected = currentlySelectedMonomerAttachmentPoint === text;
  var isMonomerAttachmentPointUsed = (_connectedMonomerAtta = connectedMonomerAttachmentPoints === null || connectedMonomerAttachmentPoints === void 0 ? void 0 : connectedMonomerAttachmentPoints.includes(text)) !== null && _connectedMonomerAtta !== void 0 ? _connectedMonomerAtta : false;
  var _util$useLabelStyles = util["default"].useLabelStyles(isMonomerAttachmentPointSelected, isMonomerAttachmentPointUsed, usageInMacromolecule !== null && usageInMacromolecule !== void 0 ? usageInMacromolecule : render_constants.UsageInMacromolecule.MonomerConnectionsModal),
    color = _util$useLabelStyles.color,
    fill = _util$useLabelStyles.fill,
    stroke = _util$useLabelStyles.stroke;
  if (isMonomerAttachmentPoint && shouldStyleLabel) {
    atom.color = color;
  }
  if (text.length > MAX_LABEL_LENGTH) {
    tooltip = text;
    text = "".concat(text.substring(0, 8), "...");
  }
  var previewOpacity = options.previewOpacity;
  if (text === '*') {
    ps.x = ps.x - 1;
    ps.y = ps.y + 3;
  }
  var path = paper.text(ps.x, ps.y, text).attr({
    font: font,
    'font-size': fontszInPx,
    fill: atom.color,
    'font-style': atom.a.pseudo ? 'italic' : '',
    'fill-opacity': atom.a.isPreview ? previewOpacity : 1
  });
  var background = isMonomerAttachmentPoint && shouldStyleLabel ? paper.rect(ps.x - fontszInPx * 2 / 2, ps.y - fontszInPx * 2 / 2, fontszInPx * 2, fontszInPx * 2, 10).attr({
    fill: fill
  }).attr({
    stroke: stroke
  }) : undefined;
  if (tooltip) {
    addTooltip(path.node, tooltip);
  }
  var rbb = util["default"].relBox(path.getBBox());
  draw["default"].recenterText(path, rbb);
  var rightMargin = rbb.width / 2 * (options.zoom > 1 ? 1 : options.zoom);
  var leftMargin = -rbb.width / 2 * (options.zoom > 1 ? 1 : options.zoom);
  if (atom.a.atomList !== null) {
    var xShift = (atom.hydrogenOnTheLeft ? -1 : 1) * (rbb.width - rbb.height) / 2;
    pathAndRBoxTranslate(path, rbb, xShift, 0);
    rightMargin += xShift;
    leftMargin += xShift;
  }
  var label = {
    text: text,
    path: path,
    rbb: rbb,
    background: background
  };
  atom.label = label;
  return {
    label: label,
    rightMargin: rightMargin,
    leftMargin: leftMargin
  };
}
function getLabelText(atom$1, atomId, sgroup, options) {
  if (sgroup !== null && sgroup !== void 0 && sgroup.isSuperatomWithoutLabel) {
    var attachmentPoint = sgroup.getAttachmentPoints().find(function (attachmentPoint) {
      return attachmentPoint.leaveAtomId === atomId;
    });
    if (attachmentPoint !== null && attachmentPoint !== void 0 && attachmentPoint.attachmentPointNumber) {
      var result = attachmentPointCalculations.getAttachmentPointLabel(attachmentPoint.attachmentPointNumber);
      return result;
    }
  }
  if (atom$1.atomList !== null) return atom$1.atomList.label();
  if (atom$1.pseudo) return atom$1.pseudo;
  if (atom$1.alias) return atom$1.alias;
  if (atom$1.label && atom$1.rglabel !== null && sgroup instanceof monomerMicromolecule.MonomerMicromolecule) {
    var isExpandMode = (options === null || options === void 0 ? void 0 : options.usageInMacromolecule) === undefined && sgroup;
    if (isExpandMode) {
      return atom$1.label;
    }
  }
  if (atom$1.label && atom$1.rglabel !== null) {
    var text = '';
    var rglabelNum = atom$1.rglabel;
    for (var rgi = 0; rgi < 32; rgi++) {
      if (rglabelNum & 1 << rgi) {
        text += 'R' + (rgi + 1).toString();
      }
    }
    if (sgroup instanceof monomerMicromolecule.MonomerMicromolecule && atom.Atom.isSuperatomLeavingGroupAtom(sgroup, atomId)) {
      var _sgroup$monomer$monom, _sgroup$monomer;
      text = (_sgroup$monomer$monom = sgroup === null || sgroup === void 0 || (_sgroup$monomer = sgroup.monomer) === null || _sgroup$monomer === void 0 || (_sgroup$monomer = _sgroup$monomer.monomerItem) === null || _sgroup$monomer === void 0 || (_sgroup$monomer = _sgroup$monomer.props) === null || _sgroup$monomer === void 0 || (_sgroup$monomer = _sgroup$monomer.MonomerCaps) === null || _sgroup$monomer === void 0 ? void 0 : _sgroup$monomer[text]) !== null && _sgroup$monomer$monom !== void 0 ? _sgroup$monomer$monom : text;
    }
    return text;
  }
  return atom$1.label;
}
function showHydroIndex(atom, render, implh, rightMargin) {
  var _atom$label$rbb$heigh, _atom$label3;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var options = render.options;
  var delta = 0.5 * options.lineWidth;
  var text = (implh + 1).toString();
  var path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color
  });
  var rbb = util["default"].relBox(path.getBBox());
  draw["default"].recenterText(path, rbb);
  var labelHeight = (_atom$label$rbb$heigh = (_atom$label3 = atom.label) === null || _atom$label3 === void 0 ? void 0 : _atom$label3.rbb.height) !== null && _atom$label$rbb$heigh !== void 0 ? _atom$label$rbb$heigh : 0;
  pathAndRBoxTranslate(path, rbb, rightMargin + 0.5 * rbb.width + delta, 0.2 * labelHeight);
  return {
    text: text,
    path: path,
    rbb: rbb
  };
}
function showRadical(atom, render) {
  var _atom$label$rbb$heigh2, _atom$label4;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var options = render.options;
  var paper = render.paper;
  var path = paper.set();
  var hshift;
  switch (atom.a.radical) {
    case 1:
      path = paper.set();
      hshift = 1.6 * options.lineWidth;
      path.push(draw["default"].radicalBullet(paper, ps.add(new vec2.Vec2(-hshift, 0)), options), draw["default"].radicalBullet(paper, ps.add(new vec2.Vec2(hshift, 0)), options));
      path.attr('fill', atom.color);
      break;
    case 2:
      path = paper.set();
      path.push(draw["default"].radicalBullet(paper, ps, options));
      path.attr('fill', atom.color);
      break;
    case 3:
      path = paper.set();
      hshift = 1.6 * options.lineWidth;
      path.push(draw["default"].radicalCap(paper, ps.add(new vec2.Vec2(-hshift, 0)), options), draw["default"].radicalCap(paper, ps.add(new vec2.Vec2(hshift, 0)), options));
      path.attr('stroke', atom.color);
      break;
  }
  var rbb = util["default"].relBox(path.getBBox());
  var labelHeight = (_atom$label$rbb$heigh2 = (_atom$label4 = atom.label) === null || _atom$label4 === void 0 ? void 0 : _atom$label4.rbb.height) !== null && _atom$label$rbb$heigh2 !== void 0 ? _atom$label$rbb$heigh2 : 0;
  var vshift = -0.5 * (labelHeight + rbb.height);
  if (atom.a.radical === 3) vshift -= options.lineWidth / 2;
  pathAndRBoxTranslate(path, rbb, 0, vshift);
  return {
    path: path,
    rbb: rbb
  };
}
function showIsotope(atom, render, leftMargin) {
  var _atom$a$isotope$toStr, _atom$a$isotope, _atom$label$rbb$heigh3, _atom$label5;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var options = render.options;
  var delta = 0.5 * options.lineWidth;
  var text = (_atom$a$isotope$toStr = (_atom$a$isotope = atom.a.isotope) === null || _atom$a$isotope === void 0 ? void 0 : _atom$a$isotope.toString()) !== null && _atom$a$isotope$toStr !== void 0 ? _atom$a$isotope$toStr : '';
  var path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color
  });
  var rbb = util["default"].relBox(path.getBBox());
  draw["default"].recenterText(path, rbb);
  pathAndRBoxTranslate(path, rbb, leftMargin - 0.5 * rbb.width - delta, -0.3 * ((_atom$label$rbb$heigh3 = (_atom$label5 = atom.label) === null || _atom$label5 === void 0 ? void 0 : _atom$label5.rbb.height) !== null && _atom$label$rbb$heigh3 !== void 0 ? _atom$label$rbb$heigh3 : 0));
  return {
    text: text,
    path: path,
    rbb: rbb
  };
}
function showCharge(atom, render, rightMargin) {
  var _atom$label$rbb$heigh4, _atom$label6;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var options = render.options;
  var delta = 0.5 * options.lineWidth;
  var text = '';
  if (atom.a.charge !== null) {
    var absCharge = Math.abs(atom.a.charge);
    if (absCharge !== 1) text = absCharge.toString();
    if (atom.a.charge < 0) text += "\u2013";else text += '+';
  }
  var path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color
  });
  var rbb = util["default"].relBox(path.getBBox());
  draw["default"].recenterText(path, rbb);
  pathAndRBoxTranslate(path, rbb, rightMargin + 0.5 * rbb.width + delta, -0.3 * ((_atom$label$rbb$heigh4 = (_atom$label6 = atom.label) === null || _atom$label6 === void 0 ? void 0 : _atom$label6.rbb.height) !== null && _atom$label$rbb$heigh4 !== void 0 ? _atom$label$rbb$heigh4 : 0));
  return {
    text: text,
    path: path,
    rbb: rbb
  };
}
function showExplicitValence(atom, render, rightMargin) {
  var _atom$label$rbb$heigh5, _atom$label7;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var options = render.options;
  var delta = 0.5 * options.lineWidth;
  var baseText = constants.VALENCE_MAP[atom.a.explicitValence];
  if (!baseText) {
    throw new Error('invalid valence ' + atom.a.explicitValence.toString());
  }
  var text = '(' + baseText + ')';
  var path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color
  });
  var rbb = util["default"].relBox(path.getBBox());
  draw["default"].recenterText(path, rbb);
  pathAndRBoxTranslate(path, rbb, rightMargin + 0.5 * rbb.width + delta, -0.3 * ((_atom$label$rbb$heigh5 = (_atom$label7 = atom.label) === null || _atom$label7 === void 0 ? void 0 : _atom$label7.rbb.height) !== null && _atom$label$rbb$heigh5 !== void 0 ? _atom$label$rbb$heigh5 : 0));
  return {
    text: text,
    path: path,
    rbb: rbb
  };
}
function showHydrogen(atom, render, implh, data) {
  var hydroIndex = data.hydroIndex;
  var hydrogenLeft = atom.hydrogenOnTheLeft;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var options = render.options;
  var delta = 0.5 * options.lineWidth;
  var hydrogenText = 'H';
  var hydrogenPath = render.paper.text(ps.x, ps.y, hydrogenText).attr({
    font: options.font,
    'font-size': options.fontszInPx,
    fill: atom.color
  });
  var hydrogenRbb = util["default"].relBox(hydrogenPath.getBBox());
  draw["default"].recenterText(hydrogenPath, hydrogenRbb);
  if (!hydrogenLeft) {
    pathAndRBoxTranslate(hydrogenPath, hydrogenRbb, data.rightMargin + 0.35 * hydrogenRbb.width + delta, 0);
    data.rightMargin += hydrogenRbb.width + delta;
  }
  if (implh > 1) {
    var hydroIndexText = implh.toString();
    var hydroIndexPath = render.paper.text(ps.x, ps.y, hydroIndexText).attr({
      font: options.font,
      'font-size': options.fontszsubInPx,
      fill: atom.color
    });
    var hydroIndexRbb = util["default"].relBox(hydroIndexPath.getBBox());
    draw["default"].recenterText(hydroIndexPath, hydroIndexRbb);
    hydroIndex = {
      text: hydroIndexText,
      path: hydroIndexPath,
      rbb: hydroIndexRbb
    };
    if (!hydrogenLeft) {
      var _atom$label$rbb$heigh6, _atom$label8;
      pathAndRBoxTranslate(hydroIndexPath, hydroIndexRbb, data.rightMargin + 0.15 * hydroIndexRbb.width * (options.zoom > 1 ? 1 : options.zoom) + delta, 0.2 * ((_atom$label$rbb$heigh6 = (_atom$label8 = atom.label) === null || _atom$label8 === void 0 ? void 0 : _atom$label8.rbb.height) !== null && _atom$label$rbb$heigh6 !== void 0 ? _atom$label$rbb$heigh6 : 0));
      data.rightMargin += hydroIndexRbb.width + delta;
    }
  }
  if (hydrogenLeft) {
    if (hydroIndex != null) {
      var _atom$label$rbb$heigh7, _atom$label9;
      pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb, data.leftMargin - 0.4 * hydroIndex.rbb.width - delta, 0.2 * ((_atom$label$rbb$heigh7 = (_atom$label9 = atom.label) === null || _atom$label9 === void 0 ? void 0 : _atom$label9.rbb.height) !== null && _atom$label$rbb$heigh7 !== void 0 ? _atom$label$rbb$heigh7 : 0));
      data.leftMargin -= hydroIndex.rbb.width + delta;
    }
    pathAndRBoxTranslate(hydrogenPath, hydrogenRbb, data.leftMargin - 0.4 * hydrogenRbb.width * (implh > 1 && options.zoom < 1 ? options.zoom : 1) - delta, 0);
    data.leftMargin -= hydrogenRbb.width + delta;
  }
  var hydrogen = {
    text: hydrogenText,
    path: hydrogenPath,
    rbb: hydrogenRbb
  };
  return Object.assign(data, {
    hydrogen: hydrogen,
    hydroIndex: hydroIndex
  });
}
function showWarning(atom, render, leftMargin, rightMargin) {
  var _atom$label$rbb$heigh8, _atom$label0;
  var ps = scale.Scale.modelToCanvas(atom.a.pp, render.options);
  var delta = 0.5 * render.options.lineWidth;
  var labelHeight = (_atom$label$rbb$heigh8 = (_atom$label0 = atom.label) === null || _atom$label0 === void 0 ? void 0 : _atom$label0.rbb.height) !== null && _atom$label$rbb$heigh8 !== void 0 ? _atom$label$rbb$heigh8 : 0;
  var y = ps.y + labelHeight / 2 + delta;
  var path = render.paper.path('M{0},{1}L{2},{3}', toFixed.toFixed(ps.x + leftMargin), toFixed.toFixed(y), toFixed.toFixed(ps.x + rightMargin), toFixed.toFixed(y)).attr(render.options.lineattr).attr({
    stroke: '#F00'
  });
  var rbb = util["default"].relBox(path.getBBox());
  return {
    path: path,
    rbb: rbb
  };
}
function getAamText(atom) {
  var aamText = '';
  if (atom.a.aam > 0) aamText += atom.a.aam;
  if (atom.a.invRet > 0) {
    if (aamText.length > 0) aamText += ',';
    if (atom.a.invRet === 1) aamText += 'Inv';else if (atom.a.invRet === 2) aamText += 'Ret';else throw new Error('Invalid value for the invert/retain flag');
  }
  if (atom.a.exactChangeFlag > 0) {
    if (aamText.length > 0) aamText += ',';
    if (atom.a.exactChangeFlag === 1) aamText += 'ext';else throw new Error('Invalid value for the exact change flag');
  }
  return aamText;
}
function getRingBondCountAttrText(value) {
  var attrText;
  if (value > 0) {
    attrText = 'rb' + value.toString();
  } else if (value === -1) {
    attrText = 'rb0';
  } else if (value === -2) {
    attrText = 'rb*';
  } else {
    throw new Error('Ring bond count invalid');
  }
  return attrText;
}
function getRingConnectivity(value) {
  if (value > 0) {
    return 'x' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'x0';
  } else {
    return '';
  }
}
function getDegree(value) {
  if (value > 0) {
    return 'D' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'D0';
  } else {
    return '';
  }
}
function getSubstitutionCountAttrText(value) {
  var attrText;
  if (value > 0) {
    attrText = 's' + value.toString();
  } else if (value === -1) {
    attrText = 's0';
  } else if (value === -2) {
    attrText = 's*';
  } else {
    throw new Error('Substitution count invalid');
  }
  return attrText;
}
var EXCLUDED_QUERY_ATTRIBUTES = ['charge', 'explicitValence', 'isotope'];
var atomCustomQueryPatterns = [{
  propertyName: 'isotope',
  getValue: function getValue(atom) {
    return atom.isotope;
  },
  format: function format(value) {
    return value;
  }
}, {
  propertyName: 'aromaticity',
  getValue: function getValue(atom) {
    var _ref0, _atom$queryProperties2, _atom$queryProperties3;
    return (_ref0 = (_atom$queryProperties2 = (_atom$queryProperties3 = atom.queryProperties) === null || _atom$queryProperties3 === void 0 ? void 0 : _atom$queryProperties3.aromaticity) !== null && _atom$queryProperties2 !== void 0 ? _atom$queryProperties2 : atom.aromaticity) !== null && _ref0 !== void 0 ? _ref0 : null;
  },
  format: function format(value) {
    return value === 'aromatic' ? 'a' : 'A';
  }
}, {
  propertyName: 'charge',
  getValue: function getValue(atom) {
    return atom.charge;
  },
  format: function format(value) {
    if (value === '') return value;
    var regExpResult = /^([+-]?)(\d{1,3}|1000)([+-]?)$/.exec(value);
    var charge = regExpResult ? parseInt(regExpResult[1] + regExpResult[3] + regExpResult[2]).toString() : value;
    return !charge.startsWith('-') ? "+".concat(charge) : charge;
  }
}, {
  propertyName: 'unsaturatedAtom',
  getValue: function getValue(atom) {
    return atom.unsaturatedAtom;
  },
  format: function format(value) {
    return value === 'true' || Number(value) === 1 ? 'u' : '';
  }
}, {
  propertyName: 'explicitValence',
  getValue: function getValue(atom) {
    return atom.explicitValence;
  },
  format: function format(value) {
    return Number(value) !== -1 ? "v".concat(value) : '';
  }
}, {
  propertyName: 'ringBondCount',
  getValue: function getValue(atom) {
    return atom.ringBondCount;
  },
  format: function format(value) {
    return getRingConnectivity(Number(value));
  }
}, {
  propertyName: 'substitutionCount',
  getValue: function getValue(atom) {
    return atom.substitutionCount;
  },
  format: function format(value) {
    return getDegree(Number(value));
  }
}, {
  propertyName: 'hCount',
  getValue: function getValue(atom) {
    return atom.hCount;
  },
  format: function format(value) {
    return Number(value) > 0 ? 'H' + (Number(value) - 1).toString() : '';
  }
}, {
  propertyName: 'implicitHCount',
  getValue: function getValue(atom) {
    return atom.implicitHCount;
  },
  format: function format(value) {
    return "h".concat(value);
  }
}, {
  propertyName: 'ringMembership',
  getValue: function getValue(atom) {
    var _ref1, _atom$queryProperties4, _atom$queryProperties5;
    return (_ref1 = (_atom$queryProperties4 = (_atom$queryProperties5 = atom.queryProperties) === null || _atom$queryProperties5 === void 0 ? void 0 : _atom$queryProperties5.ringMembership) !== null && _atom$queryProperties4 !== void 0 ? _atom$queryProperties4 : atom.ringMembership) !== null && _ref1 !== void 0 ? _ref1 : null;
  },
  format: function format(value) {
    return "R".concat(value);
  }
}, {
  propertyName: 'ringSize',
  getValue: function getValue(atom) {
    var _ref10, _atom$queryProperties6, _atom$queryProperties7;
    return (_ref10 = (_atom$queryProperties6 = (_atom$queryProperties7 = atom.queryProperties) === null || _atom$queryProperties7 === void 0 ? void 0 : _atom$queryProperties7.ringSize) !== null && _atom$queryProperties6 !== void 0 ? _atom$queryProperties6 : atom.ringSize) !== null && _ref10 !== void 0 ? _ref10 : null;
  },
  format: function format(value) {
    return "r".concat(value);
  }
}, {
  propertyName: 'connectivity',
  getValue: function getValue(atom) {
    var _ref11, _atom$queryProperties8, _atom$queryProperties9;
    return (_ref11 = (_atom$queryProperties8 = (_atom$queryProperties9 = atom.queryProperties) === null || _atom$queryProperties9 === void 0 ? void 0 : _atom$queryProperties9.connectivity) !== null && _atom$queryProperties8 !== void 0 ? _atom$queryProperties8 : atom.connectivity) !== null && _ref11 !== void 0 ? _ref11 : null;
  },
  format: function format(value) {
    return "X".concat(value);
  }
}, {
  propertyName: 'chirality',
  getValue: function getValue(atom) {
    var _ref12, _atom$queryProperties0, _atom$queryProperties1;
    return (_ref12 = (_atom$queryProperties0 = (_atom$queryProperties1 = atom.queryProperties) === null || _atom$queryProperties1 === void 0 ? void 0 : _atom$queryProperties1.chirality) !== null && _atom$queryProperties0 !== void 0 ? _atom$queryProperties0 : atom.chirality) !== null && _ref12 !== void 0 ? _ref12 : null;
  },
  format: function format(value) {
    return value === 'clockwise' ? '@@' : '@';
  }
}];
function getAtomType(atom) {
  if (atom.atomList) {
    return 'list';
  }
  if (atom.pseudo === atom.label) {
    return 'pseudo';
  }
  return 'single';
}
function checkIsSmartPropertiesExist(atom) {
  var smartsSpecificProperties = ['ringMembership', 'ringSize', 'connectivity', 'chirality', 'aromaticity', 'customQuery'];
  return atom.implicitHCount !== null || smartsSpecificProperties.some(function (name) {
    var _atom$queryProperties10;
    var value = (_atom$queryProperties10 = atom.queryProperties) === null || _atom$queryProperties10 === void 0 ? void 0 : _atom$queryProperties10[name];
    return Boolean(value) || value === 0;
  });
}
function getAtomCustomQuery(atom, includeOnlyQueryAttributes) {
  var queryAttrsText = '';
  var addSemicolon = function addSemicolon() {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };
  var _iterator6 = _createForOfIteratorHelper(atomCustomQueryPatterns),
    _step6;
  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var _step6$value = _step6.value,
        propertyName = _step6$value.propertyName,
        getValue = _step6$value.getValue,
        format = _step6$value.format;
      if (includeOnlyQueryAttributes && EXCLUDED_QUERY_ATTRIBUTES.includes(propertyName)) {
        continue;
      }
      var value = getValue(atom);
      if (value === null || value === undefined) {
        continue;
      }
      var attrText = format(String(value));
      if (attrText) {
        addSemicolon();
      }
      queryAttrsText += attrText;
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
  return queryAttrsText;
}
function getQueryAttrsText(atom) {
  var queryAttrsText = '';
  var addSemicolon = function addSemicolon() {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };
  var _atom$a = atom.a,
    ringBondCount = _atom$a.ringBondCount,
    substitutionCount = _atom$a.substitutionCount,
    unsaturatedAtom = _atom$a.unsaturatedAtom,
    hCount = _atom$a.hCount;
  if (ringBondCount !== 0) {
    queryAttrsText += getRingBondCountAttrText(ringBondCount);
  }
  if (substitutionCount !== 0) {
    addSemicolon();
    queryAttrsText += getSubstitutionCountAttrText(substitutionCount);
  }
  if (unsaturatedAtom > 0) {
    addSemicolon();
    if (unsaturatedAtom === 1) queryAttrsText += 'u';else throw new Error('Unsaturated atom invalid value');
  }
  if (hCount > 0) {
    addSemicolon();
    queryAttrsText += 'H' + (hCount - 1).toString();
  }
  return queryAttrsText;
}
function pathAndRBoxTranslate(path, rbb, x, y) {
  path.translateAbs(x, y);
  rbb.x += x;
  rbb.y += y;
}
function newVectorFromAngle(angle) {
  return new vec2.Vec2(Math.cos(angle), Math.sin(angle));
}

exports.checkIsSmartPropertiesExist = checkIsSmartPropertiesExist;
exports["default"] = ReAtom;
exports.getAtomCustomQuery = getAtomCustomQuery;
exports.getAtomType = getAtomType;
exports.getColorFromStereoLabel = getColorFromStereoLabel;
//# sourceMappingURL=reatom.js.map
