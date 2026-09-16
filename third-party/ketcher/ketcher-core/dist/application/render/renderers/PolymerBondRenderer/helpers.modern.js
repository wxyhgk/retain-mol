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
var CORNER_LENGTH = 4;
var DOUBLE_CORNER_LENGTH = CORNER_LENGTH * 2;
var generateCornerFromTopToRight = function generateCornerFromTopToRight() {
  return "c 0,4.418 3.582,".concat(CORNER_LENGTH, " ").concat(CORNER_LENGTH, ",").concat(CORNER_LENGTH);
};
var generateCornerFromLeftToTop = function generateCornerFromLeftToTop() {
  return "c 4.418,0 ".concat(CORNER_LENGTH, ",-3.582 ").concat(CORNER_LENGTH, ",-").concat(CORNER_LENGTH);
};
var generateCornerFromBottomToRight = function generateCornerFromBottomToRight() {
  return "c 0,-4.418 3.582,-".concat(CORNER_LENGTH, " ").concat(CORNER_LENGTH, ",-").concat(CORNER_LENGTH);
};
var generateCornerFromBottomToLeft = function generateCornerFromBottomToLeft() {
  return "c 0,-4.418 -3.582,-".concat(CORNER_LENGTH, " -").concat(CORNER_LENGTH, ",-").concat(CORNER_LENGTH);
};
var generateCornerFromLeftToBottom = function generateCornerFromLeftToBottom() {
  return "c 4.418,0 ".concat(CORNER_LENGTH, ",3.582 ").concat(CORNER_LENGTH, ",").concat(CORNER_LENGTH);
};
var generateCornerFromTopToLeft = function generateCornerFromTopToLeft() {
  return "c 0,4.418 -3.582,".concat(CORNER_LENGTH, " -").concat(CORNER_LENGTH, ",").concat(CORNER_LENGTH);
};
var generateCornerFromRightToTop = function generateCornerFromRightToTop() {
  return "c -4.418,0 -".concat(CORNER_LENGTH, ",-3.582 -").concat(CORNER_LENGTH, ",-").concat(CORNER_LENGTH);
};
var generateCornerFromRightToBottom = function generateCornerFromRightToBottom() {
  return "c -4.418,0 -".concat(CORNER_LENGTH, ",3.582 -").concat(CORNER_LENGTH, ",").concat(CORNER_LENGTH);
};

export { CORNER_LENGTH, DOUBLE_CORNER_LENGTH, generateCornerFromBottomToLeft, generateCornerFromBottomToRight, generateCornerFromLeftToBottom, generateCornerFromLeftToTop, generateCornerFromRightToBottom, generateCornerFromRightToTop, generateCornerFromTopToLeft, generateCornerFromTopToRight };
//# sourceMappingURL=helpers.modern.js.map
