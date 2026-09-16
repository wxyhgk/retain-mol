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
var BaseMonomer = require('./BaseMonomer.js');
var ChemSubChain = require('./monomer-chains/ChemSubChain.js');
var struct = require('./struct.js');
var resolveMonomerClass = require('../../application/editor/operations/monomer/resolveMonomerClass.js');
var ket = require('../../application/formatters/types/ket.js');
var PeptideSubChain = require('./monomer-chains/PeptideSubChain.js');
var PhosphateSubChain = require('./monomer-chains/PhosphateSubChain.js');
var RnaSubChain = require('./monomer-chains/RnaSubChain.js');
var Chem = require('./Chem.js');
var Peptide = require('./Peptide.js');
var Phosphate = require('./Phosphate.js');
var Sugar = require('./Sugar.js');
var RNABase = require('./RNABase.js');
var UnsplitNucleotide = require('./UnsplitNucleotide.js');
var editorSingleton = require('../../application/editor/editorSingleton.js');
var monomers$1 = require('../helpers/monomers.js');
var monomers = require('../constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var DEFAULT_VARIANT_MONOMER_LABEL = '%';
var MONOMER_CLASS_TO_CONSTRUCTOR = _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"]({}, monomers.KetMonomerClass.CHEM, Chem.Chem), monomers.KetMonomerClass.AminoAcid, Peptide.Peptide), monomers.KetMonomerClass.Phosphate, Phosphate.Phosphate), monomers.KetMonomerClass.Sugar, Sugar.Sugar), monomers.KetMonomerClass.Base, RNABase.RNABase), monomers.KetMonomerClass.RNA, UnsplitNucleotide.UnsplitNucleotide);
var AmbiguousMonomer = function (_BaseMonomer) {
  _inherits__default["default"](AmbiguousMonomer, _BaseMonomer);
  function AmbiguousMonomer(variantMonomerItem, position) {
    var _variantMonomerItem$l;
    var _this;
    var generateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    _classCallCheck__default["default"](this, AmbiguousMonomer);
    var variantMonomerLabel = variantMonomerItem.subtype === ket.KetAmbiguousMonomerTemplateSubType.MIXTURE || ((_variantMonomerItem$l = variantMonomerItem.label) === null || _variantMonomerItem$l === void 0 ? void 0 : _variantMonomerItem$l.length) > 1 ? DEFAULT_VARIANT_MONOMER_LABEL : variantMonomerItem.label;
    _this = _callSuper(this, AmbiguousMonomer, [{
      label: variantMonomerLabel,
      props: {
        MonomerNaturalAnalogCode: '',
        MonomerName: variantMonomerLabel,
        Name: variantMonomerLabel
      },
      attachmentPoints: AmbiguousMonomer.getAttachmentPoints(variantMonomerItem.monomers),
      struct: new struct.Struct(),
      isAmbiguous: true
    }, position, {
      generateId: generateId
    }]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "variantMonomerItem", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomers", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomerClass", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "subtype", void 0);
    _this.variantMonomerItem = variantMonomerItem;
    _this.monomers = variantMonomerItem.monomers;
    _this.monomerClass = AmbiguousMonomer.getMonomerClass(variantMonomerItem.monomers);
    _this.subtype = variantMonomerItem.subtype;
    return _this;
  }
  _createClass__default["default"](AmbiguousMonomer, [{
    key: "monomerCaps",
    get: function get() {
      var monomerCaps;
      this.monomers.forEach(function (monomer) {
        if (monomer.monomerItem.props.MonomerCaps) {
          if (!monomerCaps) {
            monomerCaps = _objectSpread({}, monomer.monomerItem.props.MonomerCaps);
          } else {
            for (var _i = 0, _Object$entries = Object.entries(monomer.monomerItem.props.MonomerCaps); _i < _Object$entries.length; _i++) {
              var _Object$entries$_i = _slicedToArray__default["default"](_Object$entries[_i], 2),
                attachmentPointName = _Object$entries$_i[0],
                label = _Object$entries$_i[1];
              if (!monomerCaps[attachmentPointName]) {
                delete monomerCaps[attachmentPointName];
              } else if (monomerCaps[attachmentPointName] !== label) {
                monomerCaps[attachmentPointName] = '';
              }
            }
          }
        }
      });
      return monomerCaps;
    }
  }, {
    key: "isModification",
    get: function get() {
      var _provideEditorInstanc,
        _provideEditorInstanc2,
        _this2 = this;
      var ownTemplateIds = this.variantMonomerItem.options.map(function (option) {
        return option.templateId;
      }).sort();
      var monomersLibrary = (_provideEditorInstanc = (_provideEditorInstanc2 = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc2 === void 0 ? void 0 : _provideEditorInstanc2.monomersLibrary) !== null && _provideEditorInstanc !== void 0 ? _provideEditorInstanc : [];
      var existsInLibrary = monomersLibrary.some(function (libraryItem) {
        if (!monomers$1.isAmbiguousMonomerLibraryItem(libraryItem) || libraryItem.subtype !== _this2.subtype) {
          return false;
        }
        var libraryTemplateIds = libraryItem.options.map(function (option) {
          return option.templateId;
        }).sort();
        return libraryTemplateIds.length === ownTemplateIds.length && libraryTemplateIds.every(function (id, index) {
          return id === ownTemplateIds[index];
        });
      });
      return !existsInLibrary;
    }
  }, {
    key: "getValidSourcePoint",
    value: function getValidSourcePoint(_secondMonomer) {
      return MONOMER_CLASS_TO_CONSTRUCTOR[this.monomerClass].prototype.getValidSourcePoint.call(this, _secondMonomer);
    }
  }, {
    key: "getValidTargetPoint",
    value: function getValidTargetPoint(_firstMonomer) {
      return MONOMER_CLASS_TO_CONSTRUCTOR[this.monomerClass].prototype.getValidTargetPoint.call(this, _firstMonomer);
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      var monomerClassToSubchainConstructor = _defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"](_defineProperty__default["default"]({}, monomers.KetMonomerClass.CHEM, ChemSubChain.ChemSubChain), monomers.KetMonomerClass.AminoAcid, PeptideSubChain.PeptideSubChain), monomers.KetMonomerClass.RNA, RnaSubChain.RnaSubChain), monomers.KetMonomerClass.DNA, RnaSubChain.RnaSubChain), monomers.KetMonomerClass.Sugar, RnaSubChain.RnaSubChain), monomers.KetMonomerClass.Phosphate, PhosphateSubChain.PhosphateSubChain), monomers.KetMonomerClass.Base, ChemSubChain.ChemSubChain);
      return monomerClassToSubchainConstructor[this.monomerClass] || ChemSubChain.ChemSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return MONOMER_CLASS_TO_CONSTRUCTOR[this.monomerClass].prototype.isMonomerTypeDifferentForChaining.call(this, monomerToChain);
    }
  }], [{
    key: "getMonomerClass",
    value: function getMonomerClass(monomers$1) {
      var monomerClass = resolveMonomerClass.resolveMonomerClass(monomers$1[0].monomerItem);
      var containDifferentMonomerTypes = monomers$1.some(function (monomer) {
        var monomerClassToCompare = resolveMonomerClass.resolveMonomerClass(monomer.monomerItem);
        return monomerClass !== monomerClassToCompare;
      });
      if (containDifferentMonomerTypes) {
        return monomers.KetMonomerClass.CHEM;
      }
      return monomerClass;
    }
  }, {
    key: "getAttachmentPoints",
    value: function getAttachmentPoints(monomers) {
      var monomersAttachmentPoints = monomers.map(function (monomer) {
        return monomer.listOfAttachmentPoints;
      });
      var possibleAttachmentPoints = monomersAttachmentPoints.flat();
      var attachmentPoints = possibleAttachmentPoints.filter(function (attachmentPointName) {
        return monomersAttachmentPoints.every(function (monomerAttachmentPoints) {
          return monomerAttachmentPoints.includes(attachmentPointName);
        });
      });
      return attachmentPoints.map(function (attachmentPointName) {
        return {
          label: attachmentPointName,
          leavingGroup: {
            atoms: []
          },
          attachmentAtom: -1
        };
      });
    }
  }]);
  return AmbiguousMonomer;
}(BaseMonomer.BaseMonomer);

exports.AmbiguousMonomer = AmbiguousMonomer;
exports.DEFAULT_VARIANT_MONOMER_LABEL = DEFAULT_VARIANT_MONOMER_LABEL;
exports.MONOMER_CLASS_TO_CONSTRUCTOR = MONOMER_CLASS_TO_CONSTRUCTOR;
//# sourceMappingURL=AmbiguousMonomer.js.map
