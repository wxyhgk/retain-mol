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
var RnaSubChain = require('./monomer-chains/RnaSubChain.js');
var PhosphateSubChain = require('./monomer-chains/PhosphateSubChain.js');
var monomers = require('../helpers/monomers.js');
var PolymerBond = require('./PolymerBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Sugar = function (_BaseMonomer) {
  _inherits__default["default"](Sugar, _BaseMonomer);
  function Sugar() {
    _classCallCheck__default["default"](this, Sugar);
    return _callSuper(this, Sugar, arguments);
  }
  _createClass__default["default"](Sugar, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(secondMonomer) {
      if (!secondMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Sugar.getValidPoint(this, secondMonomer, secondMonomer.potentialSecondAttachmentPointForBond);
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(firstMonomer) {
      if (!firstMonomer) {
        return this.firstFreeAttachmentPoint;
      }
      return Sugar.getValidPoint(this, firstMonomer, firstMonomer.chosenFirstAttachmentPointForBond);
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return RnaSubChain.RnaSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return ![PhosphateSubChain.PhosphateSubChain, RnaSubChain.RnaSubChain].includes(monomerToChain.SubChainConstructor);
    }
  }, {
    key: "isPartOfRNA",
    get: function get() {
      var r3PolymerBond = this.attachmentPointsToBonds.R3;
      return r3PolymerBond instanceof PolymerBond.PolymerBond && monomers.isRnaBaseOrAmbiguousRnaBase(r3PolymerBond === null || r3PolymerBond === void 0 ? void 0 : r3PolymerBond.getAnotherMonomer(this));
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
      if (!monomers.isPhosphateOrAmbiguousPhosphate(otherMonomer) && !monomers.isRnaBaseOrAmbiguousRnaBase(otherMonomer)) {
        return;
      }
      if (monomers.isRnaBaseOrAmbiguousRnaBase(otherMonomer)) {
        if (self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R3)) {
          return monomers$1.AttachmentPointName.R3;
        } else return;
      }
      if (potentialPointOnOther) {
        if (potentialPointOnOther === monomers$1.AttachmentPointName.R1 && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2)) {
          return monomers$1.AttachmentPointName.R2;
        } else if (potentialPointOnOther !== monomers$1.AttachmentPointName.R1 && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1)) {
          return monomers$1.AttachmentPointName.R1;
        } else {
          return;
        }
      }
      if (otherMonomer.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1) && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2)) {
        return monomers$1.AttachmentPointName.R2;
      }
      if (otherMonomer.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R2) && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1)) {
        return monomers$1.AttachmentPointName.R1;
      }
      if (!otherMonomer.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1) && self.isAttachmentPointExistAndFree(monomers$1.AttachmentPointName.R1)) {
        return monomers$1.AttachmentPointName.R1;
      }
      return undefined;
    }
  }]);
  return Sugar;
}(BaseMonomer.BaseMonomer);

exports.Sugar = Sugar;
//# sourceMappingURL=Sugar.js.map
