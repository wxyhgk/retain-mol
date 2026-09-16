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

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ShiftMonomerOperation = function (_BaseOperation) {
  _inherits__default["default"](ShiftMonomerOperation, _BaseOperation);
  function ShiftMonomerOperation(data) {
    var _this;
    _classCallCheck__default["default"](this, ShiftMonomerOperation);
    _this = _callSuper(this, ShiftMonomerOperation, [OperationType.OperationType.SHIFT_MONOMER]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousValue", null);
    _this.data = data;
    return _this;
  }
  _createClass__default["default"](ShiftMonomerOperation, [{
    key: "execute",
    value: function execute(restruct) {
      var _monomerSGroup$monome, _monomerTransformatio;
      var monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
      if (!monomerSGroup || !(monomerSGroup instanceof monomerMicromolecule.MonomerMicromolecule)) {
        return;
      }
      var monomerTransformation = (_monomerSGroup$monome = monomerSGroup.monomer.monomerItem).transformation || (_monomerSGroup$monome.transformation = {});
      this.previousValue = (_monomerTransformatio = monomerTransformation.shift) !== null && _monomerTransformatio !== void 0 ? _monomerTransformatio : null;
      if (this.data.value === null) {
        delete monomerTransformation.shift;
        return;
      }
      if (this.data.value) {
        var _this$previousValue$x, _this$previousValue, _this$data$value$x, _this$previousValue$y, _this$previousValue2, _this$data$value$y;
        monomerTransformation.shift = {
          x: ((_this$previousValue$x = (_this$previousValue = this.previousValue) === null || _this$previousValue === void 0 ? void 0 : _this$previousValue.x) !== null && _this$previousValue$x !== void 0 ? _this$previousValue$x : 0) + ((_this$data$value$x = this.data.value.x) !== null && _this$data$value$x !== void 0 ? _this$data$value$x : 0),
          y: ((_this$previousValue$y = (_this$previousValue2 = this.previousValue) === null || _this$previousValue2 === void 0 ? void 0 : _this$previousValue2.y) !== null && _this$previousValue$y !== void 0 ? _this$previousValue$y : 0) + ((_this$data$value$y = this.data.value.y) !== null && _this$data$value$y !== void 0 ? _this$data$value$y : 0)
        };
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new ShiftMonomerOperation({
        id: this.data.id,
        value: this.previousValue
      });
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var _value$x, _value$y;
      var value = this.data.value;
      if (value === null) return false;
      return ((_value$x = value.x) !== null && _value$x !== void 0 ? _value$x : 0) === 0 && ((_value$y = value.y) !== null && _value$y !== void 0 ? _value$y : 0) === 0;
    }
  }]);
  return ShiftMonomerOperation;
}(BaseOperation.BaseOperation);

exports.ShiftMonomerOperation = ShiftMonomerOperation;
//# sourceMappingURL=ShiftMonomerOperation.js.map
