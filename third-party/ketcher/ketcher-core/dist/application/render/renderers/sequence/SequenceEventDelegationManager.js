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
var editorSingleton = require('../../../editor/editorSingleton.js');
var d3 = require('d3');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SequenceEventDelegationManager = function () {
  function SequenceEventDelegationManager() {
    _classCallCheck__default["default"](this, SequenceEventDelegationManager);
    _defineProperty__default["default"](this, "canvas", null);
    _defineProperty__default["default"](this, "boundHandlers", new Map());
  }
  _createClass__default["default"](SequenceEventDelegationManager, [{
    key: "attachDelegatedEvents",
    value: function attachDelegatedEvents(canvas) {
      if (this.canvas) {
        this.removeDelegatedEvents();
      }
      this.canvas = canvas;
      this.attachHandler('mouseover', this.handleMouseOver.bind(this));
      this.attachHandler('mousemove', this.handleMouseMove.bind(this));
      this.attachHandler('mouseout', this.handleMouseOut.bind(this));
      this.attachHandler('mousedown', this.handleMouseDown.bind(this));
      this.attachHandler('click', this.handleClick.bind(this));
      this.attachHandler('dblclick', this.handleDblClick.bind(this));
    }
  }, {
    key: "removeDelegatedEvents",
    value: function removeDelegatedEvents() {
      var _this = this;
      if (!this.canvas) return;
      this.boundHandlers.forEach(function (_, eventType) {
        var _this$canvas;
        (_this$canvas = _this.canvas) === null || _this$canvas === void 0 || _this$canvas.on(eventType, null);
      });
      this.boundHandlers.clear();
      this.canvas = null;
    }
  }, {
    key: "attachHandler",
    value: function attachHandler(eventType, handler) {
      var _this$canvas2;
      this.boundHandlers.set(eventType, handler);
      (_this$canvas2 = this.canvas) === null || _this$canvas2 === void 0 || _this$canvas2.on(eventType, handler);
    }
  }, {
    key: "findSequenceItemRenderer",
    value: function findSequenceItemRenderer(target) {
      if (!target || !(target instanceof SVGElement)) return null;
      var sequenceItemElement = target.closest('.sequence-item');
      if (!sequenceItemElement) return null;
      var renderer = d3.select(sequenceItemElement).datum();
      if (!renderer) return null;
      var elementType = this.getElementType(target);
      if (!elementType) return null;
      return {
        renderer: renderer,
        elementType: elementType
      };
    }
  }, {
    key: "getElementType",
    value: function getElementType(target) {
      var dataType = target.getAttribute('data-element-type');
      if (dataType === 'text' || dataType === 'background' || dataType === 'spacer') {
        return dataType;
      }
      var tagName = target.tagName.toLowerCase();
      if (tagName === 'text') return 'text';
      if (tagName === 'rect') {
        var parentGroup = target.closest('g[data-element-type="spacer"]');
        if (parentGroup) return 'spacer';
        return 'background';
      }
      if (tagName === 'g' && target.hasAttribute('data-element-type')) {
        return target.getAttribute('data-element-type');
      }
      return null;
    }
  }, {
    key: "handleMouseOver",
    value: function handleMouseOver(event) {
      var result = this.findSequenceItemRenderer(event.target);
      if (!result) return;
      var renderer = result.renderer,
        elementType = result.elementType;
      if (elementType === 'text' || elementType === 'background') {
        renderer.drawBackgroundElementHover();
        if (elementType === 'text') {
          editorSingleton.provideEditorInstance().events.mouseOverSequenceItem.dispatch(event);
        }
      }
    }
  }, {
    key: "handleMouseMove",
    value: function handleMouseMove(event) {
      var result = this.findSequenceItemRenderer(event.target);
      if (!result) return;
      var elementType = result.elementType;
      if (elementType === 'text') {
        editorSingleton.provideEditorInstance().events.mouseOnMoveSequenceItem.dispatch(event);
      }
    }
  }, {
    key: "handleMouseOut",
    value: function handleMouseOut(event) {
      var result = this.findSequenceItemRenderer(event.target);
      if (!result) {
        return;
      }
      var renderer = result.renderer,
        elementType = result.elementType;
      renderer.removeBackgroundElementHover();
      if (elementType === 'text') {
        editorSingleton.provideEditorInstance().events.mouseLeaveSequenceItem.dispatch(event);
      }
    }
  }, {
    key: "handleMouseDown",
    value: function handleMouseDown(event) {
      var result = this.findSequenceItemRenderer(event.target);
      if (!result) return;
      var elementType = result.elementType;
      if (elementType === 'spacer') {
        editorSingleton.provideEditorInstance().events.mousedownBetweenSequenceItems.dispatch(event);
      } else if (elementType === 'background') {
        editorSingleton.provideEditorInstance().events.mouseDownOnSequenceItem.dispatch(event);
      }
    }
  }, {
    key: "handleClick",
    value: function handleClick(event) {
      var result = this.findSequenceItemRenderer(event.target);
      if (!result) return;
      var elementType = result.elementType;
      if (elementType === 'background') {
        editorSingleton.provideEditorInstance().events.clickOnSequenceItem.dispatch(event);
      }
    }
  }, {
    key: "handleDblClick",
    value: function handleDblClick(event) {
      var result = this.findSequenceItemRenderer(event.target);
      if (!result) return;
      var elementType = result.elementType;
      if (elementType === 'text' || elementType === 'background') {
        editorSingleton.provideEditorInstance().events.doubleClickOnSequenceItem.dispatch(event);
      }
    }
  }], [{
    key: "instance",
    get: function get() {
      if (!SequenceEventDelegationManager._instance) {
        SequenceEventDelegationManager._instance = new SequenceEventDelegationManager();
      }
      return SequenceEventDelegationManager._instance;
    }
  }]);
  return SequenceEventDelegationManager;
}();
_defineProperty__default["default"](SequenceEventDelegationManager, "_instance", null);

exports.SequenceEventDelegationManager = SequenceEventDelegationManager;
//# sourceMappingURL=SequenceEventDelegationManager.js.map
