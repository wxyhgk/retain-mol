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
import { Peptide } from '../Peptide.modern.js';
import { Phosphate } from '../Phosphate.modern.js';
import { Sugar } from '../Sugar.modern.js';
import { UnresolvedMonomer } from '../UnresolvedMonomer.modern.js';
import { UnsplitNucleotide } from '../UnsplitNucleotide.modern.js';
import { Nucleoside } from '../Nucleoside.modern.js';
import { Nucleotide } from '../Nucleotide.modern.js';
import { MonomerSequenceNode } from '../MonomerSequenceNode.modern.js';
import { EmptySequenceNode } from '../EmptySequenceNode.modern.js';
import { LinkerSequenceNode } from '../LinkerSequenceNode.modern.js';
import { AmbiguousMonomer } from '../AmbiguousMonomer.modern.js';
import { isValidNucleoside, isValidNucleotide, getNextMonomerInChain } from '../../helpers/monomers.modern.js';
import { EmptySubChain } from './EmptySubChain.modern.js';
import { AmbiguousMonomerSequenceNode } from '../AmbiguousMonomerSequenceNode.modern.js';
import { KetMonomerClass } from '../../constants/monomers.modern.js';

var id = 0;
var Chain = function () {
  function Chain(firstMonomer, isCyclic) {
    _classCallCheck(this, Chain);
    _defineProperty(this, "subChains", []);
    _defineProperty(this, "firstMonomer", void 0);
    _defineProperty(this, "isCyclic", false);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "nodesChanged", true);
    _defineProperty(this, "nodesCache", []);
    _defineProperty(this, "monomersCache", []);
    _defineProperty(this, "bondsCache", []);
    this.id = id++;
    if (firstMonomer) {
      this.firstMonomer = firstMonomer;
      this.fillSubChains(firstMonomer);
    }
    if (isCyclic) {
      this.isCyclic = isCyclic;
    }
  }
  _createClass(Chain, [{
    key: "recalculateNodes",
    value: function recalculateNodes() {
      if (this.nodesChanged || this.subChains.some(function (subChain) {
        return subChain.modified;
      })) {
        this.nodesCache = this.subChains.flatMap(function (subChain) {
          return subChain.nodes;
        });
        this.monomersCache = this.nodesCache.flatMap(function (node) {
          return node.monomers;
        });
        this.bondsCache = this.subChains.flatMap(function (subChain) {
          return subChain.bonds;
        });
        this.nodesChanged = false;
        this.subChains.forEach(function (subChain) {
          subChain.modified = false;
        });
      }
    }
  }, {
    key: "createSubChainIfNeed",
    value: function createSubChainIfNeed(monomer) {
      var _this$lastNode;
      var needCreateNewSubchain = !((_this$lastNode = this.lastNode) !== null && _this$lastNode !== void 0 && _this$lastNode.monomer) || monomer.isMonomerTypeDifferentForChaining(this.lastNode.monomer);
      if (needCreateNewSubchain) {
        this.subChains.push(new monomer.SubChainConstructor());
      }
    }
  }, {
    key: "tryAddAsNucleosideOrNucleotide",
    value: function tryAddAsNucleosideOrNucleotide(sugar) {
      if (isValidNucleoside(sugar, this.firstMonomer)) {
        this.lastSubChain.add(Nucleoside.fromSugar(sugar, false));
        return true;
      }
      if (isValidNucleotide(sugar, this.firstMonomer)) {
        this.lastSubChain.add(Nucleotide.fromSugar(sugar, false));
        return true;
      }
      return false;
    }
  }, {
    key: "addAmbiguousMonomer",
    value: function addAmbiguousMonomer(monomer) {
      if (monomer.monomerClass === KetMonomerClass.Sugar) {
        if (this.tryAddAsNucleosideOrNucleotide(monomer)) {
          return;
        }
      }
      if (LinkerSequenceNode.isPartOfLinker(monomer)) {
        this.lastSubChain.add(new LinkerSequenceNode(monomer));
      } else {
        this.lastSubChain.add(new AmbiguousMonomerSequenceNode(monomer));
      }
    }
  }, {
    key: "add",
    value: function add(monomer) {
      this.nodesChanged = true;
      this.createSubChainIfNeed(monomer);
      if (monomer instanceof Peptide || monomer instanceof UnsplitNucleotide || monomer instanceof UnresolvedMonomer) {
        this.lastSubChain.add(new MonomerSequenceNode(monomer));
        return;
      }
      if (monomer instanceof AmbiguousMonomer) {
        this.addAmbiguousMonomer(monomer);
        return;
      }
      if (monomer instanceof Sugar) {
        if (this.tryAddAsNucleosideOrNucleotide(monomer)) {
          return;
        }
      }
      var nextMonomer = getNextMonomerInChain(monomer);
      var isNextMonomerNucleosideOrNucleotideOrPeptide = function isNextMonomerNucleosideOrNucleotideOrPeptide() {
        var isNucleosideOrNucleotide = nextMonomer instanceof Sugar && (isValidNucleotide(nextMonomer) || isValidNucleoside(nextMonomer));
        return isNucleosideOrNucleotide || nextMonomer instanceof Peptide;
      };
      if (monomer instanceof Phosphate && (!this.lastNode || this.lastNode instanceof Nucleoside || this.lastNode.lastMonomerInNode instanceof UnsplitNucleotide) && (!nextMonomer || isNextMonomerNucleosideOrNucleotideOrPeptide())) {
        this.lastSubChain.add(new MonomerSequenceNode(monomer));
        return;
      }
      this.lastSubChain.add(new LinkerSequenceNode(monomer, this.firstMonomer));
    }
  }, {
    key: "addNode",
    value: function addNode(node) {
      this.createSubChainIfNeed(node.monomer);
      this.lastSubChain.add(node);
      this.nodesChanged = true;
      return this;
    }
  }, {
    key: "fillSubChains",
    value: function fillSubChains(monomer) {
      var _this$lastNode2;
      if (!monomer) return;
      this.add(monomer);
      this.fillSubChains(getNextMonomerInChain((_this$lastNode2 = this.lastNode) === null || _this$lastNode2 === void 0 ? void 0 : _this$lastNode2.lastMonomerInNode, this.firstMonomer));
    }
  }, {
    key: "lastSubChain",
    get: function get() {
      return this.subChains[this.subChains.length - 1];
    }
  }, {
    key: "nodes",
    get: function get() {
      this.recalculateNodes();
      return this.nodesCache;
    }
  }, {
    key: "lastNode",
    get: function get() {
      var _this$lastSubChain;
      return (_this$lastSubChain = this.lastSubChain) === null || _this$lastSubChain === void 0 ? void 0 : _this$lastSubChain.lastNode;
    }
  }, {
    key: "lastNonEmptyNode",
    get: function get() {
      if (this.lastNode instanceof EmptySequenceNode) {
        var nodes = this.nodes;
        return nodes[nodes.length - 2];
      } else {
        return this.lastNode;
      }
    }
  }, {
    key: "firstSubChain",
    get: function get() {
      return this.subChains[0];
    }
  }, {
    key: "firstNode",
    get: function get() {
      var _this$firstSubChain;
      return (_this$firstSubChain = this.firstSubChain) === null || _this$firstSubChain === void 0 ? void 0 : _this$firstSubChain.firstNode;
    }
  }, {
    key: "length",
    get: function get() {
      var length = 0;
      this.subChains.forEach(function (subChain) {
        length += subChain.length;
      });
      return length;
    }
  }, {
    key: "isEmpty",
    get: function get() {
      return this.subChains.length === 1 && this.subChains[0].nodes.length === 1 && this.subChains[0].nodes[0] instanceof EmptySequenceNode;
    }
  }, {
    key: "isAntisense",
    get: function get() {
      return this.nodes.some(function (node) {
        return node.monomer.monomerItem.isAntisense;
      });
    }
  }, {
    key: "forEachNode",
    value: function forEachNode(callback) {
      var nodeIndex = 0;
      this.subChains.forEach(function (subChain) {
        subChain.nodes.forEach(function (node) {
          callback({
            node: node,
            subChain: subChain,
            nodeIndex: nodeIndex
          });
          nodeIndex++;
        });
      });
    }
  }, {
    key: "forEachNodeReversed",
    value: function forEachNodeReversed(callback) {
      var nodeIndex = this.length - 1;
      for (var i = this.subChains.length - 1; i >= 0; i--) {
        for (var j = this.subChains[i].nodes.length - 1; j >= 0; j--) {
          callback({
            node: this.subChains[i].nodes[j],
            subChain: this.subChains[i],
            nodeIndex: nodeIndex
          });
          nodeIndex--;
        }
      }
    }
  }, {
    key: "isNewSequenceChain",
    get: function get() {
      return this.length === 1 && this.firstNode instanceof EmptySequenceNode;
    }
  }, {
    key: "monomers",
    get: function get() {
      this.recalculateNodes();
      return this.monomersCache;
    }
  }, {
    key: "bonds",
    get: function get() {
      this.recalculateNodes();
      return this.bondsCache;
    }
  }], [{
    key: "createChainWithEmptyNode",
    value: function createChainWithEmptyNode() {
      var emptyChain = new Chain();
      var emptySequenceNode = new EmptySequenceNode();
      var emptySubChain = new EmptySubChain();
      emptySubChain.add(emptySequenceNode);
      emptyChain.subChains.push(emptySubChain);
      return {
        emptyChain: emptyChain,
        emptySubChain: emptySubChain,
        emptySequenceNode: emptySequenceNode
      };
    }
  }]);
  return Chain;
}();

export { Chain };
//# sourceMappingURL=Chain.modern.js.map
