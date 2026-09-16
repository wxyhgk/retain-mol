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
var _inherits = require('@babel/runtime/helpers/inherits');
var BaseMonomer = require('./BaseMonomer.js');
var monomers$1 = require('../types/monomers.js');
require('../types/entities.js');
var PhosphateSubChain = require('./monomer-chains/PhosphateSubChain.js');
var RnaSubChain = require('./monomer-chains/RnaSubChain.js');
var monomers = require('../helpers/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Phosphate = function (_BaseMonomer) {
  _inherits__default["default"](Phosphate, _BaseMonomer);
  function Phosphate(monomerItem, _position) {
    _classCallCheck__default["default"](this, Phosphate);
    return _callSuper(this, Phosphate, [monomerItem, _position]);
  }
  _createClass__default["default"](Phosphate, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(secondMonomer) {
      if (!secondMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Phosphate.getValidPoint(this, secondMonomer, secondMonomer.potentialSecondAttachmentPointForBond);
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(firstMonomer) {
      if (!firstMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Phosphate.getValidPoint(this, firstMonomer, firstMonomer.chosenFirstAttachmentPointForBond);
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return ![PhosphateSubChain.PhosphateSubChain, RnaSubChain.RnaSubChain].includes(monomerToChain.SubChainConstructor);
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return PhosphateSubChain.PhosphateSubChain;
    }
  }], [{
    key: "getValidPoint",
    value: function getValidPoint(self, otherMonomer, potentialPointOnOther) {
      if (self.chosenFirstAttachmentPointForBond) {
        return self.chosenFirstAttachmentPointForBond;
      }
      if (self.potentialSecondAttachmentPointForBond) {
        return self.potentialSecondAttachmentPointForBond;
      }
      if (self.unUsedAttachmentPointsNamesList.length === 1) {
        return self.unUsedAttachmentPointsNamesList[0];
      }
      if (!monomers.isSugarOrAmbiguousSugar(otherMonomer)) {
        return;
      }
      if (potentialPointOnOther) {
        if (potentialPointOnOther === monomers$1.AttachmentPointName.R2 && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1)) {
          return monomers$1.AttachmentPointName.R1;
        } else if (potentialPointOnOther !== monomers$1.AttachmentPointName.R2 && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2)) {
          return monomers$1.AttachmentPointName.R2;
        } else {
          return;
        }
      }
      if (otherMonomer.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2) && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1)) {
        return monomers$1.AttachmentPointName.R1;
      }
      if (!otherMonomer.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2) && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2)) {
        return monomers$1.AttachmentPointName.R2;
      }
      return undefined;
    }
  }]);
  return Phosphate;
}(BaseMonomer.BaseMonomer);

exports.Phosphate = Phosphate;
//# sourceMappingURL=Phosphate.js.map
