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
var RotateMonomerOperation = function (_BaseOperation) {
  _inherits__default["default"](RotateMonomerOperation, _BaseOperation);
  function RotateMonomerOperation(data) {
    var _this;
    _classCallCheck__default["default"](this, RotateMonomerOperation);
    _this = _callSuper(this, RotateMonomerOperation, [OperationType.OperationType.ROTATE_MONOMER]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousValue", null);
    _this.data = data;
    return _this;
  }
  _createClass__default["default"](RotateMonomerOperation, [{
    key: "execute",
    value: function execute(restruct) {
      var _monomerSGroup$monome, _monomerTransformatio;
      var monomerSGroup = restruct.molecule.sgroups.get(this.data.id);
      if (!monomerSGroup || !(monomerSGroup instanceof monomerMicromolecule.MonomerMicromolecule)) {
        return;
      }
      var monomerTransformation = (_monomerSGroup$monome = monomerSGroup.monomer.monomerItem).transformation || (_monomerSGroup$monome.transformation = {});
      this.previousValue = (_monomerTransformatio = monomerTransformation.rotate) !== null && _monomerTransformatio !== void 0 ? _monomerTransformatio : 0;
      if (this.data.value === null) {
        delete monomerTransformation.rotate;
        return;
      }
      monomerTransformation.rotate = this.previousValue + this.data.value;
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RotateMonomerOperation({
        id: this.data.id,
        value: this.data.value === null ? this.previousValue : -this.data.value
      });
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      return this.data.value === 0;
    }
  }]);
  return RotateMonomerOperation;
}(BaseOperation.BaseOperation);

exports.RotateMonomerOperation = RotateMonomerOperation;
//# sourceMappingURL=RotateMonomerOperation.js.map
