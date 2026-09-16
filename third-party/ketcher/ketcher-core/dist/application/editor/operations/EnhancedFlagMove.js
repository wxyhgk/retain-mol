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
var fragment = require('../../../domain/entities/fragment.js');
var vec2 = require('../../../domain/entities/vec2.js');
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
var EnhancedFlagMove = function (_BaseOperation) {
  _inherits__default["default"](EnhancedFlagMove, _BaseOperation);
  function EnhancedFlagMove(fragmentId, p) {
    var _this;
    _classCallCheck__default["default"](this, EnhancedFlagMove);
    _this = _callSuper(this, EnhancedFlagMove, [OperationType.OperationType.ENHANCED_FLAG_MOVE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      frid: fragmentId,
      p: p
    };
    return _this;
  }
  _createClass__default["default"](EnhancedFlagMove, [{
    key: "execute",
    value: function execute(restruct) {
      var frid = this.data.frid;
      var p = this.data.p;
      if (frid === undefined || p === undefined) return;
      var fragment$1 = restruct.molecule.frags.get(frid);
      if (!fragment$1) return;
      var currentPosition = fragment$1.stereoFlagPosition ? new vec2.Vec2(fragment$1.stereoFlagPosition.x, fragment$1.stereoFlagPosition.y) : fragment.Fragment.getDefaultStereoFlagPosition(restruct.molecule, frid);
      if (!currentPosition) return;
      var newPosition = vec2.Vec2.sum(currentPosition, p);
      fragment$1.stereoFlagPosition = newPosition;
      this.data.p = p.negated();
      BaseOperation.BaseOperation.invalidateItem(restruct, 'enhancedFlags', frid, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      var inverted = new EnhancedFlagMove();
      inverted.data = this.data;
      return inverted;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var p = this.data.p;
      return (p === null || p === void 0 ? void 0 : p.x) === 0 && (p === null || p === void 0 ? void 0 : p.y) === 0;
    }
  }]);
  return EnhancedFlagMove;
}(BaseOperation.BaseOperation);

exports.EnhancedFlagMove = EnhancedFlagMove;
//# sourceMappingURL=EnhancedFlagMove.js.map
