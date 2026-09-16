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

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var LineLengthHighlightView = function () {
  function LineLengthHighlightView() {
    _classCallCheck__default["default"](this, LineLengthHighlightView);
  }
  _createClass__default["default"](LineLengthHighlightView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      var currentPosition = params.currentPosition;
      var VERY_LARGE_VALUE = 100000;
      transientLayer.append('rect').attr('x', -VERY_LARGE_VALUE).attr('y', -VERY_LARGE_VALUE).attr('width', VERY_LARGE_VALUE).attr('height', VERY_LARGE_VALUE * 2).attr('fill', '#333333').style('opacity', 0.05);
      transientLayer.append('rect').attr('x', currentPosition).attr('y', -VERY_LARGE_VALUE).attr('width', VERY_LARGE_VALUE).attr('height', VERY_LARGE_VALUE * 2).attr('fill', '#333333').style('opacity', 0.05);
    }
  }]);
  return LineLengthHighlightView;
}();
_defineProperty__default["default"](LineLengthHighlightView, "viewName", 'LineLengthHighlightView');

exports.LineLengthHighlightView = LineLengthHighlightView;
//# sourceMappingURL=LineLengthHighlightView.js.map
