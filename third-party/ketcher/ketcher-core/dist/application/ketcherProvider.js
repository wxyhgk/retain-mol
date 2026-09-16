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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var KetcherProvider = function () {
  function KetcherProvider() {
    _classCallCheck__default["default"](this, KetcherProvider);
    _defineProperty__default["default"](this, "ketcherInstances", new Map());
  }
  _createClass__default["default"](KetcherProvider, [{
    key: "addKetcherInstance",
    value: function addKetcherInstance(instance) {
      this.ketcherInstances.set(instance.id, instance);
    }
  }, {
    key: "removeKetcherInstance",
    value: function removeKetcherInstance(id) {
      this.ketcherInstances["delete"](id);
    }
  }, {
    key: "getIndexById",
    value: function getIndexById(id) {
      return Array.from(this.ketcherInstances.keys()).indexOf(id);
    }
  }, {
    key: "getKetcher",
    value: function getKetcher(id) {
      if (!id) {
        return _toConsumableArray__default["default"](this.ketcherInstances.values())[this.ketcherInstances.size - 1];
      }
      var ketcher = this.ketcherInstances.get(id);
      if (!ketcher) {
        throw Error("couldn't find ketcher instance ".concat(id));
      }
      return ketcher;
    }
  }]);
  return KetcherProvider;
}();
var ketcherProvider = new KetcherProvider();

exports.ketcherProvider = ketcherProvider;
//# sourceMappingURL=ketcherProvider.js.map
