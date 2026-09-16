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
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../application/editor/editorSingleton.js');
var Sugar = require('./Sugar.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');
var monomers = require('../helpers/monomers.js');
var coordinates = require('../../application/editor/shared/coordinates.js');
var vec2 = require('./vec2.js');
var rna = require('../helpers/rna.js');
var monomers$1 = require('../constants/monomers.js');
require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
require('../constants/chains.js');
var layout = require('../constants/layout.js');
var monomerSizeState = require('../../application/render/renderers/monomerSizeState.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var Nucleotide = function () {
  function Nucleotide(sugar, rnaBase, phosphate) {
    _classCallCheck__default["default"](this, Nucleotide);
    _defineProperty__default["default"](this, "sugar", void 0);
    _defineProperty__default["default"](this, "rnaBase", void 0);
    _defineProperty__default["default"](this, "phosphate", void 0);
    _defineProperty__default["default"](this, "monomersCache", []);
    this.sugar = sugar;
    this.rnaBase = rnaBase;
    this.phosphate = phosphate;
    this.monomersCache = [sugar, rnaBase, phosphate];
  }
  _createClass__default["default"](Nucleotide, [{
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
        assert.assert(monomers.isValidNucleotide(sugar), 'Nucleotide is not valid. Please check nucleotide parts connections.');
        var isNucleoside = monomers.isValidNucleoside(sugar);
        assert.assert(!isNucleoside, 'Nucleotide is nucleoside because it is a last sugar+base of rna chain');
      }
      return new Nucleotide(sugar, monomers.getRnaBaseFromSugar(sugar), monomers.getPhosphateFromSugar(sugar));
    }
  }, {
    key: "createOnCanvas",
    value: function createOnCanvas(rnaBaseName, position) {
      var sugarName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
      var editor = editorSingleton.provideEditorInstance();
      var isDnaSugar = sugarName === monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
      var rnaBaseLibraryItem = rna.getRnaPartLibraryItem(editor, rnaBaseName, monomers$1.KetMonomerClass.Base, isDnaSugar);
      var phosphateLibraryItem = rna.getRnaPartLibraryItem(editor, monomers$1.RNA_DNA_NON_MODIFIED_PART.PHOSPHATE);
      var sugarLibraryItem = rna.getRnaPartLibraryItem(editor, sugarName, monomers$1.KetMonomerClass.Sugar);
      assert.assert(sugarLibraryItem);
      assert.assert(rnaBaseLibraryItem);
      assert.assert(phosphateLibraryItem);
      var topLeftItemPosition = position;
      var bottomItemPosition = position.add(coordinates.Coordinates.canvasToModel(new vec2.Vec2(0, layout.SnakeLayoutCellWidth + monomerSizeState.getMonomerSize().height)));
      var _editor$drawingEntiti = editor.drawingEntitiesManager.addRnaPreset({
          sugar: sugarLibraryItem,
          sugarPosition: topLeftItemPosition,
          rnaBase: rnaBaseLibraryItem,
          rnaBasePosition: bottomItemPosition,
          phosphate: phosphateLibraryItem,
          phosphatePosition: topLeftItemPosition.add(coordinates.Coordinates.canvasToModel(new vec2.Vec2(layout.SnakeLayoutCellWidth, 0)))
        }),
        modelChanges = _editor$drawingEntiti.command,
        monomers = _editor$drawingEntiti.monomers;
      var sugar = monomers.find(function (monomer) {
        return monomer instanceof Sugar.Sugar;
      });
      return {
        modelChanges: modelChanges,
        node: Nucleotide.fromSugar(sugar, false)
      };
    }
  }]);
  return Nucleotide;
}();

exports.Nucleotide = Nucleotide;
//# sourceMappingURL=Nucleotide.js.map
