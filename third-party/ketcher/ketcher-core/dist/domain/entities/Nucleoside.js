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
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var assert = require('../../utilities/assert.js');
var monomers = require('../helpers/monomers.js');
var vec2 = require('./vec2.js');
var coordinates = require('../../application/editor/shared/coordinates.js');
var editorSingleton = require('../../application/editor/editorSingleton.js');
var monomers$2 = require('../types/monomers.js');
require('../types/entities.js');
var Command = require('./Command.js');
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

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var Nucleoside = function () {
  function Nucleoside(sugar, rnaBase) {
    _classCallCheck__default["default"](this, Nucleoside);
    _defineProperty__default["default"](this, "sugar", void 0);
    _defineProperty__default["default"](this, "rnaBase", void 0);
    _defineProperty__default["default"](this, "monomersCache", []);
    this.sugar = sugar;
    this.rnaBase = rnaBase;
    this.monomersCache = [sugar, rnaBase];
  }
  _createClass__default["default"](Nucleoside, [{
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
      var isNotLastNode = !!monomers.getNextMonomerInChain(this.sugar);
      return this.rnaBase.isModification || this.sugar.isModification || isNotLastNode;
    }
  }], [{
    key: "fromSugar",
    value: function fromSugar(sugar) {
      var needValidation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (needValidation) {
        assert.assert(monomers.isValidNucleoside(sugar), 'Created nucleoside is not valid. Please check nucleotide parts connections.');
        var isNucleotide = monomers.isValidNucleotide(sugar);
        assert.assert(!isNucleotide, 'Created nucleoside is nucleotide.');
      }
      return new Nucleoside(sugar, monomers.getRnaBaseFromSugar(sugar));
    }
  }, {
    key: "createOnCanvas",
    value: function createOnCanvas(rnaBaseName, position) {
      var sugarName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
      var isAntisense = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var editor = editorSingleton.provideEditorInstance();
      var isDnaSugar = sugarName === monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
      var rnaBaseLibraryItem = rna.getRnaPartLibraryItem(editor, rnaBaseName, monomers$1.KetMonomerClass.Base, isDnaSugar);
      var sugarLibraryItem = rna.getRnaPartLibraryItem(editor, sugarName, monomers$1.KetMonomerClass.Sugar);
      assert.assert(sugarLibraryItem);
      assert.assert(rnaBaseLibraryItem);
      var topLeftItemPosition = position;
      var bottomItemPosition = position.add(coordinates.Coordinates.canvasToModel(new vec2.Vec2(0, layout.SnakeLayoutCellWidth + monomerSizeState.getMonomerSize().height)));
      var modelChanges = new Command.Command();
      modelChanges.merge(editor.drawingEntitiesManager.addMonomer(_objectSpread(_objectSpread({}, sugarLibraryItem), {}, {
        isAntisense: isAntisense
      }), isAntisense ? bottomItemPosition : topLeftItemPosition));
      modelChanges.merge(editor.drawingEntitiesManager.addMonomer(_objectSpread(_objectSpread({}, rnaBaseLibraryItem), {}, {
        isAntisense: isAntisense
      }), isAntisense ? topLeftItemPosition : bottomItemPosition));
      var sugar = modelChanges.operations[0].monomer;
      var rnaBase = modelChanges.operations[1].monomer;
      modelChanges.merge(editor.drawingEntitiesManager.createPolymerBond(sugar, rnaBase, monomers$2.AttachmentPointName.R3, monomers$2.AttachmentPointName.R1));
      return {
        modelChanges: modelChanges,
        node: Nucleoside.fromSugar(sugar, false)
      };
    }
  }]);
  return Nucleoside;
}();

exports.Nucleoside = Nucleoside;
//# sourceMappingURL=Nucleoside.js.map
