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
var Zoom = require('./Zoom.js');
var d3 = require('d3');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var HandTool = function () {
  function HandTool(editor) {
    _classCallCheck__default["default"](this, HandTool);
    _defineProperty__default["default"](this, "editor", void 0);
    _defineProperty__default["default"](this, "dragBehavior", void 0);
    this.editor = editor;
    this.editor.canvas.classList.add('handCursor');
    this.dragBehavior = d3.drag().on('start', this.handleDragStart.bind(this)).on('drag', this.handleDragging.bind(this)).on('end', this.handleDragEnd.bind(this));
    d3.select(this.editor.canvas).call(this.dragBehavior);
  }
  _createClass__default["default"](HandTool, [{
    key: "handleDragStart",
    value: function handleDragStart() {
      this.editor.canvas.classList.add('handCursorGrabbing');
    }
  }, {
    key: "handleDragging",
    value: function handleDragging(event) {
      Zoom.ZoomTool.instance.scrollBy(event.dx, event.dy);
    }
  }, {
    key: "handleDragEnd",
    value: function handleDragEnd() {
      this.editor.canvas.classList.remove('handCursorGrabbing');
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.editor.canvas.classList.remove('handCursor');
      d3.select(this.editor.canvas).on('.drag', null);
    }
  }]);
  return HandTool;
}();

exports.HandTool = HandTool;
//# sourceMappingURL=Hand.js.map
