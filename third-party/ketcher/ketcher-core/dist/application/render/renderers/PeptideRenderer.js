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
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _get = require('@babel/runtime/helpers/get');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseMonomerRenderer = require('./BaseMonomerRenderer.js');
var constants = require('./constants.js');
require('../../formatters/types/ket.js');
var monomerHighlightShapes = require('./monomerHighlightShapes.js');
var monomers = require('../../../domain/constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _get__default = /*#__PURE__*/_interopDefaultLegacy(_get);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var PEPTIDE_HOVERED_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.AminoAcid].hover;
var PEPTIDE_SYMBOL_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.AminoAcid].body;
var PEPTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.AminoAcid].autochainPreview;
var PeptideRenderer = function (_BaseMonomerRenderer) {
  _inherits__default["default"](PeptideRenderer, _BaseMonomerRenderer);
  function PeptideRenderer(monomer, scale) {
    var _this;
    _classCallCheck__default["default"](this, PeptideRenderer);
    _this = _callSuper(this, PeptideRenderer, [monomer, PEPTIDE_HOVERED_ELEMENT_ID, PEPTIDE_SYMBOL_ELEMENT_ID, PEPTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "CHAIN_START_TERMINAL_INDICATOR_TEXT", 'N');
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "CHAIN_END_TERMINAL_INDICATOR_TEXT", 'C');
    _this.monomer = monomer;
    return _this;
  }
  _createClass__default["default"](PeptideRenderer, [{
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      return monomerHighlightShapes.createHexagonHighlightPath(this.center, width, height, offset);
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return undefined;
      }
      return {
        backgroundId: '#modified-background',
        requiresFill: true
      };
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      var isUnresolved = this.monomer.monomerItem.props.unresolved;
      var color;
      if (isUnresolved) {
        color = constants.UNRESOLVED_MONOMER_COLOR;
      } else {
        var _this$monomer$monomer;
        var isPeptide = ((_this$monomer$monomer = this.monomer.monomerItem.props) === null || _this$monomer$monomer === void 0 ? void 0 : _this$monomer$monomer.MonomerType) === 'PEPTIDE';
        color = isPeptide ? this.getPeptideColor(theme) : this.getMonomerColor(theme);
      }
      return rootElement.append('use').data([this]).attr('href', PEPTIDE_SYMBOL_ELEMENT_ID).attr('fill', color);
    }
  }, {
    key: "textColor",
    get: function get() {
      var _peptideColorsMap$mon;
      var LIGHT_COLOR = 'white';
      var DARK_COLOR = '#333333';
      if (this.monomer.monomerItem.props.unresolved) {
        return LIGHT_COLOR;
      }
      var peptideColorsMap = {
        D: DARK_COLOR,
        E: LIGHT_COLOR,
        K: DARK_COLOR,
        H: LIGHT_COLOR,
        O: LIGHT_COLOR,
        R: LIGHT_COLOR,
        Q: DARK_COLOR,
        Y: LIGHT_COLOR,
        U: DARK_COLOR,
        S: LIGHT_COLOR,
        C: LIGHT_COLOR,
        N: LIGHT_COLOR,
        T: LIGHT_COLOR,
        L: DARK_COLOR,
        I: LIGHT_COLOR,
        F: LIGHT_COLOR,
        A: LIGHT_COLOR,
        W: DARK_COLOR,
        P: DARK_COLOR,
        G: DARK_COLOR,
        M: DARK_COLOR,
        V: DARK_COLOR
      };
      var monomerCode = this.monomer.monomerItem.props.MonomerNaturalAnalogCode;
      var baseColor = (_peptideColorsMap$mon = peptideColorsMap[monomerCode]) !== null && _peptideColorsMap$mon !== void 0 ? _peptideColorsMap$mon : _get__default["default"](_getPrototypeOf__default["default"](PeptideRenderer.prototype), "textColor", this);
      if (this.monomer.isModification) {
        baseColor = baseColor === LIGHT_COLOR ? DARK_COLOR : LIGHT_COLOR;
      }
      return baseColor;
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get__default["default"](_getPrototypeOf__default["default"](PeptideRenderer.prototype), "show", this).call(this, theme);
      this.appendEnumeration();
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return {
        x: 10,
        y: -1
      };
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return {
        x: -6,
        y: 10
      };
    }
  }]);
  return PeptideRenderer;
}(BaseMonomerRenderer.BaseMonomerRenderer);

exports.PeptideRenderer = PeptideRenderer;
//# sourceMappingURL=PeptideRenderer.js.map
