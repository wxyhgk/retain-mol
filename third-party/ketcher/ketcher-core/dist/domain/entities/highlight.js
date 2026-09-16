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

var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var Highlight = _createClass__default["default"](function Highlight(attributes) {
  _classCallCheck__default["default"](this, Highlight);
  _defineProperty__default["default"](this, "atoms", void 0);
  _defineProperty__default["default"](this, "bonds", void 0);
  _defineProperty__default["default"](this, "rgroupAttachmentPoints", void 0);
  _defineProperty__default["default"](this, "color", void 0);
  _defineProperty__default["default"](this, "outline", void 0);
  var atoms = attributes.atoms,
    bonds = attributes.bonds,
    rgroupAttachmentPoints = attributes.rgroupAttachmentPoints,
    color = attributes.color,
    outline = attributes.outline;
  this.color = color;
  this.atoms = atoms;
  this.bonds = bonds;
  this.rgroupAttachmentPoints = rgroupAttachmentPoints;
  this.outline = outline !== null && outline !== void 0 ? outline : false;
});

exports.Highlight = Highlight;
//# sourceMappingURL=highlight.js.map
