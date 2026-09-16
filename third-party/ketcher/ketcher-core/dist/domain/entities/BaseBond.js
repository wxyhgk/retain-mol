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
var DrawingEntity = require('./DrawingEntity.js');
var vec2 = require('./vec2.js');

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
var BaseBond = function (_DrawingEntity) {
  _inherits__default["default"](BaseBond, _DrawingEntity);
  function BaseBond() {
    var _this;
    _classCallCheck__default["default"](this, BaseBond);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, BaseBond, [].concat(args));
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "endPosition", new vec2.Vec2());
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "_isOverlappedByMonomer", false);
    return _this;
  }
  _createClass__default["default"](BaseBond, [{
    key: "finished",
    get: function get() {
      return Boolean(this.firstEndEntity && this.secondEndEntity);
    }
  }, {
    key: "center",
    get: function get() {
      return vec2.Vec2.centre(this.startPosition, this.endPosition);
    }
  }, {
    key: "moveToLinkedEntities",
    value: function moveToLinkedEntities() {
      var _this$secondEndEntity;
      var firstMonomerCenter = this.firstEndEntity.position;
      var secondMonomerCenter = (_this$secondEndEntity = this.secondEndEntity) === null || _this$secondEndEntity === void 0 ? void 0 : _this$secondEndEntity.position;
      this.moveBondStartAbsolute(firstMonomerCenter.x, firstMonomerCenter.y);
      if (secondMonomerCenter) {
        this.moveBondEndAbsolute(secondMonomerCenter.x, secondMonomerCenter.y);
      }
    }
  }, {
    key: "moveBondStartAbsolute",
    value: function moveBondStartAbsolute(x, y) {
      this.moveAbsolute(new vec2.Vec2(x, y));
    }
  }, {
    key: "moveBondEndAbsolute",
    value: function moveBondEndAbsolute(x, y) {
      this.endPosition = new vec2.Vec2(x, y);
    }
  }, {
    key: "startPosition",
    get: function get() {
      return this.position;
    }
  }, {
    key: "getAnotherEntity",
    value: function getAnotherEntity(monomer) {
      return this.firstEndEntity === monomer ? this.secondEndEntity : this.firstEndEntity;
    }
  }, {
    key: "isOverlappedByMonomer",
    get: function get() {
      return this._isOverlappedByMonomer;
    },
    set: function set(value) {
      this._isOverlappedByMonomer = value;
    }
  }]);
  return BaseBond;
}(DrawingEntity.DrawingEntity);

exports.BaseBond = BaseBond;
//# sourceMappingURL=BaseBond.js.map
