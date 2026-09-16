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
var editorSingleton = require('../../../../editor/editorSingleton.js');
var BaseSequenceItemRenderer = require('../BaseSequenceItemRenderer.js');
var SequenceRendererStore = require('../SequenceRendererStore.js');
var Zoom = require('../../../../editor/tools/Zoom.js');
var d3 = require('d3');
var constants = require('../../../../editor/constants.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var TEXT_COLOR = '#333333';
var HOVER_COLOR = '#167782';
var BUTTON_OFFSET_FROM_CANVAS = 20;
var BUTTON_Y_OFFSET_FROM_SENSE_ROW = 12;
var BUTTON_Y_OFFSET_FROM_ANTISENSE_ROW = 30;
var RECT_MAX_WIDTH = 620;
var NewSequenceButton = function () {
  function NewSequenceButton(indexOfRowBefore) {
    var _ZoomTool$instance;
    _classCallCheck__default["default"](this, NewSequenceButton);
    _defineProperty__default["default"](this, "indexOfRowBefore", void 0);
    _defineProperty__default["default"](this, "buttonElement", void 0);
    _defineProperty__default["default"](this, "canvas", void 0);
    _defineProperty__default["default"](this, "rootElement", void 0);
    _defineProperty__default["default"](this, "bodyElement", void 0);
    this.indexOfRowBefore = indexOfRowBefore;
    this.canvas = ((_ZoomTool$instance = Zoom.ZoomTool.instance) === null || _ZoomTool$instance === void 0 ? void 0 : _ZoomTool$instance.canvas) || d3.select(constants.drawnStructuresSelector);
  }
  _createClass__default["default"](NewSequenceButton, [{
    key: "show",
    value: function show() {
      var _chain$lastNode,
        _chain$lastNode2,
        _this = this;
      var editor = editorSingleton.provideEditorInstance();
      var chain = SequenceRendererStore.sequenceRendererStore.sequenceViewModel.chains[this.indexOfRowBefore];
      var lastNodeRendererInChain = ((_chain$lastNode = chain.lastNode) === null || _chain$lastNode === void 0 || (_chain$lastNode = _chain$lastNode.antisenseNode) === null || _chain$lastNode === void 0 ? void 0 : _chain$lastNode.renderer) || ((_chain$lastNode2 = chain.lastNode) === null || _chain$lastNode2 === void 0 || (_chain$lastNode2 = _chain$lastNode2.senseNode) === null || _chain$lastNode2 === void 0 ? void 0 : _chain$lastNode2.renderer);
      if (!(lastNodeRendererInChain instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer)) {
        return;
      }
      this.rootElement = this.canvas.append('g').data([this]).attr('class', 'dynamic-element').attr('transform', "translate(".concat(BUTTON_OFFSET_FROM_CANVAS, ", ").concat(lastNodeRendererInChain.scaledMonomerPositionForSequence.y + (chain.hasAntisense ? BUTTON_Y_OFFSET_FROM_ANTISENSE_ROW : BUTTON_Y_OFFSET_FROM_SENSE_ROW), ")")).attr('cursor', 'pointer');
      this.rootElement.append('title').text('Add sequence here');
      this.rootElement.attr('opacity', '0');
      this.rootElement.append('title').text('Add sequence here');
      this.rootElement.append('rect').attr('x', '16').attr('y', '22').attr('width', '0').attr('height', '4').attr('stroke', '#B4B9D6').attr('stroke-width', '1').attr('fill', '#fff').attr('pointer-events', 'none');
      this.bodyElement = this.rootElement.append('foreignObject').attr('x', 0).attr('y', 0).attr('height', '48').attr('width', '48').attr('data-testid', 'NewSequencePlusButton');
      this.buttonElement = this.bodyElement.append('xhtml:div').attr('data-testid', 'NewSequencePlusButtonIcon').attr('style', "\n        width: 32px;\n        margin: 8px;\n        padding:  8px;\n        font-size: 12px;\n        color: ".concat(TEXT_COLOR, ";\n        border-radius: 20px;\n        box-shadow: 0px 2px 5px 0px #67688426;\n        background-color: #ffffff;\n        font-weight: 400;\n        border: none;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n      "));
      NewSequenceButton.appendPlusIcon(this.buttonElement);
      this.rootElement.on('mouseover', function () {
        var _this$rootElement;
        _this.appendHover();
        (_this$rootElement = _this.rootElement) === null || _this$rootElement === void 0 || _this$rootElement.attr('opacity', '1');
      }).on('mouseout', function () {
        var _this$rootElement2;
        _this.removeHover();
        (_this$rootElement2 = _this.rootElement) === null || _this$rootElement2 === void 0 || _this$rootElement2.attr('opacity', '0');
      }).on('click', function (event) {
        event.stopPropagation();
        editor.events.startNewSequence.dispatch({
          indexOfRowBefore: _this.indexOfRowBefore
        });
      });
    }
  }, {
    key: "appendHover",
    value: function appendHover() {
      var _this$buttonElement;
      (_this$buttonElement = this.buttonElement) === null || _this$buttonElement === void 0 || _this$buttonElement.style('color', HOVER_COLOR);
    }
  }, {
    key: "appendHoverAreaElement",
    value: function appendHoverAreaElement() {
    }
  }, {
    key: "drawSelection",
    value: function drawSelection() {
    }
  }, {
    key: "moveSelection",
    value: function moveSelection() {
    }
  }, {
    key: "removeHover",
    value: function removeHover() {
      var _this$buttonElement2;
      (_this$buttonElement2 = this.buttonElement) === null || _this$buttonElement2 === void 0 || _this$buttonElement2.style('color', TEXT_COLOR);
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$rootElement3;
      (_this$rootElement3 = this.rootElement) === null || _this$rootElement3 === void 0 || _this$rootElement3.remove();
      this.rootElement = undefined;
    }
  }, {
    key: "setWidth",
    value: function setWidth(width) {
      var _this$rootElement4;
      var rectElement = (_this$rootElement4 = this.rootElement) === null || _this$rootElement4 === void 0 ? void 0 : _this$rootElement4.select('rect');
      var computedWidthPx = Math.min((width - 1) * 20 + width / 10 * 10, RECT_MAX_WIDTH);
      rectElement === null || rectElement === void 0 || rectElement.attr('width', computedWidthPx);
    }
  }], [{
    key: "appendPlusIcon",
    value: function appendPlusIcon(element) {
      element.append('svg').attr('width', '16').attr('height', '16').attr('fill', 'currentColor').append('path').attr('d', 'M16 7.00095V9.00095H9V16.002H7V9.00095H0V7.00095H7V0.00195312H9V7.00095H16Z');
    }
  }]);
  return NewSequenceButton;
}();

exports.NewSequenceButton = NewSequenceButton;
//# sourceMappingURL=NewSequenceButton.js.map
