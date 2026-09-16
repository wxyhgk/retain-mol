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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../../editor/editorSingleton.js');
var constants = require('../constants.js');
var coordinates = require('../../../editor/shared/coordinates.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/constants/chains.js');
var monomers = require('../../../../domain/constants/monomers.js');
var vec2 = require('../../../../domain/entities/vec2.js');
var structureBbox = require('../../../../domain/entities/structureBbox.js');
var BaseRenderer = require('../BaseRenderer.js');
var helpers = require('./helpers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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
var FlexModePolymerBondRenderer = function (_BaseRenderer) {
  _inherits__default["default"](FlexModePolymerBondRenderer, _BaseRenderer);
  function FlexModePolymerBondRenderer(polymerBond) {
    var _this;
    _classCallCheck__default["default"](this, FlexModePolymerBondRenderer);
    _this = _callSuper(this, FlexModePolymerBondRenderer, [polymerBond]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "polymerBond", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousStateOfIsMonomersOnSameHorizontalLine", false);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "path", '');
    _this.polymerBond = polymerBond;
    _this.polymerBond.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](FlexModePolymerBondRenderer, [{
    key: "editorEvents",
    get: function get() {
      return editorSingleton.provideEditorInstance().events;
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
      var startPositionInPixels = coordinates.Coordinates.modelToCanvas(this.polymerBond.startPosition);
      var endPositionInPixels = coordinates.Coordinates.modelToCanvas(this.polymerBond.endPosition);
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
        assert.assert(this.rootElement);
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
      var subStructureBBox = structureBbox.getStructureBbox([this.polymerBond.firstMonomer, this.polymerBond.secondMonomer]);
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
        thirdPoint = new vec2.Vec2(firstPoint.x, secondPoint.y);
      } else {
        thirdPoint = new vec2.Vec2(secondPoint.x, firstPoint.y);
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
            this.path = this.path.concat(helpers.generateCornerFromLeftToBottom());
          } else {
            this.path = this.path.concat(helpers.generateCornerFromLeftToTop());
          }
        } else if (cornerPoint.y < nextPoint.y) {
          this.path = this.path.concat(helpers.generateCornerFromRightToBottom());
        } else {
          this.path = this.path.concat(helpers.generateCornerFromRightToTop());
        }
      } else if (prevPoint.y !== cornerPoint.y && cornerPoint.x !== nextPoint.x) {
        if (prevPoint.y < cornerPoint.y) {
          if (cornerPoint.x < nextPoint.x) {
            this.path = this.path.concat(helpers.generateCornerFromTopToRight());
          } else {
            this.path = this.path.concat(helpers.generateCornerFromTopToLeft());
          }
        } else if (cornerPoint.x < nextPoint.x) {
          this.path = this.path.concat(helpers.generateCornerFromBottomToRight());
        } else {
          this.path = this.path.concat(helpers.generateCornerFromBottomToLeft());
        }
      }
    }
  }, {
    key: "adjustPointForCorner",
    value: function adjustPointForCorner(startPoint, endPoint) {
      var adjustedPoint = new vec2.Vec2(endPoint.x, endPoint.y);
      if (startPoint.x > endPoint.x) {
        adjustedPoint.x += helpers.CORNER_LENGTH;
      } else if (startPoint.x < endPoint.x) {
        adjustedPoint.x -= helpers.CORNER_LENGTH;
      }
      if (startPoint.y > endPoint.y) {
        adjustedPoint.y += helpers.CORNER_LENGTH;
      } else if (startPoint.y < endPoint.y) {
        adjustedPoint.y -= helpers.CORNER_LENGTH;
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
      var expansionFactor = this.polymerBond.isSideChainConnection ? monomers.MonomerSize - 0.1 : monomers.MonomerSize;
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
        result = new vec2.Vec2(position.x > midX ? left : left + width, position.y);
      } else {
        result = new vec2.Vec2(position.x, position.y > midY ? top + height : top);
      }
      return coordinates.Coordinates.modelToCanvas(result);
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
        this.selectionElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.insert('path', ':first-child').attr('d', this.path).attr('fill', 'none').attr('stroke', constants.SELECTION_COLOR).attr('stroke-width', '5').attr('class', 'dynamic-element');
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
      assert.assert(this.bodyElement);
      assert.assert(this.hoverAreaElement);
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
      assert.assert(this.bodyElement);
      assert.assert(this.hoverAreaElement);
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
      assert.assert(this.bodyElement);
      this.bodyElement.attr('stroke', '#0097A8').attr('pointer-events', 'none');
      if (this.polymerBond.selected && this.selectionElement) {
        this.selectionElement.attr('stroke', constants.SELECTION_HOVERED_COLOR);
      }
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      assert.assert(this.bodyElement);
      assert.assert(this.hoverAreaElement);
      this.bodyElement.attr('stroke', '#333333').attr('pointer-events', this.polymerBond.finished ? 'stroke' : 'none');
      if (this.polymerBond.selected && this.selectionElement) {
        this.selectionElement.attr('stroke', constants.SELECTION_COLOR);
      }
      return this.hoverAreaElement.attr('stroke', 'transparent');
    }
  }, {
    key: "remove",
    value: function remove() {
      _get__default["default"](_getPrototypeOf__default["default"](FlexModePolymerBondRenderer.prototype), "remove", this).call(this);
      if (this.polymerBond.hovered) {
        this.editorEvents.mouseLeaveMonomer.dispatch();
      }
    }
  }]);
  return FlexModePolymerBondRenderer;
}(BaseRenderer.BaseRenderer);

exports.FlexModePolymerBondRenderer = FlexModePolymerBondRenderer;
//# sourceMappingURL=FlexModePolymerBondRenderer.js.map
