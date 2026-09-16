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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSettings = require('../../editor/editorSettings.js');
var Zoom = require('../../editor/tools/Zoom.js');
var d3 = require('d3');
var constants = require('../../editor/constants.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var BaseRenderer = function () {
  function BaseRenderer(drawingEntity) {
    var _ZoomTool$instance$ca, _ZoomTool$instance, _ZoomTool$instance$ca2, _ZoomTool$instance2;
    _classCallCheck__default["default"](this, BaseRenderer);
    _defineProperty__default["default"](this, "drawingEntity", void 0);
    _defineProperty__default["default"](this, "rootElement", void 0);
    _defineProperty__default["default"](this, "bodyElement", void 0);
    _defineProperty__default["default"](this, "hoverElement", void 0);
    _defineProperty__default["default"](this, "hoverAreaElement", void 0);
    _defineProperty__default["default"](this, "hoverCircleAreaElement", void 0);
    _defineProperty__default["default"](this, "canvasWrapper", void 0);
    _defineProperty__default["default"](this, "canvas", void 0);
    this.drawingEntity = drawingEntity;
    this.canvasWrapper = (_ZoomTool$instance$ca = (_ZoomTool$instance = Zoom.ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvasWrapper) !== null && _ZoomTool$instance$ca !== void 0 ? _ZoomTool$instance$ca : d3.select(constants.canvasSelector);
    this.canvas = (_ZoomTool$instance$ca2 = (_ZoomTool$instance2 = Zoom.ZoomTool.instance) === null || _ZoomTool$instance2 === void 0 ? void 0 : _ZoomTool$instance2.canvas) !== null && _ZoomTool$instance$ca2 !== void 0 ? _ZoomTool$instance$ca2 : d3.select(constants.drawnStructuresSelector);
  }
  _createClass__default["default"](BaseRenderer, [{
    key: "editorSettings",
    get: function get() {
      return editorSettings.provideEditorSettings();
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
    key: "rootBoundingClientRect",
    get: function get() {
      var _this$rootElement2;
      var rootNode = (_this$rootElement2 = this.rootElement) === null || _this$rootElement2 === void 0 ? void 0 : _this$rootElement2.node();
      if (!rootNode) return undefined;
      return rootNode.getBoundingClientRect();
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
    key: "x",
    get: function get() {
      var _this$rootBBox$x, _this$rootBBox3;
      return (_this$rootBBox$x = (_this$rootBBox3 = this.rootBBox) === null || _this$rootBBox3 === void 0 ? void 0 : _this$rootBBox3.x) !== null && _this$rootBBox$x !== void 0 ? _this$rootBBox$x : 0;
    }
  }, {
    key: "y",
    get: function get() {
      var _this$rootBBox$y, _this$rootBBox4;
      return (_this$rootBBox$y = (_this$rootBBox4 = this.rootBBox) === null || _this$rootBBox4 === void 0 ? void 0 : _this$rootBBox4.y) !== null && _this$rootBBox$y !== void 0 ? _this$rootBBox$y : 0;
    }
  }, {
    key: "selectionPoints",
    get: function get() {
      return undefined;
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$rootElement3;
      (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 || _this$rootElement3.remove();
      this.rootElement = undefined;
    }
  }, {
    key: "redrawHover",
    value: function redrawHover() {
      if (this.drawingEntity.hovered) {
        var hoverElement = this.appendHover(this.hoverAreaElement);
        if (hoverElement) {
          this.hoverElement = hoverElement;
        }
      } else {
        this.removeHover();
        this.hoverElement = undefined;
      }
    }
  }, {
    key: "setVisibility",
    value: function setVisibility(isVisible) {
      var _this$rootElement4;
      (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 || _this$rootElement4.style('opacity', isVisible ? 1 : 0);
    }
  }, {
    key: "move",
    value: function move() {
    }
  }]);
  return BaseRenderer;
}();

exports.BaseRenderer = BaseRenderer;
//# sourceMappingURL=BaseRenderer.js.map
