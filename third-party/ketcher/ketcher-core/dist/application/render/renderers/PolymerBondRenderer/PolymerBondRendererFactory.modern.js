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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import { provideEditorInstance } from '../../../editor/editorSingleton.modern.js';
import { FlexModePolymerBondRenderer } from './FlexModePolymerBondRenderer.modern.js';
import { SnakeModePolymerBondRenderer } from './SnakeModePolymerBondRenderer.modern.js';
import { HydrogenBond } from '../../../../domain/entities/HydrogenBond.modern.js';

var LayoutMode;
(function (LayoutMode) {
  LayoutMode["Flex"] = "Flex";
  LayoutMode["Snake"] = "Snake";
})(LayoutMode || (LayoutMode = {}));
var polymerBondRendererMap = new Map([[LayoutMode.Flex, FlexModePolymerBondRenderer], [LayoutMode.Snake, SnakeModePolymerBondRenderer]]);
var PolymerBondRendererFactory = function () {
  function PolymerBondRendererFactory() {
    _classCallCheck(this, PolymerBondRendererFactory);
  }
  _createClass(PolymerBondRendererFactory, null, [{
    key: "createInstance",
    value: function createInstance(polymerBond) {
      var mode = checkIfIsSnakeMode() ? LayoutMode.Snake : LayoutMode.Flex;
      return polymerBond instanceof HydrogenBond ? new SnakeModePolymerBondRenderer(polymerBond) : PolymerBondRendererFactory.createInstanceByMode(mode, polymerBond);
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
  var editor = provideEditorInstance();
  return (editor === null || editor === void 0 ? void 0 : editor.mode.modeName) === 'snake-layout-mode';
}

export { LayoutMode, PolymerBondRendererFactory };
//# sourceMappingURL=PolymerBondRendererFactory.modern.js.map
