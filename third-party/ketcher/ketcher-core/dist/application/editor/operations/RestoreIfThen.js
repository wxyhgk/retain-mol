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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseOperation = require('./BaseOperation.js');
var OperationType = require('./OperationType.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var RestoreIfThen = function (_BaseOperation) {
  _inherits__default["default"](RestoreIfThen, _BaseOperation);
  function RestoreIfThen(rgNew, rgOld, history) {
    var _this;
    _classCallCheck__default["default"](this, RestoreIfThen);
    _this = _callSuper(this, RestoreIfThen, [OperationType.OperationType.RESTORE_IF_THEN]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rgid_new", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "rgid_old", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "ifThenHistory", void 0);
    _this.rgid_new = rgNew;
    _this.rgid_old = rgOld;
    _this.ifThenHistory = history || new Map();
    return _this;
  }
  _createClass__default["default"](RestoreIfThen, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      this.ifThenHistory.forEach(function (rg, rgid) {
        var rgValue = struct.rgroups.get(rgid);
        if (!rgValue) return;
        rgValue.ifthen = rg;
        struct.rgroups.set(rgid, rgValue);
      });
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RestoreIfThen.InverseConstructor(this.rgid_old, this.rgid_new);
    }
  }]);
  return RestoreIfThen;
}(BaseOperation.BaseOperation);
_defineProperty__default["default"](RestoreIfThen, "InverseConstructor", void 0);

exports.RestoreIfThen = RestoreIfThen;
//# sourceMappingURL=RestoreIfThen.js.map
