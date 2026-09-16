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
var Chem = require('../../../../domain/entities/Chem.js');
var Peptide = require('../../../../domain/entities/Peptide.js');
var Phosphate = require('../../../../domain/entities/Phosphate.js');
var Nucleotide = require('../../../../domain/entities/Nucleotide.js');
var Nucleoside = require('../../../../domain/entities/Nucleoside.js');
var EmptySequenceNode = require('../../../../domain/entities/EmptySequenceNode.js');
var LinkerSequenceNode = require('../../../../domain/entities/LinkerSequenceNode.js');
var UnresolvedMonomer = require('../../../../domain/entities/UnresolvedMonomer.js');
var UnsplitNucleotide = require('../../../../domain/entities/UnsplitNucleotide.js');
var vec2 = require('../../../../domain/entities/vec2.js');
var PeptideSequenceItemRenderer = require('./PeptideSequenceItemRenderer.js');
var ChemSequenceItemRenderer = require('./ChemSequenceItemRenderer.js');
var PhosphateSequenceItemRenderer = require('./PhosphateSequenceItemRenderer.js');
var NucleotideSequenceItemRenderer = require('./NucleotideSequenceItemRenderer.js');
var EmptySequenceItemRenderer = require('./EmptySequenceItemRenderer.js');
var NucleosideSequenceItemRenderer = require('./NucleosideSequenceItemRenderer.js');
var UnresolvedMonomerSequenceItemRenderer = require('./UnresolvedMonomerSequenceItemRenderer.js');
var UnsplitNucleotideSequenceItemRenderer = require('./UnsplitNucleotideSequenceItemRenderer.js');
var AmbiguousMonomerSequenceNode = require('../../../../domain/entities/AmbiguousMonomerSequenceNode.js');
var AmbiguousSequenceItemRenderer = require('./AmbiguousSequenceItemRenderer.js');
var BackBoneSequenceItemRenderer = require('./BackBoneSequenceItemRenderer.js');
var BackBoneSequenceNode = require('../../../../domain/entities/BackBoneSequenceNode.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var DEFAULT_MONOMER_SIZE = {
  width: 0,
  height: 0
};
var DEFAULT_SCALED_MONOMER_POSITION = new vec2.Vec2(0, 0);
var SequenceNodeRendererFactory = function () {
  function SequenceNodeRendererFactory() {
    _classCallCheck__default["default"](this, SequenceNodeRendererFactory);
  }
  _createClass__default["default"](SequenceNodeRendererFactory, null, [{
    key: "fromNode",
    value: function fromNode(node, firstMonomerInChainPosition, monomerIndexInChain, isLastMonomerInChain, chain, nodeIndexOverall, editingNodeIndexOverall, twoStrandedNode, renderer) {
      var _renderer$monomerSize, _renderer$scaledMonom;
      var previousRowsWithAntisense = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
      var monomerSize = (_renderer$monomerSize = renderer === null || renderer === void 0 ? void 0 : renderer.monomerSize) !== null && _renderer$monomerSize !== void 0 ? _renderer$monomerSize : DEFAULT_MONOMER_SIZE;
      var scaledMonomerPosition = (_renderer$scaledMonom = renderer === null || renderer === void 0 ? void 0 : renderer.scaledMonomerPosition) !== null && _renderer$scaledMonom !== void 0 ? _renderer$scaledMonom : DEFAULT_SCALED_MONOMER_POSITION;
      var createRenderer = function createRenderer(RendererClass, rendererNode) {
        return new RendererClass(rendererNode, firstMonomerInChainPosition, monomerIndexInChain, isLastMonomerInChain, chain, nodeIndexOverall, editingNodeIndexOverall, monomerSize, scaledMonomerPosition, twoStrandedNode, previousRowsWithAntisense);
      };
      if (node instanceof Nucleotide.Nucleotide) {
        return createRenderer(NucleotideSequenceItemRenderer.NucleotideSequenceItemRenderer, node);
      }
      if (node instanceof Nucleoside.Nucleoside) {
        return createRenderer(NucleosideSequenceItemRenderer.NucleosideSequenceItemRenderer, node);
      }
      if (node instanceof EmptySequenceNode.EmptySequenceNode) {
        return createRenderer(EmptySequenceItemRenderer.EmptySequenceItemRenderer, node);
      }
      if (node instanceof BackBoneSequenceNode.BackBoneSequenceNode) {
        return createRenderer(BackBoneSequenceItemRenderer.BackBoneSequenceItemRenderer, node);
      }
      if (node instanceof LinkerSequenceNode.LinkerSequenceNode) {
        return createRenderer(ChemSequenceItemRenderer.ChemSequenceItemRenderer, node);
      }
      if (node instanceof AmbiguousMonomerSequenceNode.AmbiguousMonomerSequenceNode) {
        return createRenderer(AmbiguousSequenceItemRenderer.AmbiguousSequenceItemRenderer, node);
      }
      if (node.monomer instanceof Phosphate.Phosphate) {
        return createRenderer(PhosphateSequenceItemRenderer.PhosphateSequenceItemRenderer, node);
      }
      if (node.monomer instanceof Peptide.Peptide) {
        return createRenderer(PeptideSequenceItemRenderer.PeptideSequenceItemRenderer, node);
      }
      if (node.monomer instanceof UnresolvedMonomer.UnresolvedMonomer) {
        return createRenderer(UnresolvedMonomerSequenceItemRenderer.UnresolvedMonomerSequenceItemRenderer, node);
      }
      if (node.monomer instanceof UnsplitNucleotide.UnsplitNucleotide) {
        return createRenderer(UnsplitNucleotideSequenceItemRenderer.UnsplitNucleotideSequenceItemRenderer, node);
      }
      if (node.monomer instanceof Chem.Chem) {
        return createRenderer(ChemSequenceItemRenderer.ChemSequenceItemRenderer, node);
      }
      return createRenderer(ChemSequenceItemRenderer.ChemSequenceItemRenderer, node);
    }
  }]);
  return SequenceNodeRendererFactory;
}();

exports.SequenceNodeRendererFactory = SequenceNodeRendererFactory;
//# sourceMappingURL=SequenceNodeRendererFactory.js.map
