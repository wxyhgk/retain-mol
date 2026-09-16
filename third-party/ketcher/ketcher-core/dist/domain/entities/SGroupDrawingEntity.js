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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var DrawingEntity = require('./DrawingEntity.js');
var vec2 = require('./vec2.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var SGroupDrawingEntity = function (_DrawingEntity) {
  _inherits__default["default"](SGroupDrawingEntity, _DrawingEntity);
  function SGroupDrawingEntity(sgroup, monomer, sgroupIdInMicroMode) {
    var _this;
    _classCallCheck__default["default"](this, SGroupDrawingEntity);
    _this = _callSuper(this, SGroupDrawingEntity, [SGroupDrawingEntity.getCenter(sgroup, monomer)]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "sgroup", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "sgroupIdInMicroMode", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "renderer", void 0);
    _this.sgroup = sgroup;
    _this.monomer = monomer;
    _this.sgroupIdInMicroMode = sgroupIdInMicroMode;
    return _this;
  }
  _createClass__default["default"](SGroupDrawingEntity, [{
    key: "center",
    get: function get() {
      return SGroupDrawingEntity.getCenter(this.sgroup, this.monomer);
    }
  }, {
    key: "setRenderer",
    value: function setRenderer(renderer) {
      _get__default["default"](_getPrototypeOf__default["default"](SGroupDrawingEntity.prototype), "setBaseRenderer", this).call(this, renderer);
      this.renderer = renderer;
    }
  }], [{
    key: "getCenter",
    value: function getCenter(sgroup, monomer) {
      var atoms = sgroup.atoms.map(function (atomId) {
        var _monomer$monomerItem$;
        return (_monomer$monomerItem$ = monomer.monomerItem.struct.atoms.get(atomId)) === null || _monomer$monomerItem$ === void 0 ? void 0 : _monomer$monomerItem$.pp;
      }).filter(function (position) {
        return position instanceof vec2.Vec2;
      });
      if (atoms.length === 0) {
        return monomer.position;
      }
      var atomWeight = 1 / atoms.length;
      return atoms.reduce(function (center, position) {
        return center.addScaled(position, atomWeight);
      }, new vec2.Vec2());
    }
  }]);
  return SGroupDrawingEntity;
}(DrawingEntity.DrawingEntity);

exports.SGroupDrawingEntity = SGroupDrawingEntity;
//# sourceMappingURL=SGroupDrawingEntity.js.map
