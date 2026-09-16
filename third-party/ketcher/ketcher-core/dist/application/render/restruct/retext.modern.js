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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
import _inherits from '@babel/runtime/helpers/inherits';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { Box2Abs } from '../../../domain/entities/box2Abs.modern.js';
import { Vec2 } from '../../../domain/entities/vec2.modern.js';
import { flatten } from 'lodash/fp';
import { LayerMap } from './generalEnumTypes.modern.js';
import ReObject from './reobject.modern.js';
import { removeFirstLineVerticalShift } from './retext.utils.modern.js';
import { Scale } from '../../../domain/helpers/scale.modern.js';
import '../../../domain/helpers/functionalGroupsProvider.modern.js';
import '../../../domain/helpers/saltsAndSolventsProvider.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/helpers/attachmentPointCalculations.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var IS_BOLD = 1;
var IS_ITALIC = 2;
var IS_SUBSCRIPT = 32;
var IS_SUPERSCRIPT = 64;
var SCALE = 40;
var ReText = function (_ReObject) {
  _inherits(ReText, _ReObject);
  function ReText(text) {
    var _this;
    _classCallCheck(this, ReText);
    _this = _callSuper(this, ReText, ['text']);
    _defineProperty(_assertThisInitialized(_this), "item", void 0);
    _defineProperty(_assertThisInitialized(_this), "paths", []);
    _this.item = text;
    return _this;
  }
  _createClass(ReText, [{
    key: "getReferencePoints",
    value: function getReferencePoints() {
      if (!this.paths.length) return [];
      var _this$getRelBox = this.getRelBox(this.paths),
        p0 = _this$getRelBox.p0,
        p1 = _this$getRelBox.p1;
      var p = this.item.position;
      var width = Math.abs(Vec2.diff(p0, p1).x) / SCALE;
      var height = Math.abs(Vec2.diff(p0, p1).y) / SCALE;
      var refPoints = [];
      refPoints.push(this.item.position, new Vec2(p.x, p.y + height), new Vec2(p.x + width, p.y + height), new Vec2(p.x + width, p.y));
      return refPoints;
    }
  }, {
    key: "getVBoxObj",
    value: function getVBoxObj() {
      var _this$getReferencePoi = this.getReferencePoints(),
        _this$getReferencePoi2 = _slicedToArray(_this$getReferencePoi, 3),
        leftTopPoint = _this$getReferencePoi2[0];
        _this$getReferencePoi2[1];
        var rightBottomPoint = _this$getReferencePoi2[2];
      return new Box2Abs(leftTopPoint, rightBottomPoint);
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
      var topEdge = Math.min.apply(Math, _toConsumableArray(firstRow.map(function (path) {
        return path.getBBox().y;
      })));
      var widestRow = paths.reduce(function (widestRow, nextRow) {
        return _this2.getRowWidth(nextRow) > _this2.getRowWidth(widestRow) ? nextRow : widestRow;
      }, paths[0]);
      var lastElOfWidestRow = widestRow[widestRow.length - 1];
      var rightEdge = lastElOfWidestRow.getBBox().x + lastElOfWidestRow.getBBox().width;
      var lastRow = paths[paths.length - 1];
      var bottomEdge = Math.max.apply(Math, _toConsumableArray(lastRow.map(function (path) {
        return path.getBBox().y + path.getBBox().height;
      })));
      return {
        p0: new Vec2(leftEdge, topEdge),
        p1: new Vec2(rightEdge, bottomEdge)
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
      render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret);
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
      var paperScale = Scale.modelToCanvas(this.item.position, options);
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
            removeFirstLineVerticalShift(path.node);
            row.push(path);
            shiftX += path.getBBox().width;
          });
        }
        _this3.paths.push(row);
        var _this3$getRelBox = _this3.getRelBox([row]),
          p0 = _this3$getRelBox.p0,
          p1 = _this3$getRelBox.p1;
        shiftY += Math.abs(Vec2.diff(p0, p1).y);
      });
      this.item.setPos(this.getReferencePoints());
      render.ctab.addReObjectPath(LayerMap.data, this.visel, flatten(this.paths), null, true);
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
}(ReObject);

export { ReText as default };
//# sourceMappingURL=retext.modern.js.map
