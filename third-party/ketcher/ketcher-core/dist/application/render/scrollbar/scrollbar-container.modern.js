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
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import { ScrollOffset } from './scroll-offset.modern.js';
import { VerticalScrollbar } from './scrollbar-vertical.modern.js';
import { HorizontalScrollbar } from './scrollbar-horizontal.modern.js';

function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _scrollOffset = new WeakMap();
var _verticalBar = new WeakMap();
var _horizontalBar = new WeakMap();
var ScrollbarContainer = function () {
  function ScrollbarContainer(render) {
    _classCallCheck(this, ScrollbarContainer);
    _classPrivateFieldInitSpec(this, _scrollOffset, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _verticalBar, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _horizontalBar, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _scrollOffset, new ScrollOffset(render));
    _classPrivateFieldSet(this, _verticalBar, new VerticalScrollbar(render, _classPrivateFieldGet(this, _scrollOffset)));
    _classPrivateFieldSet(this, _horizontalBar, new HorizontalScrollbar(render, _classPrivateFieldGet(this, _scrollOffset)));
  }
  _createClass(ScrollbarContainer, [{
    key: "destroy",
    value: function destroy() {
      _classPrivateFieldGet(this, _verticalBar).destroy();
      _classPrivateFieldGet(this, _horizontalBar).destroy();
    }
  }, {
    key: "update",
    value: function update() {
      _classPrivateFieldGet(this, _scrollOffset).update();
      _classPrivateFieldGet(this, _verticalBar).update();
      _classPrivateFieldGet(this, _horizontalBar).update();
    }
  }]);
  return ScrollbarContainer;
}();

export { ScrollbarContainer };
//# sourceMappingURL=scrollbar-container.modern.js.map
