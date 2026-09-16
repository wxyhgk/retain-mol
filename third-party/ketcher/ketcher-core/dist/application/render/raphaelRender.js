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
var _typeof = require('@babel/runtime/helpers/typeof');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var box2Abs = require('../../domain/entities/box2Abs.js');
var struct = require('../../domain/entities/struct.js');
var vec2 = require('../../domain/entities/vec2.js');
var raphaelExt = require('./raphael-ext.js');
var restruct = require('./restruct/restruct.js');
var scale = require('../../domain/helpers/scale.js');
require('../../domain/helpers/functionalGroupsProvider.js');
require('../../domain/helpers/saltsAndSolventsProvider.js');
require('../../domain/constants/generics.js');
require('../../domain/helpers/attachmentPointCalculations.js');
var options = require('./options.js');
var draw = require('./draw.js');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var coordinateTransformation = require('./coordinateTransformation.js');
var scrollbarContainer = require('./scrollbar/scrollbar-container.js');
var notifyRenderComplete = require('./notifyRenderComplete.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var Render = function () {
  function Render(clientArea, options$1, currentRender, reuseRestructIfExist) {
    var _this = this,
      _options$width,
      _options$height;
    _classCallCheck__default["default"](this, Render);
    _defineProperty__default["default"](this, "skipRaphaelInitialization", false);
    _defineProperty__default["default"](this, "clientArea", void 0);
    _defineProperty__default["default"](this, "paper", void 0);
    _defineProperty__default["default"](this, "sz", void 0);
    _defineProperty__default["default"](this, "ctab", void 0);
    _defineProperty__default["default"](this, "options", void 0);
    _defineProperty__default["default"](this, "combinedHover", null);
    _defineProperty__default["default"](this, "viewBox", void 0);
    _defineProperty__default["default"](this, "userOpts", void 0);
    _defineProperty__default["default"](this, "oldCb", null);
    _defineProperty__default["default"](this, "scrollbar", void 0);
    _defineProperty__default["default"](this, "resizeObserver", null);
    _defineProperty__default["default"](this, "_monomerCreationState", null);
    _defineProperty__default["default"](this, "observeCanvasResize", function () {
      _this.resizeObserver = new ResizeObserver(function () {
        _this.sz = _this.getCanvasSizeVector();
        _this.resizeViewBox();
      });
      _this.resizeObserver.observe(_this.paper.canvas);
    });
    _defineProperty__default["default"](this, "unobserveCanvasResize", function () {
      var _this$resizeObserver;
      (_this$resizeObserver = _this.resizeObserver) === null || _this$resizeObserver === void 0 || _this$resizeObserver.disconnect();
      _this.resizeObserver = null;
    });
    this.userOpts = options$1;
    this.clientArea = clientArea;
    this.paper = new raphaelExt["default"](clientArea, (_options$width = options$1.width) !== null && _options$width !== void 0 ? _options$width : '100%', (_options$height = options$1.height) !== null && _options$height !== void 0 ? _options$height : '100%');
    this.sz = this.getCanvasSizeVector();
    this.options = options["default"](this.userOpts);
    if (reuseRestructIfExist && currentRender !== null && currentRender !== void 0 && currentRender.ctab) {
      this.ctab = currentRender.ctab;
      this.ctab.render = this;
      this.ctab.initLayers();
      this.ctab.update(true);
    } else {
      this.ctab = new restruct["default"](new struct.Struct(), this);
    }
    this.scrollbar = new scrollbarContainer.ScrollbarContainer(this);
    this.setViewBox({
      minX: 0,
      minY: 0,
      width: this.sz.x,
      height: this.sz.y
    });
  }
  _createClass__default["default"](Render, [{
    key: "updateOptions",
    value: function updateOptions(opts) {
      try {
        var passedOptions = JSON.parse(opts);
        if (passedOptions && _typeof__default["default"](passedOptions) === 'object') {
          this.options = _objectSpread(_objectSpread({}, this.options), passedOptions);
          return this.options;
        }
      } catch (e) {
        KetcherLogger.KetcherLogger.error('raphaelRenderer.ts::updateOptions', e);
      }
      return false;
    }
  }, {
    key: "selectionPolygon",
    value: function selectionPolygon(polygon) {
      return draw["default"].selectionPolygon(this.paper, polygon, this.options);
    }
  }, {
    key: "selectionLine",
    value: function selectionLine(point0, point1) {
      return draw["default"].selectionLine(this.paper, point0, point1, this.options);
    }
  }, {
    key: "selectionRectangle",
    value: function selectionRectangle(point0, point1) {
      return draw["default"].selectionRectangle(this.paper, point0, point1, this.options);
    }
  }, {
    key: "page2obj",
    value: function page2obj(event) {
      return coordinateTransformation.CoordinateTransformation.pageToModel(event, this);
    }
  }, {
    key: "setZoom",
    value: function setZoom(zoom, event) {
      var zoomedWidth = this.sz.x / zoom;
      var zoomedHeight = this.sz.y / zoom;
      var _ref = event ? this.zoomOnMouse(event, zoomedWidth, zoomedHeight) : this.zoomOnCanvasCenter(zoomedWidth, zoomedHeight),
        _ref2 = _slicedToArray__default["default"](_ref, 2),
        viewBoxX = _ref2[0],
        viewBoxY = _ref2[1];
      this.setViewBox({
        minX: viewBoxX,
        minY: viewBoxY,
        width: zoomedWidth,
        height: zoomedHeight
      });
      this.options.zoom = zoom;
    }
  }, {
    key: "getCanvasSizeVector",
    value: function getCanvasSizeVector() {
      return this.userOpts.width ? new vec2.Vec2(this.userOpts.width, this.userOpts.height) : new vec2.Vec2(this.clientArea.clientWidth, this.clientArea.clientHeight);
    }
  }, {
    key: "resizeViewBox",
    value: function resizeViewBox() {
      this.sz = this.getCanvasSizeVector();
      var newWidth = this.sz.x / this.options.zoom;
      var newHeight = this.sz.y / this.options.zoom;
      this.setViewBox(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          width: newWidth,
          height: newHeight
        });
      });
    }
  }, {
    key: "zoomOnCanvasCenter",
    value: function zoomOnCanvasCenter(zoomedWidth, zoomedHeight) {
      var fixedPoint = new vec2.Vec2(this.viewBox.minX + this.viewBox.width / 2, this.viewBox.minY + this.viewBox.height / 2);
      var viewBoxX = fixedPoint.x - zoomedWidth / 2;
      var viewBoxY = fixedPoint.y - zoomedHeight / 2;
      return [viewBoxX, viewBoxY];
    }
  }, {
    key: "zoomOnMouse",
    value: function zoomOnMouse(event, zoomedWidth, zoomedHeight) {
      var fixedPoint = coordinateTransformation.CoordinateTransformation.pageToCanvas(event, this);
      var widthRatio = (fixedPoint.x - this.viewBox.minX) / this.viewBox.width;
      var heightRatio = (fixedPoint.y - this.viewBox.minY) / this.viewBox.height;
      var viewBoxX = fixedPoint.x - zoomedWidth * widthRatio;
      var viewBoxY = fixedPoint.y - zoomedHeight * heightRatio;
      return [viewBoxX, viewBoxY];
    }
  }, {
    key: "setViewBox",
    value: function setViewBox(arg) {
      var newViewBox = typeof arg === 'function' ? arg(this.viewBox) : arg;
      this.viewBox = newViewBox;
      this.paper.canvas.setAttribute('viewBox', "".concat(newViewBox.minX, " ").concat(newViewBox.minY, " ").concat(newViewBox.width, " ").concat(newViewBox.height));
      this.scrollbar.update();
    }
  }, {
    key: "setMolecule",
    value: function setMolecule(struct) {
      var _this2 = this;
      var forceUpdateWithTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.paper.clear();
      this.ctab = new restruct["default"](struct, this);
      this.options.offset = new vec2.Vec2();
      this.scrollbar.destroy();
      this.scrollbar = new scrollbarContainer.ScrollbarContainer(this);
      if (forceUpdateWithTimeout) {
        setTimeout(function () {
          _this2.update(true);
        }, 0);
      } else {
        this.update(false);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _viewSz, _ref3, _this$userOpts$width, _ref4, _this$userOpts$height;
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var viewSz = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      viewSz = (_viewSz = viewSz) !== null && _viewSz !== void 0 ? _viewSz : new vec2.Vec2((_ref3 = (_this$userOpts$width = this.userOpts.width) !== null && _this$userOpts$width !== void 0 ? _this$userOpts$width : this.clientArea.clientWidth) !== null && _ref3 !== void 0 ? _ref3 : 100, (_ref4 = (_this$userOpts$height = this.userOpts.height) !== null && _this$userOpts$height !== void 0 ? _this$userOpts$height : this.clientArea.clientHeight) !== null && _ref4 !== void 0 ? _ref4 : 100);
      var changes = this.ctab.update(force);
      this.ctab.setSelection();
      if (changes) {
        var _this$options$offset;
        var bb = this.ctab.getVBoxObj().transform(scale.Scale.modelToCanvas, this.options).translate((_this$options$offset = this.options.offset) !== null && _this$options$offset !== void 0 ? _this$options$offset : new vec2.Vec2());
        if (this.options.downScale) {
          this.ctab.molecule.rescale();
        }
        var isAutoScale = this.options.autoScale || this.options.downScale;
        if (!isAutoScale) {
          var _this$options$offset2;
          if (!this.oldCb) this.oldCb = new box2Abs.Box2Abs();
          this.scrollbar.update();
          this.options.offset = (_this$options$offset2 = this.options.offset) !== null && _this$options$offset2 !== void 0 ? _this$options$offset2 : new vec2.Vec2();
        } else {
          var _this$options$rescale;
          var sz1 = bb.sz();
          var marg = this.options.autoScaleMargin;
          var mv = new vec2.Vec2(marg, marg);
          var csz = viewSz;
          if (marg && (csz.x < 2 * marg + 1 || csz.y < 2 * marg + 1)) {
            throw new Error('View box too small for the given margin');
          }
          var rescale = (_this$options$rescale = this.options.rescaleAmount) !== null && _this$options$rescale !== void 0 ? _this$options$rescale : Math.max(sz1.x / (csz.x - 2 * marg), sz1.y / (csz.y - 2 * marg));
          var isForceDownscale = this.options.downScale && rescale < 1;
          var isBondsLengthFit = this.options.maxBondLength / rescale > 1;
          if (isBondsLengthFit || isForceDownscale) {
            rescale = 1;
          }
          var sz2 = sz1.add(mv.scaled(2 * rescale));
          this.paper.setViewBox(bb.pos().x - marg * rescale - (csz.x * rescale - sz2.x) / 2, bb.pos().y - marg * rescale - (csz.y * rescale - sz2.y) / 2, csz.x * rescale, csz.y * rescale);
        }
        notifyRenderComplete.notifyRenderComplete();
      }
    }
  }, {
    key: "monomerCreationState",
    get: function get() {
      return this._monomerCreationState;
    },
    set: function set(state) {
      this._monomerCreationState = state;
    }
  }]);
  return Render;
}();

exports.Render = Render;
//# sourceMappingURL=raphaelRender.js.map
