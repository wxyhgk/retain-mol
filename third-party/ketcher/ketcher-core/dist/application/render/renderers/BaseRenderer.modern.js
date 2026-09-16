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
import { provideEditorSettings } from '../../editor/editorSettings.modern.js';
import { ZoomTool } from '../../editor/tools/Zoom.modern.js';
import { select } from 'd3';
import { canvasSelector, drawnStructuresSelector } from '../../editor/constants.modern.js';

var BaseRenderer = function () {
  function BaseRenderer(drawingEntity) {
    var _ZoomTool$instance$ca, _ZoomTool$instance, _ZoomTool$instance$ca2, _ZoomTool$instance2;
    _classCallCheck(this, BaseRenderer);
    _defineProperty(this, "drawingEntity", void 0);
    _defineProperty(this, "rootElement", void 0);
    _defineProperty(this, "bodyElement", void 0);
    _defineProperty(this, "hoverElement", void 0);
    _defineProperty(this, "hoverAreaElement", void 0);
    _defineProperty(this, "hoverCircleAreaElement", void 0);
    _defineProperty(this, "canvasWrapper", void 0);
    _defineProperty(this, "canvas", void 0);
    this.drawingEntity = drawingEntity;
    this.canvasWrapper = (_ZoomTool$instance$ca = (_ZoomTool$instance = ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvasWrapper) !== null && _ZoomTool$instance$ca !== void 0 ? _ZoomTool$instance$ca : select(canvasSelector);
    this.canvas = (_ZoomTool$instance$ca2 = (_ZoomTool$instance2 = ZoomTool.instance) === null || _ZoomTool$instance2 === void 0 ? void 0 : _ZoomTool$instance2.canvas) !== null && _ZoomTool$instance$ca2 !== void 0 ? _ZoomTool$instance$ca2 : select(drawnStructuresSelector);
  }
  _createClass(BaseRenderer, [{
    key: "editorSettings",
    get: function get() {
      return provideEditorSettings();
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

export { BaseRenderer };
//# sourceMappingURL=BaseRenderer.modern.js.map
