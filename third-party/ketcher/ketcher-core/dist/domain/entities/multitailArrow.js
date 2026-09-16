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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var BaseMicromoleculeEntity = require('./BaseMicromoleculeEntity.js');
var vec2 = require('./vec2.js');
var pool = require('./pool.js');
var helpers = require('../serializers/ket/helpers.js');
require('../constants/elements.js');
require('../constants/element.types.js');
require('../constants/generics.js');
var multitailArrow = require('../constants/multitailArrow.js');
require('../constants/chains.js');
require('../constants/monomers.js');
var fixedPrecision = require('./fixedPrecision.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _objectWithoutProperties__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutProperties);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var _excluded = ["tails"];
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var MultitailValidationErrors;
(function (MultitailValidationErrors) {
  MultitailValidationErrors["INCORRECT_SPINE"] = "INCORRECT_SPINE";
  MultitailValidationErrors["INCORRECT_HEAD"] = "INCORRECT_HEAD";
  MultitailValidationErrors["INCORRECT_TAILS"] = "INCORRECT_TAILS";
})(MultitailValidationErrors || (MultitailValidationErrors = {}));
var MultitailArrow = function (_BaseMicromoleculeEnt) {
  _inherits__default["default"](MultitailArrow, _BaseMicromoleculeEnt);
  function MultitailArrow(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailLength, tailsYOffset, arrowId) {
    var _this;
    _classCallCheck__default["default"](this, MultitailArrow);
    _this = _callSuper(this, MultitailArrow);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "spineTopX", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "spineTopY", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "height", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "headOffsetX", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "headOffsetY", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "tailLength", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "tailsYOffset", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "arrowId", void 0);
    _this.spineTopX = spineTopX;
    _this.spineTopY = spineTopY;
    _this.height = height;
    _this.headOffsetX = headOffsetX;
    _this.headOffsetY = headOffsetY;
    _this.tailLength = tailLength;
    _this.tailsYOffset = tailsYOffset;
    _this.arrowId = arrowId;
    return _this;
  }
  _createClass__default["default"](MultitailArrow, [{
    key: "getReferencePositions",
    value: function getReferencePositions() {
      return MultitailArrow.getReferencePositions(this.spineTopX, this.spineTopY, this.height, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset);
    }
  }, {
    key: "getReferencePositionsArray",
    value: function getReferencePositionsArray() {
      var _this$getReferencePos = this.getReferencePositions(),
        tails = _this$getReferencePos.tails,
        positions = _objectWithoutProperties__default["default"](_this$getReferencePos, _excluded);
      return Object.values(positions).concat(Array.from(tails.values()));
    }
  }, {
    key: "getReferenceLines",
    value: function getReferenceLines(referencePositions) {
      var spineX = referencePositions.topSpine.x;
      var headSpinePosition = new vec2.Vec2(spineX, referencePositions.head.y);
      var tails = new pool.Pool();
      referencePositions.tails.forEach(function (tail, key) {
        tails.set(key, [tail, new vec2.Vec2(spineX, tail.y)]);
      });
      return {
        topTail: [referencePositions.topTail, referencePositions.topSpine],
        bottomTail: [referencePositions.bottomTail, referencePositions.bottomSpine],
        spine: [referencePositions.topSpine, referencePositions.bottomSpine],
        head: [headSpinePosition, referencePositions.head],
        tails: tails
      };
    }
  }, {
    key: "getTailsDistance",
    value: function getTailsDistance(tailsYOffsets) {
      var allTailsOffsets = tailsYOffsets.concat([new fixedPrecision.FixedPrecisionCoordinates(0), this.height]);
      allTailsOffsets.sort(function (a, b) {
        return a.sub(b).getFloatingPrecision();
      });
      return allTailsOffsets.reduce(function (acc, item, index, array) {
        if (index === 0) {
          return acc;
        }
        var distance = item.sub(array[index - 1]);
        var centerFloatingPoint = item.sub(distance.divide(2));
        return acc.concat({
          distance: distance.getFloatingPrecision(),
          center: centerFloatingPoint.getFloatingPrecision()
        });
      }, []);
    }
  }, {
    key: "getTailsMaxDistance",
    value: function getTailsMaxDistance() {
      return this.getTailsDistance(Array.from(this.tailsYOffset.values())).reduce(function (acc, item) {
        return item.distance > acc.distance ? item : acc;
      }, {
        distance: 0,
        center: 0
      });
    }
  }, {
    key: "getTailCoordinate",
    value: function getTailCoordinate(id) {
      return this.tailsYOffset.get(id);
    }
  }, {
    key: "addTail",
    value: function addTail(id, coordinate) {
      if (typeof id === 'number' && coordinate) {
        this.tailsYOffset.set(id, coordinate);
        return id;
      }
      var _this$getTailsMaxDist = this.getTailsMaxDistance(),
        center = _this$getTailsMaxDist.center,
        distance = _this$getTailsMaxDist.distance;
      if (!MultitailArrow.canAddTail(distance)) {
        throw new Error('Cannot add tail because no minimal distance found');
      }
      var centerFixedPrecision = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(center);
      if (typeof id === 'number') {
        this.tailsYOffset.set(id, centerFixedPrecision);
        return id;
      } else {
        return this.tailsYOffset.add(centerFixedPrecision);
      }
    }
  }, {
    key: "removeTail",
    value: function removeTail(id) {
      this.tailsYOffset["delete"](id);
    }
  }, {
    key: "center",
    value: function center() {
      return vec2.Vec2.centre(new vec2.Vec2(this.spineTopX.sub(this.tailLength).getFloatingPrecision(), this.spineTopY.getFloatingPrecision()), new vec2.Vec2(this.spineTopX.add(this.headOffsetX).getFloatingPrecision(), this.spineTopY.add(this.height).getFloatingPrecision()));
    }
  }, {
    key: "clone",
    value: function clone() {
      return new MultitailArrow(this.spineTopX, this.spineTopY, this.height, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset, this.arrowId);
    }
  }, {
    key: "rescaleSize",
    value: function rescaleSize(scale) {
      var _this2 = this;
      this.spineTopX = this.spineTopX.multiply(scale);
      this.spineTopY = this.spineTopY.multiply(scale);
      this.headOffsetX = this.headOffsetX.multiply(scale);
      this.headOffsetY = this.headOffsetY.multiply(scale);
      this.height = this.height.multiply(scale);
      this.tailLength = this.tailLength.multiply(scale);
      this.tailsYOffset.forEach(function (item, index) {
        _this2.tailsYOffset.set(index, item.multiply(scale));
      });
    }
  }, {
    key: "resizeHead",
    value: function resizeHead(offset) {
      var fixedPrecisionOffset = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(offset);
      var headOffsetX = new fixedPrecision.FixedPrecisionCoordinates(Math.max(this.headOffsetX.add(fixedPrecisionOffset).value, MultitailArrow.MIN_HEAD_LENGTH.value));
      var realOffset = headOffsetX.sub(this.headOffsetX);
      this.headOffsetX = headOffsetX;
      return realOffset.getFloatingPrecision();
    }
  }, {
    key: "moveHead",
    value: function moveHead(offset) {
      var fixedPrecisionOffset = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(offset);
      var headOffsetY = new fixedPrecision.FixedPrecisionCoordinates(Math.min(Math.max(MultitailArrow.MIN_TOP_BOTTOM_OFFSET.value, this.headOffsetY.add(fixedPrecisionOffset).value), this.height.sub(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value));
      var realOffset = headOffsetY.sub(this.headOffsetY);
      this.headOffsetY = headOffsetY;
      return realOffset.getFloatingPrecision();
    }
  }, {
    key: "resizeTails",
    value: function resizeTails(offset) {
      var fixedPrecisionOffset = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(offset);
      var updatedLength = new fixedPrecision.FixedPrecisionCoordinates(Math.max(this.tailLength.sub(fixedPrecisionOffset).value, MultitailArrow.MIN_TAIL_LENGTH.value));
      var realOffset = this.tailLength.sub(updatedLength);
      this.tailLength = updatedLength;
      return realOffset.getFloatingPrecision();
    }
  }, {
    key: "normalizeTailPosition",
    value: function normalizeTailPosition(proposedPosition, tailId) {
      var proposedPositionFloatingPrecision = proposedPosition.getFloatingPrecision();
      var getDistanceToTailDistance = function getDistanceToTailDistance(tailDistance) {
        return Math.abs(tailDistance.center - proposedPositionFloatingPrecision) - tailDistance.distance / 2;
      };
      var tailsWithoutCurrent = Array.from(this.tailsYOffset.entries()).filter(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 1),
          key = _ref2[0];
        return key !== tailId;
      }).map(function (_ref3) {
        var _ref4 = _slicedToArray__default["default"](_ref3, 2);
          _ref4[0];
          var value = _ref4[1];
        return value;
      });
      var tailDistances = this.getTailsDistance(tailsWithoutCurrent).filter(function (item) {
        return MultitailArrow.canAddTail(item.distance);
      });
      tailDistances.sort(function (a, b) {
        return getDistanceToTailDistance(a) - getDistanceToTailDistance(b);
      });
      var tailMinDistance = tailDistances.at(0);
      if (!tailMinDistance) {
        return null;
      }
      var positionCenter = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tailMinDistance.center);
      var positionDistance = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tailMinDistance.distance);
      var maxDistanceFromCenter = positionDistance.divide(2).sub(MultitailArrow.MIN_TAIL_DISTANCE);
      if (Math.abs(positionCenter.sub(proposedPosition).value) >= maxDistanceFromCenter.value) {
        var distanceFromCenter = positionCenter.value > proposedPosition.value ? maxDistanceFromCenter.multiply(-1) : maxDistanceFromCenter;
        return positionCenter.add(distanceFromCenter);
      }
      return proposedPosition;
    }
  }, {
    key: "moveTail",
    value: function moveTail(offset, second, normalize) {
      var offsetFixedPrecision = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(offset);
      var minHeight = new fixedPrecision.FixedPrecisionCoordinates(Math.max(MultitailArrow.MIN_TAIL_DISTANCE.multiply(this.tailsYOffset.size + 1).value, MultitailArrow.MIN_HEIGHT.value));
      var tailsOffset = Array.from(this.tailsYOffset.values());
      tailsOffset.sort(function (a, b) {
        return a.value - b.value;
      });
      var lastTail = tailsOffset.at(-1) || new fixedPrecision.FixedPrecisionCoordinates(0);
      var firstTail = tailsOffset.at(0) || new fixedPrecision.FixedPrecisionCoordinates(Infinity);
      var closestTopLimit = new fixedPrecision.FixedPrecisionCoordinates(Math.min(firstTail.sub(MultitailArrow.MIN_TAIL_DISTANCE).value, this.headOffsetY.sub(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value));
      var closestBottomLimit = new fixedPrecision.FixedPrecisionCoordinates(Math.max(lastTail.add(MultitailArrow.MIN_TAIL_DISTANCE).value, this.headOffsetY.add(MultitailArrow.MIN_TOP_BOTTOM_OFFSET).value));
      if (typeof second === 'number') {
        var originalValue = this.tailsYOffset.get(second);
        var updatedHeight = new fixedPrecision.FixedPrecisionCoordinates(Math.max(MultitailArrow.MIN_TAIL_DISTANCE.value, Math.min(originalValue.add(offsetFixedPrecision).value, this.height.sub(MultitailArrow.MIN_TAIL_DISTANCE).value)));
        if (normalize) {
          var result = this.normalizeTailPosition(updatedHeight, second);
          if (result === null) {
            return originalValue.getFloatingPrecision();
          }
          updatedHeight = result;
        }
        var realOffset = updatedHeight.sub(originalValue);
        this.tailsYOffset.set(second, updatedHeight);
        return realOffset.getFloatingPrecision();
      } else if (second === MultitailArrow.BOTTOM_TAIL_NAME) {
        var _updatedHeight = new fixedPrecision.FixedPrecisionCoordinates(Math.max(minHeight.value, this.height.add(offsetFixedPrecision).value, closestBottomLimit.value));
        var _realOffset = _updatedHeight.sub(this.height);
        this.height = _updatedHeight;
        return _realOffset.getFloatingPrecision();
      } else {
        var _realOffset2 = new fixedPrecision.FixedPrecisionCoordinates(Math.min(offsetFixedPrecision.value, closestTopLimit.value, this.height.sub(minHeight).value));
        if (_realOffset2.value !== 0) {
          this.spineTopY = this.spineTopY.add(_realOffset2);
          this.headOffsetY = this.headOffsetY.sub(_realOffset2);
          this.height = this.height.sub(_realOffset2);
          var updatedTails = this.tailsYOffset.clone();
          updatedTails.forEach(function (item, key) {
            updatedTails.set(key, item.sub(_realOffset2));
          });
          this.tailsYOffset = updatedTails;
        }
        return _realOffset2.getFloatingPrecision();
      }
    }
  }, {
    key: "move",
    value: function move(offset) {
      this.spineTopX = this.spineTopX.add(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(offset.x));
      this.spineTopY = this.spineTopY.add(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(offset.y));
    }
  }, {
    key: "toKetNode",
    value: function toKetNode() {
      return MultitailArrow.getParametersForKetNode(this.spineTopX, this.spineTopY, this.headOffsetX, this.headOffsetY, this.tailLength, this.tailsYOffset, this.height, this.center(), this.getInitiallySelected());
    }
  }], [{
    key: "canAddTail",
    value: function canAddTail(distance) {
      return distance >= MultitailArrow.MIN_TAIL_DISTANCE.multiply(2).getFloatingPrecision();
    }
  }, {
    key: "fromTwoPoints",
    value: function fromTwoPoints(topLeft, bottomRight) {
      var center = vec2.Vec2.centre(topLeft, bottomRight);
      var tailLength = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(Math.max((bottomRight.x - topLeft.x) / 3, MultitailArrow.MIN_TAIL_LENGTH.getFloatingPrecision()));
      var topSpineX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(topLeft.x).add(tailLength);
      var topSpineY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(topLeft.y);
      var height = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(Math.max(bottomRight.y - topLeft.y, MultitailArrow.MIN_HEIGHT.getFloatingPrecision()));
      var headOffsetX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(bottomRight.x).sub(topSpineX);
      var headOffsetY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(center.y).sub(topSpineY);
      return new MultitailArrow(topSpineX, topSpineY, height, headOffsetX, headOffsetY, tailLength, new pool.Pool());
    }
  }, {
    key: "validateKetNode",
    value: function validateKetNode(ketFileData) {
      var _tailsFixedPrecision$, _tailsFixedPrecision$2;
      var head = ketFileData.head,
        spine = ketFileData.spine,
        tails = ketFileData.tails;
      var _spine$pos = _slicedToArray__default["default"](spine.pos, 2),
        spineStart = _spine$pos[0],
        spineEnd = _spine$pos[1];
      var spineStartX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineStart.x);
      var spineStartY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineStart.y);
      var spineEndX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineEnd.x);
      var spineEndY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineEnd.y);
      var headX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(head.position.x);
      var headY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(head.position.y);
      var tailsFixedPrecision = tails.pos.map(function (tail) {
        return {
          x: fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tail.x),
          y: fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tail.y)
        };
      });
      tailsFixedPrecision.sort(function (a, b) {
        return b.y.value - a.y.value;
      });
      if (spineStartX.value !== spineEndX.value || spineStartY.value < spineEndY.sub(MultitailArrow.KET_MIN_DISTANCE).value) {
        return MultitailValidationErrors.INCORRECT_SPINE;
      }
      if (headX.value < spineStartX.add(MultitailArrow.KET_MIN_DISTANCE).value || headY.sub(MultitailArrow.KET_MIN_DISTANCE).value < spineEndY.value || headY.add(MultitailArrow.KET_MIN_DISTANCE).value > spineStartY.value) {
        return MultitailValidationErrors.INCORRECT_HEAD;
      }
      if (((_tailsFixedPrecision$ = tailsFixedPrecision.at(0)) === null || _tailsFixedPrecision$ === void 0 ? void 0 : _tailsFixedPrecision$.y.value) !== spineStartY.value || ((_tailsFixedPrecision$2 = tailsFixedPrecision.at(-1)) === null || _tailsFixedPrecision$2 === void 0 ? void 0 : _tailsFixedPrecision$2.y.value) !== spineEndY.value) {
        return MultitailValidationErrors.INCORRECT_TAILS;
      }
      var firstTailX = tailsFixedPrecision[0].x;
      if (firstTailX.value > spineStartX.sub(MultitailArrow.KET_MIN_DISTANCE).value) {
        return MultitailValidationErrors.INCORRECT_TAILS;
      }
      var result = tailsFixedPrecision.every(function (tail, index, allTails) {
        if (index > 0 && allTails[index - 1].y.value < tail.y.add(MultitailArrow.KET_MIN_DISTANCE).value) {
          return false;
        }
        return tail.x.value === firstTailX.value && tail.y.value >= spineEndY.value && tail.y.value <= spineStartY.value;
      });
      return !result ? MultitailValidationErrors.INCORRECT_TAILS : null;
    }
  }, {
    key: "getConstructorParamsFromKetNode",
    value: function getConstructorParamsFromKetNode(ketFileNode) {
      var data = helpers.getNodeWithInvertedYCoord(ketFileNode.data);
      var _data$spine$pos = _slicedToArray__default["default"](data.spine.pos, 2),
        spineStart = _data$spine$pos[0],
        spineEnd = _data$spine$pos[1];
      var head = data.head.position;
      var spineTopX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineStart.x);
      var spineTopY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineStart.y);
      var height = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineEnd.y).sub(spineTopY);
      var headOffsetX = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(head.x).sub(spineTopX);
      var headOffsetY = fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(head.y).sub(spineTopY);
      var tailsYOffset = new pool.Pool();
      var tails = _toConsumableArray__default["default"](data.tails.pos);
      tails.sort(function (a, b) {
        return a.y - b.y;
      });
      var tailsLength = spineTopX.sub(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tails[0].x));
      tails.slice(1, -1).forEach(function (tail) {
        tailsYOffset.add(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tail.y).sub(spineTopY));
      });
      return {
        spineTopX: spineTopX,
        spineTopY: spineTopY,
        height: height,
        headOffsetX: headOffsetX,
        headOffsetY: headOffsetY,
        tailsLength: tailsLength,
        tailsYOffset: tailsYOffset
      };
    }
  }, {
    key: "fromKetNode",
    value: function fromKetNode(ketFileNode) {
      var _MultitailArrow$getCo = MultitailArrow.getConstructorParamsFromKetNode(ketFileNode),
        spineTopX = _MultitailArrow$getCo.spineTopX,
        spineTopY = _MultitailArrow$getCo.spineTopY,
        height = _MultitailArrow$getCo.height,
        headOffsetX = _MultitailArrow$getCo.headOffsetX,
        headOffsetY = _MultitailArrow$getCo.headOffsetY,
        tailsLength = _MultitailArrow$getCo.tailsLength,
        tailsYOffset = _MultitailArrow$getCo.tailsYOffset;
      return new MultitailArrow(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailsLength, tailsYOffset);
    }
  }, {
    key: "fromFloatingPointCoordinates",
    value: function fromFloatingPointCoordinates(spineTop, height, headOffset, tailLength, tailsYOffset) {
      var tailsYOffsetFixedPrecision = tailsYOffset.clone();
      tailsYOffsetFixedPrecision.forEach(function (item, key, map) {
        var pool = map;
        pool.set(key, fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(item));
      });
      return new MultitailArrow(fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineTop.x), fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(spineTop.y), fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(height), fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(headOffset.x), fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(headOffset.y), fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(tailLength), tailsYOffsetFixedPrecision);
    }
  }, {
    key: "getReferencePositions",
    value: function getReferencePositions(spineTopX, spineTopY, height, headOffsetX, headOffsetY, tailLength, tailsYOffset) {
      var tailX = spineTopX.sub(tailLength);
      var bottomY = spineTopY.add(height);
      var tails = new pool.Pool();
      tailsYOffset.forEach(function (tailYOffset, key) {
        tails.set(key, new vec2.Vec2(tailX.getFloatingPrecision(), spineTopY.add(tailYOffset).getFloatingPrecision()));
      });
      return {
        head: new vec2.Vec2(spineTopX.add(headOffsetX).getFloatingPrecision(), spineTopY.add(headOffsetY).getFloatingPrecision()),
        topTail: new vec2.Vec2(tailX.getFloatingPrecision(), spineTopY.getFloatingPrecision()),
        bottomTail: new vec2.Vec2(tailX.getFloatingPrecision(), bottomY.getFloatingPrecision()),
        topSpine: new vec2.Vec2(spineTopX.getFloatingPrecision(), spineTopY.getFloatingPrecision()),
        bottomSpine: new vec2.Vec2(spineTopX.getFloatingPrecision(), bottomY.getFloatingPrecision()),
        tails: tails
      };
    }
  }, {
    key: "getParametersForKetNode",
    value: function getParametersForKetNode(spineTopX, spineTopY, headOffsetX, headOffsetY, tailLength, tailsYOffset, height, center, isInitiallySelected) {
      var head = new vec2.Vec2(spineTopX.add(headOffsetX).getFloatingPrecision(), spineTopY.add(headOffsetY).getFloatingPrecision());
      var bottomY = spineTopY.add(height);
      var spine = [new vec2.Vec2(spineTopX.getFloatingPrecision(), spineTopY.getFloatingPrecision()), new vec2.Vec2(spineTopX.getFloatingPrecision(), bottomY.getFloatingPrecision())];
      var tailX = spineTopX.sub(tailLength);
      var nonBorderTails = Array.from(tailsYOffset.values()).map(function (yOffset) {
        return spineTopY.add(yOffset);
      });
      var convertTail = function convertTail(y) {
        return new vec2.Vec2(tailX.getFloatingPrecision(), y.getFloatingPrecision());
      };
      var tails = [spineTopY].concat(nonBorderTails).concat(bottomY).map(convertTail);
      return {
        type: multitailArrow.MULTITAIL_ARROW_SERIALIZE_KEY,
        center: center,
        selected: isInitiallySelected,
        data: helpers.getNodeWithInvertedYCoord({
          head: {
            position: head
          },
          spine: {
            pos: spine
          },
          tails: {
            pos: tails
          },
          zOrder: 0
        })
      };
    }
  }]);
  return MultitailArrow;
}(BaseMicromoleculeEntity.BaseMicromoleculeEntity);
_defineProperty__default["default"](MultitailArrow, "KET_MIN_DISTANCE", fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(0.01));
_defineProperty__default["default"](MultitailArrow, "MIN_TAIL_DISTANCE", fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(0.35));
_defineProperty__default["default"](MultitailArrow, "MIN_HEAD_LENGTH", fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(0.5));
_defineProperty__default["default"](MultitailArrow, "MIN_TAIL_LENGTH", fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(0.4));
_defineProperty__default["default"](MultitailArrow, "MIN_TOP_BOTTOM_OFFSET", fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(0.15));
_defineProperty__default["default"](MultitailArrow, "MIN_HEIGHT", fixedPrecision.FixedPrecisionCoordinates.fromFloatingPrecision(0.5));
_defineProperty__default["default"](MultitailArrow, "TOP_TAIL_NAME", 'topTail');
_defineProperty__default["default"](MultitailArrow, "BOTTOM_TAIL_NAME", 'bottomTail');
_defineProperty__default["default"](MultitailArrow, "TAILS_NAME", 'tails');

exports.MultitailArrow = MultitailArrow;
//# sourceMappingURL=multitailArrow.js.map
