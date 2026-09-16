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
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');
var rgroupAttachmentPoint = require('./rgroupAttachmentPoint.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var SGroupAttachmentPoint = function () {
  function SGroupAttachmentPoint(atomId, leaveAtomId, attachmentId, attachmentPointNumber) {
    _classCallCheck__default["default"](this, SGroupAttachmentPoint);
    _defineProperty__default["default"](this, "atomId", void 0);
    _defineProperty__default["default"](this, "leaveAtomId", void 0);
    _defineProperty__default["default"](this, "attachmentId", void 0);
    _defineProperty__default["default"](this, "attachmentPointNumber", void 0);
    this.atomId = atomId;
    this.leaveAtomId = leaveAtomId;
    this.attachmentId = attachmentId;
    this.attachmentPointNumber = attachmentPointNumber;
  }
  _createClass__default["default"](SGroupAttachmentPoint, [{
    key: "clone",
    value: function clone(atomIdMap) {
      var newAtomId = atomIdMap.get(this.atomId);
      assert.assert(newAtomId != null);
      var newLeaveAtomId = atomIdMap.get(this.leaveAtomId);
      return new SGroupAttachmentPoint(newAtomId, newLeaveAtomId, this.attachmentId, this.attachmentPointNumber);
    }
  }, {
    key: "convertToRGroupAttachmentPointForDisplayPurpose",
    value: function convertToRGroupAttachmentPointForDisplayPurpose(attachedAtomId) {
      return new rgroupAttachmentPoint.RGroupAttachmentPoint(attachedAtomId, 'primary');
    }
  }]);
  return SGroupAttachmentPoint;
}();

exports.SGroupAttachmentPoint = SGroupAttachmentPoint;
//# sourceMappingURL=sGroupAttachmentPoint.js.map
