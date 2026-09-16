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
var reImage = require('../../../render/restruct/reImage.js');
require('../../../../domain/constants/elements.js');
require('../../../../domain/constants/element.types.js');
require('../../../../domain/constants/generics.js');
var image = require('../../../../domain/constants/image.js');
require('../../../../domain/constants/chains.js');
require('../../../../domain/constants/monomers.js');

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
var ImageUpsert = function (_BaseOperation) {
  _inherits__default["default"](ImageUpsert, _BaseOperation);
  function ImageUpsert(image, id) {
    var _this;
    _classCallCheck__default["default"](this, ImageUpsert);
    _this = _callSuper(this, ImageUpsert, [OperationType.OperationType.IMAGE_UPSERT]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "image", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "data", void 0);
    _this.image = image;
    _this.data = {
      id: id
    };
    return _this;
  }
  _createClass__default["default"](ImageUpsert, [{
    key: "execute",
    value: function execute(reStruct) {
      var struct = reStruct.molecule;
      if (this.data.id === undefined) {
        this.data.id = struct.images.newId();
      }
      var id = this.data.id;
      var item = this.image.clone();
      struct.images.set(id, item);
      reStruct.images.set(id, new reImage.ReImage(item));
      BaseOperation.BaseOperation.invalidateItem(reStruct, image.IMAGE_KEY, id, 1);
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
}(BaseOperation.BaseOperation);
var ImageDelete = function (_BaseOperation2) {
  _inherits__default["default"](ImageDelete, _BaseOperation2);
  function ImageDelete(id) {
    var _this2;
    _classCallCheck__default["default"](this, ImageDelete);
    _this2 = _callSuper(this, ImageDelete, [OperationType.OperationType.IMAGE_DELETE]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "image", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this2), "data", void 0);
    _this2.data = {
      id: id
    };
    return _this2;
  }
  _createClass__default["default"](ImageDelete, [{
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
}(BaseOperation.BaseOperation);

exports.ImageDelete = ImageDelete;
exports.ImageUpsert = ImageUpsert;
//# sourceMappingURL=imageUpsertDelete.js.map
