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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { getNextMonomerInChain, isValidNucleoside, isValidNucleotide, getRnaBaseFromSugar } from '../helpers/monomers.modern.js';
import { Vec2 } from './vec2.modern.js';
import { Coordinates } from '../../application/editor/shared/coordinates.modern.js';
import { provideEditorInstance } from '../../application/editor/editorSingleton.modern.js';
import { AttachmentPointName } from '../types/monomers.modern.js';
import '../types/entities.modern.js';
import { Command } from './Command.modern.js';
import { getRnaPartLibraryItem } from '../helpers/rna.modern.js';
import { RNA_DNA_NON_MODIFIED_PART, KetMonomerClass } from '../constants/monomers.modern.js';
import '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import { SnakeLayoutCellWidth } from '../constants/layout.modern.js';
import { getMonomerSize } from '../../application/render/renderers/monomerSizeState.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var Nucleoside = function () {
  function Nucleoside(sugar, rnaBase) {
    _classCallCheck(this, Nucleoside);
    _defineProperty(this, "sugar", void 0);
    _defineProperty(this, "rnaBase", void 0);
    _defineProperty(this, "monomersCache", []);
    this.sugar = sugar;
    this.rnaBase = rnaBase;
    this.monomersCache = [sugar, rnaBase];
  }
  _createClass(Nucleoside, [{
    key: "isMonomerTypeDifferentForChaining",
    value: function isMonomerTypeDifferentForChaining(monomerToChain) {
      return this.sugar.isMonomerTypeDifferentForChaining(monomerToChain);
    }
  }, {
    key: "SubChainConstructor",
    get: function get() {
      return this.sugar.SubChainConstructor;
    }
  }, {
    key: "monomer",
    get: function get() {
      return this.sugar;
    }
  }, {
    key: "monomers",
    get: function get() {
      return this.monomersCache;
    }
  }, {
    key: "firstMonomerInNode",
    get: function get() {
      return this.sugar;
    }
  }, {
    key: "lastMonomerInNode",
    get: function get() {
      return this.sugar;
    }
  }, {
    key: "renderer",
    get: function get() {
      return this.monomer.renderer;
    }
  }, {
    key: "modified",
    get: function get() {
      var isNotLastNode = !!getNextMonomerInChain(this.sugar);
      return this.rnaBase.isModification || this.sugar.isModification || isNotLastNode;
    }
  }], [{
    key: "fromSugar",
    value: function fromSugar(sugar) {
      var needValidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (needValidation) {
        assert(isValidNucleoside(sugar), 'Created nucleoside is not valid. Please check nucleotide parts connections.');
        var isNucleotide = isValidNucleotide(sugar);
        assert(!isNucleotide, 'Created nucleoside is nucleotide.');
      }
      return new Nucleoside(sugar, getRnaBaseFromSugar(sugar));
    }
  }, {
    key: "createOnCanvas",
    value: function createOnCanvas(rnaBaseName, position) {
      var sugarName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
      var isAntisense = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var editor = provideEditorInstance();
      var isDnaSugar = sugarName === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
      var rnaBaseLibraryItem = getRnaPartLibraryItem(editor, rnaBaseName, KetMonomerClass.Base, isDnaSugar);
      var sugarLibraryItem = getRnaPartLibraryItem(editor, sugarName, KetMonomerClass.Sugar);
      assert(sugarLibraryItem);
      assert(rnaBaseLibraryItem);
      var topLeftItemPosition = position;
      var bottomItemPosition = position.add(Coordinates.canvasToModel(new Vec2(0, SnakeLayoutCellWidth + getMonomerSize().height)));
      var modelChanges = new Command();
      modelChanges.merge(editor.drawingEntitiesManager.addMonomer(_objectSpread(_objectSpread({}, sugarLibraryItem), {}, {
        isAntisense: isAntisense
      }), isAntisense ? bottomItemPosition : topLeftItemPosition));
      modelChanges.merge(editor.drawingEntitiesManager.addMonomer(_objectSpread(_objectSpread({}, rnaBaseLibraryItem), {}, {
        isAntisense: isAntisense
      }), isAntisense ? topLeftItemPosition : bottomItemPosition));
      var sugar = modelChanges.operations[0].monomer;
      var rnaBase = modelChanges.operations[1].monomer;
      modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond(sugar, rnaBase, AttachmentPointName.R3, AttachmentPointName.R1));
      return {
        modelChanges: modelChanges,
        node: Nucleoside.fromSugar(sugar, false)
      };
    }
  }]);
  return Nucleoside;
}();

export { Nucleoside };
//# sourceMappingURL=Nucleoside.modern.js.map
