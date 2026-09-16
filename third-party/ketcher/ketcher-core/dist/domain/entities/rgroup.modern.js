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
import { Pile } from './pile.modern.js';

var RGroup = function () {
  function RGroup(atrributes) {
    var _atrributes$resth, _atrributes$range, _atrributes$ifthen, _atrributes$index;
    _classCallCheck(this, RGroup);
    _defineProperty(this, "frags", void 0);
    _defineProperty(this, "resth", void 0);
    _defineProperty(this, "range", void 0);
    _defineProperty(this, "ifthen", void 0);
    _defineProperty(this, "index", void 0);
    this.frags = new Pile();
    this.resth = (_atrributes$resth = atrributes === null || atrributes === void 0 ? void 0 : atrributes.resth) !== null && _atrributes$resth !== void 0 ? _atrributes$resth : false;
    this.range = (_atrributes$range = atrributes === null || atrributes === void 0 ? void 0 : atrributes.range) !== null && _atrributes$range !== void 0 ? _atrributes$range : '';
    this.ifthen = (_atrributes$ifthen = atrributes === null || atrributes === void 0 ? void 0 : atrributes.ifthen) !== null && _atrributes$ifthen !== void 0 ? _atrributes$ifthen : 0;
    this.index = (_atrributes$index = atrributes === null || atrributes === void 0 ? void 0 : atrributes.index) !== null && _atrributes$index !== void 0 ? _atrributes$index : -1;
  }
  _createClass(RGroup, [{
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

export { RGroup };
//# sourceMappingURL=rgroup.modern.js.map
