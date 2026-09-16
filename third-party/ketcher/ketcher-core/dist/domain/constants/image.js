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

var IMAGE_KEY = 'images';
var IMAGE_SERIALIZE_KEY = 'image';
var CURSOR_DIAGONAL_NWSE = 'nwse-resize';
var CURSOR_DIAGONAL_NESW = 'nesw-resize';
var CURSOR_VERTICAL = 'ns-resize';
var CURSOR_HORIZONTAL = 'ew-resize';
var imageReferencePositionToCursor = {
  topLeftPosition: CURSOR_DIAGONAL_NWSE,
  topMiddlePosition: CURSOR_VERTICAL,
  topRightPosition: CURSOR_DIAGONAL_NESW,
  rightMiddlePosition: CURSOR_HORIZONTAL,
  bottomRightPosition: CURSOR_DIAGONAL_NWSE,
  bottomMiddlePosition: CURSOR_VERTICAL,
  bottomLeftPosition: CURSOR_DIAGONAL_NESW,
  leftMiddlePosition: CURSOR_HORIZONTAL
};

exports.IMAGE_KEY = IMAGE_KEY;
exports.IMAGE_SERIALIZE_KEY = IMAGE_SERIALIZE_KEY;
exports.imageReferencePositionToCursor = imageReferencePositionToCursor;
//# sourceMappingURL=image.js.map
