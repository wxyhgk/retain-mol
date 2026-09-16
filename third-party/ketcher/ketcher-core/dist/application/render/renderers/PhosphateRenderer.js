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
var monomers = require('../../../domain/constants/monomers.js');
var monomerHighlightShapes = require('./monomerHighlightShapes.js');

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
var PHOSPHATE_HOVERED_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.Phosphate].hover;
var PHOSPHATE_SYMBOL_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.Phosphate].body;
var PHOSPHATE_AUTOCHAIN_PREVIEW_ELEMENT_ID = constants.MONOMER_SYMBOLS_IDS[monomers.KetMonomerClass.Phosphate].autochainPreview;
var PhosphateRenderer = function (_BaseMonomerRenderer) {
  _inherits__default["default"](PhosphateRenderer, _BaseMonomerRenderer);
  function PhosphateRenderer(monomer, scale) {
    var _this;
    _classCallCheck__default["default"](this, PhosphateRenderer);
    _this = _callSuper(this, PhosphateRenderer, [monomer, PHOSPHATE_HOVERED_ELEMENT_ID, PHOSPHATE_SYMBOL_ELEMENT_ID, PHOSPHATE_AUTOCHAIN_PREVIEW_ELEMENT_ID, scale]);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "monomer", void 0);
    _this.monomer = monomer;
    return _this;
  }
  _createClass__default["default"](PhosphateRenderer, [{
    key: "getMonomerColor",
    value: function getMonomerColor(theme) {
      return theme.monomer.color[monomers.RNA_DNA_NON_MODIFIED_PART.PHOSPHATE].regular;
    }
  }, {
    key: "getHighlightPath",
    value: function getHighlightPath() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var _this$monomerSize = this.monomerSize,
        width = _this$monomerSize.width,
        height = _this$monomerSize.height;
      return monomerHighlightShapes.createCircleHighlightPath(this.center, Math.min(width, height) / 2, offset);
    }
  }, {
    key: "textColor",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return '#fff';
      }
      return this.monomer.isModification ? '#fff' : '#333333';
    }
  }, {
    key: "modificationConfig",
    get: function get() {
      if (this.monomer.monomerItem.props.unresolved) {
        return undefined;
      }
      return {
        backgroundId: '#phosphate-modified-background'
      };
    }
  }, {
    key: "appendBody",
    value: function appendBody(rootElement, theme) {
      var isUnresolved = this.monomer.monomerItem.props.unresolved;
      var color = isUnresolved ? constants.UNRESOLVED_MONOMER_COLOR : this.getMonomerColor(theme);
      return rootElement.append('use').data([this]).attr('href', PHOSPHATE_SYMBOL_ELEMENT_ID).attr('fill', color);
    }
  }, {
    key: "show",
    value: function show(theme) {
      _get__default["default"](_getPrototypeOf__default["default"](PhosphateRenderer.prototype), "show", this).call(this, theme);
    }
  }, {
    key: "enumerationElementPosition",
    get: function get() {
      return undefined;
    }
  }, {
    key: "beginningElementPosition",
    get: function get() {
      return undefined;
    }
  }]);
  return PhosphateRenderer;
}(BaseMonomerRenderer.BaseMonomerRenderer);

exports.PhosphateRenderer = PhosphateRenderer;
//# sourceMappingURL=PhosphateRenderer.js.map
