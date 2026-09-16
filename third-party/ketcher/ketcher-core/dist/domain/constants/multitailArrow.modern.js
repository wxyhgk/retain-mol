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
var MULTITAIL_ARROW_KEY = 'multitailArrows';
var MULTITAIL_ARROW_TOOL_NAME = 'reaction-arrow-multitail';
var MULTITAIL_ARROW_SERIALIZE_KEY = 'multi-tailed-arrow';
var MOVE = 'move';
var CURSOR_RESIZE_VERTICAL = 'ns-resize';
var CURSOR_RESIZE_HORIZONTAL = 'ew-resize';
var multitailReferencePositionToCursor = {
  topTail: CURSOR_RESIZE_HORIZONTAL,
  tails: CURSOR_RESIZE_HORIZONTAL,
  bottomTail: CURSOR_RESIZE_HORIZONTAL,
  topSpine: MOVE,
  bottomSpine: MOVE,
  head: CURSOR_RESIZE_HORIZONTAL
};
var multitailArrowReferenceLinesToCursor = {
  topTail: CURSOR_RESIZE_VERTICAL,
  bottomTail: CURSOR_RESIZE_VERTICAL,
  tails: CURSOR_RESIZE_VERTICAL,
  head: CURSOR_RESIZE_VERTICAL,
  spine: MOVE
};

export { MULTITAIL_ARROW_KEY, MULTITAIL_ARROW_SERIALIZE_KEY, MULTITAIL_ARROW_TOOL_NAME, multitailArrowReferenceLinesToCursor, multitailReferencePositionToCursor };
//# sourceMappingURL=multitailArrow.modern.js.map
