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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _get from '@babel/runtime/helpers/get';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../../editor/editorSingleton.modern.js';
import { SELECTION_COLOR, SELECTION_HOVERED_COLOR } from '../constants.modern.js';
import { Coordinates } from '../../../editor/shared/coordinates.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import { assert } from '../../../../utilities/assert.modern.js';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import '../../../../domain/constants/chains.modern.js';
import { MonomerSize } from '../../../../domain/constants/monomers.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import { getStructureBbox } from '../../../../domain/entities/structureBbox.modern.js';
import { BaseRenderer } from '../BaseRenderer.modern.js';
import { generateCornerFromLeftToBottom, generateCornerFromLeftToTop, generateCornerFromRightToBottom, generateCornerFromRightToTop, generateCornerFromTopToRight, generateCornerFromTopToLeft, generateCornerFromBottomToRight, generateCornerFromBottomToLeft, CORNER_LENGTH } from './helpers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var FlexModePolymerBondRenderer = function (_BaseRenderer) {
  _inherits(FlexModePolymerBondRenderer, _BaseRenderer);
  function FlexModePolymerBondRenderer(polymerBond) {
    var _this;
    _classCallCheck(this, FlexModePolymerBondRenderer);
    _this = _callSuper(this, FlexModePolymerBondRenderer, [polymerBond]);
    _defineProperty(_assertThisInitialized(_this), "polymerBond", void 0);
    _defineProperty(_assertThisInitialized(_this), "selectionElement", void 0);
    _defineProperty(_assertThisInitialized(_this), "previousStateOfIsMonomersOnSameHorizontalLine", false);
    _defineProperty(_assertThisInitialized(_this), "path", '');
    _this.polymerBond = polymerBond;
    _this.polymerBond.setRenderer(_assertThisInitialized(_this));
    return _this;
  }
  _createClass(FlexModePolymerBondRenderer, [{
    key: "editorEvents",
    get: function get() {
      return provideEditorInstance().events;
    }
  }, {
    key: "rootBBox",
    get: function get() {
      var _this$rootElement;
      var rootNode = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.node();
      if (!rootNode) return undefined;
      return rootNode.getBBox();
    }
  }, {
    key: "width",
    get: function get() {
      var _this$rootBBox$width, _this$rootBBox;
      return (_this$rootBBox$width = (_this$rootBBox = this.rootBBox) === null || _this$rootBBox === void 0 ? void 0 : _this$rootBBox.width) !== null && _this$rootBBox$width !== void 0 ? _this$rootBBox$width : 0;
    }
  }, {
    key: "height",
    get: function get() {
      var _this$rootBBox$height, _this$rootBBox2;
      return (_this$rootBBox$height = (_this$rootBBox2 = this.rootBBox) === null || _this$rootBBox2 === void 0 ? void 0 : _this$rootBBox2.height) !== null && _this$rootBBox$height !== void 0 ? _this$rootBBox$height : 0;
    }
  }, {
    key: "scaledPosition",
    get: function get() {
      var startPositionInPixels = Coordinates.modelToCanvas(this.polymerBond.startPosition);
      var endPositionInPixels = Coordinates.modelToCanvas(this.polymerBond.endPosition);
      return {
        startPosition: startPositionInPixels,
        endPosition: endPositionInPixels
      };
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
      if (this.previousStateOfIsMonomersOnSameHorizontalLine !== this.polymerBond.isHorizontal) {
        this.remove();
        this.show();
      } else {
        assert(this.rootElement);
        this.moveStart();
        this.moveEnd();
      }
      this.previousStateOfIsMonomersOnSameHorizontalLine = this.polymerBond.isHorizontal;
    }
  }, {
    key: "appendBond",
    value: function appendBond(rootElement) {
      if (this.polymerBond.isOverlappedByMonomer) {
        this.generateEnvelopingBondPath();
      } else {
        this.generateLinearBondPath();
      }
      this.appendBondGraph(rootElement);
      return this.bodyElement;
    }
  }, {
    key: "generateLinearBondPath",
    value: function generateLinearBondPath() {
      var _this$scaledPosition = this.scaledPosition,
        startPosition = _this$scaledPosition.startPosition,
        endPosition = _this$scaledPosition.endPosition;
      this.path = "\n      M".concat(startPosition.x, ",").concat(startPosition.y, "\n      L").concat(endPosition.x, ",").concat(endPosition.y, "\n    ");
    }
  }, {
    key: "generateEnvelopingBondPath",
    value: function generateEnvelopingBondPath() {
      if (!this.polymerBond.secondMonomer) {
        return;
      }
      var subStructureBBox = getStructureBbox([this.polymerBond.firstMonomer, this.polymerBond.secondMonomer]);
      var expandedBBox = this.getExpandedBoundingBox(subStructureBBox);
      var left = expandedBBox.left,
        top = expandedBBox.top,
        width = expandedBBox.width,
        height = expandedBBox.height;
      var midX = left + width / 2;
      var midY = top + height / 2;
      var isBoundingBoxVertical = Math.abs(this.polymerBond.startPosition.x - midX) < Math.abs(this.polymerBond.startPosition.y - midY);
      var firstPoint = this.getPointOnBBox(this.polymerBond.startPosition, expandedBBox);
      var secondPoint = this.getPointOnBBox(this.polymerBond.endPosition, expandedBBox);
      var thirdPoint;
      if (isBoundingBoxVertical) {
        thirdPoint = new Vec2(firstPoint.x, secondPoint.y);
      } else {
        thirdPoint = new Vec2(secondPoint.x, firstPoint.y);
      }
      this.path = "M".concat(this.scaledPosition.startPosition.x, ",").concat(this.scaledPosition.startPosition.y);
      var adjustedFirstPoint = this.adjustPointForCorner(this.scaledPosition.startPosition, firstPoint);
      this.path += "L".concat(adjustedFirstPoint.x, ",").concat(adjustedFirstPoint.y);
      this.addCornerBasedOnDirection(this.scaledPosition.startPosition, firstPoint, thirdPoint);
      var adjustedThirdPoint = this.adjustPointForCorner(firstPoint, thirdPoint);
      this.path += "L".concat(adjustedThirdPoint.x, ",").concat(adjustedThirdPoint.y);
      this.addCornerBasedOnDirection(firstPoint, thirdPoint, this.scaledPosition.endPosition);
      this.path += "L".concat(this.scaledPosition.endPosition.x, ",").concat(this.scaledPosition.endPosition.y);
    }
  }, {
    key: "addCornerBasedOnDirection",
    value: function addCornerBasedOnDirection(prevPoint, cornerPoint, nextPoint) {
      if (prevPoint.x !== cornerPoint.x && cornerPoint.y !== nextPoint.y) {
        if (prevPoint.x < cornerPoint.x) {
          if (cornerPoint.y < nextPoint.y) {
            this.path = this.path.concat(generateCornerFromLeftToBottom());
          } else {
            this.path = this.path.concat(generateCornerFromLeftToTop());
          }
        } else if (cornerPoint.y < nextPoint.y) {
          this.path = this.path.concat(generateCornerFromRightToBottom());
        } else {
          this.path = this.path.concat(generateCornerFromRightToTop());
        }
      } else if (prevPoint.y !== cornerPoint.y && cornerPoint.x !== nextPoint.x) {
        if (prevPoint.y < cornerPoint.y) {
          if (cornerPoint.x < nextPoint.x) {
            this.path = this.path.concat(generateCornerFromTopToRight());
          } else {
            this.path = this.path.concat(generateCornerFromTopToLeft());
          }
        } else if (cornerPoint.x < nextPoint.x) {
          this.path = this.path.concat(generateCornerFromBottomToRight());
        } else {
          this.path = this.path.concat(generateCornerFromBottomToLeft());
        }
      }
    }
  }, {
    key: "adjustPointForCorner",
    value: function adjustPointForCorner(startPoint, endPoint) {
      var adjustedPoint = new Vec2(endPoint.x, endPoint.y);
      if (startPoint.x > endPoint.x) {
        adjustedPoint.x += CORNER_LENGTH;
      } else if (startPoint.x < endPoint.x) {
        adjustedPoint.x -= CORNER_LENGTH;
      }
      if (startPoint.y > endPoint.y) {
        adjustedPoint.y += CORNER_LENGTH;
      } else if (startPoint.y < endPoint.y) {
        adjustedPoint.y -= CORNER_LENGTH;
      }
      return adjustedPoint;
    }
  }, {
    key: "appendBondGraph",
    value: function appendBondGraph(rootElement) {
      var _this$polymerBond$sec, _this$polymerBond$sec2;
      this.bodyElement = rootElement.append('path').attr('d', this.path).attr('fill', 'none').attr('stroke', this.polymerBond.finished ? '#333333' : '#0097A8').attr('stroke-width', 1).attr('class', 'selection-area').attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none').attr('data-testid', 'bond').attr('data-bondtype', 'covalent').attr('data-bondid', this.polymerBond.id).attr('data-frommonomerid', this.polymerBond.firstMonomer.id).attr('data-tomonomerid', (_this$polymerBond$sec = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec === void 0 ? void 0 : _this$polymerBond$sec.id).attr('data-fromattachmentpoint', this.polymerBond.firstMonomer.getAttachmentPointByBond(this.polymerBond)).attr('data-toattachmentpoint', (_this$polymerBond$sec2 = this.polymerBond.secondMonomer) === null || _this$polymerBond$sec2 === void 0 ? void 0 : _this$polymerBond$sec2.getAttachmentPointByBond(this.polymerBond));
      return this.bodyElement;
    }
  }, {
    key: "getExpandedBoundingBox",
    value: function getExpandedBoundingBox(bbox) {
      var expansionFactor = this.polymerBond.isSideChainConnection ? MonomerSize - 0.1 : MonomerSize;
      var left = bbox.left,
        top = bbox.top,
        width = bbox.width,
        height = bbox.height;
      if (width < height) {
        left -= expansionFactor;
        width += 2 * expansionFactor;
      } else {
        top -= expansionFactor;
        height += 2 * expansionFactor;
      }
      return {
        left: left,
        top: top,
        width: width,
        height: height
      };
    }
  }, {
    key: "getPointOnBBox",
    value: function getPointOnBBox(position, bbox) {
      var left = bbox.left,
        top = bbox.top,
        width = bbox.width,
        height = bbox.height;
      var midX = left + width / 2;
      var midY = top + height / 2;
      var result;
      if (Math.abs(position.x - midX) < Math.abs(position.y - midY)) {
        result = new Vec2(position.x > midX ? left : left + width, position.y);
      } else {
        result = new Vec2(position.x, position.y > midY ? top + height : top);
      }
      return Coordinates.modelToCanvas(result);
    }
  }, {
    key: "appendRootElement",
    value: function appendRootElement() {
      var _this2 = this;
      return this.canvas.insert('g', ".monomer").data([this]).on('mouseover', function (event) {
        _this2.editorEvents.mouseOverPolymerBond.dispatch(event);
        _this2.editorEvents.mouseOverDrawingEntity.dispatch(event);
      }).on('mousemove', function (event) {
        _this2.editorEvents.mouseOnMovePolymerBond.dispatch(event);
      }).on('mouseout', function (event) {
        _this2.editorEvents.mouseLeavePolymerBond.dispatch(event);
        _this2.editorEvents.mouseLeaveDrawingEntity.dispatch(event);
      }).attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none');
    }
  }, {
    key: "show",
    value: function show() {
      this.rootElement = this.rootElement || this.appendRootElement();
      this.appendBond(this.rootElement);
      this.appendHoverAreaElement();
      this.drawSelection();
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
      if (this.polymerBond.selected) {
        var _this$selectionElemen, _this$rootElement2;
        (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.remove();
        this.selectionElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.insert('path', ':first-child').attr('d', this.path).attr('fill', 'none').attr('stroke', SELECTION_COLOR).attr('stroke-width', '5').attr('class', 'dynamic-element');
      } else {
        var _this$selectionElemen2;
        (_this$selectionElemen2 = this.selectionElement) === null || _this$selectionElemen2 === void 0 || _this$selectionElemen2.remove();
      }
    }
  }, {
    key: "moveEnd",
    value: function moveEnd() {
      this.moveGraphBondEnd();
    }
  }, {
    key: "moveGraphBondEnd",
    value: function moveGraphBondEnd() {
      var _this$selectionElemen3, _this$hoverCircleArea;
      assert(this.bodyElement);
      assert(this.hoverAreaElement);
      this.generateLinearBondPath();
      this.bodyElement.attr('d', this.path);
      this.hoverAreaElement.attr('d', this.path);
      (_this$selectionElemen3 = this.selectionElement) === null || _this$selectionElemen3 === void 0 || _this$selectionElemen3.attr('d', this.path);
      (_this$hoverCircleArea = this.hoverCircleAreaElement) === null || _this$hoverCircleArea === void 0 || _this$hoverCircleArea.attr('cx', this.scaledPosition.endPosition.x).attr('cy', this.scaledPosition.endPosition.y);
    }
  }, {
    key: "moveStart",
    value: function moveStart() {
      this.moveGraphBondStart();
    }
  }, {
    key: "moveGraphBondStart",
    value: function moveGraphBondStart() {
      var _this$selectionElemen4;
      assert(this.bodyElement);
      assert(this.hoverAreaElement);
      this.generateLinearBondPath();
      this.bodyElement.attr('d', this.path);
      this.hoverAreaElement.attr('d', this.path);
      (_this$selectionElemen4 = this.selectionElement) === null || _this$selectionElemen4 === void 0 || _this$selectionElemen4.attr('d', this.path);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      var _this$rootElement3, _this$rootElement4;
      this.hoverAreaElement = (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 ? void 0 : _this$rootElement3.append('path').attr('d', this.path).attr('fill', 'none').attr('stroke', 'transparent').attr('stroke-width', '10');
      this.hoverCircleAreaElement = (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 ? void 0 : _this$rootElement4.append('circle').attr('cursor', 'pointer').attr('r', '1').attr('fill', 'transparent').attr('pointer-events', 'none').attr('stroke-width', '10').attr('cx', this.scaledPosition.endPosition.x).attr('cy', this.scaledPosition.endPosition.y);
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      assert(this.bodyElement);
      this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');
      if (this.polymerBond.selected && this.selectionElement) {
        this.selectionElement.attr('stroke', SELECTION_HOVERED_COLOR);
      }
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      assert(this.bodyElement);
      assert(this.hoverAreaElement);
      this.bodyElement.attr('stroke', '#333333').attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none');
      if (this.polymerBond.selected && this.selectionElement) {
        this.selectionElement.attr('stroke', SELECTION_COLOR);
      }
      return this.hoverAreaElement.attr('stroke', 'transparent');
    }
  }, {
    key: "remove",
    value: function remove() {
      _get(_getPrototypeOf(FlexModePolymerBondRenderer.prototype), "remove", this).call(this);
      if (this.polymerBond.hovered) {
        this.editorEvents.mouseLeaveMonomer.dispatch();
      }
    }
  }]);
  return FlexModePolymerBondRenderer;
}(BaseRenderer);

export { FlexModePolymerBondRenderer };
//# sourceMappingURL=FlexModePolymerBondRenderer.modern.js.map
