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

var IS_BOLD = 1;
var IS_ITALIC = 2;
var IS_SUBSCRIPT = 32;
var IS_SUPERSCRIPT = 64;
function convertDraftToLexical(draftState) {
  if (!draftState.blocks || draftState.blocks.length === 0) {
    return {
      root: {
        type: 'root',
        children: []
      }
    };
  }
  var children = draftState.blocks.map(function (block) {
    var textChildren = [];
    if (block.text.length === 0) {
      textChildren.push({
        type: 'text',
        text: '',
        format: 0,
        style: '',
        version: 1
      });
    } else {
      var segments = buildTextSegments(block.text, block.inlineStyleRanges || []);
      segments.forEach(function (segment) {
        textChildren.push({
          type: 'text',
          text: segment.text,
          format: segment.format,
          style: segment.style,
          version: 1
        });
      });
    }
    return {
      type: 'paragraph',
      children: textChildren,
      version: 1
    };
  });
  return {
    root: {
      type: 'root',
      children: children,
      version: 1
    }
  };
}
function buildTextSegments(text, styleRanges) {
  var charStyles = Array.from({
    length: text.length
  }, function () {
    return {
      format: 0,
      style: ''
    };
  });
  styleRanges.forEach(function (range) {
    var startIdx = range.offset;
    var endIdx = Math.min(range.offset + range.length, text.length);
    for (var i = startIdx; i < endIdx; i++) {
      applyStyleToChar(charStyles[i], range.style);
    }
  });
  var segments = [];
  var currentSegment = null;
  for (var i = 0; i < text.length; i++) {
    var charStyle = charStyles[i];
    var _char = text[i];
    if (!currentSegment || currentSegment.format !== charStyle.format || currentSegment.style !== charStyle.style) {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = {
        text: _char,
        format: charStyle.format,
        style: charStyle.style
      };
    } else {
      currentSegment.text += _char;
    }
  }
  if (currentSegment) {
    segments.push(currentSegment);
  }
  return segments;
}
function applyStyleToChar(charStyle, styleString) {
  switch (styleString) {
    case 'BOLD':
      charStyle.format |= IS_BOLD;
      break;
    case 'ITALIC':
      charStyle.format |= IS_ITALIC;
      break;
    case 'SUBSCRIPT':
      charStyle.format |= IS_SUBSCRIPT;
      break;
    case 'SUPERSCRIPT':
      charStyle.format |= IS_SUPERSCRIPT;
      break;
    default:
      {
        var match = /^CUSTOM_FONT_SIZE_(\d+)px$/.exec(styleString);
        if (match) {
          var size = match[1];
          charStyle.style += "font-size:".concat(size, "px;");
        }
        break;
      }
  }
}

exports.convertDraftToLexical = convertDraftToLexical;
//# sourceMappingURL=draftToLexical.js.map
