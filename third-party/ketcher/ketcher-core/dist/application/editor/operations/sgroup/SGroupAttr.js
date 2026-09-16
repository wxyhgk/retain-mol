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
var monomerMicromolecule = require('../../../../domain/entities/monomerMicromolecule.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupAttr = function (_BaseOperation) {
  _inherits__default["default"](SGroupAttr, _BaseOperation);
  function SGroupAttr(sgroupId, attribute, value) {
    var _this;
    _classCallCheck__default["default"](this, SGroupAttr);
    _this = _callSuper(this, SGroupAttr, [OperationType.OperationType.S_GROUP_ATTR, OperationType.OperationPriority.S_GROUP_ATTR]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      sgid: sgroupId,
      attr: attribute,
      value: value
    };
    return _this;
  }
  _createClass__default["default"](SGroupAttr, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var _this$data = this.data,
        sgid = _this$data.sgid,
        attr = _this$data.attr,
        value = _this$data.value;
      if (sgid === undefined || attr === undefined) {
        return;
      }
      var sgroup = struct.sgroups.get(sgid);
      if (!sgroup) {
        return;
      }
      var sgroupData = restruct.sgroupData.get(sgid);
      if (sgroup.type === 'DAT' && sgroupData) {
        restruct.clearVisel(sgroupData.visel);
        restruct.sgroupData["delete"](sgid);
      }
      if (attr === 'expanded' && sgroup instanceof monomerMicromolecule.MonomerMicromolecule) {
        if (Object.isFrozen(sgroup.monomer.monomerItem)) {
          sgroup.monomer.monomerItem = _objectSpread({}, sgroup.monomer.monomerItem);
        }
        if (typeof value === 'boolean') {
          sgroup.monomer.monomerItem.expanded = value;
        }
      }
      this.data.value = sgroup.setAttr(attr, value);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new SGroupAttr();
      inverted.data = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!restruct) return false;
      var _this$data2 = this.data,
        sgid = _this$data2.sgid,
        attr = _this$data2.attr,
        value = _this$data2.value;
      if (sgid === undefined || attr === undefined) {
        return false;
      }
      var sgroup = restruct.molecule.sgroups.get(sgid);
      if (!sgroup) return false;
      return sgroup.checkAttr(attr, value);
    }
  }]);
  return SGroupAttr;
}(BaseOperation.BaseOperation);

exports.SGroupAttr = SGroupAttr;
//# sourceMappingURL=SGroupAttr.js.map
