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
var pile = require('./pile.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var RGroup = function () {
  function RGroup(atrributes) {
    var _atrributes$resth, _atrributes$range, _atrributes$ifthen, _atrributes$index;
    _classCallCheck__default["default"](this, RGroup);
    _defineProperty__default["default"](this, "frags", void 0);
    _defineProperty__default["default"](this, "resth", void 0);
    _defineProperty__default["default"](this, "range", void 0);
    _defineProperty__default["default"](this, "ifthen", void 0);
    _defineProperty__default["default"](this, "index", void 0);
    this.frags = new pile.Pile();
    this.resth = (_atrributes$resth = atrributes === null || atrributes === void 0 ? void 0 : atrributes.resth) !== null && _atrributes$resth !== void 0 ? _atrributes$resth : false;
    this.range = (_atrributes$range = atrributes === null || atrributes === void 0 ? void 0 : atrributes.range) !== null && _atrributes$range !== void 0 ? _atrributes$range : '';
    this.ifthen = (_atrributes$ifthen = atrributes === null || atrributes === void 0 ? void 0 : atrributes.ifthen) !== null && _atrributes$ifthen !== void 0 ? _atrributes$ifthen : 0;
    this.index = (_atrributes$index = atrributes === null || atrributes === void 0 ? void 0 : atrributes.index) !== null && _atrributes$index !== void 0 ? _atrributes$index : -1;
  }
  _createClass__default["default"](RGroup, [{
    key: "getAttrs",
    value: function getAttrs() {
      return {
        resth: this.resth,
        range: this.range,
        ifthen: this.ifthen,
        index: this.index
      };
    }
  }, {
    key: "clone",
    value: function clone(fidMap) {
      var ret = new RGroup(this);
      this.frags.forEach(function (fid) {
        if (!fidMap) {
          ret.frags.add(fid);
        } else {
          var mappedFid = fidMap.get(fid);
          if (mappedFid !== undefined) {
            ret.frags.add(mappedFid);
          }
        }
      });
      return ret;
    }
  }], [{
    key: "findRGroupByFragment",
    value: function findRGroupByFragment(rgroups, frid) {
      return rgroups.find(function (_rgid, rgroup) {
        return rgroup.frags.has(frid);
      });
    }
  }]);
  return RGroup;
}();

exports.RGroup = RGroup;
//# sourceMappingURL=rgroup.js.map
