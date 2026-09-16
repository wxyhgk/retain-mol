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
var molSerializer = require('../mol/molSerializer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var DelimeterRegex = /^[^]+?\$\$\$\$$/gm;
var SdfSerializer = function () {
  function SdfSerializer(options) {
    _classCallCheck__default["default"](this, SdfSerializer);
    _defineProperty__default["default"](this, "molSerializerOptions", void 0);
    this.molSerializerOptions = options;
  }
  _createClass__default["default"](SdfSerializer, [{
    key: "deserialize",
    value: function deserialize(content) {
      var result = [];
      var molSerializer$1 = new molSerializer.MolSerializer(this.molSerializerOptions);
      var m = DelimeterRegex.exec(content);
      while (m !== null) {
        var chunk = m[0].replace(/\r/g, '').trim();
        var end = chunk.indexOf('M  END');
        if (end !== -1) {
          var propChunks = chunk.substr(end + 7).trim().split(/^$\n?/m);
          var struct = molSerializer$1.deserialize(chunk.substring(0, end + 6));
          var props = propChunks.reduce(function (acc, pc) {
            var m = /^> [ \d]*<(\S+)>/.exec(pc);
            if (m) {
              var field = m[1];
              var valueArr = pc.split('\n').slice(1, -1);
              var value = '';
              if (valueArr.length > 1) {
                value = valueArr.join(',');
              } else {
                value = pc.split('\n')[1].trim();
              }
              acc[field] = Number.isFinite(value) ? +value : value.toString();
            }
            return acc;
          }, {});
          result.push({
            struct: struct,
            props: props
          });
        }
        m = DelimeterRegex.exec(content);
      }
      return result;
    }
  }, {
    key: "serialize",
    value: function serialize(sdfItems) {
      var molSerializer$1 = new molSerializer.MolSerializer(this.molSerializerOptions);
      return sdfItems.reduce(function (res, item) {
        res += molSerializer$1.serialize(item.struct);
        Object.keys(item.props).forEach(function (prop) {
          res += "> <".concat(prop, ">\n");
          res += "".concat(item.props[prop], "\n\n");
        });
        return "".concat(res, "$$$$\n");
      }, '');
    }
  }]);
  return SdfSerializer;
}();

exports.SdfSerializer = SdfSerializer;
//# sourceMappingURL=sdfSerializer.js.map
