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
var vec2 = require('../../../../domain/entities/vec2.js');
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
var moveLeftPositions = ['topLeftPosition', 'leftMiddlePosition', 'bottomLeftPosition'];
var moveRightPositions = ['topRightPosition', 'rightMiddlePosition', 'bottomRightPosition'];
var moveTopPositions = ['topLeftPosition', 'topMiddlePosition', 'topRightPosition'];
var moveBottomPositions = ['bottomLeftPosition', 'bottomMiddlePosition', 'bottomRightPosition'];
var ImageResize = function (_BaseOperation) {
  _inherits__default["default"](ImageResize, _BaseOperation);
  function ImageResize(id, position, referencePositionName) {
    var _this;
    _classCallCheck__default["default"](this, ImageResize);
    _this = _callSuper(this, ImageResize, [OperationType.OperationType.IMAGE_RESIZE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "id", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "position", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "referencePositionName", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "previousPosition", null);
    _this.id = id;
    _this.position = position;
    _this.referencePositionName = referencePositionName;
    return _this;
  }
  _createClass__default["default"](ImageResize, [{
    key: "execute",
    value: function execute(reStruct) {
      var item = reStruct.molecule.images.get(this.id);
      var renderItem = reStruct.images.get(this.id);
      if (!item || !renderItem) {
        return;
      }
      var referencePositions = item.getReferencePositions();
      this.previousPosition = referencePositions[this.referencePositionName];
      var diff = vec2.Vec2.diff(this.position, this.previousPosition);
      var topLeftPosition = new vec2.Vec2(referencePositions.topLeftPosition);
      var bottomRightPosition = new vec2.Vec2(referencePositions.bottomRightPosition);
      if (moveTopPositions.includes(this.referencePositionName)) {
        topLeftPosition.add_(new vec2.Vec2(0, diff.y));
      } else if (moveBottomPositions.includes(this.referencePositionName)) {
        bottomRightPosition.add_(new vec2.Vec2(0, diff.y));
      }
      if (moveLeftPositions.includes(this.referencePositionName)) {
        topLeftPosition.add_(new vec2.Vec2(diff.x, 0));
      } else if (moveRightPositions.includes(this.referencePositionName)) {
        bottomRightPosition.add_(new vec2.Vec2(diff.x, 0));
      }
      item.resize(topLeftPosition, bottomRightPosition);
      var next = renderItem.visel.paths[0].next;
      reStruct.clearVisel(renderItem.visel);
      renderItem.show(reStruct, reStruct.render.options, next);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (!this.previousPosition) {
        throw new Error('ImageResize: cannot invert an operation that has not been executed yet');
      }
      return new ImageResize(this.id, this.previousPosition, this.referencePositionName);
    }
  }, {
    key: "isDummy",
    value: function isDummy(restruct) {
      if (!restruct) return false;
      var item = restruct.molecule.images.get(this.id);
      if (!item) return false;
      var currentPosition = item.getReferencePositions()[this.referencePositionName];
      return this.position.x === currentPosition.x && this.position.y === currentPosition.y;
    }
  }]);
  return ImageResize;
}(BaseOperation.BaseOperation);

exports.ImageResize = ImageResize;
//# sourceMappingURL=imageResize.js.map
