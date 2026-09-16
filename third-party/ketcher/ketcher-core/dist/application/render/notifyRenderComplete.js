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

var _ = require('lodash');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

var notifyRenderComplete = ___default["default"].debounce(function () {
  var event = new Event('renderComplete');
  window.dispatchEvent(event);
}, 250);
var notifyItemsToMergeInitializationComplete = function notifyItemsToMergeInitializationComplete() {
  var event = new Event('itemsToMergeInitializationComplete');
  window.dispatchEvent(event);
};

exports.notifyItemsToMergeInitializationComplete = notifyItemsToMergeInitializationComplete;
exports.notifyRenderComplete = notifyRenderComplete;
//# sourceMappingURL=notifyRenderComplete.js.map
