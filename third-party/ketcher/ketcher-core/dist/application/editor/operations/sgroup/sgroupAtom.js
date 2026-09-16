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
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');
var sgroup = require('../../../../domain/entities/sgroup.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');

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
var SGroupAtomAdd = function (_BaseOperation) {
  _inherits__default["default"](SGroupAtomAdd, _BaseOperation);
  function SGroupAtomAdd(sgroupId, aid) {
    var _this;
    _classCallCheck__default["default"](this, SGroupAtomAdd);
    _this = _callSuper(this, SGroupAtomAdd, [OperationType.OperationType.S_GROUP_ATOM_ADD, OperationType.OperationPriority.S_GROUP_ATOM_ADD]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      sgid: sgroupId,
      aid: aid
    };
    return _this;
  }
  _createClass__default["default"](SGroupAtomAdd, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data = this.data,
        aid = _this$data.aid,
        sgid = _this$data.sgid;
      var struct = restruct.molecule;
      var atom = struct.atoms.get(aid);
      var sgroup = struct.sgroups.get(sgid);
      assert.assert(atom, "OpSGroupAtomAdd: Atom ".concat(aid, " not found"));
      assert.assert(sgroup, "OpSGroupAtomAdd: S-Group ".concat(sgid, " not found"));
      if (sgroup.atoms.indexOf(aid) >= 0) {
        return;
      }
      struct.atomAddToSGroup(sgid, aid);
      BaseOperation.BaseOperation.invalidateAtom(restruct, aid);
    }
  }]);
  return SGroupAtomAdd;
}(BaseOperation.BaseOperation);
var SGroupAtomRemove = function (_BaseOperation2) {
  _inherits__default["default"](SGroupAtomRemove, _BaseOperation2);
  function SGroupAtomRemove(sgroupId, aid) {
    var _this2;
    _classCallCheck__default["default"](this, SGroupAtomRemove);
    _this2 = _callSuper(this, SGroupAtomRemove, [OperationType.OperationType.S_GROUP_ATOM_REMOVE, 4]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _this2.data = {
      sgid: sgroupId,
      aid: aid
    };
    return _this2;
  }
  _createClass__default["default"](SGroupAtomRemove, [{
    key: "execute",
    value: function execute(restruct) {
      var _this$data2 = this.data,
        aid = _this$data2.aid,
        sgid = _this$data2.sgid;
      var struct = restruct.molecule;
      var atom = struct.atoms.get(aid);
      var sgroup$1 = struct.sgroups.get(sgid);
      if (!atom || !sgroup$1) {
        return;
      }
      sgroup.SGroup.removeAtom(sgroup$1, aid);
      atom.sgs["delete"](sgid);
      BaseOperation.BaseOperation.invalidateAtom(restruct, aid);
    }
  }]);
  return SGroupAtomRemove;
}(BaseOperation.BaseOperation);
SGroupAtomAdd.InverseConstructor = SGroupAtomRemove;
SGroupAtomRemove.InverseConstructor = SGroupAtomAdd;

exports.SGroupAtomAdd = SGroupAtomAdd;
exports.SGroupAtomRemove = SGroupAtomRemove;
//# sourceMappingURL=sgroupAtom.js.map
