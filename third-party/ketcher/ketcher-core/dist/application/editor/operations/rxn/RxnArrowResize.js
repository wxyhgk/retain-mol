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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var rxnArrow = require('../../../../domain/entities/rxnArrow.js');
var vec2 = require('../../../../domain/entities/vec2.js');
var scale = require('../../../../domain/helpers/scale.js');
require('../../../../domain/helpers/functionalGroupsProvider.js');
require('../../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../../domain/constants/generics.js');
require('../../../../domain/helpers/attachmentPointCalculations.js');
var toFixed = require('../../../../utilities/toFixed.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
var assert = require('../../../../utilities/assert.js');
var OperationType = require('../OperationType.js');
var BaseOperation = require('../BaseOperation.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ARROW_MAX_SNAPPING_ANGLE = Math.PI / 36;
var RxnArrowResize = function (_Base) {
  _inherits__default["default"](RxnArrowResize, _Base);
  function RxnArrowResize(id, d, current, anchor, noinvalidate, isSnappingEnabled) {
    var _this;
    _classCallCheck__default["default"](this, RxnArrowResize);
    _this = _callSuper(this, RxnArrowResize, [OperationType.OperationType.RXN_ARROW_RESIZE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "isSnappingEnabled", void 0);
    _this.data = {
      id: id,
      d: d,
      current: current,
      anchor: anchor,
      noinvalidate: noinvalidate
    };
    _this.isSnappingEnabled = isSnappingEnabled;
    return _this;
  }
  _createClass__default["default"](RxnArrowResize, [{
    key: "execute",
    value: function execute(restruct) {
      var struct = restruct.molecule;
      var id = this.data.id;
      var d = this.data.d;
      var current = this.data.current;
      var item = struct.rxnArrows.get(id);
      var reItem = restruct.rxnArrows.get(id);
      assert.assert(item != null && reItem != null);
      var anchor = this.data.anchor;
      if (anchor) {
        var previousPos0 = item.pos[0].get_xy0();
        var previousPos1 = item.pos[1].get_xy0();
        var middlePoint;
        if (rxnArrow.RxnArrow.isElliptical(item)) {
          var _reItem$getReferenceP = reItem.getReferencePoints();
          var _reItem$getReferenceP2 = _slicedToArray__default["default"](_reItem$getReferenceP, 3);
          middlePoint = _reItem$getReferenceP2[2];
        }
        if (
        toFixed.toFixed(anchor.x) === toFixed.toFixed(item.pos[1].x) && toFixed.toFixed(anchor.y) === toFixed.toFixed(item.pos[1].y)) {
          if (this.isSnappingEnabled) {
            var currentArrowVector = current.sub(item.pos[0]);
            var snappedArrowVector = getSnappedArrowVector(currentArrowVector);
            var snappedCurrent = item.pos[0].add(snappedArrowVector);
            current.x = snappedCurrent.x;
            current.y = snappedCurrent.y;
          }
          item.pos[1].x = anchor.x = current.x;
          current.x = previousPos1.x;
          item.pos[1].y = anchor.y = current.y;
          current.y = previousPos1.y;
        }
        if (
        toFixed.toFixed(anchor.x) === toFixed.toFixed(item.pos[0].x) && toFixed.toFixed(anchor.y) === toFixed.toFixed(item.pos[0].y)) {
          if (this.isSnappingEnabled) {
            var _currentArrowVector = current.sub(item.pos[1]);
            var _snappedArrowVector = getSnappedArrowVector(_currentArrowVector);
            var _snappedCurrent = item.pos[1].add(_snappedArrowVector);
            current.x = _snappedCurrent.x;
            current.y = _snappedCurrent.y;
          }
          item.pos[0].x = anchor.x = current.x;
          current.x = previousPos0.x;
          item.pos[0].y = anchor.y = current.y;
          current.y = previousPos0.y;
        }
        if (middlePoint && toFixed.toFixed(anchor.x) === toFixed.toFixed(middlePoint.x) && toFixed.toFixed(anchor.y) === toFixed.toFixed(middlePoint.y)) {
          var _reItem$getArrowParam = reItem.getArrowParams(item.pos[0].x, item.pos[0].y, item.pos[1].x, item.pos[1].y),
            angle = _reItem$getArrowParam.angle;
          var angleInRadians = angle * Math.PI / 180;
          var cosAngle = Math.cos(angleInRadians);
          var sinAngle = Math.sin(angleInRadians);
          var diffX = current.x - anchor.x;
          var diffY = current.y - anchor.y;
          var diff = diffY * cosAngle - diffX * sinAngle;
          if (item.height !== undefined) {
            item.height -= diff;
          }
          var _reItem$getReferenceP3 = reItem.getReferencePoints(),
            _reItem$getReferenceP4 = _slicedToArray__default["default"](_reItem$getReferenceP3, 3),
            newMiddlePoint = _reItem$getReferenceP4[2];
          anchor.y = newMiddlePoint.y;
          anchor.x = newMiddlePoint.x;
        }
      } else {
        if (this.isSnappingEnabled) {
          d = getSnappedArrowVector(d);
        }
        item.pos[1].add_(d);
      }
      reItem.visel.translate(scale.Scale.modelToCanvas(d, restruct.render.options));
      this.data.d = d.negated();
      if (!this.data.noinvalidate) {
        BaseOperation.BaseOperation.invalidateItem(restruct, 'rxnArrows', id, 1);
      }
    }
  }, {
    key: "invert",
    value: function invert() {
      return new RxnArrowResize(this.data.id, this.data.d, this.data.current, this.data.anchor, this.data.noinvalidate, this.isSnappingEnabled);
    }
  }, {
    key: "isDummy",
    value: function isDummy() {
      var d = this.data.d;
      return d.x === 0 && d.y === 0;
    }
  }]);
  return RxnArrowResize;
}(BaseOperation.BaseOperation);
function getSnappedArrowVector(arrow) {
  var AXIS = {
    POSITIVE_X: 0,
    POSITIVE_Y: Math.PI / 2,
    NEGATIVE_X: [Math.PI, -Math.PI],
    NEGATIVE_Y: -Math.PI / 2
  };
  var oxAngle = arrow.oxAngle();
  var arrowLength = arrow.length();
  var isSnappingToPositiveXAxis = Math.abs(oxAngle - AXIS.POSITIVE_X) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToPositiveXAxis) {
    return new vec2.Vec2(arrowLength, 0);
  }
  var isSnappingToPositiveYAxis = Math.abs(oxAngle - AXIS.POSITIVE_Y) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToPositiveYAxis) {
    return new vec2.Vec2(0, arrowLength);
  }
  var isSnappingToNegativeXAxis = Math.abs(oxAngle - AXIS.NEGATIVE_X[0]) <= ARROW_MAX_SNAPPING_ANGLE || Math.abs(oxAngle - AXIS.NEGATIVE_X[1]) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToNegativeXAxis) {
    return new vec2.Vec2(-arrowLength, 0);
  }
  var isSnappingToNegativeYAxis = Math.abs(oxAngle - AXIS.NEGATIVE_Y) <= ARROW_MAX_SNAPPING_ANGLE;
  if (isSnappingToNegativeYAxis) {
    return new vec2.Vec2(0, -arrowLength);
  }
  return arrow;
}

exports.ARROW_MAX_SNAPPING_ANGLE = ARROW_MAX_SNAPPING_ANGLE;
exports.RxnArrowResize = RxnArrowResize;
exports.getSnappedArrowVector = getSnappedArrowVector;
//# sourceMappingURL=RxnArrowResize.js.map
