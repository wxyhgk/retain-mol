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
import { Vec2 } from './vec2.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';

var HalfBond = _createClass(function HalfBond(begin, end, bid) {
  _classCallCheck(this, HalfBond);
  _defineProperty(this, "begin", void 0);
  _defineProperty(this, "end", void 0);
  _defineProperty(this, "bid", void 0);
  _defineProperty(this, "dir", void 0);
  _defineProperty(this, "norm", void 0);
  _defineProperty(this, "ang", void 0);
  _defineProperty(this, "p", void 0);
  _defineProperty(this, "loop", void 0);
  _defineProperty(this, "contra", void 0);
  _defineProperty(this, "next", void 0);
  _defineProperty(this, "leftSin", void 0);
  _defineProperty(this, "leftCos", void 0);
  _defineProperty(this, "leftNeighbor", void 0);
  _defineProperty(this, "rightSin", void 0);
  _defineProperty(this, "rightCos", void 0);
  _defineProperty(this, "rightNeighbor", void 0);
  assert(arguments.length === 3, 'Invalid parameter number.');
  this.begin = begin;
  this.end = end;
  this.bid = bid;
  this.dir = new Vec2();
  this.norm = new Vec2();
  this.ang = 0;
  this.p = new Vec2();
  this.loop = -1;
  this.contra = -1;
  this.next = -1;
  this.leftSin = 0;
  this.leftCos = 0;
  this.leftNeighbor = 0;
  this.rightSin = 0;
  this.rightCos = 0;
  this.rightNeighbor = 0;
});

export { HalfBond };
//# sourceMappingURL=halfBond.modern.js.map
