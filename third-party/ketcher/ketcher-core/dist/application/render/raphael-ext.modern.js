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
import { Vec2 } from '../../domain/entities/vec2.modern.js';

var raphaelModule = typeof window !== 'undefined' ?
require('raphael') : undefined;
function resolveRaphael() {
  if (!raphaelModule) {
    return undefined;
  }
  return typeof raphaelModule === 'function' ? raphaelModule : raphaelModule["default"];
}
var Raphael = resolveRaphael();
if (Raphael) {
  Raphael.el.translateAbs = function (x, y) {
    this.delta = this.delta || new Vec2();
    this.delta.x += x - 0;
    this.delta.y += y - 0;
    this.transform('t' + this.delta.x.toString() + ',' + this.delta.y.toString());
  };
  Raphael.st.translateAbs = function (x, y) {
    this.forEach(function (el) {
      el.translateAbs(x, y);
    });
  };
}

export { Raphael as default };
//# sourceMappingURL=raphael-ext.modern.js.map
