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
var BaseMonomerRenderer = require('./BaseMonomerRenderer.js');
var constants = require('./constants.js');
require('../../formatters/types/ket.js');
var monomers = require('../../../domain/constants/monomers.js');

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
var SUGAR_HOVERED_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.Sugar].hover;
var SUGAR_SYMBOL_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.Sugar].body;
var SUGAR_AUTOCHAIN_PREVIEW_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.Sugar].autochainPreview;
var SugarRenderer = function (_BaseMonomerRenderer) {
  _inherits__default["default"](SugarRenderer, _BaseMonomerRenderer);
  function SugarRenderer(monomer, scale) {
    var _this;
    _classCallCheck__default["default"](this, SugarRenderer);
    _this = _callSuper(this, SugarRenderer, [monomer, SUGAR_HOVERED_ELEMENT_ID, SUGAR_SYMBOL_ELEMENT_ID, SUGAR_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "CHAIN_START_TERMINAL_INDICATOR_TEXT", '’5');
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "CHAIN_END_TERMINAL_INDICATOR_TEXT", '’3');
    _this.monomer = monomer;
    return _this;
  }
  _createClass__default["default"](SugarRenderer, [{
    key: "textColor",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return '#fff';
      }
      return this.monomer.isModification ? '#333333' : '#fff';
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return undefined;
      }
      return {
        backgroundId: '#sugar-modified-background',
        requiresFill: true
      };
    }
  }, {
    key: "getMonomerColor",
    value: function getMonomerColor(theme) {
      return theme.monomer.color[monomers.RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA].regular;
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      var isUnresolved = this.monomer.monomerItem.props.unresolved;
      var color = isUnresolved ? constants.UNRESOLVED_MONOMER_COLOR : this.getMonomerColor(theme);
      return rootElement.append('use').data([this]).attr('href', SUGAR_SYMBOL_ELEMENT_ID).attr('fill', color);
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return undefined;
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return {
        x: -5,
        y: 7
      };
    }
  }]);
  return SugarRenderer;
}(BaseMonomerRenderer.BaseMonomerRenderer);

exports.SugarRenderer = SugarRenderer;
//# sourceMappingURL=SugarRenderer.js.map
