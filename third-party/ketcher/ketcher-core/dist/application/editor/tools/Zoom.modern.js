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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { zoom, drag, ZoomTransform, select } from 'd3';
import { drawnStructuresSelector, canvasSelector } from '../constants.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { clamp, isNumber } from 'lodash';
import { notifyRenderComplete } from '../../render/notifyRenderComplete.modern.js';

var SCROLL_POSITION;
(function (SCROLL_POSITION) {
  SCROLL_POSITION["CENTER"] = "CENTER";
  SCROLL_POSITION["BOTTOM"] = "BOTTOM";
})(SCROLL_POSITION || (SCROLL_POSITION = {}));
var AUTO_SCROLL_OFFSET_X = 10;
var AUTO_SCROLL_OFFSET_Y = 10;
var ZoomTool = function () {
  function ZoomTool(drawingEntitiesManager, canvas) {
    var _this = this;
    _classCallCheck(this, ZoomTool);
    _defineProperty(this, "canvas", void 0);
    _defineProperty(this, "canvasWrapper", void 0);
    _defineProperty(this, "zoom", void 0);
    _defineProperty(this, "zoomLevel", void 0);
    _defineProperty(this, "_zoomTransform", void 0);
    _defineProperty(this, "resizeObserver", null);
    _defineProperty(this, "drawingEntitiesManager", void 0);
    _defineProperty(this, "zoomEventHandlers", []);
    _defineProperty(this, "scrollBars", void 0);
    _defineProperty(this, "COLOR", '#a5afb9');
    _defineProperty(this, "MIN_LENGTH", 40);
    _defineProperty(this, "RADIUS", 2);
    _defineProperty(this, "MARGIN", 5);
    _defineProperty(this, "HORIZONTAL_DIST_TO_EDGE", 16);
    _defineProperty(this, "VERTICAL_DIST_TO_EDGE", 4);
    _defineProperty(this, "WIDTH", 4);
    _defineProperty(this, "MINZOOMSCALE", 0.2);
    _defineProperty(this, "MAXZOOMSCALE", 4);
    _defineProperty(this, "dragged", function (name) {
      return function (event) {
        if (name === 'horizontal') {
          var _this$zoom;
          (_this$zoom = _this.zoom) === null || _this$zoom === void 0 || _this$zoom.translateBy(_this.canvasWrapper, -event.dx, 0);
        } else {
          var _this$zoom2;
          (_this$zoom2 = _this.zoom) === null || _this$zoom2 === void 0 || _this$zoom2.translateBy(_this.canvasWrapper, 0, -event.dy);
        }
      };
    });
    _defineProperty(this, "observeCanvasResize", function () {
      _this.resizeObserver = new ResizeObserver(function () {
        _this.drawScrollBars();
      });
      _this.resizeObserver.observe(_this.canvasWrapper.node());
    });
    if (canvas) {
      this.canvasWrapper = select(canvas);
      this.canvas = select(canvas).select(drawnStructuresSelector);
    } else {
      this.canvasWrapper = select(canvasSelector);
      this.canvas = select(drawnStructuresSelector);
    }
    this.zoomLevel = 1;
    this._zoomTransform = new ZoomTransform(1, 0, 0);
    this.drawingEntitiesManager = drawingEntitiesManager;
    this.initActions();
  }
  _createClass(ZoomTool, [{
    key: "initActions",
    value: function initActions() {
      var _this2 = this;
      this.zoom = zoom().scaleExtent([this.MINZOOMSCALE, this.MAXZOOMSCALE]).wheelDelta(this.defaultWheelDelta).filter(function (e) {
        e.preventDefault();
        if (e.ctrlKey && e.type === 'wheel') {
          return true;
        }
        return false;
      }).on('zoom', this.zoomAction.bind(this)).on('end', function () {
        notifyRenderComplete();
      });
      this.canvasWrapper.call(this.zoom);
      this.canvasWrapper.on('wheel', function (event) {
        if (event.ctrlKey) {
          event.preventDefault();
        } else {
          _this2.mouseWheeled(event);
        }
      });
    }
  }, {
    key: "setZoomLevel",
    value: function setZoomLevel(zoomLevel) {
      this.zoomLevel = zoomLevel;
    }
  }, {
    key: "getZoomLevel",
    value: function getZoomLevel() {
      return this.zoomLevel;
    }
  }, {
    key: "setZoomTransform",
    value: function setZoomTransform(transform) {
      this._zoomTransform = transform;
    }
  }, {
    key: "zoomTransform",
    get: function get() {
      return this._zoomTransform;
    }
  }, {
    key: "zoomAction",
    value: function zoomAction(_ref) {
      var _this3 = this;
      var transform = _ref.transform;
      this.canvas.attr('transform', transform);
      this.zoomLevel = transform.k;
      this._zoomTransform = transform;
      this.drawScrollBars();
      requestAnimationFrame(function () {
        _this3.dispatchZoomEventHandlers(transform);
      });
    }
  }, {
    key: "subscribeOnZoomEvent",
    value: function subscribeOnZoomEvent(zoomEventHandler) {
      this.zoomEventHandlers.push(zoomEventHandler);
    }
  }, {
    key: "unsubscribeOnZoomEvent",
    value: function unsubscribeOnZoomEvent(zoomEventHandler) {
      this.zoomEventHandlers = this.zoomEventHandlers.filter(function (handler) {
        return handler !== zoomEventHandler;
      });
    }
  }, {
    key: "dispatchZoomEventHandlers",
    value: function dispatchZoomEventHandlers(transform) {
      this.zoomEventHandlers.forEach(function (zoomEventHandler) {
        zoomEventHandler(transform);
      });
    }
  }, {
    key: "drawScrollBars",
    value: function drawScrollBars() {
      var forceHide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      if (this.canvas.node() && this.canvasWrapper.node()) {
        this.initScrollBars();
        this.renderScrollBar(this.scrollBars.horizontal, forceHide);
        this.renderScrollBar(this.scrollBars.vertical, forceHide);
      }
    }
  }, {
    key: "renderScrollBar",
    value: function renderScrollBar(scrollBar) {
      var forceHide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var hasOffset = scrollBar.offsetStart < 0 || scrollBar.offsetEnd < 0;
      if (hasOffset && !forceHide) {
        if (scrollBar.bar) {
          this.updateScrollBarAttrs(scrollBar);
        } else {
          this.drawScrollBar(scrollBar);
        }
      } else {
        var _scrollBar$bar;
        (_scrollBar$bar = scrollBar.bar) === null || _scrollBar$bar === void 0 || _scrollBar$bar.remove();
        scrollBar.bar = undefined;
      }
    }
  }, {
    key: "drawScrollBar",
    value: function drawScrollBar(scrollBar) {
      var _scrollBar$bar2;
      scrollBar.bar = this.canvasWrapper.append('rect');
      var dragged = drag().on('drag', this.dragged(scrollBar.name).bind(this));
      (_scrollBar$bar2 = scrollBar.bar) === null || _scrollBar$bar2 === void 0 || _scrollBar$bar2.call(dragged);
      this.updateScrollBarAttrs(scrollBar);
    }
  }, {
    key: "updateScrollBarAttrs",
    value: function updateScrollBarAttrs(scrollBar) {
      var _scrollBar$bar5;
      var _this$calculateDynami = this.calculateDynamicAttr(scrollBar),
        start = _this$calculateDynami.start,
        length = _this$calculateDynami.length;
      if (scrollBar.name === 'horizontal') {
        var _scrollBar$bar3;
        (_scrollBar$bar3 = scrollBar.bar) === null || _scrollBar$bar3 === void 0 || _scrollBar$bar3.attr('x', start).attr('y', scrollBar.maxHeight - this.HORIZONTAL_DIST_TO_EDGE).attr('width', length).attr('height', this.WIDTH);
      } else {
        var _scrollBar$bar4;
        (_scrollBar$bar4 = scrollBar.bar) === null || _scrollBar$bar4 === void 0 || _scrollBar$bar4.attr('x', scrollBar.maxHeight - this.VERTICAL_DIST_TO_EDGE).attr('y', start).attr('width', this.WIDTH).attr('height', length);
      }
      (_scrollBar$bar5 = scrollBar.bar) === null || _scrollBar$bar5 === void 0 || _scrollBar$bar5.attr('rx', this.RADIUS).attr('draggable', true).attr('cursor', 'pointer').attr('stroke', this.COLOR).attr('fill', this.COLOR).attr('data-testid', scrollBar.name + '-bar').attr('class', 'dynamic-element');
    }
  }, {
    key: "calculateDynamicAttr",
    value: function calculateDynamicAttr(scrollBar) {
      var start = clamp(-scrollBar.offsetStart, this.MARGIN, scrollBar.maxWidth - this.MIN_LENGTH - this.MARGIN);
      var end = scrollBar.maxWidth - clamp(-scrollBar.offsetEnd, this.MARGIN, scrollBar.maxWidth);
      var length = Math.max(end - start, this.MIN_LENGTH);
      return {
        start: start,
        length: length
      };
    }
  }, {
    key: "scrollTo",
    value: function scrollTo(position) {
      var _this$canvasWrapper$n, _this$canvasWrapper$n2, _this$_zoomTransform$, _this$_zoomTransform, _this$zoom3;
      var stickToBottom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var xOffset = arguments.length > 2 ? arguments[2] : undefined;
      var yOffset = arguments.length > 3 ? arguments[3] : undefined;
      var isOffsetInPercents = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
      var needScrollVertical = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
      var canvasWrapperHeight = ((_this$canvasWrapper$n = this.canvasWrapper.node()) === null || _this$canvasWrapper$n === void 0 ? void 0 : _this$canvasWrapper$n.height.baseVal.value) || 0;
      var canvasWrapperWidth = ((_this$canvasWrapper$n2 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n2 === void 0 ? void 0 : _this$canvasWrapper$n2.width.baseVal.value) || 0;
      var xOffsetValue;
      if (isNumber(xOffset) && !isOffsetInPercents) {
        xOffsetValue = xOffset;
      } else {
        var xOffsetOrDefault = isNumber(xOffset) ? xOffset : AUTO_SCROLL_OFFSET_X;
        xOffsetValue = canvasWrapperWidth * xOffsetOrDefault / 100;
      }
      var yOffsetValue;
      if (isNumber(yOffset) && !isOffsetInPercents) {
        yOffsetValue = yOffset;
      } else {
        var yOffsetOrDefault = isNumber(yOffset) ? yOffset : AUTO_SCROLL_OFFSET_Y;
        yOffsetValue = canvasWrapperHeight * yOffsetOrDefault / 100;
      }
      var offset = new Vec2(canvasWrapperWidth / 2 - xOffsetValue, canvasWrapperHeight / 2 - yOffsetValue);
      var currentY = (_this$_zoomTransform$ = (_this$_zoomTransform = this._zoomTransform) === null || _this$_zoomTransform === void 0 ? void 0 : _this$_zoomTransform.y) !== null && _this$_zoomTransform$ !== void 0 ? _this$_zoomTransform$ : 0;
      var yPosition;
      if (needScrollVertical) {
        var multiplier = stickToBottom ? -1 : 1;
        yPosition = position.y + this.unzoomValue(offset.y * multiplier);
      } else {
        yPosition = this.unzoomValue(canvasWrapperHeight / 2 - currentY);
      }
      (_this$zoom3 = this.zoom) === null || _this$zoom3 === void 0 || _this$zoom3.translateTo(this.canvasWrapper, position.x + this.unzoomValue(offset.x), yPosition);
    }
  }, {
    key: "scrollBy",
    value: function scrollBy(x, y) {
      var _this$zoom4;
      (_this$zoom4 = this.zoom) === null || _this$zoom4 === void 0 || _this$zoom4.translateBy(this.canvasWrapper, this.unzoomValue(x), this.unzoomValue(y));
    }
  }, {
    key: "scrollToVerticalCenter",
    value: function scrollToVerticalCenter(structCenterY) {
      var _this$zoom5;
      var centerPointOfModel = this.drawingEntitiesManager.getCurrentCenterPointOfCanvas();
      var offsetY = centerPointOfModel.y - structCenterY;
      (_this$zoom5 = this.zoom) === null || _this$zoom5 === void 0 || _this$zoom5.translateBy(this.canvasWrapper, 0, offsetY);
    }
  }, {
    key: "scrollToVerticalBottom",
    value: function scrollToVerticalBottom() {
      this.drawScrollBars();
      if (this.scrollBars.vertical.offsetEnd < 0) {
        var _this$zoom6;
        (_this$zoom6 = this.zoom) === null || _this$zoom6 === void 0 || _this$zoom6.translateBy(this.canvasWrapper, 0, this.scrollBars.vertical.offsetEnd / this.zoomLevel);
      }
    }
  }, {
    key: "mouseWheeled",
    value: function mouseWheeled(event) {
      var isShiftKeydown = event.shiftKey;
      var boxNode = this.canvasWrapper.node();
      if (boxNode && (event.deltaX || event.deltaY)) {
        var x = -event.deltaX / this.zoomLevel;
        var y = -event.deltaY / this.zoomLevel;
        if (isShiftKeydown) {
          var _this$zoom7;
          (_this$zoom7 = this.zoom) === null || _this$zoom7 === void 0 || _this$zoom7.translateBy(this.canvasWrapper, x - y, 0);
        } else {
          var _this$zoom8;
          (_this$zoom8 = this.zoom) === null || _this$zoom8 === void 0 || _this$zoom8.translateBy(this.canvasWrapper, x, y);
        }
      }
    }
  }, {
    key: "initScrollBars",
    value: function initScrollBars() {
      var _this$canvas$node, _this$canvasWrapper$n3, _this$canvasWrapper$n4, _this$canvasWrapper$n5, _this$scrollBars, _this$scrollBars2;
      var boundingBox = (_this$canvas$node = this.canvas.node()) === null || _this$canvas$node === void 0 ? void 0 : _this$canvas$node.getBoundingClientRect();
      var wrapperBoundingBox = (_this$canvasWrapper$n3 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n3 === void 0 ? void 0 : _this$canvasWrapper$n3.getBoundingClientRect();
      var canvasWrapperHeight = ((_this$canvasWrapper$n4 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n4 === void 0 ? void 0 : _this$canvasWrapper$n4.height.baseVal.value) || 0;
      var canvasWrapperWidth = ((_this$canvasWrapper$n5 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n5 === void 0 ? void 0 : _this$canvasWrapper$n5.width.baseVal.value) || 0;
      this.scrollBars = {
        horizontal: {
          name: 'horizontal',
          offsetStart: boundingBox.left - wrapperBoundingBox.left,
          offsetEnd: wrapperBoundingBox.width - boundingBox.right,
          maxWidth: canvasWrapperWidth,
          maxHeight: canvasWrapperHeight,
          bar: (_this$scrollBars = this.scrollBars) === null || _this$scrollBars === void 0 || (_this$scrollBars = _this$scrollBars.horizontal) === null || _this$scrollBars === void 0 ? void 0 : _this$scrollBars.bar
        },
        vertical: {
          name: 'vertical',
          offsetStart: boundingBox.top - wrapperBoundingBox.top,
          offsetEnd: wrapperBoundingBox.height - boundingBox.bottom,
          maxWidth: canvasWrapperHeight,
          maxHeight: canvasWrapperWidth,
          bar: (_this$scrollBars2 = this.scrollBars) === null || _this$scrollBars2 === void 0 || (_this$scrollBars2 = _this$scrollBars2.vertical) === null || _this$scrollBars2 === void 0 ? void 0 : _this$scrollBars2.bar
        }
      };
    }
  }, {
    key: "zoomStep",
    get: function get() {
      return 0.1;
    }
  }, {
    key: "zoomIn",
    value: function zoomIn() {
      var zoomStep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.zoomStep;
      this.zoomToLeftTopCorner(this.zoomLevel + zoomStep);
    }
  }, {
    key: "zoomOut",
    value: function zoomOut() {
      var zoomStep = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.zoomStep;
      this.zoomToLeftTopCorner(this.zoomLevel - zoomStep);
    }
  }, {
    key: "zoomToLeftTopCorner",
    value: function zoomToLeftTopCorner(_newZoomLevel) {
      var _this$zoom9;
      var newZoomLevel = _newZoomLevel;
      newZoomLevel = Math.min(newZoomLevel, this.MAXZOOMSCALE);
      newZoomLevel = Math.max(newZoomLevel, this.MINZOOMSCALE);
      var _this$_zoomTransform2 = this._zoomTransform,
        x = _this$_zoomTransform2.x,
        y = _this$_zoomTransform2.y;
      var scaleFactor = newZoomLevel / this.zoomLevel;
      var newX = x * scaleFactor;
      var newY = y * scaleFactor;
      (_this$zoom9 = this.zoom) === null || _this$zoom9 === void 0 || _this$zoom9.transform(this.canvasWrapper, new ZoomTransform(newZoomLevel, newX, newY));
    }
  }, {
    key: "zoomTo",
    value: function zoomTo(zoomLevel) {
      this.zoomToLeftTopCorner(zoomLevel);
    }
  }, {
    key: "resetZoom",
    value: function resetZoom() {
      var _canvasWrapperNode$tr, _this$zoom0;
      var canvasWrapperNode = this.canvasWrapper.node();
      if (!(canvasWrapperNode !== null && canvasWrapperNode !== void 0 && (_canvasWrapperNode$tr = canvasWrapperNode.transform) !== null && _canvasWrapperNode$tr !== void 0 && _canvasWrapperNode$tr.baseVal)) {
        return;
      }
      (_this$zoom0 = this.zoom) === null || _this$zoom0 === void 0 || _this$zoom0.transform(this.canvasWrapper, new ZoomTransform(1, 0, 0));
    }
  }, {
    key: "defaultWheelDelta",
    value: function defaultWheelDelta(event) {
      var wheelDeltaFactor = 0.002;
      if (event.deltaMode === 1) {
        wheelDeltaFactor = 0.05;
      } else if (event.deltaMode) {
        wheelDeltaFactor = 1;
      }
      return -event.deltaY * wheelDeltaFactor;
    }
  }, {
    key: "scaleCoordinates",
    value: function scaleCoordinates(position) {
      var newX = this._zoomTransform.applyX(position.x);
      var newY = this._zoomTransform.applyY(position.y);
      return new Vec2(newX, newY);
    }
  }, {
    key: "invertZoom",
    value: function invertZoom(position) {
      var newX = this._zoomTransform.invertX(position.x);
      var newY = this._zoomTransform.invertY(position.y);
      return new Vec2(newX, newY);
    }
  }, {
    key: "unzoomValue",
    value: function unzoomValue(value) {
      return value / this.zoomLevel;
    }
  }, {
    key: "zoomValue",
    value: function zoomValue(value) {
      return value * this.zoomLevel;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var _this$scrollBars3, _this$scrollBars4, _this$resizeObserver;
      (_this$scrollBars3 = this.scrollBars) === null || _this$scrollBars3 === void 0 || (_this$scrollBars3 = _this$scrollBars3.horizontal) === null || _this$scrollBars3 === void 0 || (_this$scrollBars3 = _this$scrollBars3.bar) === null || _this$scrollBars3 === void 0 || _this$scrollBars3.remove();
      (_this$scrollBars4 = this.scrollBars) === null || _this$scrollBars4 === void 0 || (_this$scrollBars4 = _this$scrollBars4.vertical) === null || _this$scrollBars4 === void 0 || (_this$scrollBars4 = _this$scrollBars4.bar) === null || _this$scrollBars4 === void 0 || _this$scrollBars4.remove();
      (_this$resizeObserver = this.resizeObserver) === null || _this$resizeObserver === void 0 || _this$resizeObserver.disconnect();
      this.resizeObserver = null;
      this.zoom = null;
      this.zoomEventHandlers = [];
    }
  }, {
    key: "isFitToCanvasHeight",
    value: function isFitToCanvasHeight(height) {
      var canvasWrapperHeight = this.canvasWrapperHeight;
      return height < this.unzoomValue(canvasWrapperHeight - canvasWrapperHeight * AUTO_SCROLL_OFFSET_Y / 100);
    }
  }, {
    key: "zoomStructureToFitHalfOfCanvas",
    value: function zoomStructureToFitHalfOfCanvas(structureBbox) {
      var MAX_AUTOSCALE = 2;
      var OFFSET_FROM_CANVAS_BORDER = 2;
      var canvasWrapperSize = this.canvasWrapperSize;
      if (structureBbox.width < canvasWrapperSize.width / 2) {
        var scale = canvasWrapperSize.width / 2 / structureBbox.width;
        this.zoomTo(Math.min(scale, MAX_AUTOSCALE));
        this.scrollTo(new Vec2(structureBbox.left, structureBbox.top), false, OFFSET_FROM_CANVAS_BORDER, OFFSET_FROM_CANVAS_BORDER);
      }
    }
  }, {
    key: "canvasWrapperHeight",
    get: function get() {
      var _this$canvasWrapper$n6, _canvasWrapperBbox$he;
      var canvasWrapperBbox = (_this$canvasWrapper$n6 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n6 === void 0 ? void 0 : _this$canvasWrapper$n6.getBoundingClientRect();
      return (_canvasWrapperBbox$he = canvasWrapperBbox === null || canvasWrapperBbox === void 0 ? void 0 : canvasWrapperBbox.height) !== null && _canvasWrapperBbox$he !== void 0 ? _canvasWrapperBbox$he : 0;
    }
  }, {
    key: "canvasWrapperWidth",
    get: function get() {
      var _this$canvasWrapper$n7, _canvasWrapperBbox$wi;
      var canvasWrapperBbox = (_this$canvasWrapper$n7 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n7 === void 0 ? void 0 : _this$canvasWrapper$n7.getBoundingClientRect();
      return (_canvasWrapperBbox$wi = canvasWrapperBbox === null || canvasWrapperBbox === void 0 ? void 0 : canvasWrapperBbox.width) !== null && _canvasWrapperBbox$wi !== void 0 ? _canvasWrapperBbox$wi : 0;
    }
  }, {
    key: "canvasWrapperSize",
    get: function get() {
      var _this$canvasWrapper$n8, _canvasWrapperBbox$wi2, _canvasWrapperBbox$he2;
      var canvasWrapperBbox = (_this$canvasWrapper$n8 = this.canvasWrapper.node()) === null || _this$canvasWrapper$n8 === void 0 ? void 0 : _this$canvasWrapper$n8.getBoundingClientRect();
      return {
        width: (_canvasWrapperBbox$wi2 = canvasWrapperBbox === null || canvasWrapperBbox === void 0 ? void 0 : canvasWrapperBbox.width) !== null && _canvasWrapperBbox$wi2 !== void 0 ? _canvasWrapperBbox$wi2 : 0,
        height: (_canvasWrapperBbox$he2 = canvasWrapperBbox === null || canvasWrapperBbox === void 0 ? void 0 : canvasWrapperBbox.height) !== null && _canvasWrapperBbox$he2 !== void 0 ? _canvasWrapperBbox$he2 : 0
      };
    }
  }], [{
    key: "instance",
    get: function get() {
      var _ZoomTool$_renderingC;
      return (_ZoomTool$_renderingC = ZoomTool._renderingContext) !== null && _ZoomTool$_renderingC !== void 0 ? _ZoomTool$_renderingC : ZoomTool._instance;
    }
  }, {
    key: "setRenderingContext",
    value: function setRenderingContext(zoomTool) {
      ZoomTool._renderingContext = zoomTool;
    }
  }, {
    key: "initInstance",
    value: function initInstance(drawingEntitiesManager, canvas) {
      ZoomTool._instance = new ZoomTool(drawingEntitiesManager, canvas);
      return ZoomTool._instance;
    }
  }]);
  return ZoomTool;
}();
_defineProperty(ZoomTool, "_instance", void 0);
_defineProperty(ZoomTool, "_renderingContext", void 0);

export { SCROLL_POSITION, ZoomTool, ZoomTool as default };
//# sourceMappingURL=Zoom.modern.js.map
