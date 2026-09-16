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

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var remoteStructService = require('./remoteStructService.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

var RemoteStructServiceProvider = function () {
  function RemoteStructServiceProvider(apiPath, customHeaders) {
    _classCallCheck__default["default"](this, RemoteStructServiceProvider);
    _defineProperty__default["default"](this, "apiPath", void 0);
    _defineProperty__default["default"](this, "mode", 'remote');
    _defineProperty__default["default"](this, "customHeaders", void 0);
    var currentApiPath = apiPath;
    this.customHeaders = customHeaders;
    var params = new URLSearchParams(document.location.search);
    if (params.has('api_path')) {
      var _params$get;
      currentApiPath = (_params$get = params.get('api_path')) !== null && _params$get !== void 0 ? _params$get : currentApiPath;
    }
    this.apiPath = !currentApiPath || currentApiPath.endsWith('/') ? currentApiPath : currentApiPath + '/';
  }
  _createClass__default["default"](RemoteStructServiceProvider, [{
    key: "createStructService",
    value: function createStructService(options) {
      return new remoteStructService.RemoteStructService(this.apiPath, options, this.customHeaders);
    }
  }]);
  return RemoteStructServiceProvider;
}();

exports.RemoteStructServiceProvider = RemoteStructServiceProvider;
//# sourceMappingURL=remoteStructServiceProvider.js.map
