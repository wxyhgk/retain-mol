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
var BaseSequenceItemRenderer = require('./BaseSequenceItemRenderer.js');
var monomers = require('../../../../domain/constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);

function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var UnsplitNucleotideSequenceItemRenderer = function (_BaseSequenceItemRend) {
  _inherits__default["default"](UnsplitNucleotideSequenceItemRenderer, _BaseSequenceItemRend);
  function UnsplitNucleotideSequenceItemRenderer() {
    _classCallCheck__default["default"](this, UnsplitNucleotideSequenceItemRenderer);
    return _callSuper(this, UnsplitNucleotideSequenceItemRenderer, arguments);
  }
  _createClass__default["default"](UnsplitNucleotideSequenceItemRenderer, [{
    key: "symbolToDisplay",
    get: function get() {
      var naturalAnalogue = this.node.monomer.monomerItem.props.MonomerNaturalAnalogCode;
      return naturalAnalogue && naturalAnalogue !== monomers.NO_NATURAL_ANALOGUE ? naturalAnalogue : monomers.NO_NATURAL_ANALOGUE;
    }
  }, {
    key: "drawModification",
    value: function drawModification() {
      return undefined;
    }
  }]);
  return UnsplitNucleotideSequenceItemRenderer;
}(BaseSequenceItemRenderer.BaseSequenceItemRenderer);

exports.UnsplitNucleotideSequenceItemRenderer = UnsplitNucleotideSequenceItemRenderer;
//# sourceMappingURL=UnsplitNucleotideSequenceItemRenderer.js.map
