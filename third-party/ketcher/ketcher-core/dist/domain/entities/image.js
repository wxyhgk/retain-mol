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

var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseMicromoleculeEntity = require('./BaseMicromoleculeEntity.js');
var vec2 = require('./vec2.js');
var helpers = require('../serializers/ket/helpers.js');
require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
var image = require('../constants/image.js');
require('../constants/chains.js');
require('../constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _objectWithoutProperties__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutProperties);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var _excluded = ["width", "height"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Image = function (_BaseMicromoleculeEnt) {
  _inherits__default["default"](Image, _BaseMicromoleculeEnt);
  function Image(bitmap, _center, halfSize) {
    var _this;
    _classCallCheck__default["default"](this, Image);
    _this = _callSuper(this, Image);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "bitmap", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "_center", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "halfSize", void 0);
    _this.bitmap = bitmap;
    _this._center = _center;
    _this.halfSize = halfSize;
    return _this;
  }
  _createClass__default["default"](Image, [{
    key: "getTopLeftPosition",
    value: function getTopLeftPosition() {
      return this._center.sub(this.halfSize);
    }
  }, {
    key: "getTopRightPosition",
    value: function getTopRightPosition() {
      return new vec2.Vec2(this._center.x + this.halfSize.x, this._center.y - this.halfSize.y);
    }
  }, {
    key: "getBottomRightPosition",
    value: function getBottomRightPosition() {
      return this._center.add(this.halfSize);
    }
  }, {
    key: "getBottomLeftPosition",
    value: function getBottomLeftPosition() {
      return new vec2.Vec2(this._center.x - this.halfSize.x, this._center.y + this.halfSize.y);
    }
  }, {
    key: "getCornerPositions",
    value: function getCornerPositions() {
      return [this.getTopLeftPosition(), this.getTopRightPosition(), this.getBottomRightPosition(), this.getBottomLeftPosition()];
    }
  }, {
    key: "getReferencePositions",
    value: function getReferencePositions() {
      var _this$getCornerPositi = this.getCornerPositions(),
        _this$getCornerPositi2 = _slicedToArray__default["default"](_this$getCornerPositi, 4),
        topLeftPosition = _this$getCornerPositi2[0],
        topRightPosition = _this$getCornerPositi2[1],
        bottomRightPosition = _this$getCornerPositi2[2],
        bottomLeftPosition = _this$getCornerPositi2[3];
      return {
        topLeftPosition: topLeftPosition,
        topMiddlePosition: vec2.Vec2.centre(topLeftPosition, topRightPosition),
        topRightPosition: topRightPosition,
        rightMiddlePosition: vec2.Vec2.centre(topRightPosition, bottomRightPosition),
        bottomRightPosition: bottomRightPosition,
        bottomMiddlePosition: vec2.Vec2.centre(bottomLeftPosition, bottomRightPosition),
        bottomLeftPosition: bottomLeftPosition,
        leftMiddlePosition: vec2.Vec2.centre(topLeftPosition, bottomLeftPosition)
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Image(this.bitmap, new vec2.Vec2(this._center), new vec2.Vec2(this.halfSize));
    }
  }, {
    key: "addPositionOffset",
    value: function addPositionOffset(offset) {
      this._center = this._center.add(offset);
    }
  }, {
    key: "resize",
    value: function resize(topLeftPosition, bottomRightPosition) {
      this._center = vec2.Vec2.centre(topLeftPosition, bottomRightPosition);
      var halfSize = vec2.Vec2.diff(bottomRightPosition, topLeftPosition).scaled(0.5);
      this.halfSize = new vec2.Vec2(Math.abs(halfSize.x), Math.abs(halfSize.y));
    }
  }, {
    key: "rescaleSize",
    value: function rescaleSize(scale) {
      this.halfSize = this.halfSize.scaled(scale);
    }
  }, {
    key: "center",
    value: function center() {
      return this._center;
    }
  }, {
    key: "toKetNode",
    value: function toKetNode() {
      var _exec;
      var topLeftCorner = this.getTopLeftPosition();
      var base64Data = this.bitmap.replace(/^.*;base64,/, '');
      var format = (_exec = /^data:(image\/.*);base64,/.exec(this.bitmap)) === null || _exec === void 0 ? void 0 : _exec[1];
      return {
        type: image.IMAGE_SERIALIZE_KEY,
        center: helpers.getNodeWithInvertedYCoord(this._center),
        format: format,
        boundingBox: _objectSpread(_objectSpread({}, helpers.getNodeWithInvertedYCoord(topLeftCorner)), {}, {
          width: this.halfSize.x * 2,
          height: this.halfSize.y * 2
        }),
        data: base64Data,
        selected: this.getInitiallySelected()
      };
    }
  }], [{
    key: "fromKetNode",
    value: function fromKetNode(ketFileNode) {
      var _getNodeWithInvertedY = helpers.getNodeWithInvertedYCoord(ketFileNode.boundingBox),
        width = _getNodeWithInvertedY.width,
        height = _getNodeWithInvertedY.height,
        point = _objectWithoutProperties__default["default"](_getNodeWithInvertedY, _excluded);
      var halfSize = new vec2.Vec2(width / 2, height / 2);
      var topLeftCorner = new vec2.Vec2(point);
      var center = topLeftCorner.add(halfSize);
      var imageSrc = "data:".concat(ketFileNode.format, ";base64,").concat(ketFileNode.data);
      var image = new Image(imageSrc, center, halfSize);
      image.setInitiallySelected(ketFileNode.selected);
      return image;
    }
  }]);
  return Image;
}(BaseMicromoleculeEntity.BaseMicromoleculeEntity);

exports.Image = Image;
//# sourceMappingURL=image.js.map
