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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var rxnArrow = require('../../../domain/entities/rxnArrow.js');
var vec2 = require('../../../domain/entities/vec2.js');
var generalEnumTypes = require('./generalEnumTypes.js');
var raphaelExt = require('../raphael-ext.js');
var reobject = require('./reobject.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');
var draw = require('../draw.js');
var util = require('../util.js');
var toFixed = require('../../../utilities/toFixed.js');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _possibleConstructorReturn__default = /*#__PURE__*/_interopDefaultLegacy(_possibleConstructorReturn);
var _getPrototypeOf__default = /*#__PURE__*/_interopDefaultLegacy(_getPrototypeOf);
var _assertThisInitialized__default = /*#__PURE__*/_interopDefaultLegacy(_assertThisInitialized);
var _inherits__default = /*#__PURE__*/_interopDefaultLegacy(_inherits);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf__default["default"](o), _possibleConstructorReturn__default["default"](t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf__default["default"](t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var ReRxnArrow = function (_ReObject) {
  _inherits__default["default"](ReRxnArrow, _ReObject);
  function ReRxnArrow(arrow) {
    var _this;
    _classCallCheck__default["default"](this, ReRxnArrow);
    _this = _callSuper(this, ReRxnArrow, ['rxnArrow']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "item", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "isResizing", false);
    _this.item = arrow;
    return _this;
  }
  _createClass__default["default"](ReRxnArrow, [{
    key: "calcDistance",
    value: function calcDistance(p, s) {
      var point = new vec2.Vec2(p.x, p.y);
      var distRef = this.getReferencePointDistance(p);
      var item = this.item;
      var pos = item.pos;
      var dist = point.calculateDistanceToLine([pos[0], pos[1]]);
      if (rxnArrow.RxnArrow.isElliptical(item)) {
        var _this$getReferencePoi = this.getReferencePoints(),
          _this$getReferencePoi2 = _slicedToArray__default["default"](_this$getReferencePoi, 3),
          startPoint = _this$getReferencePoi2[0],
          endPoint = _this$getReferencePoi2[1],
          middlePoint = _this$getReferencePoi2[2];
        dist = Math.min(dist, point.calculateDistanceToLine([startPoint, middlePoint]), point.calculateDistanceToLine([middlePoint, endPoint]));
      }
      var refPoint = distRef.minDist <= 8 / s ? distRef.refPoint : null;
      dist = Math.min(distRef.minDist, dist);
      return {
        minDist: dist,
        refPoint: refPoint
      };
    }
  }, {
    key: "getReferencePointDistance",
    value: function getReferencePointDistance(p) {
      var dist = [];
      var refPoints = this.getReferencePoints();
      refPoints.forEach(function (rp) {
        dist.push({
          minDist: Math.abs(vec2.Vec2.dist(p, rp)),
          refPoint: rp
        });
      });
      var minDist = dist.reduce(function (acc, current) {
        return acc.minDist < current.minDist ? acc : current;
      });
      return minDist;
    }
  }, {
    key: "hoverPath",
    value: function hoverPath(render) {
      var path = this.generatePath(render, render.options, 'selection');
      return render.paper.path(path);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var ret = this.hoverPath(render).attr(render.options.hoverStyle);
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "getReferencePoints",
    value: function getReferencePoints() {
      var refPoints = [];
      var item = this.item;
      var _item$pos = _slicedToArray__default["default"](item.pos, 2),
        a = _item$pos[0],
        b = _item$pos[1];
      var height = item.height;
      refPoints.push(new vec2.Vec2(a.x, a.y));
      refPoints.push(new vec2.Vec2(b.x, b.y));
      if (rxnArrow.RxnArrow.isElliptical(item) && height !== undefined) {
        var middlePoint = findMiddlePoint(height, a, b);
        refPoints.push(middlePoint);
      }
      return refPoints;
    }
  }, {
    key: "makeAdditionalInfo",
    value: function makeAdditionalInfo(restruct) {
      var scaleFactor = restruct.render.options.microModeScale;
      var refPoints = this.getReferencePoints();
      var selectionSet = restruct.render.paper.set();
      refPoints.forEach(function (rp) {
        var scaledRP = scale.Scale.modelToCanvas(rp, restruct.render.options);
        selectionSet.push(restruct.render.paper.circle(scaledRP.x, scaledRP.y, scaleFactor / 8).attr({
          fill: 'black'
        }));
      });
      return selectionSet;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, _paper, styles) {
      var render = restruct.render;
      var options = restruct.render.options;
      var selectionSet = restruct.render.paper.set();
      selectionSet.push(render.paper.path(this.generatePath(render, options, 'selection')).attr(styles.selectionStyle));
      return selectionSet;
    }
  }, {
    key: "generatePath",
    value: function generatePath(render, options, type) {
      var path;
      var item = this.item;
      var height = rxnArrow.RxnArrow.isElliptical(item) && item.height ? item.height * options.microModeScale : 0;
      var pos = item.pos.map(function (p) {
        return scale.Scale.modelToCanvas(p, options) || new vec2.Vec2();
      });
      var _this$getArrowParams = this.getArrowParams(pos[0].x, pos[0].y, pos[1].x, pos[1].y),
        length = _this$getArrowParams.length,
        angle = _this$getArrowParams.angle;
      switch (type) {
        case 'selection':
          path = draw["default"].rectangleArrowHighlightAndSelection(render.paper, {
            pos: pos,
            height: height
          }, length, angle);
          break;
        case 'arrow':
          path = draw["default"].arrow(render.paper, _objectSpread(_objectSpread({}, item), {}, {
            pos: pos,
            height: height
          }), length, angle, options, this.isResizing);
          break;
      }
      return path;
    }
  }, {
    key: "getArrowParams",
    value: function getArrowParams(x1, y1, x2, y2) {
      var length = Math.hypot(x2 - x1, y2 - y1);
      var angle = raphaelExt["default"].angle(x1, y1, x2, y2) - 180;
      return {
        length: length,
        angle: angle
      };
    }
  }, {
    key: "show",
    value: function show(restruct, _id, options) {
      var _path$node, _path$node2;
      var path = this.generatePath(restruct.render, options, 'arrow');
      (_path$node = path.node) === null || _path$node === void 0 || _path$node.setAttribute('data-testid', 'rxn-arrow');
      (_path$node2 = path.node) === null || _path$node2 === void 0 || _path$node2.setAttribute('data-arrowtype', this.item.mode + '-arrow');
      if (typeof this.item.arrowId === 'number') {
        var _path$node3;
        (_path$node3 = path.node) === null || _path$node3 === void 0 || _path$node3.setAttribute('data-arrow-id', String(this.item.arrowId));
      }
      var offset = options.offset;
      if (offset != null) path.translateAbs(offset.x, offset.y);
      this.visel.add(path, box2Abs.Box2Abs.fromRelBox(util["default"].relBox(path.getBBox())));
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReRxnArrow;
}(reobject["default"]);
function findMiddlePoint(height, a, b) {
  if (+toFixed.toFixed(height) === 0) {
    var minX = Math.min(a.x, b.x);
    var minY = Math.min(a.y, b.y);
    var x = minX + Math.abs(a.x - b.x) / 2;
    var y = minY + Math.abs(a.y - b.y) / 2;
    return new vec2.Vec2(x, y);
  }
  var length = Math.hypot(b.x - a.x, b.y - a.y);
  var lengthHyp = Math.hypot(length / 2, height);
  var coordinates1 = util["default"].calcCoordinates(a, b, lengthHyp).pos1;
  var coordinates2 = util["default"].calcCoordinates(a, b, lengthHyp).pos2;
  if (height > 0) {
    if (b.x < a.x) {
      return new vec2.Vec2(coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.x, coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.y);
    }
    if (b.x > a.x) {
      return new vec2.Vec2(coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.x, coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.y);
    }
    if (b.x === a.x) {
      if (b.y > a.y) {
        return new vec2.Vec2(coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.x, coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.y);
      }
      if (b.y < a.y) {
        return new vec2.Vec2(coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.x, coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.y);
      }
      if (b.y === a.y) {
        return new vec2.Vec2(a.x, a.y);
      }
    }
  } else {
    if (b.x > a.x) {
      return new vec2.Vec2(coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.x, coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.y);
    }
    if (b.x < a.x) {
      return new vec2.Vec2(coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.x, coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.y);
    }
    if (b.x === a.x) {
      if (b.y > a.y) {
        return new vec2.Vec2(coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.x, coordinates1 === null || coordinates1 === void 0 ? void 0 : coordinates1.y);
      }
      if (b.y < a.y) {
        return new vec2.Vec2(coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.x, coordinates2 === null || coordinates2 === void 0 ? void 0 : coordinates2.y);
      }
      if (b.y === a.y) {
        return new vec2.Vec2(a.x, a.y);
      }
    }
  }
  return new vec2.Vec2(a.x, a.y);
}

exports["default"] = ReRxnArrow;
//# sourceMappingURL=rerxnarrow.js.map
