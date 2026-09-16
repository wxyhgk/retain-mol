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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { getNodeWithInvertedYCoord } from '../helpers.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var IS_BOLD = 1;
var IS_ITALIC = 2;
var IS_SUBSCRIPT = 32;
var IS_SUPERSCRIPT = 64;
function applyFontStyleOverrides(target, child) {
  var _child$format;
  var format = (_child$format = child.format) !== null && _child$format !== void 0 ? _child$format : 0;
  if (format & IS_BOLD) target.bold = true;
  if (format & IS_ITALIC) target.italic = true;
  if (format & IS_SUPERSCRIPT) target.superscript = true;
  if (format & IS_SUBSCRIPT) target.subscript = true;
  var font = {};
  var hasFont = false;
  if (child.font !== undefined) {
    font.family = child.font;
    hasFont = true;
  }
  if (child.style) {
    var fontSizeMatch = /font-size:\s*(\d+(?:\.\d+)?)px/.exec(child.style);
    if (fontSizeMatch) {
      font.size = parseFloat(fontSizeMatch[1]);
      hasFont = true;
    }
  }
  if (hasFont) {
    target.font = font;
  }
  if (child.style) {
    var colorMatch = /(?:^|;)\s*color:\s*(#[0-9A-Fa-f]+)/.exec(child.style);
    if (colorMatch) {
      target.color = colorMatch[1];
    }
  }
}
function textToKet(textNode) {
  var convertToKET20Text = function convertToKET20Text(source) {
    var pos = source.pos;
    var x = pos[0].x;
    var y = pos[0].y;
    var width = pos[2].x - pos[0].x;
    var height = Math.abs(pos[1].y - pos[0].y);
    var textContent = JSON.parse(source.content);
    var root = textContent.root;
    if (!root) {
      return {
        type: 'text',
        data: source
      };
    }
    var ketText = {
      type: 'text',
      boundingBox: {
        x: x,
        y: y,
        width: width,
        height: height
      },
      paragraphs: []
    };
    if (root.alignment !== undefined) ketText.alignment = root.alignment;
    if (root.indent !== undefined) ketText.indent = root.indent;
    if (root.font !== undefined) ketText.font = root.font;
    if (root.color !== undefined) ketText.color = root.color;
    if (root.bold !== undefined) ketText.bold = root.bold;
    if (root.italic !== undefined) ketText.italic = root.italic;
    if (root.superscript !== undefined) ketText.superscript = root.superscript;
    if (root.subscript !== undefined) ketText.subscript = root.subscript;
    ketText.paragraphs = (root.children || []).map(function (paragraph) {
      var paraObj = {
        parts: []
      };
      if (paragraph.alignment !== undefined) paraObj.alignment = paragraph.alignment;
      if (paragraph.indent !== undefined) paraObj.indent = paragraph.indent;
      if (paragraph.font !== undefined) paraObj.font = paragraph.font;
      if (paragraph.color !== undefined) paraObj.color = paragraph.color;
      if (paragraph.bold !== undefined) paraObj.bold = paragraph.bold;
      if (paragraph.italic !== undefined) paraObj.italic = paragraph.italic;
      if (paragraph.superscript !== undefined) paraObj.superscript = paragraph.superscript;
      if (paragraph.subscript !== undefined) paraObj.subscript = paragraph.subscript;
      paraObj.parts = (paragraph.children || []).map(function (child) {
        if (child.type !== 'text' || child.text === undefined) return null;
        var part = {
          text: child.text
        };
        applyFontStyleOverrides(part, child);
        return part;
      }).filter(function (p) {
        return Boolean(p);
      });
      return paraObj;
    });
    return ketText;
  };
  return _objectSpread({
    selected: textNode.selected
  }, convertToKET20Text(getNodeWithInvertedYCoord(textNode.data)));
}

export { textToKet };
//# sourceMappingURL=textToKet.modern.js.map
