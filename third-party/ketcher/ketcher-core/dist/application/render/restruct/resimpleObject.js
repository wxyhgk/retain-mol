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
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var simpleObject = require('../../../domain/entities/simpleObject.js');
var vec2 = require('../../../domain/entities/vec2.js');
var generalEnumTypes = require('./generalEnumTypes.js');
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
var ReSimpleObject = function (_ReObject) {
  _inherits__default["default"](ReSimpleObject, _ReObject);
  function ReSimpleObject(simpleObject) {
    var _this;
    _classCallCheck__default["default"](this, ReSimpleObject);
    _this = _callSuper(this, ReSimpleObject, ['simpleObject']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "item", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionSet", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "selectionPointsSet", void 0);
    _this.item = simpleObject;
    return _this;
  }
  _createClass__default["default"](ReSimpleObject, [{
    key: "calcDistance",
    value: function calcDistance(p, s) {
      var point = new vec2.Vec2(p.x, p.y);
      var distRef = this.getReferencePointDistance(p);
      var item = this.item;
      var mode = item.mode;
      var pos = item.pos;
      var dist;
      switch (mode) {
        case simpleObject.SimpleObjectMode.ellipse:
          {
            var rad = vec2.Vec2.diff(pos[1], pos[0]);
            var rx = rad.x / 2;
            var ry = rad.y / 2;
            var center = vec2.Vec2.sum(pos[0], new vec2.Vec2(rx, ry));
            var pointToCenter = vec2.Vec2.diff(point, center);
            if (rx !== 0 && ry !== 0) {
              dist = Math.abs(1 - pointToCenter.x * pointToCenter.x / (rx * rx) - pointToCenter.y * pointToCenter.y / (ry * ry));
            } else {
              dist = point.calculateDistanceToLine([pos[0], pos[1]]);
            }
            break;
          }
        case simpleObject.SimpleObjectMode.rectangle:
          {
            var topX = Math.min(pos[0].x, pos[1].x);
            var topY = Math.min(pos[0].y, pos[1].y);
            var bottomX = Math.max(pos[0].x, pos[1].x);
            var bottomY = Math.max(pos[0].y, pos[1].y);
            var distances = [];
            if (point.x >= topX && point.x <= bottomX) {
              if (point.y < topY) {
                distances.push(topY - point.y);
              } else if (point.y > bottomY) {
                distances.push(point.y - bottomY);
              } else {
                distances.push(point.y - topY, bottomY - point.y);
              }
            }
            if (point.x < topX && point.y < topY) {
              distances.push(vec2.Vec2.dist(new vec2.Vec2(topX, topY), point));
            }
            if (point.x > bottomX && point.y > bottomY) {
              distances.push(vec2.Vec2.dist(new vec2.Vec2(bottomX, bottomY), point));
            }
            if (point.x < topX && point.y > bottomY) {
              distances.push(vec2.Vec2.dist(new vec2.Vec2(topX, bottomY), point));
            }
            if (point.x > bottomX && point.y < topY) {
              distances.push(vec2.Vec2.dist(new vec2.Vec2(bottomX, topY), point));
            }
            if (point.y >= topY && point.y <= bottomY) {
              if (point.x < topX) {
                distances.push(topX - point.x);
              } else if (point.x > bottomX) {
                distances.push(point.x - bottomX);
              } else {
                distances.push(point.x - topX, bottomX - point.x);
              }
            }
            dist = Math.min.apply(Math, distances);
            break;
          }
        case simpleObject.SimpleObjectMode.line:
          {
            dist = point.calculateDistanceToLine([pos[0], pos[1]]);
            break;
          }
        default:
          {
            throw new Error('Unsupported shape type');
          }
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
    key: "getReferencePoints",
    value: function getReferencePoints() {
      var refPoints = [];
      switch (this.item.mode) {
        case simpleObject.SimpleObjectMode.ellipse:
        case simpleObject.SimpleObjectMode.rectangle:
          {
            var p0 = new vec2.Vec2(Math.min(this.item.pos[0].x, this.item.pos[1].x), Math.min(this.item.pos[0].y, this.item.pos[1].y));
            var w = Math.abs(vec2.Vec2.diff(this.item.pos[0], this.item.pos[1]).x);
            var h = Math.abs(vec2.Vec2.diff(this.item.pos[0], this.item.pos[1]).y);
            refPoints.push(new vec2.Vec2(p0.x + 0.5 * w, p0.y), new vec2.Vec2(p0.x + w, p0.y + 0.5 * h), new vec2.Vec2(p0.x + 0.5 * w, p0.y + h), new vec2.Vec2(p0.x, p0.y + 0.5 * h));
            refPoints.push(p0, new vec2.Vec2(p0.x, p0.y + h), new vec2.Vec2(p0.x + w, p0.y + h), new vec2.Vec2(p0.x + w, p0.y));
            break;
          }
        case simpleObject.SimpleObjectMode.line:
          {
            this.item.pos.forEach(function (i) {
              return refPoints.push(new vec2.Vec2(i.x, i.y, 0));
            });
            break;
          }
        default:
          {
            throw new Error('Unsupported shape type');
          }
      }
      return refPoints;
    }
  }, {
    key: "getReferencePointsOnObject",
    value: function getReferencePointsOnObject() {
      var refPoints = [];
      switch (this.item.mode) {
        case simpleObject.SimpleObjectMode.ellipse:
        case simpleObject.SimpleObjectMode.rectangle:
          {
            var p0 = new vec2.Vec2(Math.min(this.item.pos[0].x, this.item.pos[1].x), Math.min(this.item.pos[0].y, this.item.pos[1].y));
            var w = Math.abs(vec2.Vec2.diff(this.item.pos[0], this.item.pos[1]).x);
            var h = Math.abs(vec2.Vec2.diff(this.item.pos[0], this.item.pos[1]).y);
            refPoints.push(new vec2.Vec2(p0.x + 0.5 * w, p0.y), new vec2.Vec2(p0.x + w, p0.y + 0.5 * h), new vec2.Vec2(p0.x + 0.5 * w, p0.y + h), new vec2.Vec2(p0.x, p0.y + 0.5 * h));
            if (this.item.mode === simpleObject.SimpleObjectMode.rectangle) {
              refPoints.push(p0, new vec2.Vec2(p0.x, p0.y + h), new vec2.Vec2(p0.x + w, p0.y + h), new vec2.Vec2(p0.x + w, p0.y));
            }
            break;
          }
        case simpleObject.SimpleObjectMode.line:
          {
            this.item.pos.forEach(function (i) {
              return refPoints.push(new vec2.Vec2(i.x, i.y, 0));
            });
            break;
          }
        default:
          {
            throw new Error('Unsupported shape type');
          }
      }
      return refPoints;
    }
  }, {
    key: "getBorderHoverPath",
    value: function getBorderHoverPath(path, render) {
      return path.attr(_objectSpread(_objectSpread({}, render.options.hoverStyle), {}, {
        fill: 'none'
      }));
    }
  }, {
    key: "getFillHoverPath",
    value: function getFillHoverPath(path, render) {
      return path.attr(render.options.innerHoverStyle);
    }
  }, {
    key: "hoverPath",
    value: function hoverPath(render) {
      var point = [];
      this.item.pos.forEach(function (p, index) {
        point[index] = scale.Scale.modelToCanvas(p, render.options);
      });
      var scaleFactor = render.options.microModeScale;
      var paths = [];
      var lineOffset = scaleFactor / 8;
      switch (this.item.mode) {
        case simpleObject.SimpleObjectMode.ellipse:
          {
            var rad = vec2.Vec2.diff(point[1], point[0]);
            var rx = rad.x / 2;
            var ry = rad.y / 2;
            var centerX = toFixed.toFixed(point[0].x + rx);
            var centerY = toFixed.toFixed(point[0].y + ry);
            var outerBorderEllipse = render.paper.ellipse(centerX, centerY, toFixed.toFixed(Math.abs(rx) + lineOffset), toFixed.toFixed(Math.abs(ry) + lineOffset));
            paths.push({
              path: this.getBorderHoverPath(outerBorderEllipse, render),
              stylesApplied: true
            });
            var fillEllipse = render.paper.ellipse(centerX, centerY, toFixed.toFixed(Math.abs(rx)), toFixed.toFixed(Math.abs(ry)));
            paths.push({
              path: this.getFillHoverPath(fillEllipse, render),
              stylesApplied: true
            });
            if (Math.abs(rx) - scaleFactor / 8 > 0 && Math.abs(ry) - scaleFactor / 8 > 0) {
              var innerBorderEllipse = render.paper.ellipse(centerX, centerY, toFixed.toFixed(Math.abs(rx) - lineOffset), toFixed.toFixed(Math.abs(ry) - lineOffset));
              paths.push({
                path: this.getBorderHoverPath(innerBorderEllipse, render),
                stylesApplied: true
              });
            }
            break;
          }
        case simpleObject.SimpleObjectMode.rectangle:
          {
            var leftX = Math.min(point[0].x, point[1].x);
            var topY = Math.min(point[0].y, point[1].y);
            var rightX = Math.max(point[0].x, point[1].x) - leftX;
            var bottomY = Math.max(point[0].y, point[1].y) - topY;
            var outerBorderRect = render.paper.rect(toFixed.toFixed(leftX - lineOffset), toFixed.toFixed(topY - lineOffset), toFixed.toFixed(rightX + 2 * lineOffset), toFixed.toFixed(bottomY + 2 * lineOffset));
            paths.push({
              path: this.getBorderHoverPath(outerBorderRect, render),
              stylesApplied: true
            });
            var fillRect = render.paper.rect(toFixed.toFixed(leftX), toFixed.toFixed(topY), toFixed.toFixed(rightX), toFixed.toFixed(bottomY));
            paths.push({
              path: this.getFillHoverPath(fillRect, render),
              stylesApplied: true
            });
            if (rightX - 2 * lineOffset > 0 && bottomY - 2 * lineOffset > 0) {
              var innerRect = render.paper.rect(toFixed.toFixed(leftX + lineOffset), toFixed.toFixed(topY + lineOffset), toFixed.toFixed(rightX - 2 * lineOffset), toFixed.toFixed(bottomY - 2 * lineOffset));
              paths.push({
                path: this.getBorderHoverPath(innerRect, render),
                stylesApplied: true
              });
            }
            break;
          }
        case simpleObject.SimpleObjectMode.line:
          {
            var poly = [];
            var angle = Math.atan((point[1].y - point[0].y) / (point[1].x - point[0].x));
            var p0 = {
              x: 0,
              y: 0
            };
            var p1 = {
              x: 0,
              y: 0
            };
            var k = point[0].x > point[1].x ? -1 : 1;
            p0.x = point[0].x - k * (scaleFactor / 8 * Math.cos(angle));
            p0.y = point[0].y - k * (scaleFactor / 8 * Math.sin(angle));
            p1.x = point[1].x + k * (scaleFactor / 8 * Math.cos(angle));
            p1.y = point[1].y + k * (scaleFactor / 8 * Math.sin(angle));
            poly.push('M', p0.x + k * scaleFactor / 8 * Math.sin(angle), p0.y - k * scaleFactor / 8 * Math.cos(angle));
            poly.push('L', p1.x + k * scaleFactor / 8 * Math.sin(angle), p1.y - k * scaleFactor / 8 * Math.cos(angle));
            poly.push('L', p1.x - k * scaleFactor / 8 * Math.sin(angle), p1.y + k * scaleFactor / 8 * Math.cos(angle));
            poly.push('L', p0.x - k * scaleFactor / 8 * Math.sin(angle), p0.y + k * scaleFactor / 8 * Math.cos(angle));
            poly.push('L', p0.x + k * scaleFactor / 8 * Math.sin(angle), p0.y - k * scaleFactor / 8 * Math.cos(angle));
            paths.push({
              path: render.paper.path(poly).attr(render.options.hoverStyle),
              stylesApplied: true
            });
            break;
          }
        default:
          {
            throw new Error('Unsupported shape type');
          }
      }
      return paths;
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      var paths = this.hoverPath(render).map(function (enhPath) {
        if (!enhPath.stylesApplied) {
          return enhPath.path.attr(render.options.hoverStyle);
        }
        return enhPath.path;
      });
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, paths);
      return paths;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, paper, styles) {
      var _this2 = this;
      var pos = this.item.pos.map(function (p) {
        return scale.Scale.modelToCanvas(p, restruct.render.options) || new vec2.Vec2();
      });
      var refPoints = this.getReferencePoints();
      var scaleFactor = restruct.render.options.microModeScale;
      this.selectionSet = restruct.render.paper.set();
      this.selectionPointsSet = restruct.render.paper.set();
      this.selectionSet.push(generatePath(this.item.mode, paper, [pos[0], pos[1]]).attr(styles.selectionStyleSimpleObject));
      refPoints.forEach(function (rp) {
        var scaledRP = scale.Scale.modelToCanvas(rp, restruct.render.options);
        _this2.selectionPointsSet.push(restruct.render.paper.circle(scaledRP.x, scaledRP.y, scaleFactor / 8).attr({
          fill: 'black'
        }));
      });
      restruct.addReObjectPath(generalEnumTypes.LayerMap.selectionPoints, this.visel, this.selectionPointsSet);
      return this.selectionSet;
    }
  }, {
    key: "showPoints",
    value: function showPoints() {
      var _this$selectionPoints;
      (_this$selectionPoints = this.selectionPointsSet) === null || _this$selectionPoints === void 0 || _this$selectionPoints.show();
    }
  }, {
    key: "hidePoints",
    value: function hidePoints() {
      var _this$selectionPoints2;
      (_this$selectionPoints2 = this.selectionPointsSet) === null || _this$selectionPoints2 === void 0 || _this$selectionPoints2.hide();
    }
  }, {
    key: "show",
    value: function show(restruct, options) {
      var render = restruct.render;
      var pos = this.item.pos.map(function (p) {
        return scale.Scale.modelToCanvas(p, options) || new vec2.Vec2();
      });
      var path = generatePath(this.item.mode, render.paper, [pos[0], pos[1]]);
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
  return ReSimpleObject;
}(reobject["default"]);
function generatePath(mode, paper, pos) {
  var path;
  switch (mode) {
    case simpleObject.SimpleObjectMode.ellipse:
      {
        path = draw["default"].ellipse(paper, pos);
        break;
      }
    case simpleObject.SimpleObjectMode.rectangle:
      {
        path = draw["default"].rectangle(paper, pos);
        break;
      }
    case simpleObject.SimpleObjectMode.line:
      {
        path = draw["default"].line(paper, pos);
        break;
      }
    default:
      {
        throw new Error('Unsupported shape type');
      }
  }
  return path;
}

exports["default"] = ReSimpleObject;
//# sourceMappingURL=resimpleObject.js.map
