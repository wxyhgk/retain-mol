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
var editorSingleton = require('../../../editor/editorSingleton.js');
var FlexModePolymerBondRenderer = require('./FlexModePolymerBondRenderer.js');
var SnakeModePolymerBondRenderer = require('./SnakeModePolymerBondRenderer.js');
var HydrogenBond = require('../../../../domain/entities/HydrogenBond.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

exports.LayoutMode = void 0;
(function (LayoutMode) {
  LayoutMode["Flex"] = "Flex";
  LayoutMode["Snake"] = "Snake";
})(exports.LayoutMode || (exports.LayoutMode = {}));
var polymerBondRendererMap = new Map([[exports.LayoutMode.Flex, FlexModePolymerBondRenderer.FlexModePolymerBondRenderer], [exports.LayoutMode.Snake, SnakeModePolymerBondRenderer.SnakeModePolymerBondRenderer]]);
var PolymerBondRendererFactory = function () {
  function PolymerBondRendererFactory() {
    _classCallCheck__default["default"](this, PolymerBondRendererFactory);
  }
  _createClass__default["default"](PolymerBondRendererFactory, null, [{
    key: "createInstance",
    value: function createInstance(polymerBond) {
      var mode = checkIfIsSnakeMode() ? exports.LayoutMode.Snake : exports.LayoutMode.Flex;
      return polymerBond instanceof HydrogenBond.HydrogenBond ? new SnakeModePolymerBondRenderer.SnakeModePolymerBondRenderer(polymerBond) : PolymerBondRendererFactory.createInstanceByMode(mode, polymerBond);
    }
  }, {
    key: "createInstanceByMode",
    value: function createInstanceByMode(mode, polymerBond) {
      var RendererClass = polymerBondRendererMap.get(mode);
      if (!RendererClass) {
        throw new Error("PolymerBondRenderer for the layout mode \u201C".concat(mode, "\u201D not found."));
      }
      return new RendererClass(polymerBond);
    }
  }]);
  return PolymerBondRendererFactory;
}();
function checkIfIsSnakeMode() {
  var editor = editorSingleton.provideEditorInstance();
  return (editor === null || editor === void 0 ? void 0 : editor.mode.modeName) === 'snake-layout-mode';
}

exports.PolymerBondRendererFactory = PolymerBondRendererFactory;
//# sourceMappingURL=PolymerBondRendererFactory.js.map
