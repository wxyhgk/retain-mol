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

var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseRenderer = require('./BaseRenderer.js');
var pool = require('../../../domain/entities/pool.js');
var vec2 = require('../../../domain/entities/vec2.js');
var coordinates = require('../../editor/shared/coordinates.js');
var editorSettings = require('../../editor/editorSettings.js');
var constants = require('./constants.js');
var pathBuilder = require('../pathBuilder.js');
var draw = require('../draw.js');
var remultitailArrow = require('../restruct/remultitailArrow.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _objectWithoutProperties__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutProperties);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var _excluded = ["tails"];
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ARROW_STROKE_WIDTH = 2;
var MULTITAIL_ARROW_TEST_ID = 'multitail-arrow';
var RXN_ARROW_TEST_ID = 'rxn-arrow';
var MultitailArrowRenderer = function (_BaseRenderer) {
  _inherits__default["default"](MultitailArrowRenderer, _BaseRenderer);
  function MultitailArrowRenderer(arrow) {
    var _this;
    _classCallCheck__default["default"](this, MultitailArrowRenderer);
    _this = _callSuper(this, MultitailArrowRenderer, [arrow]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "arrow", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionElement", void 0);
    _this.arrow = arrow;
    _this.arrow.setRenderer(_assertThisInitialized__default["default"](_this));
    return _this;
  }
  _createClass__default["default"](MultitailArrowRenderer, [{
    key: "selectionPoints",
    get: function get() {
      return this.getReferencePositionsArray();
    }
  }, {
    key: "getReferencePositionsArray",
    value: function getReferencePositionsArray() {
      var _this$getReferencePos = this.getReferencePositions(),
        tails = _this$getReferencePos.tails,
        positions = _objectWithoutProperties__default["default"](_this$getReferencePos, _excluded);
      return Object.values(positions).concat(Array.from(tails.values()));
    }
  }, {
    key: "getReferencePositions",
    value: function getReferencePositions() {
      var positions = this.arrow.getReferencePositions();
      var tails = new pool.Pool();
      positions.tails.forEach(function (item, key) {
        tails.set(key, coordinates.Coordinates.modelToCanvas(item));
      });
      return {
        head: coordinates.Coordinates.modelToCanvas(positions.head),
        topTail: coordinates.Coordinates.modelToCanvas(positions.topTail),
        bottomTail: coordinates.Coordinates.modelToCanvas(positions.bottomTail),
        topSpine: coordinates.Coordinates.modelToCanvas(positions.topSpine),
        bottomSpine: coordinates.Coordinates.modelToCanvas(positions.bottomSpine),
        tails: tails
      };
    }
  }, {
    key: "getArrowPaths",
    value: function getArrowPaths() {
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      var pathBuilder$1 = new pathBuilder.PathBuilder();
      var headPathBuilder = new pathBuilder.PathBuilder();
      var _this$getReferencePos2 = this.getReferencePositions(),
        topTail = _this$getReferencePos2.topTail,
        topSpine = _this$getReferencePos2.topSpine,
        bottomSpine = _this$getReferencePos2.bottomSpine,
        head = _this$getReferencePos2.head,
        tails = _this$getReferencePos2.tails;
      var topTailOffsetX = topSpine.sub(topTail).x;
      var headLineStartOffset = Math.min(remultitailArrow.ReMultitailArrow.HEAD_LINE_START_OFFSET, Math.max(0, head.x - topSpine.x));
      var arrowStart = new vec2.Vec2(topSpine.x + headLineStartOffset, head.y);
      var arrowLength = head.x - arrowStart.x;
      var arrowHeadLength = draw.ARROW_HEAD_LENGHT * macroModeScale;
      var arrowHeadWidth = draw.ARROW_HEAD_WIDTH * macroModeScale;
      pathBuilder$1.addMultitailArrowBase(topSpine.y, bottomSpine.y, topSpine.x, topTailOffsetX);
      headPathBuilder.addFilledTriangleArrowPathParts(arrowStart, arrowLength, arrowHeadLength, arrowHeadWidth);
      tails.forEach(function (tail) {
        pathBuilder$1.addLine(tail, {
          x: topSpine.x,
          y: tail.y
        });
      });
      return {
        arrowBody: pathBuilder$1.build(),
        arrowHead: headPathBuilder.build()
      };
    }
  }, {
    key: "getSelectionContour",
    value: function getSelectionContour() {
      var macroModeScale = editorSettings.provideEditorSettings().macroModeScale;
      var offset = remultitailArrow.ReMultitailArrow.FRAME_OFFSET * macroModeScale;
      var _this$getReferencePos3 = this.getReferencePositions(),
        topSpine = _this$getReferencePos3.topSpine,
        bottomSpine = _this$getReferencePos3.bottomSpine,
        topTail = _this$getReferencePos3.topTail,
        bottomTail = _this$getReferencePos3.bottomTail,
        head = _this$getReferencePos3.head,
        tails = _this$getReferencePos3.tails;
      var builder = new pathBuilder.PathBuilder();
      var tailsPoints = Array.from(tails.values()).sort(function (a, b) {
        return a.y - b.y;
      });
      var start = topSpine.add(new vec2.Vec2(offset, offset));
      builder.addMovement(start).addLine(topSpine.add(new vec2.Vec2(offset, -offset + remultitailArrow.ReMultitailArrow.CUBIC_BEZIER_OFFSET))).addQuadraticBezierCurve(topSpine.add(new vec2.Vec2(offset, -offset)), topSpine.add(new vec2.Vec2(offset - remultitailArrow.ReMultitailArrow.CUBIC_BEZIER_OFFSET, -offset)));
      remultitailArrow.ReMultitailArrow.drawSingleLineHover(builder, offset, topSpine, topTail, -1, -1);
      tailsPoints.forEach(function (tailPoint) {
        remultitailArrow.ReMultitailArrow.drawSingleLineHover(builder, offset, new vec2.Vec2(topSpine.x, tailPoint.y), tailPoint, -1, -1);
      });
      remultitailArrow.ReMultitailArrow.drawSingleLineHover(builder, offset, bottomSpine, bottomTail, -1, -1);
      builder.addLine(bottomSpine.add(new vec2.Vec2(offset - remultitailArrow.ReMultitailArrow.CUBIC_BEZIER_OFFSET, offset))).addQuadraticBezierCurve(bottomSpine.add(new vec2.Vec2(offset, offset)), bottomSpine.add(new vec2.Vec2(offset, offset - remultitailArrow.ReMultitailArrow.CUBIC_BEZIER_OFFSET)));
      remultitailArrow.ReMultitailArrow.drawSingleLineHover(builder, offset, new vec2.Vec2(topSpine.x, head.y), head, 1, 1);
      builder.addLine(start);
      return builder.build();
    }
  }, {
    key: "show",
    value: function show() {
      var arrowId = typeof this.arrow.arrowId === 'number' ? String(this.arrow.arrowId) : undefined;
      this.rootElement = this.canvas.insert('g', ".monomer").data([this]).attr('data-testid', MULTITAIL_ARROW_TEST_ID);
      if (arrowId) {
        this.rootElement.attr('data-arrow-id', arrowId);
      }
      var arrowPaths = this.getArrowPaths();
      var bodyPath = this.rootElement.append('path').attr('data-testid', RXN_ARROW_TEST_ID).attr('data-arrowtype', MULTITAIL_ARROW_TEST_ID).attr('stroke', '#000').attr('stroke-width', ARROW_STROKE_WIDTH).attr('fill', 'none').attr('d', arrowPaths.arrowBody);
      if (arrowId) {
        bodyPath.attr('data-arrow-id', arrowId);
      }
      var headPath = this.rootElement.append('path').attr('d', arrowPaths.arrowHead).attr('stroke', '#000').attr('stroke-width', ARROW_STROKE_WIDTH).attr('fill', '#000');
      if (arrowId) {
        headPath.attr('data-arrow-id', arrowId);
      }
      this.appendHoverAreaElement();
      this.drawSelection();
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      var _this$rootElement;
      var selectionPathDAttr = this.getSelectionContour();
      var arrowId = typeof this.arrow.arrowId === 'number' ? String(this.arrow.arrowId) : undefined;
      this.hoverElement = (_this$rootElement = this.rootElement) === null || _this$rootElement === void 0 ? void 0 : _this$rootElement.insert('path', ':first-child').attr('d', selectionPathDAttr).attr('fill', 'none').attr('stroke', '#0097A8').attr('stroke-width', 1.2).attr('class', 'dynamic-element');
      if (arrowId) {
        var _this$hoverElement;
        (_this$hoverElement = this.hoverElement) === null || _this$hoverElement === void 0 || _this$hoverElement.attr('data-arrow-id', arrowId);
      }
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
      var _this$rootElement2,
        _this$hoverAreaElemen2,
        _this2 = this,
        _this$hoverAreaElemen3;
      var selectionPathDAttr = this.getSelectionContour();
      var arrowId = typeof this.arrow.arrowId === 'number' ? String(this.arrow.arrowId) : undefined;
      this.hoverAreaElement = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.append('path').attr('d', selectionPathDAttr).attr('fill', 'none').attr('stroke', 'none').attr('pointer-events', 'all').attr('class', 'dynamic-element');
      if (arrowId) {
        var _this$hoverAreaElemen;
        (_this$hoverAreaElemen = this.hoverAreaElement) === null || _this$hoverAreaElemen === void 0 || _this$hoverAreaElemen.attr('data-arrow-id', arrowId);
      }
      (_this$hoverAreaElemen2 = this.hoverAreaElement) === null || _this$hoverAreaElemen2 === void 0 || _this$hoverAreaElemen2.on('mouseover', function () {
        _this2.appendHover();
      }).on('mouseout', function () {
        _this2.removeHover();
      });
      (_this$hoverAreaElemen3 = this.hoverAreaElement) === null || _this$hoverAreaElemen3 === void 0 || _this$hoverAreaElemen3.data([this]);
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
      var selectionPathDAttr = this.getSelectionContour();
      var arrowId = typeof this.arrow.arrowId === 'number' ? String(this.arrow.arrowId) : undefined;
      this.selectionElement = (_this$canvas = this.canvas) === null || _this$canvas === void 0 ? void 0 : _this$canvas.insert('path', ':first-child').attr('stroke', constants.SELECTION_COLOR).attr('fill', constants.SELECTION_COLOR).attr('d', selectionPathDAttr);
      if (arrowId) {
        var _this$selectionElemen;
        (_this$selectionElemen = this.selectionElement) === null || _this$selectionElemen === void 0 || _this$selectionElemen.attr('data-arrow-id', arrowId);
      }
    }
  }, {
    key: "removeSelection",
    value: function removeSelection() {
      var _this$selectionElemen2;
      (_this$selectionElemen2 = this.selectionElement) === null || _this$selectionElemen2 === void 0 || _this$selectionElemen2.remove();
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
      var _this$hoverElement2;
      (_this$hoverElement2 = this.hoverElement) === null || _this$hoverElement2 === void 0 || _this$hoverElement2.remove();
      this.hoverElement = undefined;
    }
  }, {
    key: "remove",
    value: function remove() {
      _get__default["default"](_getPrototypeOf__default["default"](MultitailArrowRenderer.prototype), "remove", this).call(this);
      this.removeHover();
      this.removeSelection();
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }]);
  return MultitailArrowRenderer;
}(BaseRenderer.BaseRenderer);

exports.MultitailArrowRenderer = MultitailArrowRenderer;
//# sourceMappingURL=MultitailArrowRenderer.js.map
