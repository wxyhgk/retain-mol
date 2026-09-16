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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseOperation } from '../BaseOperation.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import { OperationType } from '../OperationType.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var moveLeftPositions = ['topLeftPosition', 'leftMiddlePosition', 'bottomLeftPosition'];
var moveRightPositions = ['topRightPosition', 'rightMiddlePosition', 'bottomRightPosition'];
var moveTopPositions = ['topLeftPosition', 'topMiddlePosition', 'topRightPosition'];
var moveBottomPositions = ['bottomLeftPosition', 'bottomMiddlePosition', 'bottomRightPosition'];
var ImageResize = function (_BaseOperation) {
  _inherits(ImageResize, _BaseOperation);
  function ImageResize(id, position, referencePositionName) {
    var _this;
    _classCallCheck(this, ImageResize);
    _this = _callSuper(this, ImageResize, [OperationType.IMAGE_RESIZE]);
    _defineProperty(_assertThisInitialized(_this), "id", void 0);
    _defineProperty(_assertThisInitialized(_this), "position", void 0);
    _defineProperty(_assertThisInitialized(_this), "referencePositionName", void 0);
    _defineProperty(_assertThisInitialized(_this), "previousPosition", null);
    _this.id = id;
    _this.position = position;
    _this.referencePositionName = referencePositionName;
    return _this;
  }
  _createClass(ImageResize, [{
    key: "execute",
    value: function execute(reStruct) {
      var item = reStruct.molecule.images.get(this.id);
      var renderItem = reStruct.images.get(this.id);
      if (!item || !renderItem) {
        return;
      }
      var referencePositions = item.getReferencePositions();
      this.previousPosition = referencePositions[this.referencePositionName];
      var diff = Vec2.diff(this.position, this.previousPosition);
      var topLeftPosition = new Vec2(referencePositions.topLeftPosition);
      var bottomRightPosition = new Vec2(referencePositions.bottomRightPosition);
      if (moveTopPositions.includes(this.referencePositionName)) {
        topLeftPosition.add_(new Vec2(0, diff.y));
      } else if (moveBottomPositions.includes(this.referencePositionName)) {
        bottomRightPosition.add_(new Vec2(0, diff.y));
      }
      if (moveLeftPositions.includes(this.referencePositionName)) {
        topLeftPosition.add_(new Vec2(diff.x, 0));
      } else if (moveRightPositions.includes(this.referencePositionName)) {
        bottomRightPosition.add_(new Vec2(diff.x, 0));
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
}(BaseOperation);

export { ImageResize };
//# sourceMappingURL=imageResize.modern.js.map
