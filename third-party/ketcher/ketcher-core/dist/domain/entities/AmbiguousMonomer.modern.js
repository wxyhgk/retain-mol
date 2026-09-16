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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { BaseMonomer } from './BaseMonomer.modern.js';
import { ChemSubChain } from './monomer-chains/ChemSubChain.modern.js';
import { Struct } from './struct.modern.js';
import { resolveMonomerClass } from '../../application/editor/operations/monomer/resolveMonomerClass.modern.js';
import { KetAmbiguousMonomerTemplateSubType } from '../../application/formatters/types/ket.modern.js';
import { PeptideSubChain } from './monomer-chains/PeptideSubChain.modern.js';
import { PhosphateSubChain } from './monomer-chains/PhosphateSubChain.modern.js';
import { RnaSubChain } from './monomer-chains/RnaSubChain.modern.js';
import { Chem } from './Chem.modern.js';
import { Peptide } from './Peptide.modern.js';
import { Phosphate } from './Phosphate.modern.js';
import { Sugar } from './Sugar.modern.js';
import { RNABase } from './RNABase.modern.js';
import { UnsplitNucleotide } from './UnsplitNucleotide.modern.js';
import { provideEditorInstance } from '../../application/editor/editorSingleton.modern.js';
import { isAmbiguousMonomerLibraryItem } from '../helpers/monomers.modern.js';
import { KetMonomerClass } from '../constants/monomers.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var DEFAULT_VARIANT_MONOMER_LABEL = '%';
var MONOMER_CLASS_TO_CONSTRUCTOR = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, KetMonomerClass.CHEM, Chem), KetMonomerClass.AminoAcid, Peptide), KetMonomerClass.Phosphate, Phosphate), KetMonomerClass.Sugar, Sugar), KetMonomerClass.Base, RNABase), KetMonomerClass.RNA, UnsplitNucleotide);
var AmbiguousMonomer = function (_BaseMonomer) {
  _inherits(AmbiguousMonomer, _BaseMonomer);
  function AmbiguousMonomer(variantMonomerItem, position) {
    var _variantMonomerItem$l;
    var _this;
    var generateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    _classCallCheck(this, AmbiguousMonomer);
    var variantMonomerLabel = variantMonomerItem.subtype === KetAmbiguousMonomerTemplateSubType.MIXTURE || ((_variantMonomerItem$l = variantMonomerItem.label) === null || _variantMonomerItem$l === void 0 ? void 0 : _variantMonomerItem$l.length) > 1 ? DEFAULT_VARIANT_MONOMER_LABEL : variantMonomerItem.label;
    _this = _callSuper(this, AmbiguousMonomer, [{
      label: variantMonomerLabel,
      props: {
        MonomerNaturalAnalogCode: '',
        MonomerName: variantMonomerLabel,
        Name: variantMonomerLabel
      },
      attachmentPoints: AmbiguousMonomer.getAttachmentPoints(variantMonomerItem.monomers),
      struct: new Struct(),
      isAmbiguous: true
    }, position, {
      generateId: generateId
    }]);
    _defineProperty(_assertThisInitialized(_this), "variantMonomerItem", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomers", void 0);
    _defineProperty(_assertThisInitialized(_this), "monomerClass", void 0);
    _defineProperty(_assertThisInitialized(_this), "subtype", void 0);
    _this.variantMonomerItem = variantMonomerItem;
    _this.monomers = variantMonomerItem.monomers;
    _this.monomerClass = AmbiguousMonomer.getMonomerClass(variantMonomerItem.monomers);
    _this.subtype = variantMonomerItem.subtype;
    return _this;
  }
  _createClass(AmbiguousMonomer, [{
    key: "monomerCaps",
    get: function get() {
      var monomerCaps;
      this.monomers.forEach(function (monomer) {
        if (monomer.monomerItem.props.MonomerCaps) {
          if (!monomerCaps) {
            monomerCaps = _objectSpread({}, monomer.monomerItem.props.MonomerCaps);
          } else {
            for (var _i = 0, _Object$entries = Object.entries(monomer.monomerItem.props.MonomerCaps); _i < _Object$entries.length; _i++) {
              var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
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
      var monomersLibrary = (_provideEditorInstanc = (_provideEditorInstanc2 = provideEditorInstance()) === null || _provideEditorInstanc2 === void 0 ? void 0 : _provideEditorInstanc2.monomersLibrary) !== null && _provideEditorInstanc !== void 0 ? _provideEditorInstanc : [];
      var existsInLibrary = monomersLibrary.some(function (libraryItem) {
        if (!isAmbiguousMonomerLibraryItem(libraryItem) || libraryItem.subtype !== _this2.subtype) {
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
      var monomerClassToSubchainConstructor = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, KetMonomerClass.CHEM, ChemSubChain), KetMonomerClass.AminoAcid, PeptideSubChain), KetMonomerClass.RNA, RnaSubChain), KetMonomerClass.DNA, RnaSubChain), KetMonomerClass.Sugar, RnaSubChain), KetMonomerClass.Phosphate, PhosphateSubChain), KetMonomerClass.Base, ChemSubChain);
      return monomerClassToSubchainConstructor[this.monomerClass] || ChemSubChain;
    }
  }, {
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return MONOMER_CLASS_TO_CONSTRUCTOR[this.monomerClass].prototype.isMonomerTypeDifferentForChaining.call(this, monomerToChain);
    }
  }], [{
    key: "getMonomerClass",
    value: function getMonomerClass(monomers) {
      var monomerClass = resolveMonomerClass(monomers[0].monomerItem);
      var containDifferentMonomerTypes = monomers.some(function (monomer) {
        var monomerClassToCompare = resolveMonomerClass(monomer.monomerItem);
        return monomerClass !== monomerClassToCompare;
      });
      if (containDifferentMonomerTypes) {
        return KetMonomerClass.CHEM;
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
}(BaseMonomer);

export { AmbiguousMonomer, DEFAULT_VARIANT_MONOMER_LABEL, MONOMER_CLASS_TO_CONSTRUCTOR };
//# sourceMappingURL=AmbiguousMonomer.modern.js.map
