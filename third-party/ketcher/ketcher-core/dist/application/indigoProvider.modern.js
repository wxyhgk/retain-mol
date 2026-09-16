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

var indigo;
var IndigoProvider = function () {
  function IndigoProvider() {
    _classCallCheck(this, IndigoProvider);
  }
  _createClass(IndigoProvider, null, [{
    key: "getIndigo",
    value: function getIndigo() {
      return indigo;
    }
  }, {
    key: "setIndigo",
    value: function setIndigo(newIndigo) {
      indigo = newIndigo;
    }
  }]);
  return IndigoProvider;
}();

export { IndigoProvider };
//# sourceMappingURL=indigoProvider.modern.js.map
