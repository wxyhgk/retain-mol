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

var SupportedFormatProperties = _createClass(function SupportedFormatProperties(name, mime, extensions, supportsCoords, options) {
  _classCallCheck(this, SupportedFormatProperties);
  _defineProperty(this, "name", void 0);
  _defineProperty(this, "mime", void 0);
  _defineProperty(this, "extensions", void 0);
  _defineProperty(this, "supportsCoords", void 0);
  _defineProperty(this, "options", void 0);
  this.name = name;
  this.mime = mime;
  this.extensions = extensions;
  this.supportsCoords = supportsCoords || false;
  this.options = options || {};
});

export { SupportedFormatProperties };
//# sourceMappingURL=supportedFormatProperties.modern.js.map
