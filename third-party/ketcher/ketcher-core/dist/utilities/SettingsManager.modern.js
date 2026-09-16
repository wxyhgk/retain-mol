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
import { KetcherLogger } from './KetcherLogger.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var KETCHER_SAVED_SETTINGS_KEY = 'ketcher_editor_saved_settings';
var KETCHER_SAVED_OPTIONS_KEY = 'ketcher-opts';
var DefaultEditorLineLength = {
  'sequence-layout-mode': 30,
  'snake-layout-mode': 0
};
var SetEditorLineLengthAction = 'SetEditorLineLength';
var SettingsManager = function () {
  function SettingsManager() {
    _classCallCheck(this, SettingsManager);
  }
  _createClass(SettingsManager, null, [{
    key: "getSettings",
    value: function getSettings() {
      try {
        var _localStorage$getItem;
        return JSON.parse((_localStorage$getItem = localStorage.getItem(KETCHER_SAVED_SETTINGS_KEY)) !== null && _localStorage$getItem !== void 0 ? _localStorage$getItem : '{}');
      } catch (e) {
        KetcherLogger.error('settingsManager.ts::SettingsManager::getSettings', e);
        return {};
      }
    }
  }, {
    key: "saveSettings",
    value: function saveSettings(settings) {
      if (!settings) {
        return;
      }
      localStorage.setItem(KETCHER_SAVED_SETTINGS_KEY, JSON.stringify(settings));
    }
  }, {
    key: "getOptions",
    value: function getOptions() {
      try {
        var _localStorage$getItem2;
        var optionsFromLocalStorage = JSON.parse((_localStorage$getItem2 = localStorage.getItem(KETCHER_SAVED_OPTIONS_KEY)) !== null && _localStorage$getItem2 !== void 0 ? _localStorage$getItem2 : '{}');
        if (optionsFromLocalStorage.bondLength === 2.1 && optionsFromLocalStorage.bondLengthUnit === 'px') {
          optionsFromLocalStorage.bondLength = 40;
        }
        return optionsFromLocalStorage;
      } catch (e) {
        KetcherLogger.error('SettingsManager.ts::SettingsManager::getOptions', e);
        return {};
      }
    }
  }, {
    key: "saveOptions",
    value: function saveOptions(options) {
      if (!options) {
        return;
      }
      localStorage.setItem(KETCHER_SAVED_OPTIONS_KEY, JSON.stringify(options));
    }
  }, {
    key: "selectionTool",
    get: function get() {
      var _this$getSettings = this.getSettings(),
        selectionTool = _this$getSettings.selectionTool;
      return selectionTool;
    },
    set: function set(selectionTool) {
      var settings = this.getSettings();
      this.saveSettings(_objectSpread(_objectSpread({}, settings), {}, {
        selectionTool: selectionTool
      }));
    }
  }, {
    key: "editorLineLength",
    get: function get() {
      var _this$getSettings2 = this.getSettings(),
        editorLineLength = _this$getSettings2.editorLineLength;
      return _objectSpread(_objectSpread({}, DefaultEditorLineLength), editorLineLength);
    },
    set: function set(newEditorLineLength) {
      var _settings$editorLineL;
      var settings = this.getSettings();
      var previousEditorLineLength = (_settings$editorLineL = settings.editorLineLength) !== null && _settings$editorLineL !== void 0 ? _settings$editorLineL : DefaultEditorLineLength;
      var editorLineLength = _objectSpread(_objectSpread({}, previousEditorLineLength), newEditorLineLength);
      window.dispatchEvent(new CustomEvent(SetEditorLineLengthAction, {
        detail: editorLineLength
      }));
      this.saveSettings(_objectSpread(_objectSpread({}, settings), {}, {
        editorLineLength: editorLineLength
      }));
    }
  }, {
    key: "disableCustomQuery",
    get: function get() {
      return this.disableCustomQueryValue;
    },
    set: function set(disableCustomQuery) {
      this.disableCustomQueryValue = disableCustomQuery;
    }
  }, {
    key: "ignoreChiralFlag",
    get: function get() {
      var _this$getOptions = this.getOptions(),
        ignoreChiralFlag = _this$getOptions.ignoreChiralFlag;
      return ignoreChiralFlag;
    },
    set: function set(ignoreChiralFlag) {
      var options = this.getOptions();
      this.saveOptions(_objectSpread(_objectSpread({}, options), {}, {
        ignoreChiralFlag: ignoreChiralFlag
      }));
    }
  }, {
    key: "monomerLibraryUpdates",
    get: function get() {
      var _this$getSettings3 = this.getSettings(),
        monomerLibraryUpdates = _this$getSettings3.monomerLibraryUpdates;
      return monomerLibraryUpdates !== null && monomerLibraryUpdates !== void 0 ? monomerLibraryUpdates : [];
    },
    set: function set(monomerLibraryUpdates) {
      var settings = this.getSettings();
      this.saveSettings(_objectSpread(_objectSpread({}, settings), {}, {
        monomerLibraryUpdates: monomerLibraryUpdates
      }));
    }
  }, {
    key: "addMonomerLibraryUpdate",
    value: function addMonomerLibraryUpdate(newUpdate) {
      var updates = this.monomerLibraryUpdates;
      if (!updates.includes(newUpdate)) {
        updates.push(newUpdate);
        this.monomerLibraryUpdates = updates;
      }
    }
  }, {
    key: "persistMonomerLibraryUpdates",
    get: function get() {
      return this.persistMonomerLibraryUpdatesValue;
    },
    set: function set(value) {
      this.persistMonomerLibraryUpdatesValue = value !== null && value !== void 0 ? value : true;
    }
  }]);
  return SettingsManager;
}();
_defineProperty(SettingsManager, "disableCustomQueryValue", void 0);
_defineProperty(SettingsManager, "persistMonomerLibraryUpdatesValue", true);

export { KETCHER_SAVED_OPTIONS_KEY, KETCHER_SAVED_SETTINGS_KEY, SetEditorLineLengthAction, SettingsManager };
//# sourceMappingURL=SettingsManager.modern.js.map
