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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Chain } from './Chain.modern.js';
import { AmbiguousMonomer } from '../AmbiguousMonomer.modern.js';
import { Chem } from '../Chem.modern.js';
import { IsChainCycled } from './types.modern.js';
import { Peptide } from '../Peptide.modern.js';
import { Phosphate } from '../Phosphate.modern.js';
import { RNABase } from '../RNABase.modern.js';
import { Sugar } from '../Sugar.modern.js';
import { UnresolvedMonomer } from '../UnresolvedMonomer.modern.js';
import { UnsplitNucleotide } from '../UnsplitNucleotide.modern.js';
import { isRnaBaseApplicableForAntisense, getPreviousMonomerInChain, isRnaBaseOrAmbiguousRnaBase, getRnaBaseFromSugar, isMonomerConnectedToR2RnaBase, isLinearChem, getNextMonomerInChain } from '../../helpers/monomers.modern.js';
import { MonomerToAtomBond } from '../MonomerToAtomBond.modern.js';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers.modern.js';

function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var ChainsCollection = function () {
  function ChainsCollection() {
    _classCallCheck(this, ChainsCollection);
    _defineProperty(this, "chains", []);
  }
  _createClass(ChainsCollection, [{
    key: "monomerToChain",
    get: function get() {
      var monomerToChain = new Map();
      this.chains.forEach(function (chain) {
        chain.forEachNode(function (_ref) {
          var node = _ref.node;
          node.monomers.forEach(function (monomer) {
            monomerToChain.set(monomer, chain);
          });
        });
      });
      return monomerToChain;
    }
  }, {
    key: "monomerToNode",
    get: function get() {
      var monomerToNode = new Map();
      this.forEachNode(function (_ref2) {
        var node = _ref2.node;
        node.monomers.forEach(function (monomer) {
          monomerToNode.set(monomer, node);
        });
      });
      return monomerToNode;
    }
  }, {
    key: "rearrange",
    value: function rearrange() {
      this.chains.sort(function (chain1, chain2) {
        var _chain1$firstNode$mon, _chain1$firstNode, _chain1$firstNode$mon2, _chain1$firstNode2, _chain2$firstNode$mon, _chain2$firstNode, _chain2$firstNode$mon2, _chain2$firstNode2, _chain1$firstNode$mon3, _chain1$firstNode3, _chain2$firstNode$mon3, _chain2$firstNode3;
        var X_COORDINATE_REDUCTION_FACTOR = 0.01;
        var chain1Weight = ((_chain1$firstNode$mon = (_chain1$firstNode = chain1.firstNode) === null || _chain1$firstNode === void 0 ? void 0 : _chain1$firstNode.monomer.position.x) !== null && _chain1$firstNode$mon !== void 0 ? _chain1$firstNode$mon : 0) * X_COORDINATE_REDUCTION_FACTOR + ((_chain1$firstNode$mon2 = (_chain1$firstNode2 = chain1.firstNode) === null || _chain1$firstNode2 === void 0 ? void 0 : _chain1$firstNode2.monomer.position.y) !== null && _chain1$firstNode$mon2 !== void 0 ? _chain1$firstNode$mon2 : 0);
        var chain2Weight = ((_chain2$firstNode$mon = (_chain2$firstNode = chain2.firstNode) === null || _chain2$firstNode === void 0 ? void 0 : _chain2$firstNode.monomer.position.x) !== null && _chain2$firstNode$mon !== void 0 ? _chain2$firstNode$mon : 0) * X_COORDINATE_REDUCTION_FACTOR + ((_chain2$firstNode$mon2 = (_chain2$firstNode2 = chain2.firstNode) === null || _chain2$firstNode2 === void 0 ? void 0 : _chain2$firstNode2.monomer.position.y) !== null && _chain2$firstNode$mon2 !== void 0 ? _chain2$firstNode$mon2 : 0);
        if (chain1Weight !== chain2Weight) {
          return chain1Weight - chain2Weight;
        }
        return ((_chain1$firstNode$mon3 = (_chain1$firstNode3 = chain1.firstNode) === null || _chain1$firstNode3 === void 0 ? void 0 : _chain1$firstNode3.monomer.id) !== null && _chain1$firstNode$mon3 !== void 0 ? _chain1$firstNode$mon3 : 0) - ((_chain2$firstNode$mon3 = (_chain2$firstNode3 = chain2.firstNode) === null || _chain2$firstNode3 === void 0 ? void 0 : _chain2$firstNode3.monomer.id) !== null && _chain2$firstNode$mon3 !== void 0 ? _chain2$firstNode$mon3 : 0);
      });
      var reorderedChains = new Set();
      var monomerToChain = this.monomerToChain;
      this.chains.forEach(function (chain) {
        reorderedChains.add(chain);
        chain.forEachNode(function (_ref3) {
          var node = _ref3.node;
          node.monomers.forEach(function (monomer) {
            var sideConnections = monomer.sideConnections;
            if (sideConnections.length) {
              sideConnections.forEach(function (sideConnection) {
                var anotherMonomer = sideConnection.getAnotherMonomer(monomer);
                var anotherChain = anotherMonomer && monomerToChain.get(anotherMonomer);
                if (anotherChain && !reorderedChains.has(anotherChain)) {
                  reorderedChains.add(anotherChain);
                }
              });
            }
          });
        });
      });
      this.chains = _toConsumableArray(reorderedChains.values());
      this.reorderChainsPutSenseChainOrderInAccordanceAntisenseConnection();
    }
  }, {
    key: "add",
    value: function add(chain) {
      this.chains.push(chain);
      return this;
    }
  }, {
    key: "firstNode",
    get: function get() {
      var _this$chains$;
      return (_this$chains$ = this.chains[0]) === null || _this$chains$ === void 0 || (_this$chains$ = _this$chains$.subChains[0]) === null || _this$chains$ === void 0 ? void 0 : _this$chains$.nodes[0];
    }
  }, {
    key: "lastNode",
    get: function get() {
      return this.chains[0].lastSubChain.lastNode;
    }
  }, {
    key: "length",
    get: function get() {
      return this.chains.reduce(function (length, chain) {
        return length + chain.length;
      }, 0);
    }
  }, {
    key: "forEachNode",
    value: function forEachNode(forEachCallback) {
      var nodeIndexOverall = 0;
      this.chains.forEach(function (chain, chainIndex) {
        chain.subChains.forEach(function (subChain, subChainIndex) {
          subChain.nodes.forEach(function (node, nodeIndex) {
            forEachCallback({
              chainIndex: chainIndex,
              subChainIndex: subChainIndex,
              nodeIndex: nodeIndex,
              nodeIndexOverall: nodeIndexOverall,
              node: node,
              subChain: subChain,
              chain: chain
            });
            nodeIndexOverall++;
          });
        });
      });
    }
  }, {
    key: "getFirstComplimentaryMonomer",
    value: function getFirstComplimentaryMonomer(monomer) {
      var hydrogenBond = monomer.hydrogenBonds[0];
      if (hydrogenBond) {
        return {
          monomer: monomer,
          complimentaryMonomer: hydrogenBond.getAnotherMonomer(monomer)
        };
      }
      return undefined;
    }
  }, {
    key: "findCycledComplimentaryChains",
    value: function findCycledComplimentaryChains(chain, startChain, previousChain) {
      var _this = this;
      var visitedChains = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new Set();
      if (visitedChains.has(chain)) {
        return [];
      }
      visitedChains.add(chain);
      var complimentaryChainsWithData = this.getComplimentaryChainsWithData(chain);
      if (complimentaryChainsWithData.length === 0) {
        return [];
      }
      var complimentaryChainGoesToStartChain = complimentaryChainsWithData.find(function (_ref4) {
        var complimentaryChain = _ref4.complimentaryChain;
        return complimentaryChain !== previousChain && complimentaryChain === startChain;
      });
      if (complimentaryChainGoesToStartChain) {
        return [chain];
      } else {
        return complimentaryChainsWithData.reduce(function (acc, _ref5) {
          var complimentaryChain = _ref5.complimentaryChain;
          if (complimentaryChain === startChain || complimentaryChain === previousChain) {
            return acc;
          }
          return [].concat(_toConsumableArray(acc), _toConsumableArray(_this.findCycledComplimentaryChains(complimentaryChain, startChain, chain, visitedChains)));
        }, []);
      }
    }
  }, {
    key: "getComplimentaryChainIfNucleotide",
    value: function getComplimentaryChainIfNucleotide(node, monomerToChain, monomerToNode) {
      var complimentaryChain;
      var complimentaryNode;
      var _iterator = _createForOfIteratorHelper(node.monomers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var monomerToCheck = _step.value;
          var _ref6 = this.getFirstComplimentaryMonomer(monomerToCheck) || {},
            monomer = _ref6.monomer,
            complimentaryMonomer = _ref6.complimentaryMonomer;
          var complimentaryNodeOrUndefined = complimentaryMonomer && monomerToNode.get(complimentaryMonomer);
          var complimentaryChainOrUndefined = complimentaryMonomer && monomerToChain.get(complimentaryMonomer);
          if (!complimentaryNodeOrUndefined || !complimentaryChainOrUndefined) {
            continue;
          }
          var isRnaMonomer = isRnaBaseApplicableForAntisense(monomer);
          var isRnaComplimentaryMonomer = isRnaBaseApplicableForAntisense(complimentaryMonomer);
          if (!isRnaMonomer || !isRnaComplimentaryMonomer) {
            continue;
          }
          return {
            complimentaryChain: complimentaryChainOrUndefined,
            complimentaryNode: complimentaryNodeOrUndefined
          };
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return {
        complimentaryChain: complimentaryChain,
        complimentaryNode: complimentaryNode
      };
    }
  }, {
    key: "reorderChainsPutSenseChainOrderInAccordanceAntisenseConnection",
    value: function reorderChainsPutSenseChainOrderInAccordanceAntisenseConnection() {
      var _this2 = this;
      var handledChain = new Set();
      var monomerToChain = this.monomerToChain;
      var monomerToNode = this.monomerToNode;
      var reorderedSenseForSequentialAntisenseChains = new Array(this.chains.length);
      this.chains.forEach(function (chain) {
        if (!handledChain.has(chain)) {
          reorderedSenseForSequentialAntisenseChains[handledChain.size] = chain;
          handledChain.add(chain);
        }
        if (chain.isAntisense) {
          return;
        }
        chain.forEachNode(function (_ref7) {
          var _this2$getComplimenta;
          var sNode = _ref7.node;
          var _ref8 = (_this2$getComplimenta = _this2.getComplimentaryChainIfNucleotide(sNode, monomerToChain, monomerToNode)) !== null && _this2$getComplimenta !== void 0 ? _this2$getComplimenta : {},
            antisenseChain = _ref8.complimentaryChain,
            antisenseNode = _ref8.complimentaryNode;
          if (!antisenseChain) {
            return;
          }
          var isFindCur = false;
          antisenseChain.forEachNode(function (_ref9) {
            var aNode = _ref9.node;
            if (aNode === antisenseNode) {
              isFindCur = true;
            }
            if (!isFindCur) {
              var _this2$getComplimenta2;
              var _ref0 = (_this2$getComplimenta2 = _this2.getComplimentaryChainIfNucleotide(aNode, monomerToChain, monomerToNode)) !== null && _this2$getComplimenta2 !== void 0 ? _this2$getComplimenta2 : {},
                anotherSenseChain = _ref0.complimentaryChain;
              if (anotherSenseChain && !handledChain.has(anotherSenseChain)) {
                var curChainIdx = reorderedSenseForSequentialAntisenseChains.findIndex(function (v) {
                  return v === chain;
                });
                var last = anotherSenseChain;
                for (var i = curChainIdx; i < reorderedSenseForSequentialAntisenseChains.length; i++) {
                  var tmp = reorderedSenseForSequentialAntisenseChains[i];
                  reorderedSenseForSequentialAntisenseChains[i] = last;
                  last = tmp;
                }
                handledChain.add(anotherSenseChain);
              }
            }
          });
        });
      });
      this.chains = [].concat(reorderedSenseForSequentialAntisenseChains);
    }
  }, {
    key: "getAllChainsWithConnectionInBlock",
    value: function getAllChainsWithConnectionInBlock(c) {
      var _this3 = this;
      var chains = [{
        group: 0,
        chain: c
      }];
      var cycledComplimentaryChains = new Set(this.findCycledComplimentaryChains(c, c));
      var res = [{
        group: 0,
        chain: c
      }];
      var handledChains = new Set([c]);
      var monomerToChain = this.monomerToChain;
      var monomerToNode = this.monomerToNode;
      var _loop = function _loop() {
        var _chains$pop = chains.pop(),
          group = _chains$pop.group,
          chain = _chains$pop.chain;
        var chainNodes = chain.nodes;
        chain.forEachNode(function (_ref1) {
          var _this3$getComplimenta;
          var node = _ref1.node,
            nodeIndex = _ref1.nodeIndex;
          var _ref10 = (_this3$getComplimenta = _this3.getComplimentaryChainIfNucleotide(node, monomerToChain, monomerToNode)) !== null && _this3$getComplimenta !== void 0 ? _this3$getComplimenta : {},
            complimentaryChain = _ref10.complimentaryChain,
            complimentaryNode = _ref10.complimentaryNode;
          if (!complimentaryChain || !complimentaryNode || handledChains.has(complimentaryChain) || cycledComplimentaryChains.has(complimentaryChain)) {
            return;
          }
          var complimentaryChainNodes = complimentaryChain.nodes;
          var firstComplimentaryNodeIndex = complimentaryChainNodes.indexOf(complimentaryNode);
          var hasIntersection = false;
          for (var i = firstComplimentaryNodeIndex; i < complimentaryChainNodes.length; i++) {
            var _this3$getComplimenta2;
            var potentialNextComplimentaryNode = complimentaryChainNodes[i];
            var _ref11 = (_this3$getComplimenta2 = _this3.getComplimentaryChainIfNucleotide(potentialNextComplimentaryNode, monomerToChain, monomerToNode)) !== null && _this3$getComplimenta2 !== void 0 ? _this3$getComplimenta2 : {},
              nextComplimentaryNode = _ref11.complimentaryNode,
              nextComplimentaryNodeChain = _ref11.complimentaryChain;
            if (nextComplimentaryNode && nextComplimentaryNodeChain === chain && chainNodes.indexOf(nextComplimentaryNode) > nodeIndex) {
              hasIntersection = true;
              break;
            }
          }
          handledChains.add(complimentaryChain);
          if (hasIntersection) {
            return;
          }
          var el = {
            chain: complimentaryChain,
            group: Number(!group)
          };
          chains.push(el);
          res.push(el);
        });
      };
      while (chains.length) {
        _loop();
      }
      return res;
    }
  }, {
    key: "getComplimentaryChainsWithData",
    value: function getComplimentaryChainsWithData(chain) {
      var _this4 = this;
      var complimentaryChainsWithData = [];
      var handledChains = new Set();
      var monomerToNode = this.monomerToNode;
      var monomerToChain = this.monomerToChain;
      chain.forEachNode(function (_ref12) {
        var node = _ref12.node,
          nodeIndex = _ref12.nodeIndex;
        node.monomers.forEach(function (monomer) {
          var _ref13 = _this4.getFirstComplimentaryMonomer(monomer) || {},
            complimentaryMonomer = _ref13.complimentaryMonomer;
          var complimentaryNode = complimentaryMonomer && monomerToNode.get(complimentaryMonomer);
          var complimentaryChain = complimentaryMonomer && monomerToChain.get(complimentaryMonomer);
          if (!complimentaryNode || !complimentaryChain || handledChains.has(complimentaryChain)) {
            return;
          }
          handledChains.add(complimentaryChain);
          complimentaryChainsWithData.push({
            complimentaryChain: complimentaryChain,
            chain: chain,
            firstConnectedNode: node,
            firstConnectedComplimentaryNode: complimentaryNode,
            chainIdxConnection: nodeIndex
          });
        });
      });
      return complimentaryChainsWithData;
    }
  }], [{
    key: "fromMonomers",
    value: function fromMonomers(monomers) {
      var chainsCollection = new ChainsCollection();
      var filteredMonomers = monomers.filter(function (monomer) {
        return !monomer.monomerItem.props.isMicromoleculeFragment || isMonomerSgroupWithAttachmentPoints(monomer);
      });
      if (filteredMonomers.length === 0) {
        return chainsCollection;
      }
      var _this$getFirstMonomer = this.getFirstMonomersInChains(filteredMonomers),
        _this$getFirstMonomer2 = _slicedToArray(_this$getFirstMonomer, 2),
        firstMonomersInRegularChains = _this$getFirstMonomer2[0],
        firstMonomersInCycledChains = _this$getFirstMonomer2[1];
      firstMonomersInRegularChains.forEach(function (monomer) {
        chainsCollection.add(new Chain(monomer));
      });
      firstMonomersInCycledChains.forEach(function (monomer) {
        chainsCollection.add(new Chain(monomer, !!IsChainCycled.CYCLED));
      });
      var firstMonomersInMiddleOfChains = this.getFirstMonomersInMiddleOfChains(filteredMonomers);
      if (firstMonomersInMiddleOfChains.length) {
        firstMonomersInMiddleOfChains.forEach(function (firstMonomerInMiddleOfChain) {
          chainsCollection.add(new Chain(firstMonomerInMiddleOfChain));
        });
      }
      return chainsCollection;
    }
  }, {
    key: "getFirstMonomersInChains",
    value: function getFirstMonomersInChains(monomers) {
      var MonomerTypes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [Peptide, Chem, Phosphate, Sugar, RNABase, UnresolvedMonomer, UnsplitNucleotide, AmbiguousMonomer];
      var monomersList = monomers.filter(function (monomer) {
        return MonomerTypes.some(function (MonomerType) {
          return monomer instanceof MonomerType;
        });
      });
      var firstMonomersInChains = [];
      var firstMonomersInRegularChains = this.getFirstMonomersInRegularChains(monomersList);
      var firstMonomersInCycledChains = this.getFirstMonomersInCycledChains(monomersList);
      firstMonomersInChains.push(firstMonomersInRegularChains, firstMonomersInCycledChains);
      return firstMonomersInChains;
    }
  }, {
    key: "getFirstMonomersInMiddleOfChains",
    value: function getFirstMonomersInMiddleOfChains(monomers) {
      var initialMonomersSet = new Set(monomers);
      var handledMonomers = new Set();
      var firstMonomersInMiddleOfChains = [];
      monomers.forEach(function (monomer) {
        if (handledMonomers.has(monomer)) {
          return;
        }
        handledMonomers.add(monomer);
        var previousMonomerInChain = getPreviousMonomerInChain(monomer);
        while (previousMonomerInChain && !handledMonomers.has(previousMonomerInChain) && !initialMonomersSet.has(previousMonomerInChain)) {
          var previousMonomer = getPreviousMonomerInChain(previousMonomerInChain);
          handledMonomers.add(previousMonomerInChain);
          if (!previousMonomer) {
            firstMonomersInMiddleOfChains.push(previousMonomerInChain);
          } else {
            previousMonomerInChain = previousMonomer;
          }
        }
      });
      return firstMonomersInMiddleOfChains;
    }
  }, {
    key: "getFirstMonomersInRegularChains",
    value: function getFirstMonomersInRegularChains(monomersList) {
      var firstMonomersInRegularChains = monomersList.filter(function (monomer) {
        var R1PolymerBond = monomer.attachmentPointsToBonds.R1;
        if (R1PolymerBond instanceof MonomerToAtomBond) {
          return true;
        }
        var isFirstMonomerWithR2R1connection = !R1PolymerBond || R1PolymerBond.isSideChainConnection;
        var R1ConnectedMonomer = R1PolymerBond === null || R1PolymerBond === void 0 ? void 0 : R1PolymerBond.getAnotherMonomer(monomer);
        var isRnaBaseConnectedToSugar = isRnaBaseOrAmbiguousRnaBase(monomer) && R1ConnectedMonomer instanceof Sugar && getRnaBaseFromSugar(R1ConnectedMonomer) === monomer;
        var isStart = (isFirstMonomerWithR2R1connection || isMonomerConnectedToR2RnaBase(monomer)) && !isRnaBaseConnectedToSugar;
        if (isStart && !isMonomerConnectedToR2RnaBase(monomer)) {
          var previousMonomer = getPreviousMonomerInChain(monomer);
          if (previousMonomer && (isLinearChem(monomer) || isLinearChem(previousMonomer))) {
            return false;
          }
        }
        return isStart;
      });
      return firstMonomersInRegularChains;
    }
  }, {
    key: "getFirstMonomersInCycledChains",
    value: function getFirstMonomersInCycledChains(monomersList) {
      var _this5 = this;
      var handledMonomers = new Set();
      var cyclicChains = [];
      monomersList.forEach(function (monomer) {
        if (handledMonomers.has(monomer)) {
          return;
        }
        var monomersInSameChain = new Set();
        monomersInSameChain.add(monomer);
        handledMonomers.add(monomer);
        var nextMonomerInChain = getNextMonomerInChain(monomer);
        while (nextMonomerInChain && !handledMonomers.has(nextMonomerInChain)) {
          monomersInSameChain.add(nextMonomerInChain);
          handledMonomers.add(nextMonomerInChain);
          nextMonomerInChain = getNextMonomerInChain(nextMonomerInChain);
        }
        if (monomer === nextMonomerInChain) {
          cyclicChains.push(Array.from(monomersInSameChain));
        }
      });
      var firstMonomersOfCycledChainsSet = cyclicChains.map(function (cyclicChain) {
        return _this5.getMonomerWithLowerCoordsFromMonomerList(cyclicChain);
      });
      return firstMonomersOfCycledChainsSet;
    }
  }, {
    key: "getMonomerWithLowerCoordsFromMonomerList",
    value: function getMonomerWithLowerCoordsFromMonomerList(monomerList) {
      var monomerListShallowCopy = monomerList.slice();
      monomerListShallowCopy.sort(function (monomer1, monomer2) {
        if (monomer2.position.x + monomer2.position.y > monomer1.position.x + monomer1.position.y) {
          return -1;
        } else {
          return 1;
        }
      });
      var monomerWithLowerCoords = monomerListShallowCopy[0];
      return monomerWithLowerCoords;
    }
  }]);
  return ChainsCollection;
}();

export { ChainsCollection };
//# sourceMappingURL=ChainsCollection.modern.js.map
