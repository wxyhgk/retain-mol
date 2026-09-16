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
import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseMicromoleculeEntity } from './BaseMicromoleculeEntity.modern.js';
import { Vec2 } from './vec2.modern.js';
import { getNodeWithInvertedYCoord } from '../serializers/ket/helpers.modern.js';
import '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import { IMAGE_SERIALIZE_KEY } from '../constants/image.modern.js';
import '../constants/chains.modern.js';
import '../constants/monomers.modern.js';

var _excluded = ["width", "height"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Image = function (_BaseMicromoleculeEnt) {
  _inherits(Image, _BaseMicromoleculeEnt);
  function Image(bitmap, _center, halfSize) {
    var _this;
    _classCallCheck(this, Image);
    _this = _callSuper(this, Image);
    _defineProperty(_assertThisInitialized(_this), "bitmap", void 0);
    _defineProperty(_assertThisInitialized(_this), "_center", void 0);
    _defineProperty(_assertThisInitialized(_this), "halfSize", void 0);
    _this.bitmap = bitmap;
    _this._center = _center;
    _this.halfSize = halfSize;
    return _this;
  }
  _createClass(Image, [{
    key: "getTopLeftPosition",
    value: function getTopLeftPosition() {
      return this._center.sub(this.halfSize);
    }
  }, {
    key: "getTopRightPosition",
    value: function getTopRightPosition() {
      return new Vec2(this._center.x + this.halfSize.x, this._center.y - this.halfSize.y);
    }
  }, {
    key: "getBottomRightPosition",
    value: function getBottomRightPosition() {
      return this._center.add(this.halfSize);
    }
  }, {
    key: "getBottomLeftPosition",
    value: function getBottomLeftPosition() {
      return new Vec2(this._center.x - this.halfSize.x, this._center.y + this.halfSize.y);
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
        _this$getCornerPositi2 = _slicedToArray(_this$getCornerPositi, 4),
        topLeftPosition = _this$getCornerPositi2[0],
        topRightPosition = _this$getCornerPositi2[1],
        bottomRightPosition = _this$getCornerPositi2[2],
        bottomLeftPosition = _this$getCornerPositi2[3];
      return {
        topLeftPosition: topLeftPosition,
        topMiddlePosition: Vec2.centre(topLeftPosition, topRightPosition),
        topRightPosition: topRightPosition,
        rightMiddlePosition: Vec2.centre(topRightPosition, bottomRightPosition),
        bottomRightPosition: bottomRightPosition,
        bottomMiddlePosition: Vec2.centre(bottomLeftPosition, bottomRightPosition),
        bottomLeftPosition: bottomLeftPosition,
        leftMiddlePosition: Vec2.centre(topLeftPosition, bottomLeftPosition)
      };
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Image(this.bitmap, new Vec2(this._center), new Vec2(this.halfSize));
    }
  }, {
    key: "addPositionOffset",
    value: function addPositionOffset(offset) {
      this._center = this._center.add(offset);
    }
  }, {
    key: "resize",
    value: function resize(topLeftPosition, bottomRightPosition) {
      this._center = Vec2.centre(topLeftPosition, bottomRightPosition);
      var halfSize = Vec2.diff(bottomRightPosition, topLeftPosition).scaled(0.5);
      this.halfSize = new Vec2(Math.abs(halfSize.x), Math.abs(halfSize.y));
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
        type: IMAGE_SERIALIZE_KEY,
        center: getNodeWithInvertedYCoord(this._center),
        format: format,
        boundingBox: _objectSpread(_objectSpread({}, getNodeWithInvertedYCoord(topLeftCorner)), {}, {
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
      var _getNodeWithInvertedY = getNodeWithInvertedYCoord(ketFileNode.boundingBox),
        width = _getNodeWithInvertedY.width,
        height = _getNodeWithInvertedY.height,
        point = _objectWithoutProperties(_getNodeWithInvertedY, _excluded);
      var halfSize = new Vec2(width / 2, height / 2);
      var topLeftCorner = new Vec2(point);
      var center = topLeftCorner.add(halfSize);
      var imageSrc = "data:".concat(ketFileNode.format, ";base64,").concat(ketFileNode.data);
      var image = new Image(imageSrc, center, halfSize);
      image.setInitiallySelected(ketFileNode.selected);
      return image;
    }
  }]);
  return Image;
}(BaseMicromoleculeEntity);

export { Image };
//# sourceMappingURL=image.modern.js.map
