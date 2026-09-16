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
var BaseRenderer = require('./BaseRenderer.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var rxnArrow = require('../../../domain/entities/rxnArrow.js');
var vec2 = require('../../../domain/entities/vec2.js');
var constants = require('./constants.js');
var OpenAngleArrowRenderer = require('./RxnArrowPathRenderer/OpenAngleArrowRenderer.js');
var FilledTriangleArrowRenderer = require('./RxnArrowPathRenderer/FilledTriangleArrowRenderer.js');
var FilledBowArrowRenderer = require('./RxnArrowPathRenderer/FilledBowArrowRenderer.js');
var DashedOpenAngleArrowRenderer = require('./RxnArrowPathRenderer/DashedOpenAngleArrowRenderer.js');
var FailedArrowRenderer = require('./RxnArrowPathRenderer/FailedArrowRenderer.js');
var RetrosyntheticArrowRenderer = require('./RxnArrowPathRenderer/RetrosyntheticArrowRenderer.js');
var BothEndsFilledArrowRenderer = require('./RxnArrowPathRenderer/BothEndsFilledArrowRenderer.js');
var EquilibriumFilledHalfBowArrowRenderer = require('./RxnArrowPathRenderer/EquilibriumFilledHalfBowArrowRenderer.js');
var EquilibriumFilledTriangleArrowRenderer = require('./RxnArrowPathRenderer/EquilibriumFilledTriangleArrowRenderer.js');
var EquilibriumOpenAngleArrowRenderer = require('./RxnArrowPathRenderer/EquilibriumOpenAngleArrowRenderer.js');
var UnbalancedEquilibriumFilledHalfBowArrowRenderer = require('./RxnArrowPathRenderer/UnbalancedEquilibriumFilledHalfBowArrowRenderer.js');
var UnbalancedEquilibriumOpenHalfAngleArrowRenderer = require('./RxnArrowPathRenderer/UnbalancedEquilibriumOpenHalfAngleArrowRenderer.js');
var UnbalancedEquilibriumFilledHalfTriangleArrowRenderer = require('./RxnArrowPathRenderer/UnbalancedEquilibriumFilledHalfTriangleArrowRenderer.js');
var EllipticalArcFilledBowArrowRenderer = require('./RxnArrowPathRenderer/EllipticalArcFilledBowArrowRenderer.js');
var editorSettings = require('../../editor/editorSettings.js');
var EllipticalArcFilledTriangleArrowRenderer = require('./RxnArrowPathRenderer/EllipticalArcFilledTriangleArrowRenderer.js');
var EllipticalArcOpenAngleArrowRenderer = require('./RxnArrowPathRenderer/EllipticalArcOpenAngleArrowRenderer.js');
var EllipticalArcOpenHalfAngleArrowRenderer = require('./RxnArrowPathRenderer/EllipticalArcOpenHalfAngleArrowRenderer.js');
var toFixed = require('../../../utilities/toFixed.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer = require('./RxnArrowPathRenderer/UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer.js');
var svgPath = require('svgpath');

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
var svgPath__default = /*#__PURE__*/_interopDefaultLegacy(svgPath);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ARROW_STROKE_WIDTH = 2;
var RxnArrowRenderer = function (_BaseRenderer) {
  _inherits__default["default"](RxnArrowRenderer, _BaseRenderer);
  function RxnArrowRenderer(arrow) {
    var _this;
    _classCallCheck__default["default"](this, RxnArrowRenderer);
    _this = _callSuper(this, RxnArrowRenderer, [arrow]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "arrow", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _this.arrow = arrow;
    _this.arrow.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](RxnArrowRenderer, [{
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = scale.Scale.modelToCanvas(this.arrow.startPosition, this.editorSettings);
      var endPositionInPixels = scale.Scale.modelToCanvas(this.arrow.endPosition, this.editorSettings);
      return {
        startPosition: startPositionInPixels,
        endPosition: endPositionInPixels
      };
    }
  }, {
    key: "getArrowParams",
    value: function getArrowParams() {
      var _this$scaledPosition = this.scaledPosition,
        startPosition = _this$scaledPosition.startPosition,
        endPosition = _this$scaledPosition.endPosition;
      var length = Math.hypot(endPosition.x - startPosition.x, endPosition.y - startPosition.y);
      var angle = vec2.Vec2.radiansToDegrees(vec2.Vec2.oxAngleForVector(new vec2.Vec2(startPosition.x, startPosition.y), new vec2.Vec2(endPosition.x, endPosition.y)));
      return {
        length: length,
        angle: angle
      };
    }
  }, {
    key: "generateArrowPath",
    value: function generateArrowPath() {
      var _this$arrow$height;
      var _this$getArrowParams = this.getArrowParams(),
        length = _this$getArrowParams.length,
        angle = _this$getArrowParams.angle;
      var startPosition = new vec2.Vec2(0, 0);
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      var height = ((_this$arrow$height = this.arrow.height) !== null && _this$arrow$height !== void 0 ? _this$arrow$height : 0) * macroModeScale;
      var paths = [];
      switch (this.arrow.type) {
        case rxnArrow.RxnArrowMode.OpenAngle:
          paths = OpenAngleArrowRenderer.OpenAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.FilledTriangle:
          paths = FilledTriangleArrowRenderer.FilledTriangleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.FilledBow:
          paths = FilledBowArrowRenderer.FilledBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.DashedOpenAngle:
          paths = DashedOpenAngleArrowRenderer.DashedOpenAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.Failed:
          paths = FailedArrowRenderer.FailedArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.Retrosynthetic:
          paths = RetrosyntheticArrowRenderer.RetrosyntheticArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.BothEndsFilledTriangle:
          paths = BothEndsFilledArrowRenderer.BothEndsFilledArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.EquilibriumFilledHalfBow:
          paths = EquilibriumFilledHalfBowArrowRenderer.EquilibriumFilledHalfBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.EquilibriumFilledTriangle:
          paths = EquilibriumFilledTriangleArrowRenderer.EquilibriumFilledTriangleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.EquilibriumOpenAngle:
          paths = EquilibriumOpenAngleArrowRenderer.EquilibriumOpenAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.UnbalancedEquilibriumFilledHalfBow:
          paths = UnbalancedEquilibriumFilledHalfBowArrowRenderer.UnbalancedEquilibriumFilledHalfBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle:
          paths = UnbalancedEquilibriumOpenHalfAngleArrowRenderer.UnbalancedEquilibriumOpenHalfAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow:
          paths = UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer.UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle:
          paths = UnbalancedEquilibriumFilledHalfTriangleArrowRenderer.UnbalancedEquilibriumFilledHalfTriangleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case rxnArrow.RxnArrowMode.EllipticalArcFilledBow:
          paths = EllipticalArcFilledBowArrowRenderer.EllipticalArcFilledBowArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        case rxnArrow.RxnArrowMode.EllipticalArcFilledTriangle:
          paths = EllipticalArcFilledTriangleArrowRenderer.EllipticalArcFilledTriangleArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        case rxnArrow.RxnArrowMode.EllipticalArcOpenAngle:
          paths = EllipticalArcOpenAngleArrowRenderer.EllipticalArcOpenAngleArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        case rxnArrow.RxnArrowMode.EllipticalArcOpenHalfAngle:
          paths = EllipticalArcOpenHalfAngleArrowRenderer.EllipticalArcOpenHalfAngleArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        default:
          KetcherLogger.KetcherLogger.error('Unknown RxnArrow arrow type: ', this.arrow.type);
          break;
      }
      return paths;
    }
  }, {
    key: "getSelectionContour",
    value: function getSelectionContour(startPosition) {
      var _this$arrow$height2;
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      var _this$getArrowParams2 = this.getArrowParams(),
        length = _this$getArrowParams2.length,
        angle = _this$getArrowParams2.angle;
      var height = ((_this$arrow$height2 = this.arrow.height) !== null && _this$arrow$height2 !== void 0 ? _this$arrow$height2 : 0) * macroModeScale;
      var start = startPosition !== null && startPosition !== void 0 ? startPosition : new vec2.Vec2(0, 0);
      var endX = start.x + length;
      var normalizedHeight = height === 0 ? undefined : height;
      var wOffset = 5,
        hOffset = normalizedHeight !== null && normalizedHeight !== void 0 ? normalizedHeight : 8;
      var path = "M".concat(toFixed.toFixed(start.x - wOffset), ",").concat(toFixed.toFixed(start.y)) + "L".concat(toFixed.toFixed(start.x - wOffset), ",").concat(toFixed.toFixed(start.y - hOffset)) + "L".concat(toFixed.toFixed(endX + wOffset), ",").concat(toFixed.toFixed(start.y - hOffset)) + "L".concat(toFixed.toFixed(endX + wOffset), ",").concat(toFixed.toFixed(start.y + (!height ? hOffset : 0))) + "L".concat(toFixed.toFixed(start.x - wOffset), ",").concat(toFixed.toFixed(start.y + (!height ? hOffset : 0)), "Z");
      return svgPath__default["default"](path).rotate(angle, start.x, start.y).toString();
    }
  }, {
    key: "show",
    value: function show() {
      var _this2 = this;
      this.rootElement = this.canvas.insert('g', ".monomer").data([this]).attr('transform', "translate(".concat(this.scaledPosition.startPosition.x, ", ").concat(this.scaledPosition.startPosition.y, ")"));
      var paths = this.generateArrowPath();
      paths.forEach(function (_ref) {
        var _this2$rootElement;
        var d = _ref.d,
          attrs = _ref.attrs;
        var path = (_this2$rootElement = _this2.rootElement) === null || _this2$rootElement === void 0 ? void 0 : _this2$rootElement.append('path').attr('d', d).attr('data-testid', 'rxn-arrow').attr('data-arrowtype', _this2.arrow.type + '-arrow').attr('fill', 'none').attr('stroke', '#000').attr('stroke-width', ARROW_STROKE_WIDTH).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
        if (typeof _this2.arrow.arrowId === 'number') {
          path === null || path === void 0 || path.attr('data-arrow-id', String(_this2.arrow.arrowId));
        }
        Object.entries(attrs).forEach(function (_ref2) {
          var _ref3 = _slicedToArray__default["default"](_ref2, 2),
            key = _ref3[0],
            value = _ref3[1];
          path === null || path === void 0 || path.attr(key, value);
        });
      });
      this.appendHoverAreaElement();
      this.drawSelection();
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      var _this$rootElement;
      var selectionPathDAttr = this.getSelectionContour();
      this.hoverElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.insert('path', ':first-child').attr('d', selectionPathDAttr).attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1.2).attr('class', 'dynamic-element');
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      var _this$rootElement2,
        _this$hoverAreaElemen,
        _this3 = this;
      var selectionPathDAttr = this.getSelectionContour();
      this.hoverAreaElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.append('path').attr('d', selectionPathDAttr).attr('fill', 'none').attr('stroke', 'none').attr('pointer-events', 'all').attr('class', 'dynamic-element');
      (_this$hoverAreaElemen = this.hoverAreaElement) === null || _this$hoverAreaElemen === void 0 || _this$hoverAreaElemen.on('mouseover', function () {
        _this3.appendHover();
      }).on('mouseout', function () {
        _this3.removeHover();
      });
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (!this.rootElement) {
        return;
      }
      if (this.arrow.selected) {
        this.appendSelection();
      } else {
        this.removeSelection();
      }
    }
  }, {
    key: "appendSelection",
    value: function appendSelection() {
      var _this$canvas;
      var selectionPathDAttr = this.getSelectionContour(this.scaledPosition.startPosition);
      this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('path', ':first-child').attr('d', selectionPathDAttr).attr('fill', constants.SELECTION_COLOR).attr('stroke', constants.SELECTION_COLOR).attr('class', 'dynamic-element');
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionElemen;
      (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
      this.selectionElement = undefined;
    }
  }, {
    key: "move",
    value: function move() {
      if (!this.rootElement) {
        return;
      }
      this.remove();
      this.show();
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$hoverElement;
      (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.remove();
      this.hoverElement = undefined;
    }
  }, {
    key: "remove",
    value: function remove() {
      _get__default["default"](_getPrototypeOf__default["default"](RxnArrowRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }]);
  return RxnArrowRenderer;
}(BaseRenderer.BaseRenderer);

exports.RxnArrowRenderer = RxnArrowRenderer;
//# sourceMappingURL=RxnArrowRenderer.js.map
