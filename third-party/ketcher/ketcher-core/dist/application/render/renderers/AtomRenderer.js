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
var editorSingleton = require('../../editor/editorSingleton.js');
var BaseRenderer = require('./BaseRenderer.js');
var CoreAtom = require('../../../domain/entities/CoreAtom.js');
var coordinates = require('../../editor/shared/coordinates.js');
var ketcherProvider = require('../../ketcherProvider.js');
var elementColor = require('../../../domain/constants/elementColor.js');
var elements = require('../../../domain/constants/elements.js');
var element_types = require('../../../domain/constants/element.types.js');
require('../../../domain/constants/generics.js');
require('../../../domain/constants/chains.js');
require('../../../domain/constants/monomers.js');
var constants$1 = require('../restruct/constants.js');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var vec2 = require('../../../domain/entities/vec2.js');
var atom = require('../../../domain/entities/atom.js');
var generalEnumTypes = require('../restruct/generalEnumTypes.js');
var fragment = require('../../../domain/entities/fragment.js');
var util = require('../util.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var assert = require('../../../utilities/assert.js');
var constants = require('./constants.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
var isGenericAtom = require('../../../domain/helpers/isGenericAtom.js');
require('../../../domain/helpers/attachmentPointCalculations.js');

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

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var LABEL_CLEARANCE_OFFSET = 5;
var STEREO_CIP_GAP = 2;
var MAX_LABEL_LENGTH = 8;
var AtomRenderer = function (_BaseRenderer) {
  _inherits__default["default"](AtomRenderer, _BaseRenderer);
  function AtomRenderer(atom) {
    var _this;
    _classCallCheck__default["default"](this, AtomRenderer);
    _this = _callSuper(this, AtomRenderer, [atom]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "atom", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "textElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "radicalElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "cipLabelElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "stereoLabelElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "badValenceElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "cipLabelElementBBox", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "cipTextElementBBox", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "stereoLabelElementBBox", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "stereoTextElementBBox", void 0);
    _this.atom = atom;
    atom.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](AtomRenderer, [{
    key: "scaledPosition",
    get: function get() {
      return coordinates.Coordinates.modelToCanvas(this.atom.position);
    }
  }, {
    key: "center",
    get: function get() {
      return this.scaledPosition;
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this$atom$atomIdInMi,
        _this$atom$label,
        _this$atom$properties,
        _this$atom$properties2,
        _this$atom$properties3,
        _this$atom$properties4,
        _this2 = this;
      var editor = editorSingleton.provideEditorInstance();
      var _this$atom$calculateV = this.atom.calculateValence(),
        hydrogenAmount = _this$atom$calculateV.hydrogenAmount;
      var atomId = (_this$atom$atomIdInMi = this.atom.atomIdInMicroMode) !== null && _this$atom$atomIdInMi !== void 0 ? _this$atom$atomIdInMi : this.atom.id;
      var rootElement = this.canvas.insert('g', ':first-child').data([this]).attr('pointer-events', 'all').attr('data-testid', 'atom').attr('data-atomalias', this.atom.label).attr('data-atomid', this.atom.id).attr('data-atom-id', atomId).attr('data-atom-type', 'single').attr('data-atomLabel', (_this$atom$label = this.atom.label) !== null && _this$atom$label !== void 0 ? _this$atom$label : '').attr('data-atomCharge', (_this$atom$properties = this.atom.properties.charge) !== null && _this$atom$properties !== void 0 ? _this$atom$properties : '').attr('data-atomIsotopeAtomicMass', (_this$atom$properties2 = this.atom.properties.isotope) !== null && _this$atom$properties2 !== void 0 ? _this$atom$properties2 : '').attr('data-atomValence', (_this$atom$properties3 = this.atom.properties.explicitValence) !== null && _this$atom$properties3 !== void 0 ? _this$atom$properties3 : '').attr('data-atomRadical', (_this$atom$properties4 = this.atom.properties.radical) !== null && _this$atom$properties4 !== void 0 ? _this$atom$properties4 : '').attr('data-atomRingBondCount', '').attr('data-atomHCount', hydrogenAmount !== null && hydrogenAmount !== void 0 ? hydrogenAmount : '').attr('data-atomSubstitutionCount', '').attr('data-atomUnsaturated', '').attr('data-atomAromaticity', '').attr('data-atomImplicitHCount', '').attr('data-atomRingMembership', '').attr('data-atomRingSize', '').attr('data-atomConnectivity', '').attr('data-atomChirality', '').attr('data-atomInversion', '').attr('data-atomExactChange', '').attr('data-atomCustomQuery', '').attr('transform', "translate(".concat(this.scaledPosition.x, ", ").concat(this.scaledPosition.y, ")"));
      rootElement === null || rootElement === void 0 || rootElement.on('mouseover', function (event) {
        editorSingleton.provideEditorInstance().events.mouseOverDrawingEntity.dispatch(event);
        _this2.showHover();
      }).on('mouseleave', function (event) {
        editorSingleton.provideEditorInstance().events.mouseLeaveDrawingEntity.dispatch(event);
        _this2.hideHover();
      }).on('mouseup', function (event) {
        editor.events.mouseUpAtom.dispatch(event);
      });
      return rootElement;
    }
  }, {
    key: "appendBody",
    value: function appendBody() {
      var _this$rootElement;
      return (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.append('circle').data([this]).attr('r', 0).attr('cx', 0).attr('cy', 0);
    }
  }, {
    key: "appendSelectionContour",
    value: function appendSelectionContour() {
      if ((this.labelLength < 2 || !this.isLabelVisible) && !this.atom.hasCharge) {
        var _this$rootElement2;
        var macroModeScale = this.editorSettings.macroModeScale;
        var selectionRadius = Math.ceil(1.9 * (macroModeScale / 6));
        return (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.insert('circle', ':first-child').attr('r', selectionRadius).attr('cx', 0).attr('cy', 0);
      } else {
        var _this$textElement, _labelBbox$x, _labelBbox$width, _labelBbox$height, _this$rootElement3;
        var labelBbox = (_this$textElement = this.textElement) === null || _this$textElement === void 0 || (_this$textElement = _this$textElement.node()) === null || _this$textElement === void 0 ? void 0 : _this$textElement.getBBox();
        var labelX = (_labelBbox$x = labelBbox === null || labelBbox === void 0 ? void 0 : labelBbox.x) !== null && _labelBbox$x !== void 0 ? _labelBbox$x : 0;
        var labelWidth = (_labelBbox$width = labelBbox === null || labelBbox === void 0 ? void 0 : labelBbox.width) !== null && _labelBbox$width !== void 0 ? _labelBbox$width : 8;
        var labelHeight = (_labelBbox$height = labelBbox === null || labelBbox === void 0 ? void 0 : labelBbox.height) !== null && _labelBbox$height !== void 0 ? _labelBbox$height : 8;
        var HOVER_PADDING = 4;
        var HOVER_RECTANGLE_RADIUS = 10;
        return (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 ? void 0 : _this$rootElement3.insert('rect', ':first-child').attr('x', labelX - HOVER_PADDING).attr('y', -(labelHeight / 2 + HOVER_PADDING)).attr('width', labelWidth + HOVER_PADDING * 2).attr('height', labelHeight + HOVER_PADDING * 2).attr('rx', HOVER_RECTANGLE_RADIUS).attr('ry', HOVER_RECTANGLE_RADIUS);
      }
    }
  }, {
    key: "getHoverContour",
    value: function getHoverContour() {
      var _this$textElement2, _labelBbox$x2, _labelBbox$width2, _labelBbox$height2;
      if ((this.labelLength < 2 || !this.isLabelVisible) && !this.atom.hasCharge) {
        var macroModeScale = this.editorSettings.macroModeScale;
        return {
          type: 'circle',
          center: this.center,
          radius: Math.ceil(1.9 * (macroModeScale / 6))
        };
      }
      var labelBbox = (_this$textElement2 = this.textElement) === null || _this$textElement2 === void 0 || (_this$textElement2 = _this$textElement2.node()) === null || _this$textElement2 === void 0 ? void 0 : _this$textElement2.getBBox();
      var labelX = (_labelBbox$x2 = labelBbox === null || labelBbox === void 0 ? void 0 : labelBbox.x) !== null && _labelBbox$x2 !== void 0 ? _labelBbox$x2 : 0;
      var labelWidth = (_labelBbox$width2 = labelBbox === null || labelBbox === void 0 ? void 0 : labelBbox.width) !== null && _labelBbox$width2 !== void 0 ? _labelBbox$width2 : 8;
      var labelHeight = (_labelBbox$height2 = labelBbox === null || labelBbox === void 0 ? void 0 : labelBbox.height) !== null && _labelBbox$height2 !== void 0 ? _labelBbox$height2 : 8;
      var HOVER_PADDING = 4;
      var HOVER_RECTANGLE_RADIUS = 10;
      return {
        type: 'rect',
        x: this.center.x + labelX - HOVER_PADDING,
        y: this.center.y - (labelHeight / 2 + HOVER_PADDING),
        width: labelWidth + HOVER_PADDING * 2,
        height: labelHeight + HOVER_PADDING * 2,
        radius: HOVER_RECTANGLE_RADIUS
      };
    }
  }, {
    key: "updateSelectionContour",
    value: function updateSelectionContour() {
      var _this$textElement$nod;
      if (!this.rootElement || !this.textElement) return;
      var labelBbox = (_this$textElement$nod = this.textElement.node()) === null || _this$textElement$nod === void 0 ? void 0 : _this$textElement$nod.getBBox();
      if (!labelBbox) return;
      var labelX = labelBbox.x || 0;
      var labelWidth = labelBbox.width || 8;
      var labelHeight = labelBbox.height || 8;
      var HOVER_PADDING = 4;
      var rect = this.rootElement.select('rect');
      if (rect !== null && rect !== void 0 && rect.node()) {
        rect.attr('x', labelX - HOVER_PADDING).attr('y', -(labelHeight / 2 + HOVER_PADDING)).attr('width', labelWidth + HOVER_PADDING * 2).attr('height', labelHeight + HOVER_PADDING * 2);
      }
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      if (this.hoverElement) {
        return this.hoverElement;
      }
      var selectionContourElement = this.appendSelectionContour();
      return selectionContourElement === null || selectionContourElement === void 0 ? void 0 : selectionContourElement.attr('stroke', '#0097a8')
      .attr('stroke-width', '1.2').attr('fill', 'none').attr('opacity', '0').attr('class', 'dynamic-element');
    }
  }, {
    key: "redrawHover",
    value: function redrawHover() {
      if (this.drawingEntity.hovered) {
        var hoverElement = this.appendHover();
        if (hoverElement) {
          this.hoverElement = hoverElement;
        }
        if (this.atom.selected) {
          var _this$selectionElemen;
          (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.attr('fill', constants.SELECTION_HOVERED_COLOR);
        }
        this.showHover();
      } else {
        this.hideHover();
        if (this.atom.selected) {
          var _this$selectionElemen2;
          (_this$selectionElemen2 = this.selectionElement) === null || _this$selectionElemen2 === void 0 || _this$selectionElemen2.attr('fill', constants.SELECTION_COLOR);
        }
      }
    }
  }, {
    key: "showHover",
    value: function showHover() {
      var _this$hoverElement;
      (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.attr('opacity', '1');
    }
  }, {
    key: "hideHover",
    value: function hideHover() {
      var _this$hoverElement2;
      (_this$hoverElement2 = this.hoverElement) === null || _this$hoverElement2 === void 0 || _this$hoverElement2.attr('opacity', '0');
    }
  }, {
    key: "shouldHydrogenBeOnLeft",
    get: function get() {
      var viewModel = editorSingleton.provideEditorInstance().viewModel;
      var atomHaldEdges = viewModel.atomsToHalfEdges.get(this.atom);
      if (!(atomHaldEdges !== null && atomHaldEdges !== void 0 && atomHaldEdges.length)) {
        if (this.atom.label === element_types.AtomLabel.D || this.atom.label === element_types.AtomLabel.T) {
          return false;
        } else {
          var element = elements.Elements.get(this.atom.label);
          return !element || Boolean(element.leftH);
        }
      }
      if ((atomHaldEdges === null || atomHaldEdges === void 0 ? void 0 : atomHaldEdges.length) === 1) {
        var firstHalfEdge = atomHaldEdges[0];
        return firstHalfEdge.direction.x > 0;
      }
      return false;
    }
  }, {
    key: "labelText",
    get: function get() {
      var _this$atom$properties5;
      if (this.atom.properties.atomList) {
        return this.atom.properties.atomList.label();
      }
      return (_this$atom$properties5 = this.atom.properties.alias) !== null && _this$atom$properties5 !== void 0 ? _this$atom$properties5 : this.atom.label;
    }
  }, {
    key: "isGenericLabel",
    get: function get() {
      return isGenericAtom.isGenericAtom(this.atom.label);
    }
  }, {
    key: "isHydrogenLabel",
    get: function get() {
      return this.atom.label === element_types.AtomLabel.H;
    }
  }, {
    key: "displayLabelText",
    get: function get() {
      var text = this.labelText;
      if (text.length > MAX_LABEL_LENGTH) {
        return "".concat(text.substring(0, MAX_LABEL_LENGTH), "...");
      }
      return text;
    }
  }, {
    key: "labelTooltipText",
    get: function get() {
      var text = this.labelText;
      return text.length > MAX_LABEL_LENGTH ? text : null;
    }
  }, {
    key: "isAtomTerminal",
    get: function get() {
      var editor = editorSingleton.provideEditorInstance();
      var viewModel = editor.viewModel;
      var atomNeighborsHalfEdges = viewModel.atomsToHalfEdges.get(this.atom);
      return !(atomNeighborsHalfEdges !== null && atomNeighborsHalfEdges !== void 0 && atomNeighborsHalfEdges.length) || atomNeighborsHalfEdges.length === 1;
    }
  }, {
    key: "isLabelVisible",
    get: function get() {
      var _atomNeighborsHalfEdg;
      var editor = editorSingleton.provideEditorInstance();
      var viewModel = editor.viewModel;
      var atomNeighborsHalfEdges = viewModel.atomsToHalfEdges.get(this.atom);
      var isCarbon = this.atom.label === element_types.AtomLabel.C;
      var visibleTerminal = true;
      var isAtomTerminal = this.isAtomTerminal;
      var isAtomInMiddleOfChain = ((_atomNeighborsHalfEdg = atomNeighborsHalfEdges === null || atomNeighborsHalfEdges === void 0 ? void 0 : atomNeighborsHalfEdges.length) !== null && _atomNeighborsHalfEdg !== void 0 ? _atomNeighborsHalfEdg : 0) >= 2;
      var hasCharge = this.atom.hasCharge;
      var hasRadical = this.atom.hasRadical;
      var hasAlias = this.atom.hasAlias;
      var hasExplicitValence = this.atom.hasExplicitValence;
      var hasExplicitIsotope = this.atom.hasExplicitIsotope;
      if (isCarbon && !isAtomTerminal && !hasCharge && !hasRadical && !hasAlias && !hasExplicitValence && !hasExplicitIsotope) {
        if ((atomNeighborsHalfEdges === null || atomNeighborsHalfEdges === void 0 ? void 0 : atomNeighborsHalfEdges.length) === 2) {
          var _atomNeighborsHalfEdg2 = _slicedToArray__default["default"](atomNeighborsHalfEdges, 2),
            hb1 = _atomNeighborsHalfEdg2[0],
            hb2 = _atomNeighborsHalfEdg2[1];
          if (Math.abs(vec2.Vec2.cross(hb1.direction, hb2.direction)) < 0.2) {
            return true;
          }
        }
        return false;
      }
      if (isAtomTerminal && visibleTerminal || isAtomInMiddleOfChain) {
        return true;
      }
      return false;
    }
  }, {
    key: "labelLength",
    get: function get() {
      var _this$atom$calculateV2 = this.atom.calculateValence(),
        hydrogenAmount = _this$atom$calculateV2.hydrogenAmount;
      if (this.displayLabelText.length > 1) {
        return this.displayLabelText.length;
      }
      if (!this.shouldDisplayHydrogen) {
        hydrogenAmount = 0;
      }
      if (hydrogenAmount === 0) {
        return 1;
      }
      return hydrogenAmount === 1 ? 2 : 3;
    }
  }, {
    key: "labelColor",
    get: function get() {
      return this.atom.properties.alias ? 'black' : elementColor.ElementColor[this.atom.label];
    }
  }, {
    key: "labelBBoxes",
    get: function get() {
      var _this$radicalElement;
      if (!this.textElement) {
        return [];
      }
      var labelBboxes = [];
      var radicalElementBbox = (_this$radicalElement = this.radicalElement) === null || _this$radicalElement === void 0 || (_this$radicalElement = _this$radicalElement.node()) === null || _this$radicalElement === void 0 ? void 0 : _this$radicalElement.getBBox();
      this.textElement.selectAll('tspan').each(function (_atomRenderer, tspanIndex, tspans) {
        labelBboxes.push(tspans[tspanIndex].getBBox());
      });
      if (radicalElementBbox) {
        labelBboxes.push(radicalElementBbox);
      }
      return labelBboxes;
    }
  }, {
    key: "labelBoundingBox",
    get: function get() {
      var _this$textElement3;
      return (_this$textElement3 = this.textElement) === null || _this$textElement3 === void 0 || (_this$textElement3 = _this$textElement3.node()) === null || _this$textElement3 === void 0 ? void 0 : _this$textElement3.getBBox();
    }
  }, {
    key: "shouldDisplayHydrogen",
    get: function get() {
      return this.atom.label !== element_types.AtomLabel.C || this.isAtomTerminal;
    }
  }, {
    key: "appendLabel",
    value: function appendLabel() {
      var _this$rootElement4;
      if (!this.isLabelVisible) {
        return;
      }
      var _this$atom$calculateV3 = this.atom.calculateValence(),
        hydrogenAmount = _this$atom$calculateV3.hydrogenAmount;
      var shouldHydrogenBeOnLeft = this.shouldHydrogenBeOnLeft;
      if (!this.shouldDisplayHydrogen) {
        hydrogenAmount = 0;
      }
      var isHydrogenLabel = this.isHydrogenLabel;
      if (isHydrogenLabel && hydrogenAmount > 0) {
        hydrogenAmount += 1;
      }
      var textElement = (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 ? void 0 : _this$rootElement4.append('text').attr('y', 5).attr('fill', this.labelColor).attr('style', "user-select: none; font-family: Arial; letter-spacing: 1.2px;".concat(this.isGenericLabel ? ' font-style: italic;' : '')).attr('font-size', '13px').attr('pointer-events', 'none');
      if (!shouldHydrogenBeOnLeft) {
        textElement === null || textElement === void 0 || textElement.append('tspan').attr('dy', this.atom.hasExplicitIsotope ? 4 : 0).text(this.displayLabelText);
      }
      if (!this.atom.hasAlias && hydrogenAmount > 0 && !isHydrogenLabel) {
        textElement === null || textElement === void 0 || textElement.append('tspan').attr('dy', this.atom.hasExplicitIsotope && shouldHydrogenBeOnLeft ? 4 : 0).text('H');
        if (hydrogenAmount > 1) {
          textElement === null || textElement === void 0 || textElement.append('tspan').text(hydrogenAmount).attr('dy', 3);
        }
      } else if (isHydrogenLabel && hydrogenAmount > 0) {
        textElement === null || textElement === void 0 || textElement.append('tspan').text(hydrogenAmount).attr('dy', 3);
      }
      if (shouldHydrogenBeOnLeft) {
        textElement === null || textElement === void 0 || textElement.append('tspan').text(this.displayLabelText).attr('dy', hydrogenAmount > 1 ? -3 : 0);
      }
      var hydrogenLabelAnchor = 'middle';
      if (shouldHydrogenBeOnLeft) {
        hydrogenLabelAnchor = 'end';
      } else if (hydrogenAmount > 0) {
        hydrogenLabelAnchor = 'start';
      }
      var hydrogenLabelXOffset = 0;
      if (shouldHydrogenBeOnLeft) {
        hydrogenLabelXOffset = 5;
      } else if (hydrogenAmount > 0) {
        hydrogenLabelXOffset = -5;
      }
      textElement === null || textElement === void 0 || textElement.attr('text-anchor', hydrogenLabelAnchor).attr('x', hydrogenLabelXOffset);
      return textElement;
    }
  }, {
    key: "removeLabel",
    value: function removeLabel() {
      if (!this.textElement) return;
      this.textElement.remove();
      this.textElement = undefined;
    }
  }, {
    key: "redrawLabel",
    value: function redrawLabel() {
      var _this$radicalElement2, _this$hoverElement3, _this$cipLabelElement, _this$stereoLabelElem, _this$badValenceEleme;
      this.removeLabel();
      this.textElement = this.appendLabel();
      (_this$radicalElement2 = this.radicalElement) === null || _this$radicalElement2 === void 0 || _this$radicalElement2.remove();
      this.radicalElement = undefined;
      (_this$hoverElement3 = this.hoverElement) === null || _this$hoverElement3 === void 0 || _this$hoverElement3.remove();
      this.hoverElement = undefined;
      (_this$cipLabelElement = this.cipLabelElement) === null || _this$cipLabelElement === void 0 || _this$cipLabelElement.remove();
      this.cipLabelElement = undefined;
      (_this$stereoLabelElem = this.stereoLabelElement) === null || _this$stereoLabelElem === void 0 || _this$stereoLabelElem.remove();
      this.stereoLabelElement = undefined;
      this.stereoLabelElementBBox = undefined;
      this.stereoTextElementBBox = undefined;
      (_this$badValenceEleme = this.badValenceElement) === null || _this$badValenceEleme === void 0 || _this$badValenceEleme.remove();
      this.badValenceElement = undefined;
      this.updateSelectionContour();
      this.hoverElement = this.appendHover();
      this.appendAtomProperties();
      this.appendBadValenceWarning();
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$cipLabelElement2;
      if (!this.selectionElement) {
        var selectionContourElement = this.appendSelectionContour();
        this.selectionElement = selectionContourElement === null || selectionContourElement === void 0 ? void 0 : selectionContourElement.attr('fill', constants.SELECTION_COLOR)
        .attr('class', 'dynamic-element');
      }
      (_this$cipLabelElement2 = this.cipLabelElement) === null || _this$cipLabelElement2 === void 0 || (_this$cipLabelElement2 = _this$cipLabelElement2.select('rect')) === null || _this$cipLabelElement2 === void 0 || _this$cipLabelElement2.attr('fill', constants.SELECTION_COLOR);
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionElemen3, _this$cipLabelElement3;
      (_this$selectionElemen3 = this.selectionElement) === null || _this$selectionElemen3 === void 0 || _this$selectionElemen3.remove();
      this.selectionElement = undefined;
      (_this$cipLabelElement3 = this.cipLabelElement) === null || _this$cipLabelElement3 === void 0 || (_this$cipLabelElement3 = _this$cipLabelElement3.select('rect')) === null || _this$cipLabelElement3 === void 0 || _this$cipLabelElement3.attr('fill', '#F5F5F5');
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.atom.selected) {
        this.appendSelection();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
      if (!this.rootElement) {
        return;
      }
      this.drawSelection();
      this.move();
    }
  }, {
    key: "appendCharge",
    value: function appendCharge() {
      if (this.atom.hasCharge) {
        var _this$textElement4;
        var charge = this.atom.properties.charge;
        (_this$textElement4 = this.textElement) === null || _this$textElement4 === void 0 || _this$textElement4.append('tspan').text((Math.abs(charge) > 1 ? Math.abs(charge) : '') + (charge > 0 ? '+' : '–')).attr('fill', this.labelColor).attr('dy', -4);
      }
    }
  }, {
    key: "appendRadical",
    value: function appendRadical() {
      var _this$rootElement5, _this$radicalElement3, _this$radicalElement4, _this$radicalElement5, _this$radicalElement6;
      if (!this.atom.hasRadical) {
        return;
      }
      var radical = this.atom.properties.radical;
      this.radicalElement = (_this$rootElement5 = this.rootElement) === null || _this$rootElement5 === void 0 ? void 0 : _this$rootElement5.append('g');
      switch (radical) {
        case CoreAtom.AtomRadical.Single:
          (_this$radicalElement3 = this.radicalElement) === null || _this$radicalElement3 === void 0 || _this$radicalElement3.append('circle').attr('cx', 3).attr('cy', -10).attr('r', 2).attr('fill', this.labelColor);
          (_this$radicalElement4 = this.radicalElement) === null || _this$radicalElement4 === void 0 || _this$radicalElement4.append('circle').attr('cx', -3).attr('cy', -10).attr('r', 2).attr('fill', this.labelColor);
          break;
        case CoreAtom.AtomRadical.Doublet:
          (_this$radicalElement5 = this.radicalElement) === null || _this$radicalElement5 === void 0 || _this$radicalElement5.append('circle').attr('cx', 0).attr('cy', -10).attr('r', 2).attr('fill', this.labelColor);
          break;
        case CoreAtom.AtomRadical.Triplet:
          (_this$radicalElement6 = this.radicalElement) === null || _this$radicalElement6 === void 0 || _this$radicalElement6.append('path').attr('d', "M 0 -5 L 2 -10 L 4 -5 M -6 -5 L -4 -10 L -2 -5").attr('fill', 'none').attr('stroke', this.labelColor).attr('stroke-width', 1.4);
          break;
      }
    }
  }, {
    key: "appendExplicitValence",
    value: function appendExplicitValence() {
      if (this.atom.hasExplicitValence) {
        var _this$textElement5;
        var explicitValence = this.atom.properties.explicitValence;
        (_this$textElement5 = this.textElement) === null || _this$textElement5 === void 0 || _this$textElement5.append('tspan').text("(".concat(constants$1.VALENCE_MAP[explicitValence], ")")).attr('fill', this.labelColor).attr('letter-spacing', 0.2).attr('dy', -4);
      }
    }
  }, {
    key: "appendExplicitIsotope",
    value: function appendExplicitIsotope() {
      if (this.atom.hasExplicitIsotope) {
        var _this$textElement6;
        var explicitIsotope = this.atom.properties.isotope;
        (_this$textElement6 = this.textElement
) === null || _this$textElement6 === void 0 || _this$textElement6.insert('tspan', ':first-child').text(explicitIsotope).attr('fill', this.labelColor).attr('letter-spacing', 0.2).attr('dy', -4);
      }
    }
  }, {
    key: "appendAtomProperties",
    value: function appendAtomProperties() {
      this.appendExplicitIsotope();
      this.appendCharge();
      this.appendRadical();
      this.appendExplicitValence();
    }
  }, {
    key: "appendBadValenceWarning",
    value: function appendBadValenceWarning() {
      var _this$textElement7, _this$rootElement6;
      if (!this.atom.hasBadValence || !this.isLabelVisible) {
        return;
      }
      var labelBbox = (_this$textElement7 = this.textElement) === null || _this$textElement7 === void 0 || (_this$textElement7 = _this$textElement7.node()) === null || _this$textElement7 === void 0 ? void 0 : _this$textElement7.getBBox();
      if (!labelBbox) {
        return;
      }
      var lineY = labelBbox.height / 2 + constants.BAD_VALENCE_LINE_OFFSET;
      var lineStartX = labelBbox.x;
      var lineEndX = labelBbox.x + labelBbox.width;
      this.badValenceElement = (_this$rootElement6 = this.rootElement) === null || _this$rootElement6 === void 0 ? void 0 : _this$rootElement6.append('line').attr('x1', lineStartX).attr('y1', lineY).attr('x2', lineEndX).attr('y2', lineY).attr('stroke', constants.BAD_VALENCE_WARNING_COLOR).attr('stroke-width', 1).attr('pointer-events', 'none');
    }
  }, {
    key: "show",
    value: function show() {
      this.rootElement = this.appendRootElement();
      this.bodyElement = this.appendBody();
      this.textElement = this.appendLabel();
      this.appendAtomProperties();
      this.appendBadValenceWarning();
      this.appendStereoLabel();
      this.appendCIPLabel();
      this.hoverElement = this.appendHover();
      this.drawSelection();
    }
  }, {
    key: "appendCIPLabel",
    value: function appendCIPLabel() {
      var _this$canvas, _this$cipLabelElement4, _cipTextElement$node, _this$cipLabelElement5, _this$cipLabelElement6;
      var cipValue = this.atom.properties.cip;
      if (!cipValue) {
        return;
      }
      this.cipLabelElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 || (_this$canvas = _this$canvas.append('g')) === null || _this$canvas === void 0 ? void 0 : _this$canvas.attr('id', "cip-atom-".concat(this.atom.id));
      var cipTextElement = (_this$cipLabelElement4 = this.cipLabelElement) === null || _this$cipLabelElement4 === void 0 ? void 0 : _this$cipLabelElement4.append('text').text("(".concat(cipValue, ")")).attr('font-family', 'Arial').attr('font-size', '10px').attr('pointer-events', 'none');
      this.cipTextElementBBox = cipTextElement === null || cipTextElement === void 0 || (_cipTextElement$node = cipTextElement.node()) === null || _cipTextElement$node === void 0 ? void 0 : _cipTextElement$node.getBBox();
      assert.assert(this.cipTextElementBBox);
      var _this$cipTextElementB = this.cipTextElementBBox,
        x = _this$cipTextElementB.x,
        y = _this$cipTextElementB.y,
        width = _this$cipTextElementB.width,
        height = _this$cipTextElementB.height;
      (_this$cipLabelElement5 = this.cipLabelElement) === null || _this$cipLabelElement5 === void 0 || _this$cipLabelElement5.insert('rect', 'text').attr('x', x - 1).attr('y', y - 1).attr('width', width + 2).attr('height', height + 2).attr('rx', 3).attr('ry', 3).attr('fill', '#f5f5f5');
      this.cipLabelElementBBox = (_this$cipLabelElement6 = this.cipLabelElement) === null || _this$cipLabelElement6 === void 0 || (_this$cipLabelElement6 = _this$cipLabelElement6.node()) === null || _this$cipLabelElement6 === void 0 ? void 0 : _this$cipLabelElement6.getBBox();
      this.positionCIPLabel();
    }
  }, {
    key: "positionCIPLabel",
    value: function positionCIPLabel() {
      var _this$cipLabelElement7;
      if (!this.cipTextElementBBox || !this.cipLabelElementBBox) {
        return;
      }
      var direction = this.bisectLargestSector();
      var projectedDistance = this.getProjectedLabelDistance(this.cipTextElementBBox.width, this.cipTextElementBBox.height, direction);
      if (this.stereoTextElementBBox) {
        var stereoProjectedDistance = this.getProjectedLabelDistance(this.stereoTextElementBBox.width, this.stereoTextElementBBox.height, direction);
        var stereoProjectionRadius = this.getLabelProjectionRadius(this.stereoTextElementBBox.width, this.stereoTextElementBBox.height, direction);
        var cipProjectionRadius = this.getLabelProjectionRadius(this.cipTextElementBBox.width, this.cipTextElementBBox.height, direction);
        projectedDistance = Math.max(projectedDistance, stereoProjectedDistance + stereoProjectionRadius + cipProjectionRadius + STEREO_CIP_GAP);
      }
      var shiftVector = direction.scaled(projectedDistance);
      var cipPosition = this.scaledPosition.add(new vec2.Vec2(shiftVector.x - (this.cipLabelElementBBox.x + this.cipLabelElementBBox.width / 2), shiftVector.y - (this.cipLabelElementBBox.y + this.cipLabelElementBBox.height / 2)));
      (_this$cipLabelElement7 = this.cipLabelElement) === null || _this$cipLabelElement7 === void 0 || _this$cipLabelElement7.attr('transform', "translate(".concat(cipPosition.x, ", ").concat(cipPosition.y, ")"));
    }
  }, {
    key: "bisectLargestSector",
    value: function bisectLargestSector() {
      var _provideEditorInstanc = editorSingleton.provideEditorInstance().viewModel.getLargestSectorFromAtomNeighbours(this.atom),
        neighborAngle = _provideEditorInstanc.neighborAngle,
        largestAngle = _provideEditorInstanc.largestAngle;
      var bisectAngle = neighborAngle + largestAngle / 2;
      return new vec2.Vec2(Math.cos(bisectAngle), Math.sin(bisectAngle));
    }
  }, {
    key: "getStereoLabelColor",
    value: function getStereoLabelColor() {
      var _stereoLabel$match;
      var stereoLabel = this.atom.properties.stereoLabel;
      if (!stereoLabel) {
        return '#000';
      }
      var stereoLabelType = (_stereoLabel$match = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match === void 0 ? void 0 : _stereoLabel$match[0];
      switch (stereoLabelType) {
        case atom.StereoLabel.And:
          return '#0000cd';
        case atom.StereoLabel.Or:
          return '#228b22';
        case atom.StereoLabel.Abs:
          return '#ff0000';
        default:
          return '#000';
      }
    }
  }, {
    key: "shouldDisplayStereoLabel",
    value: function shouldDisplayStereoLabel() {
      var _ketcherProvider$getK, _settings$ignoreChira;
      var stereoLabel = this.atom.properties.stereoLabel;
      if (!stereoLabel) {
        return false;
      }
      var editor = editorSingleton.provideEditorInstance();
      var settings = (_ketcherProvider$getK = ketcherProvider.ketcherProvider.getKetcher(editor.ketcherId).settingsService) === null || _ketcherProvider$getK === void 0 ? void 0 : _ketcherProvider$getK.getSettings();
      var labelStyle = getStereoLabelStyleType(settings === null || settings === void 0 ? void 0 : settings.stereoLabelStyle);
      var ignoreChiralFlag = (_settings$ignoreChira = settings === null || settings === void 0 ? void 0 : settings.ignoreChiralFlag) !== null && _settings$ignoreChira !== void 0 ? _settings$ignoreChira : false;
      var enhancedStereoFlag = this.getEnhancedStereoFlag();
      return _shouldDisplayStereoLabel(stereoLabel, labelStyle, ignoreChiralFlag, enhancedStereoFlag);
    }
  }, {
    key: "getEnhancedStereoFlag",
    value: function getEnhancedStereoFlag() {
      var _struct$frags$get;
      var struct = this.atom.monomer.monomerItem.struct;
      var structAtom = struct.atoms.get(this.atom.atomIdInMicroMode);
      return (_struct$frags$get = struct.frags.get(Number(structAtom === null || structAtom === void 0 ? void 0 : structAtom.fragment))) === null || _struct$frags$get === void 0 ? void 0 : _struct$frags$get.enhancedStereoFlag;
    }
  }, {
    key: "appendStereoLabel",
    value: function appendStereoLabel() {
      var _this$canvas2, _this$stereoLabelElem2, _stereoTextElement$no, _this$stereoLabelElem3;
      var stereoLabel = this.atom.properties.stereoLabel;
      if (!stereoLabel || !this.shouldDisplayStereoLabel()) {
        return;
      }
      this.stereoLabelElement = (_this$canvas2 = this.canvas) === null || _this$canvas2 === void 0 || (_this$canvas2 = _this$canvas2.append('g')) === null || _this$canvas2 === void 0 ? void 0 : _this$canvas2.attr('id', "stereo-atom-".concat(this.atom.id));
      var stereoTextElement = (_this$stereoLabelElem2 = this.stereoLabelElement) === null || _this$stereoLabelElem2 === void 0 ? void 0 : _this$stereoLabelElem2.append('text').text(stereoLabel).attr('font-family', 'Arial').attr('font-size', '13px').attr('fill', this.getStereoLabelColor()).attr('pointer-events', 'none');
      this.stereoTextElementBBox = stereoTextElement === null || stereoTextElement === void 0 || (_stereoTextElement$no = stereoTextElement.node()) === null || _stereoTextElement$no === void 0 ? void 0 : _stereoTextElement$no.getBBox();
      if (!this.stereoTextElementBBox) {
        return;
      }
      this.stereoLabelElementBBox = (_this$stereoLabelElem3 = this.stereoLabelElement) === null || _this$stereoLabelElem3 === void 0 || (_this$stereoLabelElem3 = _this$stereoLabelElem3.node()) === null || _this$stereoLabelElem3 === void 0 ? void 0 : _this$stereoLabelElem3.getBBox();
      this.positionStereoLabel();
    }
  }, {
    key: "positionStereoLabel",
    value: function positionStereoLabel() {
      var _this$stereoLabelElem4;
      if (!this.stereoTextElementBBox || !this.stereoLabelElementBBox) {
        return;
      }
      var direction = this.bisectLargestSector();
      var projectedDistance = this.getProjectedLabelDistance(this.stereoTextElementBBox.width, this.stereoTextElementBBox.height, direction);
      var shiftVector = direction.scaled(projectedDistance);
      var stereoPosition = this.scaledPosition.add(new vec2.Vec2(shiftVector.x - (this.stereoLabelElementBBox.x + this.stereoLabelElementBBox.width / 2), shiftVector.y - (this.stereoLabelElementBBox.y + this.stereoLabelElementBBox.height / 2)));
      (_this$stereoLabelElem4 = this.stereoLabelElement) === null || _this$stereoLabelElem4 === void 0 || _this$stereoLabelElem4.attr('transform', "translate(".concat(stereoPosition.x, ", ").concat(stereoPosition.y, ")"));
    }
  }, {
    key: "getProjectedLabelDistance",
    value: function getProjectedLabelDistance(width, height, direction) {
      var _this3 = this;
      var baseDistance = 3;
      var forwardShift = 0;
      this.labelBBoxes.forEach(function (labelSymbolBBox) {
        var absoluteBox = new box2Abs.Box2Abs(labelSymbolBBox.x, labelSymbolBBox.y, labelSymbolBBox.x + labelSymbolBBox.width, labelSymbolBBox.y + labelSymbolBBox.height).translate(_this3.scaledPosition);
        forwardShift = Math.max(forwardShift, util["default"].shiftRayBox(_this3.scaledPosition, direction, absoluteBox));
      });
      var stereoLabelBox = {
        x: this.scaledPosition.x - width / 2,
        y: this.scaledPosition.y - height / 2,
        width: width,
        height: height
      };
      var backwardShift = util["default"].shiftRayBox(this.scaledPosition, direction.negated(), box2Abs.Box2Abs.fromRelBox(stereoLabelBox));
      return LABEL_CLEARANCE_OFFSET + baseDistance + forwardShift + backwardShift;
    }
  }, {
    key: "getLabelProjectionRadius",
    value: function getLabelProjectionRadius(width, height, direction) {
      return Math.abs(direction.x) * (width / 2) + Math.abs(direction.y) * (height / 2);
    }
  }, {
    key: "move",
    value: function move() {
      var _this$rootElement7;
      (_this$rootElement7 = this.rootElement) === null || _this$rootElement7 === void 0 || _this$rootElement7.attr('transform', "translate(".concat(this.scaledPosition.x, ", ").concat(this.scaledPosition.y, ")"));
      this.positionCIPLabel();
      this.positionStereoLabel();
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$cipLabelElement8, _this$stereoLabelElem5;
      this.removeSelection();
      (_this$cipLabelElement8 = this.cipLabelElement) === null || _this$cipLabelElement8 === void 0 || _this$cipLabelElement8.remove();
      (_this$stereoLabelElem5 = this.stereoLabelElement) === null || _this$stereoLabelElem5 === void 0 || _this$stereoLabelElem5.remove();
      this.hoverElement = undefined;
      _get__default["default"](_getPrototypeOf__default["default"](AtomRenderer.prototype), "remove", this).call(this);
    }
  }, {
    key: "setVisibility",
    value: function setVisibility(isVisible) {
      var _this$rootElement8, _this$selectionElemen4, _this$cipLabelElement9, _this$stereoLabelElem6;
      _get__default["default"](_getPrototypeOf__default["default"](AtomRenderer.prototype), "setVisibility", this).call(this, isVisible);
      var display = isVisible ? '' : 'none';
      (_this$rootElement8 = this.rootElement) === null || _this$rootElement8 === void 0 || _this$rootElement8.style('display', display);
      (_this$selectionElemen4 = this.selectionElement) === null || _this$selectionElemen4 === void 0 || _this$selectionElemen4.style('display', display);
      (_this$cipLabelElement9 = this.cipLabelElement) === null || _this$cipLabelElement9 === void 0 || _this$cipLabelElement9.style('display', display);
      (_this$stereoLabelElem6 = this.stereoLabelElement) === null || _this$stereoLabelElem6 === void 0 || _this$stereoLabelElem6.style('display', display);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$hoverElement4;
      (_this$hoverElement4 = this.hoverElement) === null || _this$hoverElement4 === void 0 || _this$hoverElement4.remove();
      this.hoverElement = undefined;
    }
  }]);
  return AtomRenderer;
}(BaseRenderer.BaseRenderer);
function getStereoLabelStyleType(stereoLabelStyle) {
  switch (stereoLabelStyle) {
    case 'IUPAC':
      return generalEnumTypes.StereoLabelStyleType.IUPAC;
    case 'classic':
      return generalEnumTypes.StereoLabelStyleType.Classic;
    case 'On-Atoms':
      return generalEnumTypes.StereoLabelStyleType.On;
    case 'off':
      return generalEnumTypes.StereoLabelStyleType.Off;
    default:
      return undefined;
  }
}
function _shouldDisplayStereoLabel(stereoLabel, labelStyle, ignoreChiralFlag, flag) {
  var _stereoLabel$match2;
  var stereoLabelType = (_stereoLabel$match2 = stereoLabel.match(/\D+/g)) === null || _stereoLabel$match2 === void 0 ? void 0 : _stereoLabel$match2[0];
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
      return flag === fragment.StereoFlag.Mixed || stereoLabelType === atom.StereoLabel.Or;
    case generalEnumTypes.StereoLabelStyleType.IUPAC:
      return flag === fragment.StereoFlag.Mixed && stereoLabelType !== atom.StereoLabel.Abs;
    default:
      return true;
  }
}

exports.AtomRenderer = AtomRenderer;
//# sourceMappingURL=AtomRenderer.js.map
