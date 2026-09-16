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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);

var editorInstances = new Map();
var _renderingContext;
var _lastEditorInstance;
function setEditorRenderingContext(editor) {
  _renderingContext = editor;
}
function setEditorInstance(editor) {
  _lastEditorInstance = editor;
  if (editor.ketcherId) {
    editorInstances.set(editor.ketcherId, editor);
  }
}
function resetEditorInstance(ketcherId) {
  var _lastEditorInstance2;
  if (ketcherId) {
    editorInstances["delete"](ketcherId);
  }
  if (((_lastEditorInstance2 = _lastEditorInstance) === null || _lastEditorInstance2 === void 0 ? void 0 : _lastEditorInstance2.ketcherId) === ketcherId) {
    _lastEditorInstance = undefined;
  }
}
function provideEditorInstance(ketcherId) {
  var _values;
  if (_renderingContext) return _renderingContext;
  if (ketcherId) {
    var editor = editorInstances.get(ketcherId);
    if (editor) return editor;
  }
  var values = _toConsumableArray__default["default"](editorInstances.values());
  return (_values = values[values.length - 1]) !== null && _values !== void 0 ? _values : _lastEditorInstance;
}

exports.provideEditorInstance = provideEditorInstance;
exports.resetEditorInstance = resetEditorInstance;
exports.setEditorInstance = setEditorInstance;
exports.setEditorRenderingContext = setEditorRenderingContext;
//# sourceMappingURL=editorSingleton.js.map
