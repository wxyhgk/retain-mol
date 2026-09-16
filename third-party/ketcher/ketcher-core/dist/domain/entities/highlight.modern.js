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
import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

var Highlight = _createClass(function Highlight(attributes) {
  _classCallCheck(this, Highlight);
  _defineProperty(this, "atoms", void 0);
  _defineProperty(this, "bonds", void 0);
  _defineProperty(this, "rgroupAttachmentPoints", void 0);
  _defineProperty(this, "color", void 0);
  _defineProperty(this, "outline", void 0);
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

export { Highlight };
//# sourceMappingURL=highlight.modern.js.map
