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
import { Bond } from './bond.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { assert } from '../../utilities/assert.modern.js';

var Loop = _createClass(function Loop(hbs, struct, isConvex) {
  var _this = this;
  _classCallCheck(this, Loop);
  _defineProperty(this, "hbs", void 0);
  _defineProperty(this, "dblBonds", void 0);
  _defineProperty(this, "aromatic", void 0);
  _defineProperty(this, "convex", void 0);
  this.hbs = hbs;
  this.dblBonds = 0;
  this.aromatic = true;
  this.convex = isConvex || false;
  hbs.forEach(function (hb) {
    var halfBond = struct.halfBonds.get(hb);
    assert(halfBond, "Expected half-bond ".concat(hb, " to exist when constructing loop"));
    var bond = struct.bonds.get(halfBond.bid);
    assert(bond, "Expected bond ".concat(halfBond.bid, " to exist for half-bond ").concat(hb, " when constructing loop"));
    if (bond.type !== Bond.PATTERN.TYPE.AROMATIC) _this.aromatic = false;
    if (bond.type === Bond.PATTERN.TYPE.DOUBLE) _this.dblBonds++;
  });
});

export { Loop };
//# sourceMappingURL=loop.modern.js.map
