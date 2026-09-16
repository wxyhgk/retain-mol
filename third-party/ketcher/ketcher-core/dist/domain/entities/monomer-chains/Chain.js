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
var Peptide = require('../Peptide.js');
var Phosphate = require('../Phosphate.js');
var Sugar = require('../Sugar.js');
var UnresolvedMonomer = require('../UnresolvedMonomer.js');
var UnsplitNucleotide = require('../UnsplitNucleotide.js');
var Nucleoside = require('../Nucleoside.js');
var Nucleotide = require('../Nucleotide.js');
var MonomerSequenceNode = require('../MonomerSequenceNode.js');
var EmptySequenceNode = require('../EmptySequenceNode.js');
var LinkerSequenceNode = require('../LinkerSequenceNode.js');
var AmbiguousMonomer = require('../AmbiguousMonomer.js');
var monomers = require('../../helpers/monomers.js');
var EmptySubChain = require('./EmptySubChain.js');
var AmbiguousMonomerSequenceNode = require('../AmbiguousMonomerSequenceNode.js');
var monomers$1 = require('../../constants/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var id = 0;
var Chain = function () {
  function Chain(firstMonomer, isCyclic) {
    _classCallCheck__default["default"](this, Chain);
    _defineProperty__default["default"](this, "subChains", []);
    _defineProperty__default["default"](this, "firstMonomer", void 0);
    _defineProperty__default["default"](this, "isCyclic", false);
    _defineProperty__default["default"](this, "id", void 0);
    _defineProperty__default["default"](this, "nodesChanged", true);
    _defineProperty__default["default"](this, "nodesCache", []);
    _defineProperty__default["default"](this, "monomersCache", []);
    _defineProperty__default["default"](this, "bondsCache", []);
    this.id = id++;
    if (firstMonomer) {
      this.firstMonomer = firstMonomer;
      this.fillSubChains(firstMonomer);
    }
    if (isCyclic) {
      this.isCyclic = isCyclic;
    }
  }
  _createClass__default["default"](Chain, [{
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
      if (monomers.isValidNucleoside(sugar, this.firstMonomer)) {
        this.lastSubChain.add(Nucleoside.Nucleoside.fromSugar(sugar, false));
        return true;
      }
      if (monomers.isValidNucleotide(sugar, this.firstMonomer)) {
        this.lastSubChain.add(Nucleotide.Nucleotide.fromSugar(sugar, false));
        return true;
      }
      return false;
    }
  }, {
    key: "addAmbiguousMonomer",
    value: function addAmbiguousMonomer(monomer) {
      if (monomer.monomerClass === monomers$1.KetMonomerClass.Sugar) {
        if (this.tryAddAsNucleosideOrNucleotide(monomer)) {
          return;
        }
      }
      if (LinkerSequenceNode.LinkerSequenceNode.isPartOfLinker(monomer)) {
        this.lastSubChain.add(new LinkerSequenceNode.LinkerSequenceNode(monomer));
      } else {
        this.lastSubChain.add(new AmbiguousMonomerSequenceNode.AmbiguousMonomerSequenceNode(monomer));
      }
    }
  }, {
    key: "add",
    value: function add(monomer) {
      this.nodesChanged = true;
      this.createSubChainIfNeed(monomer);
      if (monomer instanceof Peptide.Peptide || monomer instanceof UnsplitNucleotide.UnsplitNucleotide || monomer instanceof UnresolvedMonomer.UnresolvedMonomer) {
        this.lastSubChain.add(new MonomerSequenceNode.MonomerSequenceNode(monomer));
        return;
      }
      if (monomer instanceof AmbiguousMonomer.AmbiguousMonomer) {
        this.addAmbiguousMonomer(monomer);
        return;
      }
      if (monomer instanceof Sugar.Sugar) {
        if (this.tryAddAsNucleosideOrNucleotide(monomer)) {
          return;
        }
      }
      var nextMonomer = monomers.getNextMonomerInChain(monomer);
      var isNextMonomerNucleosideOrNucleotideOrPeptide = function isNextMonomerNucleosideOrNucleotideOrPeptide() {
        var isNucleosideOrNucleotide = nextMonomer instanceof Sugar.Sugar && (monomers.isValidNucleotide(nextMonomer) || monomers.isValidNucleoside(nextMonomer));
        return isNucleosideOrNucleotide || nextMonomer instanceof Peptide.Peptide;
      };
      if (monomer instanceof Phosphate.Phosphate && (!this.lastNode || this.lastNode instanceof Nucleoside.Nucleoside || this.lastNode.lastMonomerInNode instanceof UnsplitNucleotide.UnsplitNucleotide) && (!nextMonomer || isNextMonomerNucleosideOrNucleotideOrPeptide())) {
        this.lastSubChain.add(new MonomerSequenceNode.MonomerSequenceNode(monomer));
        return;
      }
      this.lastSubChain.add(new LinkerSequenceNode.LinkerSequenceNode(monomer, this.firstMonomer));
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
      this.fillSubChains(monomers.getNextMonomerInChain((_this$lastNode2 = this.lastNode) === null || _this$lastNode2 === void 0 ? void 0 : _this$lastNode2.lastMonomerInNode, this.firstMonomer));
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
      if (this.lastNode instanceof EmptySequenceNode.EmptySequenceNode) {
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
      return this.subChains.length === 1 && this.subChains[0].nodes.length === 1 && this.subChains[0].nodes[0] instanceof EmptySequenceNode.EmptySequenceNode;
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
      return this.length === 1 && this.firstNode instanceof EmptySequenceNode.EmptySequenceNode;
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
      var emptySequenceNode = new EmptySequenceNode.EmptySequenceNode();
      var emptySubChain = new EmptySubChain.EmptySubChain();
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

exports.Chain = Chain;
//# sourceMappingURL=Chain.js.map
