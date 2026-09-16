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
import { Chem } from '../../../../domain/entities/Chem.modern.js';
import { Peptide } from '../../../../domain/entities/Peptide.modern.js';
import { Phosphate } from '../../../../domain/entities/Phosphate.modern.js';
import { Nucleotide } from '../../../../domain/entities/Nucleotide.modern.js';
import { Nucleoside } from '../../../../domain/entities/Nucleoside.modern.js';
import { EmptySequenceNode } from '../../../../domain/entities/EmptySequenceNode.modern.js';
import { LinkerSequenceNode } from '../../../../domain/entities/LinkerSequenceNode.modern.js';
import { UnresolvedMonomer } from '../../../../domain/entities/UnresolvedMonomer.modern.js';
import { UnsplitNucleotide } from '../../../../domain/entities/UnsplitNucleotide.modern.js';
import { Vec2 } from '../../../../domain/entities/vec2.modern.js';
import { PeptideSequenceItemRenderer } from './PeptideSequenceItemRenderer.modern.js';
import { ChemSequenceItemRenderer } from './ChemSequenceItemRenderer.modern.js';
import { PhosphateSequenceItemRenderer } from './PhosphateSequenceItemRenderer.modern.js';
import { NucleotideSequenceItemRenderer } from './NucleotideSequenceItemRenderer.modern.js';
import { EmptySequenceItemRenderer } from './EmptySequenceItemRenderer.modern.js';
import { NucleosideSequenceItemRenderer } from './NucleosideSequenceItemRenderer.modern.js';
import { UnresolvedMonomerSequenceItemRenderer } from './UnresolvedMonomerSequenceItemRenderer.modern.js';
import { UnsplitNucleotideSequenceItemRenderer } from './UnsplitNucleotideSequenceItemRenderer.modern.js';
import { AmbiguousMonomerSequenceNode } from '../../../../domain/entities/AmbiguousMonomerSequenceNode.modern.js';
import { AmbiguousSequenceItemRenderer } from './AmbiguousSequenceItemRenderer.modern.js';
import { BackBoneSequenceItemRenderer } from './BackBoneSequenceItemRenderer.modern.js';
import { BackBoneSequenceNode } from '../../../../domain/entities/BackBoneSequenceNode.modern.js';

var DEFAULT_MONOMER_SIZE = {
  width: 0,
  height: 0
};
var DEFAULT_SCALED_MONOMER_POSITION = new Vec2(0, 0);
var SequenceNodeRendererFactory = function () {
  function SequenceNodeRendererFactory() {
    _classCallCheck(this, SequenceNodeRendererFactory);
  }
  _createClass(SequenceNodeRendererFactory, null, [{
    key: "fromNode",
    value: function fromNode(node, firstMonomerInChainPosition, monomerIndexInChain, isLastMonomerInChain, chain, nodeIndexOverall, editingNodeIndexOverall, twoStrandedNode, renderer) {
      var _renderer$monomerSize, _renderer$scaledMonom;
      var previousRowsWithAntisense = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
      var monomerSize = (_renderer$monomerSize = renderer === null || renderer === void 0 ? void 0 : renderer.monomerSize) !== null && _renderer$monomerSize !== void 0 ? _renderer$monomerSize : DEFAULT_MONOMER_SIZE;
      var scaledMonomerPosition = (_renderer$scaledMonom = renderer === null || renderer === void 0 ? void 0 : renderer.scaledMonomerPosition) !== null && _renderer$scaledMonom !== void 0 ? _renderer$scaledMonom : DEFAULT_SCALED_MONOMER_POSITION;
      var createRenderer = function createRenderer(RendererClass, rendererNode) {
        return new RendererClass(rendererNode, firstMonomerInChainPosition, monomerIndexInChain, isLastMonomerInChain, chain, nodeIndexOverall, editingNodeIndexOverall, monomerSize, scaledMonomerPosition, twoStrandedNode, previousRowsWithAntisense);
      };
      if (node instanceof Nucleotide) {
        return createRenderer(NucleotideSequenceItemRenderer, node);
      }
      if (node instanceof Nucleoside) {
        return createRenderer(NucleosideSequenceItemRenderer, node);
      }
      if (node instanceof EmptySequenceNode) {
        return createRenderer(EmptySequenceItemRenderer, node);
      }
      if (node instanceof BackBoneSequenceNode) {
        return createRenderer(BackBoneSequenceItemRenderer, node);
      }
      if (node instanceof LinkerSequenceNode) {
        return createRenderer(ChemSequenceItemRenderer, node);
      }
      if (node instanceof AmbiguousMonomerSequenceNode) {
        return createRenderer(AmbiguousSequenceItemRenderer, node);
      }
      if (node.monomer instanceof Phosphate) {
        return createRenderer(PhosphateSequenceItemRenderer, node);
      }
      if (node.monomer instanceof Peptide) {
        return createRenderer(PeptideSequenceItemRenderer, node);
      }
      if (node.monomer instanceof UnresolvedMonomer) {
        return createRenderer(UnresolvedMonomerSequenceItemRenderer, node);
      }
      if (node.monomer instanceof UnsplitNucleotide) {
        return createRenderer(UnsplitNucleotideSequenceItemRenderer, node);
      }
      if (node.monomer instanceof Chem) {
        return createRenderer(ChemSequenceItemRenderer, node);
      }
      return createRenderer(ChemSequenceItemRenderer, node);
    }
  }]);
  return SequenceNodeRendererFactory;
}();

export { SequenceNodeRendererFactory };
//# sourceMappingURL=SequenceNodeRendererFactory.modern.js.map
