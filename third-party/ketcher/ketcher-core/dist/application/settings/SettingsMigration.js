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

var _typeof = require('@babel/runtime/helpers/typeof');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
require('../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

var SettingsMigration = function () {
  function SettingsMigration() {
    _classCallCheck__default["default"](this, SettingsMigration);
  }
  _createClass__default["default"](SettingsMigration, null, [{
    key: "migrate",
    value:
    function migrate(stored) {
      if (!stored || _typeof__default["default"](stored) !== 'object') {
        return {};
      }
      var storedRecord = stored;
      if (this.isFlatFormat(storedRecord)) {
        return storedRecord;
      }
      return this.migrateFromNamespacedFormat(storedRecord);
    }
  }, {
    key: "isFlatFormat",
    value: function isFlatFormat(stored) {
      var flatKeys = ['resetToSelect', 'rotationStep', 'atomColoring', 'bondLength'];
      var categoryKeys = ['editor', 'render', 'server', 'debug', 'miew', 'macromolecules'];
      var hasFlatKeys = flatKeys.some(function (key) {
        return key in stored;
      });
      var hasCategoryKeys = categoryKeys.some(function (key) {
        return key in stored;
      });
      return hasFlatKeys && !hasCategoryKeys;
    }
  }, {
    key: "migrateFromNamespacedFormat",
    value: function migrateFromNamespacedFormat(old) {
      var flat = {};
      if (old.editor && _typeof__default["default"](old.editor) === 'object') {
        Object.assign(flat, old.editor);
      }
      if (old.render && _typeof__default["default"](old.render) === 'object') {
        Object.assign(flat, old.render);
      }
      if (old.server && _typeof__default["default"](old.server) === 'object') {
        Object.assign(flat, old.server);
      }
      if (old.debug && _typeof__default["default"](old.debug) === 'object') {
        Object.assign(flat, old.debug);
      }
      if (old.miew && _typeof__default["default"](old.miew) === 'object') {
        Object.assign(flat, old.miew);
      }
      if (old.macromolecules && _typeof__default["default"](old.macromolecules) === 'object') {
        Object.assign(flat, old.macromolecules);
      }
      return flat;
    }
  }, {
    key: "loadFromLegacyStorage",
    value: function loadFromLegacyStorage() {
      var keys = ['ketcher-opts', 'ketcher_editor_saved_settings'];
      for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
        var key = _keys[_i];
        try {
          if (typeof localStorage === 'undefined') {
            continue;
          }
          var item = localStorage.getItem(key);
          if (item) {
            var parsed = JSON.parse(item);
            return this.migrate(parsed);
          }
        } catch (error) {
          KetcherLogger.KetcherLogger.warn("Failed to load from legacy key ".concat(key, ":"), error);
        }
      }
      return null;
    }
  }]);
  return SettingsMigration;
}();

exports.SettingsMigration = SettingsMigration;
//# sourceMappingURL=SettingsMigration.js.map
