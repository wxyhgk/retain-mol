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
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _possibleConstructorReturn = require('@babel/runtime/helpers/possibleConstructorReturn');
var _getPrototypeOf = require('@babel/runtime/helpers/getPrototypeOf');
var _assertThisInitialized = require('@babel/runtime/helpers/assertThisInitialized');
var _inherits = require('@babel/runtime/helpers/inherits');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var box2Abs = require('../../../domain/entities/box2Abs.js');
var vec2 = require('../../../domain/entities/vec2.js');
var fp = require('lodash/fp');
var generalEnumTypes = require('./generalEnumTypes.js');
var reobject = require('./reobject.js');
var retext_utils = require('./retext.utils.js');
var scale = require('../../../domain/helpers/scale.js');
require('../../../domain/helpers/functionalGroupsProvider.js');
require('../../../domain/helpers/saltsAndSolventsProvider.js');
require('../../../domain/constants/generics.js');
require('../../../domain/helpers/attachmentPointCalculations.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
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
var IS_BOLD = 1;
var IS_ITALIC = 2;
var IS_SUBSCRIPT = 32;
var IS_SUPERSCRIPT = 64;
var SCALE = 40;
var ReText = function (_ReObject) {
  _inherits__default["default"](ReText, _ReObject);
  function ReText(text) {
    var _this;
    _classCallCheck__default["default"](this, ReText);
    _this = _callSuper(this, ReText, ['text']);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "item", void 0);
    _defineProperty__default["default"](_assertThisInitialized__default["default"](_this), "paths", []);
    _this.item = text;
    return _this;
  }
  _createClass__default["default"](ReText, [{
    key: "getReferencePoints",
    value: function getReferencePoints() {
      if (!this.paths.length) return [];
      var _this$getRelBox = this.getRelBox(this.paths),
        p0 = _this$getRelBox.p0,
        p1 = _this$getRelBox.p1;
      var p = this.item.position;
      var width = Math.abs(vec2.Vec2.diff(p0, p1).x) / SCALE;
      var height = Math.abs(vec2.Vec2.diff(p0, p1).y) / SCALE;
      var refPoints = [];
      refPoints.push(this.item.position, new vec2.Vec2(p.x, p.y + height), new vec2.Vec2(p.x + width, p.y + height), new vec2.Vec2(p.x + width, p.y));
      return refPoints;
    }
  }, {
    key: "getVBoxObj",
    value: function getVBoxObj() {
      var _this$getReferencePoi = this.getReferencePoints(),
        _this$getReferencePoi2 = _slicedToArray__default["default"](_this$getReferencePoi, 3),
        leftTopPoint = _this$getReferencePoi2[0];
        _this$getReferencePoi2[1];
        var rightBottomPoint = _this$getReferencePoi2[2];
      return new box2Abs.Box2Abs(leftTopPoint, rightBottomPoint);
    }
  }, {
    key: "hoverPath",
    value: function hoverPath(render) {
      var _this$getRelBox2 = this.getRelBox(this.paths),
        p0 = _this$getRelBox2.p0,
        p1 = _this$getRelBox2.p1;
      var topLeft = p0.sub(render.options.offset);
      var _p1$sub = p1.sub(p0),
        width = _p1$sub.x,
        height = _p1$sub.y;
      return render.paper.rect(topLeft.x, topLeft.y, width, height, 5);
    }
  }, {
    key: "getRelBox",
    value: function getRelBox(paths) {
      var _this2 = this;
      var firstElOfFirstRow = paths[0][0];
      var leftEdge = firstElOfFirstRow.getBBox().x;
      var firstRow = paths[0];
      var topEdge = Math.min.apply(Math, _toConsumableArray__default["default"](firstRow.map(function (path) {
        return path.getBBox().y;
      })));
      var widestRow = paths.reduce(function (widestRow, nextRow) {
        return _this2.getRowWidth(nextRow) > _this2.getRowWidth(widestRow) ? nextRow : widestRow;
      }, paths[0]);
      var lastElOfWidestRow = widestRow[widestRow.length - 1];
      var rightEdge = lastElOfWidestRow.getBBox().x + lastElOfWidestRow.getBBox().width;
      var lastRow = paths[paths.length - 1];
      var bottomEdge = Math.max.apply(Math, _toConsumableArray__default["default"](lastRow.map(function (path) {
        return path.getBBox().y + path.getBBox().height;
      })));
      return {
        p0: new vec2.Vec2(leftEdge, topEdge),
        p1: new vec2.Vec2(rightEdge, bottomEdge)
      };
    }
  }, {
    key: "getRowWidth",
    value: function getRowWidth(row) {
      return row.reduce(function (rowWidth, nextRow) {
        rowWidth += nextRow.getBBox().width;
        return rowWidth;
      }, 0);
    }
  }, {
    key: "drawHover",
    value: function drawHover(render) {
      if (!this.paths.length) return null;
      var ret = this.hoverPath(render).attr(render.options.hoverStyle);
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.hovering, this.visel, ret);
      return ret;
    }
  }, {
    key: "makeSelectionPlate",
    value: function makeSelectionPlate(restruct, paper, options) {
      if (!this.paths.length || !paper) return null;
      return this.hoverPath(restruct.render).attr(options.selectionStyle);
    }
  }, {
    key: "show",
    value: function show(restruct, _id, options) {
      var _editorState,
        _this3 = this;
      var render = restruct.render;
      var paper = render.paper;
      var paperScale = scale.Scale.modelToCanvas(this.item.position, options);
      var shiftY = 0;
      this.paths = [];
      var editorState = null;
      try {
        if (this.item.content) {
          var parsed = JSON.parse(this.item.content);
          if (parsed !== null && parsed !== void 0 && parsed.root) {
            editorState = parsed;
          } else {
          }
        }
      } catch (error) {
      }
      if (!((_editorState = editorState) !== null && _editorState !== void 0 && _editorState.root)) {
        return;
      }
      var paragraphs = editorState.root.children.filter(function (child) {
        return child.type === 'paragraph';
      });
      paragraphs.forEach(function (paragraph) {
        var textNodes = paragraph.children.filter(function (child) {
          return child.type === 'text';
        });
        var shiftX = 0;
        var row = [];
        if (textNodes.length === 0) {
          var path = paper.text(paperScale.x, paperScale.y, "\xA0").attr({
            font: options.font,
            'font-size': options.fontszInPx,
            'text-anchor': 'start',
            fill: '#000000'
          });
          path.node.setAttribute('data-testid', 'text-label');
          path.node.setAttribute('data-text-id', restruct.molecule.texts.keyOf(_this3.item));
          path.translateAbs(0, shiftY);
          row.push(path);
        } else {
          textNodes.forEach(function (textNode) {
            var styles = _this3.getStylesFromTextNode(textNode, options);
            var text = textNode.text.replace(/[^\S\r\n]/g, "\xA0") || "\xA0";
            var path = paper.text(paperScale.x, paperScale.y, text).attr(_objectSpread({
              font: options.font,
              'font-size': options.fontszInPx,
              'text-anchor': 'start',
              fill: '#000000'
            }, styles));
            path.node.setAttribute('data-testid', 'text-label');
            path.node.setAttribute('data-text-id', restruct.molecule.texts.keyOf(_this3.item));
            path.translateAbs(shiftX, shiftY + (styles.shiftY || 0));
            retext_utils.removeFirstLineVerticalShift(path.node);
            row.push(path);
            shiftX += path.getBBox().width;
          });
        }
        _this3.paths.push(row);
        var _this3$getRelBox = _this3.getRelBox([row]),
          p0 = _this3$getRelBox.p0,
          p1 = _this3$getRelBox.p1;
        shiftY += Math.abs(vec2.Vec2.diff(p0, p1).y);
      });
      this.item.setPos(this.getReferencePoints());
      render.ctab.addReObjectPath(generalEnumTypes.LayerMap.data, this.visel, fp.flatten(this.paths), null, true);
    }
  }, {
    key: "getStylesFromTextNode",
    value: function getStylesFromTextNode(textNode, options) {
      var _customFontSize, _customFontSize2;
      var styles = {};
      var format = textNode.format || 0;
      var customFontSize = null;
      if (textNode.style) {
        var fontSizeMatch = /font-size:\s*(\d+(?:\.\d+)?)px/.exec(textNode.style);
        if (fontSizeMatch) {
          customFontSize = parseFloat(fontSizeMatch[1]);
          styles['font-size'] = customFontSize + 'px';
        }
      }
      if (format & IS_BOLD) {
        styles['font-weight'] = 'bold';
      }
      if (format & IS_ITALIC) {
        styles['font-style'] = 'italic';
      }
      var fontsz = (_customFontSize = customFontSize) !== null && _customFontSize !== void 0 ? _customFontSize : options.fontszInPx;
      var fontszsub = ((_customFontSize2 = customFontSize) !== null && _customFontSize2 !== void 0 ? _customFontSize2 : options.fontszsubInPx) * 0.5;
      if (format & IS_SUBSCRIPT) {
        styles['font-size'] = fontszsub + 'px';
        styles.shiftY = fontsz / 4;
      }
      if (format & IS_SUPERSCRIPT) {
        styles['font-size'] = fontszsub + 'px';
        styles.shiftY = -fontsz / 3;
      }
      return styles;
    }
  }], [{
    key: "isSelectable",
    value: function isSelectable() {
      return true;
    }
  }]);
  return ReText;
}(reobject["default"]);

exports["default"] = ReText;
//# sourceMappingURL=retext.js.map
