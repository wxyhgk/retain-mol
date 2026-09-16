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
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var scrollOffset = require('./scroll-offset.js');
var scrollbarVertical = require('./scrollbar-vertical.js');
var scrollbarHorizontal = require('./scrollbar-horizontal.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _scrollOffset = new WeakMap();
var _verticalBar = new WeakMap();
var _horizontalBar = new WeakMap();
var ScrollbarContainer = function () {
  function ScrollbarContainer(render) {
    _classCallCheck__default["default"](this, ScrollbarContainer);
    _classPrivateFieldInitSpec(this, _scrollOffset, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _verticalBar, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _horizontalBar, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet__default["default"](this, _scrollOffset, new scrollOffset.ScrollOffset(render));
    _classPrivateFieldSet__default["default"](this, _verticalBar, new scrollbarVertical.VerticalScrollbar(render, _classPrivateFieldGet__default["default"](this, _scrollOffset)));
    _classPrivateFieldSet__default["default"](this, _horizontalBar, new scrollbarHorizontal.HorizontalScrollbar(render, _classPrivateFieldGet__default["default"](this, _scrollOffset)));
  }
  _createClass__default["default"](ScrollbarContainer, [{
    key: "destroy",
    value: function destroy() {
      _classPrivateFieldGet__default["default"](this, _verticalBar).destroy();
      _classPrivateFieldGet__default["default"](this, _horizontalBar).destroy();
    }
  }, {
    key: "update",
    value: function update() {
      _classPrivateFieldGet__default["default"](this, _scrollOffset).update();
      _classPrivateFieldGet__default["default"](this, _verticalBar).update();
      _classPrivateFieldGet__default["default"](this, _horizontalBar).update();
    }
  }]);
  return ScrollbarContainer;
}();

exports.ScrollbarContainer = ScrollbarContainer;
//# sourceMappingURL=scrollbar-container.js.map
