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
var scale = require('../../../../domain/helpers/scale.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
var BaseOperation = require('../BaseOperation.js');
var OperationType = require('../OperationType.js');

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
var RxnArrowMove = function (_Base) {
  _inherits__default["default"](RxnArrowMove, _Base);
  function RxnArrowMove(id, d, noinvalidate) {
    var _this;
    _classCallCheck__default["default"](this, RxnArrowMove);
    _this = _callSuper(this, RxnArrowMove, [OperationType.OperationType.RXN_ARROW_MOVE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      id: id,
      d: d,
      noinvalidate: noinvalidate
    };
    return _this;
  }
  _createClass__default["default"](RxnArrowMove, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      if (id === undefined || d === undefined) return;
      var item = struct.rxnArrows.get(id);
      if (!item) return;
      item.pos.forEach(function (p) {
        return p.add_(d);
      });
      var reItem = restruct.rxnArrows.get(id);
      if (!reItem) return;
      reItem.visel.translate(scale.Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.BaseOperation.invalidateItem(restruct, 'rxnArrows', id, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var move = new RxnArrowMove(this.data.id, this.data.d, this.data.noinvalidate);
      move.data = this.data;
      return move;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return (d === null || d === void 0 ? void 0 : d.x) === 0 && (d === null || d === void 0 ? void 0 : d.y) === 0;
    }
  }]);
  return RxnArrowMove;
}(BaseOperation.BaseOperation);

exports.RxnArrowMove = RxnArrowMove;
//# sourceMappingURL=RxnArrowMove.js.map
