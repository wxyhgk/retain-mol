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

var text = require('../../../entities/text.js');
var helpers = require('../helpers.js');
var draftToLexical = require('../../../../application/render/restruct/draftToLexical.js');

var IS_BOLD = 1;
var IS_ITALIC = 2;
var IS_SUBSCRIPT = 32;
var IS_SUPERSCRIPT = 64;
function convertKetV2ToInternal(ketText) {
  var boundingBox = ketText.boundingBox,
    paragraphs = ketText.paragraphs;
  var x = boundingBox.x,
    y = boundingBox.y,
    z = boundingBox.z,
    width = boundingBox.width,
    height = boundingBox.height;
  var pos = [{
    x: x,
    y: y,
    z: z
  }, {
    x: x,
    y: y + height,
    z: z
  }, {
    x: x + width,
    y: y + height,
    z: z
  }, {
    x: x + width,
    y: y,
    z: z
  }];
  var lexicalRoot = {
    root: {
      children: paragraphs.map(function (para) {
        var paragraphNode = {
          children: (para.parts || []).map(function (part) {
            var _part$font, _part$font2;
            var format = 0;
            if (part.bold) format |= IS_BOLD;
            if (part.italic) format |= IS_ITALIC;
            if (part.subscript) format |= IS_SUBSCRIPT;
            if (part.superscript) format |= IS_SUPERSCRIPT;
            var textNode = {
              detail: 0,
              format: format,
              mode: 'normal',
              style: '',
              text: part.text,
              type: 'text',
              version: 1
            };
            var styles = [];
            if ((_part$font = part.font) !== null && _part$font !== void 0 && _part$font.size) {
              styles.push("font-size: ".concat(part.font.size, "px"));
            }
            if (part.color) {
              styles.push("color: ".concat(part.color));
            }
            if (styles.length > 0) {
              textNode.style = styles.join('; ');
            }
            if ((_part$font2 = part.font) !== null && _part$font2 !== void 0 && _part$font2.family) {
              textNode.font = part.font.family;
            }
            return textNode;
          }),
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
          textFormat: 0,
          textStyle: ''
        };
        if (para.alignment) {
          paragraphNode.format = para.alignment;
        }
        return paragraphNode;
      }),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1
    }
  };
  return {
    position: {
      x: x,
      y: y,
      z: z
    },
    pos: pos,
    content: JSON.stringify(lexicalRoot)
  };
}
function isKetV2Format(ketItem) {
  return ketItem && ketItem.boundingBox !== undefined && ketItem.paragraphs !== undefined;
}
function textToStruct(ketItem, struct) {
  var node;
  if (isKetV2Format(ketItem)) {
    var internal = convertKetV2ToInternal(ketItem);
    node = helpers.getNodeWithInvertedYCoord(internal);
  } else {
    var _node;
    node = helpers.getNodeWithInvertedYCoord(ketItem.data);
    if ((_node = node) !== null && _node !== void 0 && _node.content) {
      try {
        var parsed = typeof node.content === 'string' ? JSON.parse(node.content) : node.content;
        if (parsed && Array.isArray(parsed.blocks)) {
          var lexical = draftToLexical.convertDraftToLexical(parsed);
          node.content = JSON.stringify(lexical);
        }
      } catch (_e) {
      }
    }
  }
  var text$1 = new text.Text(node);
  text$1.setInitiallySelected(ketItem.selected);
  struct.texts.add(text$1);
  return struct;
}

exports.textToStruct = textToStruct;
//# sourceMappingURL=textToStruct.js.map
