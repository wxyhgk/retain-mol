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
import { provideEditorInstance } from '../../application/editor/editorSingleton.modern.js';
import { Sugar } from './Sugar.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';
import { isValidNucleotide, isValidNucleoside, getPhosphateFromSugar, getRnaBaseFromSugar } from '../helpers/monomers.modern.js';
import { Coordinates } from '../../application/editor/shared/coordinates.modern.js';
import { Vec2 } from './vec2.modern.js';
import { getRnaPartLibraryItem } from '../helpers/rna.modern.js';
import { RNA_DNA_NON_MODIFIED_PART, KetMonomerClass } from '../constants/monomers.modern.js';
import '../constants/elements.modern.js';
import '../constants/element.types.modern.js';
import '../constants/generics.modern.js';
import '../constants/chains.modern.js';
import { SnakeLayoutCellWidth } from '../constants/layout.modern.js';
import { getMonomerSize } from '../../application/render/renderers/monomerSizeState.modern.js';

var Nucleotide = function () {
  function Nucleotide(sugar, rnaBase, phosphate) {
    _classCallCheck(this, Nucleotide);
    _defineProperty(this, "sugar", void 0);
    _defineProperty(this, "rnaBase", void 0);
    _defineProperty(this, "phosphate", void 0);
    _defineProperty(this, "monomersCache", []);
    this.sugar = sugar;
    this.rnaBase = rnaBase;
    this.phosphate = phosphate;
    this.monomersCache = [sugar, rnaBase, phosphate];
  }
  _createClass(Nucleotide, [{
    key: "toString",
    value: function toString() {
      return "sugar: ".concat(this.sugar.constructor.name, ", ") + "rnaBase: ".concat(this.rnaBase.constructor.name, ", ") + "phosphate: ".concat(this.phosphate.constructor.name);
    }
  }, {
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
      return this.firstMonomerInNode;
    }
  }, {
    key: "monomers",
    get: function get() {
      return this.monomersCache;
    }
  }, {
    key: "firstMonomerInNode",
    get: function get() {
      return this.isFiveEndPhosphate ? this.phosphate : this.sugar;
    }
  }, {
    key: "lastMonomerInNode",
    get: function get() {
      return this.isFiveEndPhosphate ? this.sugar : this.phosphate;
    }
  }, {
    key: "renderer",
    get: function get() {
      return this.monomer.renderer;
    }
  }, {
    key: "modified",
    get: function get() {
      return this.rnaBase.isModification || this.sugar.isModification || this.phosphate.isModification;
    }
  }, {
    key: "isFiveEndPhosphate",
    get: function get() {
      var _this$sugar$attachmen, _this$phosphate$attac;
      return ((_this$sugar$attachmen = this.sugar.attachmentPointsToBonds.R1) === null || _this$sugar$attachmen === void 0 ? void 0 : _this$sugar$attachmen.getAnotherEntity(this.sugar)) === this.phosphate && ((_this$phosphate$attac = this.phosphate.attachmentPointsToBonds.R2) === null || _this$phosphate$attac === void 0 ? void 0 : _this$phosphate$attac.getAnotherEntity(this.phosphate)) === this.sugar;
    }
  }], [{
    key: "fromSugar",
    value: function fromSugar(sugar) {
      var needValidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (needValidation) {
        assert(isValidNucleotide(sugar), 'Nucleotide is not valid. Please check nucleotide parts connections.');
        var isNucleoside = isValidNucleoside(sugar);
        assert(!isNucleoside, 'Nucleotide is nucleoside because it is a last sugar+base of rna chain');
      }
      return new Nucleotide(sugar, getRnaBaseFromSugar(sugar), getPhosphateFromSugar(sugar));
    }
  }, {
    key: "createOnCanvas",
    value: function createOnCanvas(rnaBaseName, position) {
      var sugarName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
      var editor = provideEditorInstance();
      var isDnaSugar = sugarName === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
      var rnaBaseLibraryItem = getRnaPartLibraryItem(editor, rnaBaseName, KetMonomerClass.Base, isDnaSugar);
      var phosphateLibraryItem = getRnaPartLibraryItem(editor, RNA_DNA_NON_MODIFIED_PART.PHOSPHATE);
      var sugarLibraryItem = getRnaPartLibraryItem(editor, sugarName, KetMonomerClass.Sugar);
      assert(sugarLibraryItem);
      assert(rnaBaseLibraryItem);
      assert(phosphateLibraryItem);
      var topLeftItemPosition = position;
      var bottomItemPosition = position.add(Coordinates.canvasToModel(new Vec2(0, SnakeLayoutCellWidth + getMonomerSize().height)));
      var _editor$drawingEntiti = editor.drawingEntitiesManager.addRnaPreset({
          sugar: sugarLibraryItem,
          sugarPosition: topLeftItemPosition,
          rnaBase: rnaBaseLibraryItem,
          rnaBasePosition: bottomItemPosition,
          phosphate: phosphateLibraryItem,
          phosphatePosition: topLeftItemPosition.add(Coordinates.canvasToModel(new Vec2(SnakeLayoutCellWidth, 0)))
        }),
        modelChanges = _editor$drawingEntiti.command,
        monomers = _editor$drawingEntiti.monomers;
      var sugar = monomers.find(function (monomer) {
        return monomer instanceof Sugar;
      });
      return {
        modelChanges: modelChanges,
        node: Nucleotide.fromSugar(sugar, false)
      };
    }
  }]);
  return Nucleotide;
}();

export { Nucleotide };
//# sourceMappingURL=Nucleotide.modern.js.map
