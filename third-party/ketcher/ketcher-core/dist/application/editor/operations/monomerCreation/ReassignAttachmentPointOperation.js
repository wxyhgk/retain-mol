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

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReassignAttachmentPointOperation = function (_BaseOperation) {
  _inherits__default["default"](ReassignAttachmentPointOperation, _BaseOperation);
  function ReassignAttachmentPointOperation(monomerCreationState, currentName, newName) {
    var _this;
    _classCallCheck__default["default"](this, ReassignAttachmentPointOperation);
    _this = _callSuper(this, ReassignAttachmentPointOperation, [OperationType.OperationType.MONOMER_CREATION_REASSIGN_AP]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerCreationState", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "currentName", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "newName", void 0);
    _this.monomerCreationState = monomerCreationState;
    _this.currentName = currentName;
    _this.newName = newName;
    assert.assert(_this.monomerCreationState);
    return _this;
  }
  _createClass__default["default"](ReassignAttachmentPointOperation, [{
    key: "execute",
    value: function execute(restruct) {
      assert.assert(this.monomerCreationState);
      var _this$monomerCreation = this.monomerCreationState,
        assignedAttachmentPoints = _this$monomerCreation.assignedAttachmentPoints,
        problematicAttachmentPoints = _this$monomerCreation.problematicAttachmentPoints;
      problematicAttachmentPoints["delete"](this.currentName);
      var atomPair = assignedAttachmentPoints.get(this.currentName);
      assert.assert(atomPair);
      if (assignedAttachmentPoints.has(this.newName)) {
        var existingAtomPair = assignedAttachmentPoints.get(this.newName);
        assert.assert(existingAtomPair);
        assignedAttachmentPoints.set(this.newName, atomPair);
        assignedAttachmentPoints.set(this.currentName, existingAtomPair);
        BaseOperation.BaseOperation.invalidateAtom(restruct, atomPair[0]);
        BaseOperation.BaseOperation.invalidateAtom(restruct, atomPair[1]);
        BaseOperation.BaseOperation.invalidateAtom(restruct, existingAtomPair[0]);
        BaseOperation.BaseOperation.invalidateAtom(restruct, existingAtomPair[1]);
      } else {
        assignedAttachmentPoints.set(this.newName, atomPair);
        assignedAttachmentPoints["delete"](this.currentName);
        BaseOperation.BaseOperation.invalidateAtom(restruct, atomPair[0]);
        BaseOperation.BaseOperation.invalidateAtom(restruct, atomPair[1]);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new ReassignAttachmentPointOperation(this.monomerCreationState, this.newName, this.currentName);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.currentName === this.newName;
    }
  }]);
  return ReassignAttachmentPointOperation;
}(BaseOperation.BaseOperation);

exports.ReassignAttachmentPointOperation = ReassignAttachmentPointOperation;
//# sourceMappingURL=ReassignAttachmentPointOperation.js.map
