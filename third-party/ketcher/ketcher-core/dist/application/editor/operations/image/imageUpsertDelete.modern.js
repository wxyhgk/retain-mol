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
import { OperationType } from '../OperationType.modern.js';
import { ReImage } from '../../../render/restruct/reImage.modern.js';
import '../../../../domain/constants/elements.modern.js';
import '../../../../domain/constants/element.types.modern.js';
import '../../../../domain/constants/generics.modern.js';
import { IMAGE_KEY } from '../../../../domain/constants/image.modern.js';
import '../../../../domain/constants/chains.modern.js';
import '../../../../domain/constants/monomers.modern.js';

function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ImageUpsert = function (_BaseOperation) {
  _inherits(ImageUpsert, _BaseOperation);
  function ImageUpsert(image, id) {
    var _this;
    _classCallCheck(this, ImageUpsert);
    _this = _callSuper(this, ImageUpsert, [OperationType.IMAGE_UPSERT]);
    _defineProperty(_assertThisInitialized(_this), "image", void 0);
    _defineProperty(_assertThisInitialized(_this), "data", void 0);
    _this.image = image;
    _this.data = {
      id: id
    };
    return _this;
  }
  _createClass(ImageUpsert, [{
    key: "execute",
    value: function execute(reStruct) {
      var struct = reStruct.molecule;
      if (this.data.id === undefined) {
        this.data.id = struct.images.newId();
      }
      var id = this.data.id;
      var item = this.image.clone();
      struct.images.set(id, item);
      reStruct.images.set(id, new ReImage(item));
      BaseOperation.invalidateItem(reStruct, IMAGE_KEY, id, 1);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (this.data.id === undefined) {
        throw new Error('ImageUpsert.invert: operation has not been executed');
      }
      return new ImageDelete(this.data.id);
    }
  }]);
  return ImageUpsert;
}(BaseOperation);
var ImageDelete = function (_BaseOperation2) {
  _inherits(ImageDelete, _BaseOperation2);
  function ImageDelete(id) {
    var _this2;
    _classCallCheck(this, ImageDelete);
    _this2 = _callSuper(this, ImageDelete, [OperationType.IMAGE_DELETE]);
    _defineProperty(_assertThisInitialized(_this2), "image", void 0);
    _defineProperty(_assertThisInitialized(_this2), "data", void 0);
    _this2.data = {
      id: id
    };
    return _this2;
  }
  _createClass(ImageDelete, [{
    key: "execute",
    value: function execute(reStruct) {
      var reImage = reStruct.images.get(this.data.id);
      if (!reImage) {
        return;
      }
      this.image = reImage.image.clone();
      reStruct.clearVisel(reImage.visel);
      reStruct.markItemRemoved();
      reStruct.images["delete"](this.data.id);
      reStruct.molecule.images["delete"](this.data.id);
    }
  }, {
    key: "invert",
    value: function invert() {
      if (!this.image) {
        throw new Error('ImageDelete.invert: operation has not been executed');
      }
      return new ImageUpsert(this.image, this.data.id);
    }
  }]);
  return ImageDelete;
}(BaseOperation);

export { ImageDelete, ImageUpsert };
//# sourceMappingURL=imageUpsertDelete.modern.js.map
