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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseRenderer } from './BaseRenderer.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';
import { RxnArrowMode } from '../../../domain/entities/rxnArrow.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { SELECTION_COLOR } from './constants.modern.js';
import { OpenAngleArrowRenderer } from './RxnArrowPathRenderer/OpenAngleArrowRenderer.modern.js';
import { FilledTriangleArrowRenderer } from './RxnArrowPathRenderer/FilledTriangleArrowRenderer.modern.js';
import { FilledBowArrowRenderer } from './RxnArrowPathRenderer/FilledBowArrowRenderer.modern.js';
import { DashedOpenAngleArrowRenderer } from './RxnArrowPathRenderer/DashedOpenAngleArrowRenderer.modern.js';
import { FailedArrowRenderer } from './RxnArrowPathRenderer/FailedArrowRenderer.modern.js';
import { RetrosyntheticArrowRenderer } from './RxnArrowPathRenderer/RetrosyntheticArrowRenderer.modern.js';
import { BothEndsFilledArrowRenderer } from './RxnArrowPathRenderer/BothEndsFilledArrowRenderer.modern.js';
import { EquilibriumFilledHalfBowArrowRenderer } from './RxnArrowPathRenderer/EquilibriumFilledHalfBowArrowRenderer.modern.js';
import { EquilibriumFilledTriangleArrowRenderer } from './RxnArrowPathRenderer/EquilibriumFilledTriangleArrowRenderer.modern.js';
import { EquilibriumOpenAngleArrowRenderer } from './RxnArrowPathRenderer/EquilibriumOpenAngleArrowRenderer.modern.js';
import { UnbalancedEquilibriumFilledHalfBowArrowRenderer } from './RxnArrowPathRenderer/UnbalancedEquilibriumFilledHalfBowArrowRenderer.modern.js';
import { UnbalancedEquilibriumOpenHalfAngleArrowRenderer } from './RxnArrowPathRenderer/UnbalancedEquilibriumOpenHalfAngleArrowRenderer.modern.js';
import { UnbalancedEquilibriumFilledHalfTriangleArrowRenderer } from './RxnArrowPathRenderer/UnbalancedEquilibriumFilledHalfTriangleArrowRenderer.modern.js';
import { EllipticalArcFilledBowArrowRenderer } from './RxnArrowPathRenderer/EllipticalArcFilledBowArrowRenderer.modern.js';
import { provideEditorSettings } from '../../editor/editorSettings.modern.js';
import { EllipticalArcFilledTriangleArrowRenderer } from './RxnArrowPathRenderer/EllipticalArcFilledTriangleArrowRenderer.modern.js';
import { EllipticalArcOpenAngleArrowRenderer } from './RxnArrowPathRenderer/EllipticalArcOpenAngleArrowRenderer.modern.js';
import { EllipticalArcOpenHalfAngleArrowRenderer } from './RxnArrowPathRenderer/EllipticalArcOpenHalfAngleArrowRenderer.modern.js';
import { toFixed } from '../../../utilities/toFixed.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer } from './RxnArrowPathRenderer/UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer.modern.js';
import svgPath from 'svgpath';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ARROW_STROKE_WIDTH = 2;
var RxnArrowRenderer = function (_BaseRenderer) {
  _inherits(RxnArrowRenderer, _BaseRenderer);
  function RxnArrowRenderer(arrow) {
    var _this;
    _classCallCheck(this, RxnArrowRenderer);
    _this = _callSuper(this, RxnArrowRenderer, [arrow]);
    _defineProperty(_assertThisInitialized(_this), "arrow", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _this.arrow = arrow;
    _this.arrow.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(RxnArrowRenderer, [{
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = Scale.modelToCanvas(this.arrow.startPosition, this.editorSettings);
      var endPositionInPixels = Scale.modelToCanvas(this.arrow.endPosition, this.editorSettings);
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
      var angle = Vec2.radiansToDegrees(Vec2.oxAngleForVector(new Vec2(startPosition.x, startPosition.y), new Vec2(endPosition.x, endPosition.y)));
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
      var startPosition = new Vec2(0, 0);
      var macroModeScale = provideEditorSettings().macroModeScale;
      var height = ((_this$arrow$height = this.arrow.height) !== null && _this$arrow$height !== void 0 ? _this$arrow$height : 0) * macroModeScale;
      var paths = [];
      switch (this.arrow.type) {
        case RxnArrowMode.OpenAngle:
          paths = OpenAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.FilledTriangle:
          paths = FilledTriangleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.FilledBow:
          paths = FilledBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.DashedOpenAngle:
          paths = DashedOpenAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.Failed:
          paths = FailedArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.Retrosynthetic:
          paths = RetrosyntheticArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.BothEndsFilledTriangle:
          paths = BothEndsFilledArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.EquilibriumFilledHalfBow:
          paths = EquilibriumFilledHalfBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.EquilibriumFilledTriangle:
          paths = EquilibriumFilledTriangleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.EquilibriumOpenAngle:
          paths = EquilibriumOpenAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.UnbalancedEquilibriumFilledHalfBow:
          paths = UnbalancedEquilibriumFilledHalfBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.UnbalancedEquilibriumOpenHalfAngle:
          paths = UnbalancedEquilibriumOpenHalfAngleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.UnbalancedEquilibriumLargeFilledHalfBow:
          paths = UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.UnbalancedEquilibriumFilledHalfTriangle:
          paths = UnbalancedEquilibriumFilledHalfTriangleArrowRenderer.preparePaths(startPosition, length, angle);
          break;
        case RxnArrowMode.EllipticalArcFilledBow:
          paths = EllipticalArcFilledBowArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        case RxnArrowMode.EllipticalArcFilledTriangle:
          paths = EllipticalArcFilledTriangleArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        case RxnArrowMode.EllipticalArcOpenAngle:
          paths = EllipticalArcOpenAngleArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        case RxnArrowMode.EllipticalArcOpenHalfAngle:
          paths = EllipticalArcOpenHalfAngleArrowRenderer.preparePaths(startPosition, length, angle, height);
          break;
        default:
          KetcherLogger.error('Unknown RxnArrow arrow type: ', this.arrow.type);
          break;
      }
      return paths;
    }
  }, {
    key: "getSelectionContour",
    value: function getSelectionContour(startPosition) {
      var _this$arrow$height2;
      var macroModeScale = provideEditorSettings().macroModeScale;
      var _this$getArrowParams2 = this.getArrowParams(),
        length = _this$getArrowParams2.length,
        angle = _this$getArrowParams2.angle;
      var height = ((_this$arrow$height2 = this.arrow.height) !== null && _this$arrow$height2 !== void 0 ? _this$arrow$height2 : 0) * macroModeScale;
      var start = startPosition !== null && startPosition !== void 0 ? startPosition : new Vec2(0, 0);
      var endX = start.x + length;
      var normalizedHeight = height === 0 ? undefined : height;
      var wOffset = 5,
        hOffset = normalizedHeight !== null && normalizedHeight !== void 0 ? normalizedHeight : 8;
      var path = "M".concat(toFixed(start.x - wOffset), ",").concat(toFixed(start.y)) + "L".concat(toFixed(start.x - wOffset), ",").concat(toFixed(start.y - hOffset)) + "L".concat(toFixed(endX + wOffset), ",").concat(toFixed(start.y - hOffset)) + "L".concat(toFixed(endX + wOffset), ",").concat(toFixed(start.y + (!height ? hOffset : 0))) + "L".concat(toFixed(start.x - wOffset), ",").concat(toFixed(start.y + (!height ? hOffset : 0)), "Z");
      return svgPath(path).rotate(angle, start.x, start.y).toString();
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
          var _ref3 = _slicedToArray(_ref2, 2),
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
      this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('path', ':first-child').attr('d', selectionPathDAttr).attr('fill', SELECTION_COLOR).attr('stroke', SELECTION_COLOR).attr('class', 'dynamic-element');
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
      _get(_getPrototypeOf(RxnArrowRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }]);
  return RxnArrowRenderer;
}(BaseRenderer);

export { RxnArrowRenderer };
//# sourceMappingURL=RxnArrowRenderer.modern.js.map
