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
var utils = require('../../shared/utils.js');
var OperationType = require('../OperationType.js');
var BaseOperation = require('../BaseOperation.js');

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
var RxnArrowRotate = function (_Base) {
  _inherits__default["default"](RxnArrowRotate, _Base);
  function RxnArrowRotate(id, angle, center, noinvalidate) {
    var _this;
    _classCallCheck__default["default"](this, RxnArrowRotate);
    _this = _callSuper(this, RxnArrowRotate, [OperationType.OperationType.RXN_ARROW_ROTATE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.data = {
      id: id,
      angle: angle,
      center: center,
      noinvalidate: noinvalidate
    };
    return _this;
  }
  _createClass__default["default"](RxnArrowRotate, [{
    key: "execute",
    value: function execute(reStruct) {
      var _this2 = this,
        _reStruct$rxnArrows$g;
      var degree = utils["default"].degrees(this.data.angle);
      var arrowId = this.data.id;
      var arrow = reStruct.molecule.rxnArrows.get(arrowId);
      if (arrow) {
        arrow.pos = arrow.pos.map(function (p) {
          return p.rotateAroundOrigin(degree, _this2.data.center);
        });
      }
      var options = reStruct.render.options;
      var drawingCenter = this.data.center.scaled(options.microModeScale).add(options.offset);
      (_reStruct$rxnArrows$g = reStruct.rxnArrows.get(arrowId)) === null || _reStruct$rxnArrows$g === void 0 || _reStruct$rxnArrows$g.visel.rotate(degree, drawingCenter);
      if (!this.data.noinvalidate) {
        BaseOperation.BaseOperation.invalidateItem(reStruct, 'rxnArrows', arrowId, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      var move = new RxnArrowRotate(this.data.id, -this.data.angle, this.data.center, this.data.noinvalidate);
      return move;
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.data.angle === 0;
    }
  }]);
  return RxnArrowRotate;
}(BaseOperation.BaseOperation);

exports.RxnArrowRotate = RxnArrowRotate;
//# sourceMappingURL=RxnArrowRotate.js.map
