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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';

var KetcherProvider = function () {
  function KetcherProvider() {
    _classCallCheck(this, KetcherProvider);
    _defineProperty(this, "ketcherInstances", new Map());
  }
  _createClass(KetcherProvider, [{
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
        return _toConsumableArray(this.ketcherInstances.values())[this.ketcherInstances.size - 1];
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

export { ketcherProvider };
//# sourceMappingURL=ketcherProvider.modern.js.map
