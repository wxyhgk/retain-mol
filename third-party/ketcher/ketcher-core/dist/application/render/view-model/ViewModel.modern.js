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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { HalfEdge } from './HalfEdge.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Pile } from '../../../domain/entities/pile.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { Loop } from './Loop.modern.js';

var ViewModel = function () {
  function ViewModel() {
    _classCallCheck(this, ViewModel);
    _defineProperty(this, "halfEdges", new Map());
    _defineProperty(this, "atomsToHalfEdges", new Map());
    _defineProperty(this, "bondsToHalfEdges", new Map());
    _defineProperty(this, "loops", new Map());
  }
  _createClass(ViewModel, [{
    key: "setHalfBondProperties",
    value: function setHalfBondProperties(halfEdge, oppositeHalfEdge) {
      var coordsDifference = Vec2.diff(halfEdge.secondAtom.position, halfEdge.firstAtom.position).normalized();
      halfEdge.oppositeHalfEdge = oppositeHalfEdge;
      halfEdge.direction = Vec2.dist(halfEdge.secondAtom.position, halfEdge.firstAtom.position) > 1e-4 ? coordsDifference : new Vec2(1, 0);
      if (halfEdge.loopId < 0) halfEdge.loopId = -1;
    }
  }, {
    key: "setAtomsToHalfEdgesMap",
    value: function setAtomsToHalfEdgesMap(atom, halfEdge) {
      var atomHalfEdges = this.atomsToHalfEdges.get(atom);
      if (!atomHalfEdges) {
        this.atomsToHalfEdges.set(atom, [halfEdge]);
      } else {
        atomHalfEdges.push(halfEdge);
      }
    }
  }, {
    key: "setBondsToHalfEdgesMap",
    value: function setBondsToHalfEdgesMap(bond, halfEdge) {
      var bondsToHalfEdges = this.bondsToHalfEdges.get(bond);
      if (!bondsToHalfEdges) {
        this.bondsToHalfEdges.set(bond, [halfEdge]);
      } else {
        bondsToHalfEdges.push(halfEdge);
      }
    }
  }, {
    key: "initHalfEdge",
    value: function initHalfEdge(bond) {
      var firstHalfEdgeId = 2 * bond.id;
      var secondHalfEdgeId = 2 * bond.id + 1;
      var firstHalfEdge = new HalfEdge(firstHalfEdgeId, bond.firstAtom, bond.secondAtom, bond);
      var secondHalfEdge = new HalfEdge(secondHalfEdgeId, bond.secondAtom, bond.firstAtom, bond);
      this.halfEdges.set(firstHalfEdgeId, firstHalfEdge);
      this.halfEdges.set(secondHalfEdgeId, secondHalfEdge);
      this.setAtomsToHalfEdgesMap(bond.firstAtom, firstHalfEdge);
      this.setAtomsToHalfEdgesMap(bond.secondAtom, secondHalfEdge);
      this.setBondsToHalfEdgesMap(bond, firstHalfEdge);
      this.setBondsToHalfEdgesMap(bond, secondHalfEdge);
      this.setHalfBondProperties(firstHalfEdge, secondHalfEdge);
      this.setHalfBondProperties(secondHalfEdge, firstHalfEdge);
    }
  }, {
    key: "initHalfEdges",
    value: function initHalfEdges(bonds) {
      var _this = this;
      bonds.forEach(function (bond) {
        _this.initHalfEdge(bond);
      });
    }
  }, {
    key: "setHalfEdgesAngle",
    value: function setHalfEdgesAngle(halfEdge, nextHalfEdge) {
      halfEdge.cosToRightNeighborHalfEdge = Vec2.dot(halfEdge.direction, nextHalfEdge.direction);
      nextHalfEdge.cosToLeftNeighborHalfEdge = Vec2.dot(halfEdge.direction, nextHalfEdge.direction);
      halfEdge.sinToRightNeighborHalfEdge = Vec2.cross(halfEdge.direction, nextHalfEdge.direction);
      nextHalfEdge.sinToLeftNeighborHalfEdge = Vec2.cross(halfEdge.direction, nextHalfEdge.direction);
      nextHalfEdge.leftNeighborHalfEdge = halfEdge;
      halfEdge.rightNeighborHalfEdge = nextHalfEdge;
    }
  }, {
    key: "sortAtomsHalfEdges",
    value: function sortAtomsHalfEdges() {
      var _this2 = this;
      this.atomsToHalfEdges.forEach(function (atomHalfEdges, atom) {
        atomHalfEdges.sort(function (halfEdge1, halfEdge2) {
          return halfEdge1.angle - halfEdge2.angle;
        });
        atomHalfEdges.forEach(function (halfEdge, halfEdgeIndex) {
          var nextHalfEdge = atomHalfEdges[(halfEdgeIndex + 1) % atomHalfEdges.length];
          if (!halfEdge.oppositeHalfEdge) {
            KetcherLogger.warn("Failed to sort HalfEdges for atom ".concat(atom.id, ". HalfEdge ").concat(halfEdge.id, " has no opposite halfEdge"));
            return;
          }
          halfEdge.oppositeHalfEdge.nextHalfEdge = nextHalfEdge;
          _this2.setHalfEdgesAngle(halfEdge, nextHalfEdge);
        });
      });
    }
  }, {
    key: "partitionLoop",
    value: function partitionLoop(halfEdgesInLoop) {
      var subloops = [];
      var continueFlag = true;
      while (continueFlag) {
        var atomToHalfBond = {};
        continueFlag = false;
        for (var l = 0; l < halfEdgesInLoop.length; ++l) {
          var halfEdge = halfEdgesInLoop[l];
          var firstAtomId = halfEdge.firstAtom.id;
          var secondAtomId = halfEdge.secondAtom.id;
          if (secondAtomId in atomToHalfBond) {
            var s = atomToHalfBond[secondAtomId];
            var subloop = halfEdgesInLoop.slice(s, l + 1);
            subloops.push(subloop);
            if (l < halfEdgesInLoop.length) {
              halfEdgesInLoop.splice(s, l - s + 1);
            }
            continueFlag = true;
            break;
          }
          atomToHalfBond[firstAtomId] = l;
        }
        if (!continueFlag) subloops.push(halfEdgesInLoop);
      }
      return subloops;
    }
  }, {
    key: "getAngleBetweenHalfEdges",
    value: function getAngleBetweenHalfEdges(firstHalfEdge, secondHalfEdge) {
      return Math.atan2(Vec2.cross(firstHalfEdge.direction, secondHalfEdge.direction), Vec2.dot(firstHalfEdge.direction, secondHalfEdge.direction));
    }
  }, {
    key: "loopIsInner",
    value: function loopIsInner(halfEdgesInLoop) {
      var _this3 = this;
      var totalAngle = 2 * Math.PI;
      halfEdgesInLoop.forEach(function (halfEdge, i, loopArr) {
        var nextHalfEdge = loopArr[(i + 1) % loopArr.length];
        var angle = _this3.getAngleBetweenHalfEdges(halfEdge, nextHalfEdge);
        totalAngle += nextHalfEdge.oppositeHalfEdge === halfEdge ? Math.PI : angle;
      });
      return Math.abs(totalAngle) < Math.PI;
    }
  }, {
    key: "loopHasSelfIntersections",
    value: function loopHasSelfIntersections(halfEdges) {
      for (var i = 0; i < halfEdges.length; ++i) {
        var halfEdge = halfEdges[i];
        var set = new Pile([halfEdge.firstAtom, halfEdge.secondAtom]);
        for (var j = i + 2; j < halfEdges.length; ++j) {
          var nextNextHalfEdge = halfEdges[j];
          if (set.has(nextNextHalfEdge.firstAtom) || set.has(nextNextHalfEdge.secondAtom)) continue;
          if (Box2Abs.segmentIntersection(halfEdge.firstAtom.position, halfEdge.secondAtom.position, nextNextHalfEdge.firstAtom.position, nextNextHalfEdge.secondAtom.position)) return true;
        }
      }
      return false;
    }
  }, {
    key: "loopIsConvex",
    value: function loopIsConvex(loop) {
      var _this4 = this;
      return loop.every(function (halfEdge, k, loopArr) {
        var angle = _this4.getAngleBetweenHalfEdges(halfEdge, loopArr[(k + 1) % loopArr.length]);
        return angle <= 0;
      });
    }
  }, {
    key: "findLoops",
    value: function findLoops() {
      var _this5 = this;
      var newLoops = [];
      var bondsToMark = new Pile();
      var currentHalfEdge;
      var index = 0;
      var halfEdgesInPotentialLoop = [];
      this.halfEdges.forEach(function (halfEdge) {
        if (halfEdge.loopId !== -1) return;
        for (currentHalfEdge = halfEdge, index = 0, halfEdgesInPotentialLoop = []; index <= _this5.halfEdges.size; currentHalfEdge = currentHalfEdge.nextHalfEdge, ++index) {
          if (!(index > 0 && currentHalfEdge === halfEdge)) {
            halfEdgesInPotentialLoop.push(currentHalfEdge);
            continue;
          }
          var subloops = _this5.partitionLoop(halfEdgesInPotentialLoop);
          subloops.forEach(function (halfEdgesInSubLoop) {
            var loopId;
            if (_this5.loopIsInner(halfEdgesInSubLoop) && !_this5.loopHasSelfIntersections(halfEdgesInSubLoop)) {
              loopId = Math.min.apply(Math, _toConsumableArray(halfEdgesInSubLoop.map(function (halfEdge) {
                return halfEdge.id;
              })));
              _this5.loops.set(loopId, new Loop(halfEdgesInSubLoop, _this5.loopIsConvex(halfEdgesInSubLoop)));
            } else {
              loopId = -2;
            }
            halfEdgesInSubLoop.forEach(function (halfEdge) {
              halfEdge.loopId = loopId;
              bondsToMark.add(halfEdge.bond.id);
            });
            if (loopId >= 0) newLoops.push(loopId);
          });
          break;
        }
      });
      return {
        newLoops: newLoops,
        bondsToMark: Array.from(bondsToMark)
      };
    }
  }, {
    key: "getLargestSectorFromAtomNeighbours",
    value: function getLargestSectorFromAtomNeighbours(atom) {
      var atomHalfEdges = this.atomsToHalfEdges.get(atom);
      if (!atomHalfEdges || atomHalfEdges.length === 0) {
        KetcherLogger.warn("No half-edges found for atom ".concat(atom.id));
        return {
          neighborAngle: 0,
          largestAngle: 0
        };
      }
      var angles = atomHalfEdges.map(function (halfEdge) {
        return halfEdge.angle;
      });
      angles.sort(function (a, b) {
        return a - b;
      });
      var largeAngles = [];
      for (var i = 0; i < angles.length - 1; ++i) {
        largeAngles.push(angles[(i + 1) % angles.length] - angles[i]);
      }
      largeAngles.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI);
      var largestAngle = 0;
      var neighborAngle = -Math.PI / 2;
      for (var _i = 0; _i < angles.length; ++_i) {
        if (largeAngles[_i] > largestAngle) {
          largestAngle = largeAngles[_i];
          neighborAngle = angles[_i];
        }
      }
      return {
        neighborAngle: neighborAngle,
        largestAngle: largestAngle
      };
    }
  }, {
    key: "clearState",
    value: function clearState() {
      this.halfEdges.clear();
      this.loops.clear();
      this.atomsToHalfEdges.clear();
      this.bondsToHalfEdges.clear();
    }
  }, {
    key: "initialize",
    value: function initialize(bonds) {
      this.clearState();
      this.initHalfEdges(bonds);
      this.sortAtomsHalfEdges();
      this.findLoops();
    }
  }]);
  return ViewModel;
}();

export { ViewModel };
//# sourceMappingURL=ViewModel.modern.js.map
