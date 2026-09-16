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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import './formatters/supportedFormatProperties.modern.js';
import './formatters/formatProperties.modern.js';
import './formatters/structFormatter.types.modern.js';
import { FormatterFactory } from './formatters/formatterFactory.modern.js';
import './formatters/mol2Formatter.modern.js';
import './formatters/xyzFormatter.modern.js';
import './formatters/qcSchemaFormatter.modern.js';
import '../utilities/runAsyncAction.modern.js';
import '../utilities/KetcherLogger.modern.js';
import '../utilities/SettingsManager.modern.js';
import '../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../utilities/clipboardUtils.modern.js';
import { assert } from '../utilities/assert.modern.js';
import './formatters/types/ket.modern.js';
import { Ketcher } from './ketcher.modern.js';
import { ketcherProvider } from './ketcherProvider.modern.js';
import './settings/types.modern.js';
import { SettingsService } from './settings/SettingsService.modern.js';
import { LocalStorageAdapter } from './settings/LocalStorageAdapter.modern.js';
import './settings/MemoryStorageAdapter.modern.js';
import './settings/SchemaValidator.modern.js';
import './settings/SettingsMigration.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var DefaultStructServiceOptions = {
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'ignore-no-chiral-flag': false
};
var _structServiceProvider = new WeakMap();
var _settingsService = new WeakMap();
var _storageAdapter = new WeakMap();
var _initialSettings = new WeakMap();
var KetcherBuilder = function () {
  function KetcherBuilder() {
    _classCallCheck(this, KetcherBuilder);
    _classPrivateFieldInitSpec(this, _structServiceProvider, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _settingsService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _storageAdapter, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _initialSettings, {
      writable: true,
      value: void 0
    });
  }
  _createClass(KetcherBuilder, [{
    key: "withStructServiceProvider",
    value: function withStructServiceProvider(structServiceProvider) {
      _classPrivateFieldSet(this, _structServiceProvider, structServiceProvider);
      return this;
    }
  }, {
    key: "withSettingsService",
    value: function withSettingsService(settingsService) {
      _classPrivateFieldSet(this, _settingsService, settingsService);
      return this;
    }
  }, {
    key: "withStorageAdapter",
    value: function withStorageAdapter(storageAdapter) {
      _classPrivateFieldSet(this, _storageAdapter, storageAdapter);
      return this;
    }
  }, {
    key: "withSettings",
    value: function withSettings(settings) {
      _classPrivateFieldSet(this, _initialSettings, settings);
      return this;
    }
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(serviceOptions) {
        var structServiceProvider, mergedServiceOptions, structService, settingsService, ketcher;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              assert(_classPrivateFieldGet(this, _structServiceProvider) !== undefined);
              structServiceProvider = _classPrivateFieldGet(this, _structServiceProvider);
              mergedServiceOptions = _objectSpread(_objectSpread({}, DefaultStructServiceOptions), serviceOptions);
              structService = structServiceProvider.createStructService(mergedServiceOptions);
              settingsService = _classPrivateFieldGet(this, _settingsService);
              if (settingsService) {
                _context.next = 9;
                break;
              }
              _context.next = 8;
              return SettingsService.getInstance({
                storage: _classPrivateFieldGet(this, _storageAdapter) || new LocalStorageAdapter(),
                defaults: _classPrivateFieldGet(this, _initialSettings),
                autoSave: true,
                migrateOnLoad: true
              });
            case 8:
              settingsService = _context.sent;
            case 9:
              ketcher = new Ketcher(structService, new FormatterFactory(structService), settingsService);
              structService.addKetcherId(ketcher.id);
              ketcher[structServiceProvider.mode] = true;
              ketcherProvider.addKetcherInstance(ketcher);
              return _context.abrupt("return", ketcher);
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function build(_x) {
        return _build.apply(this, arguments);
      }
      return build;
    }()
  }]);
  return KetcherBuilder;
}();

export { DefaultStructServiceOptions, KetcherBuilder };
//# sourceMappingURL=ketcherBuilder.modern.js.map
