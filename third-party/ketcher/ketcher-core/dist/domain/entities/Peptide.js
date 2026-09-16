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
var monomers = require('../types/monomers.js');
require('../types/entities.js');
var PeptideSubChain = require('./monomer-chains/PeptideSubChain.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Peptide = function (_BaseMonomer) {
  _inherits__default["default"](Peptide, _BaseMonomer);
  function Peptide() {
    _classCallCheck__default["default"](this, Peptide);
    return _callSuper(this, Peptide, arguments);
  }
  _createClass__default["default"](Peptide, [{
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(secondMonomer) {
      if (this.chosenFirstAttachmentPointForBond) {
        return this.chosenFirstAttachmentPointForBond;
      }
      if (this.unUsedAttachmentPointsNamesList.length === 1) {
        return this.unUsedAttachmentPointsNamesList[0];
      }
      if (secondMonomer !== null && secondMonomer !== void 0 && secondMonomer.potentialSecondAttachmentPointForBond) {
        if ((secondMonomer === null || secondMonomer === void 0 ? void 0 : secondMonomer.potentialSecondAttachmentPointForBond) === monomers.AttachmentPointName.R1 && this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R2)) {
          return monomers.AttachmentPointName.R2;
        }
        if ((secondMonomer === null || secondMonomer === void 0 ? void 0 : secondMonomer.potentialSecondAttachmentPointForBond) === monomers.AttachmentPointName.R2 && this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R1)) {
          return monomers.AttachmentPointName.R1;
        }
        return;
      }
      if ((!secondMonomer || secondMonomer.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R1)) && this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R2)) {
        return monomers.AttachmentPointName.R2;
      }
      if (this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R1) && secondMonomer !== null && secondMonomer !== void 0 && secondMonomer.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R2)) {
        return monomers.AttachmentPointName.R1;
      }
      return undefined;
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(firstMonomer) {
      if (this.potentialSecondAttachmentPointForBond) {
        return this.potentialSecondAttachmentPointForBond;
      }
      if (this.unUsedAttachmentPointsNamesList.length === 1) {
        return this.unUsedAttachmentPointsNamesList[0];
      }
      if (firstMonomer !== null && firstMonomer !== void 0 && firstMonomer.chosenFirstAttachmentPointForBond) {
        if ((firstMonomer === null || firstMonomer === void 0 ? void 0 : firstMonomer.chosenFirstAttachmentPointForBond) === monomers.AttachmentPointName.R1 && this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R2)) {
          return monomers.AttachmentPointName.R2;
        }
        if ((firstMonomer === null || firstMonomer === void 0 ? void 0 : firstMonomer.chosenFirstAttachmentPointForBond) === monomers.AttachmentPointName.R2 && this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R1)) {
          return monomers.AttachmentPointName.R1;
        }
        return;
      }
      if (this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R1) && firstMonomer.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R2)) {
        return monomers.AttachmentPointName.R1;
      }
      if (firstMonomer.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R1) && this.isAttachmentPointExistAndFree(monomers.AttachmentPointName.R2)) {
        return monomers.AttachmentPointName.R2;
      }
      return undefined;
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return PeptideSubChain.PeptideSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return ![PeptideSubChain.PeptideSubChain].includes(monomerToChain.SubChainConstructor);
    }
  }]);
  return Peptide;
}(BaseMonomer.BaseMonomer);

exports.Peptide = Peptide;
//# sourceMappingURL=Peptide.js.map
