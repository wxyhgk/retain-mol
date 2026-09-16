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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { RemoteStructService } from './remoteStructService.modern.js';

var RemoteStructServiceProvider = function () {
  function RemoteStructServiceProvider(apiPath, customHeaders) {
    _classCallCheck(this, RemoteStructServiceProvider);
    _defineProperty(this, "apiPath", void 0);
    _defineProperty(this, "mode", 'remote');
    _defineProperty(this, "customHeaders", void 0);
    var currentApiPath = apiPath;
    this.customHeaders = customHeaders;
    var params = new URLSearchParams(document.location.search);
    if (params.has('api_path')) {
      var _params$get;
      currentApiPath = (_params$get = params.get('api_path')) !== null && _params$get !== void 0 ? _params$get : currentApiPath;
    }
    this.apiPath = !currentApiPath || currentApiPath.endsWith('/') ? currentApiPath : currentApiPath + '/';
  }
  _createClass(RemoteStructServiceProvider, [{
    key: "createStructService",
    value: function createStructService(options) {
      return new RemoteStructService(this.apiPath, options, this.customHeaders);
    }
  }]);
  return RemoteStructServiceProvider;
}();

export { RemoteStructServiceProvider };
//# sourceMappingURL=remoteStructServiceProvider.modern.js.map
