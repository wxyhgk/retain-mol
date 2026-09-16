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

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReassignLeavingAtomOperation = function (_BaseOperation) {
  _inherits__default["default"](ReassignLeavingAtomOperation, _BaseOperation);
  function ReassignLeavingAtomOperation(monomerCreationState, attachmentPointName, attachmentAtomId, newLeavingAtomId, previousLeavingAtomId) {
    var _this;
    _classCallCheck__default["default"](this, ReassignLeavingAtomOperation);
    _this = _callSuper(this, ReassignLeavingAtomOperation, [OperationType.OperationType.MONOMER_CREATION_REASSIGN_LGA]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerCreationState", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentPointName", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "attachmentAtomId", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "newLeavingAtomId", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousLeavingAtomId", void 0);
    _this.monomerCreationState = monomerCreationState;
    _this.attachmentPointName = attachmentPointName;
    _this.attachmentAtomId = attachmentAtomId;
    _this.newLeavingAtomId = newLeavingAtomId;
    _this.previousLeavingAtomId = previousLeavingAtomId;
    return _this;
  }
  _createClass__default["default"](ReassignLeavingAtomOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert.assert(this.monomerCreationState);
      var newAtomPair = [this.attachmentAtomId, this.newLeavingAtomId];
      this.monomerCreationState.assignedAttachmentPoints.set(this.attachmentPointName, newAtomPair);
      this.monomerCreationState = _objectSpread({}, this.monomerCreationState || {});
      BaseOperation.BaseOperation.invalidateAtom(restruct, this.attachmentAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, this.newLeavingAtomId);
      BaseOperation.BaseOperation.invalidateAtom(restruct, this.previousLeavingAtomId);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new ReassignLeavingAtomOperation(this.monomerCreationState, this.attachmentPointName, this.attachmentAtomId, this.previousLeavingAtomId, this.newLeavingAtomId);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.newLeavingAtomId === this.previousLeavingAtomId;
    }
  }]);
  return ReassignLeavingAtomOperation;
}(BaseOperation.BaseOperation);

exports.ReassignLeavingAtomOperation = ReassignLeavingAtomOperation;
//# sourceMappingURL=ReassignLeavingAtomOperation.js.map
