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
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var d3 = require('d3');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SelectionView = function () {
  function SelectionView() {
    _classCallCheck__default["default"](this, SelectionView);
  }
  _createClass__default["default"](SelectionView, null, [{
    key: "show",
    value: function show(transientLayer, params) {
      if (params.type === 'rectangle') {
        var _params$start = _slicedToArray__default["default"](params.start, 2),
          x = _params$start[0],
          y = _params$start[1],
          width = params.width,
          height = params.height;
        transientLayer.append('rect').attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('fill', 'transparent').attr('stroke', '#B4B9D6').attr('style', 'pointer-events: none');
        return;
      }
      if (params.type === 'lasso') {
        var path = params.path;
        var line = d3.line().x(function (d) {
          return d[0];
        }).y(function (d) {
          return d[1];
        });
        transientLayer.append('path').datum(path).attr('d', line).attr('fill', '#E1E5EA').attr('fill-opacity', 0.5).attr('stroke', '#B4B9D6').attr('style', 'pointer-events: none');
        if (path.length > 1) {
          var linePoints = [path[0], path[path.length - 1]];
          transientLayer.append('path').datum(linePoints).attr('d', line).attr('stroke', '#B4B9D6').attr('style', 'pointer-events: none');
        }
      }
    }
  }]);
  return SelectionView;
}();
_defineProperty__default["default"](SelectionView, "viewName", 'SelectionView');

exports.SelectionView = SelectionView;
//# sourceMappingURL=SelectionView.js.map
