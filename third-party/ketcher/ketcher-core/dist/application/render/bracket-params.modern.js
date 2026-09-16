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
import _createClass from '@babel/runtime/helpers/createClass';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

var BracketParams = _createClass(function BracketParams(center, bracketAngleDirection, width, height, bracketDirection) {
  _classCallCheck(this, BracketParams);
  _defineProperty(this, "center", void 0);
  _defineProperty(this, "bracketAngleDirection", void 0);
  _defineProperty(this, "bracketDirection", void 0);
  _defineProperty(this, "width", void 0);
  _defineProperty(this, "height", void 0);
  this.center = center;
  this.bracketAngleDirection = bracketAngleDirection;
  this.bracketDirection = bracketDirection || bracketAngleDirection.rotateSC(1, 0);
  this.width = width;
  this.height = height;
});

export { BracketParams as default };
//# sourceMappingURL=bracket-params.modern.js.map
