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
var molfile = require('./molfile.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var ketSerializer = require('../ket/ketSerializer.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var MolSerializer = function () {
  function MolSerializer(options) {
    _classCallCheck__default["default"](this, MolSerializer);
    _defineProperty__default["default"](this, "options", void 0);
    this.options = _objectSpread(_objectSpread({}, MolSerializer.DefaultOptions), options);
  }
  _createClass__default["default"](MolSerializer, [{
    key: "deserialize",
    value: function deserialize(content) {
      var molfile$1 = new molfile.Molfile();
      var lines = content === null || content === void 0 ? void 0 : content.split(/\r\n|[\n\r]/g);
      var parseCTFileParams = {
        molfileLines: lines,
        shouldReactionRelayout: this.options.reactionRelayout,
        ignoreChiralFlag: this.options.ignoreChiralFlag
      };
      try {
        return molfile$1.parseCTFile(parseCTFileParams);
      } catch (e) {
        KetcherLogger.KetcherLogger.error('molSerializer::MolSerializer::deserialize', e);
        if (this.options.badHeaderRecover) {
          try {
            return molfile$1.parseCTFile(_objectSpread(_objectSpread({}, parseCTFileParams), {}, {
              molfileLines: lines.slice(1)
            }));
          } catch (e1) {
            KetcherLogger.KetcherLogger.error('molSerializer::MolSerializer::deserialize', e1);
          }
          try {
            return molfile$1.parseCTFile(_objectSpread(_objectSpread({}, parseCTFileParams), {}, {
              molfileLines: [''].concat(lines)
            }));
          } catch (e2) {
            KetcherLogger.KetcherLogger.error('molSerializer::MolSerializer::deserialize', e2);
          }
        }
        throw e;
      }
    }
  }, {
    key: "serialize",
    value: function serialize(_struct) {
      var struct = ketSerializer.KetSerializer.removeLeavingGroupsFromConnectedAtoms(_struct);
      return new molfile.Molfile().saveMolecule(struct, this.options.ignoreErrors, this.options.noRgroups, this.options.preserveIndigoDesc);
    }
  }]);
  return MolSerializer;
}();
_defineProperty__default["default"](MolSerializer, "DefaultOptions", {
  badHeaderRecover: false,
  ignoreErrors: false,
  noRgroups: false,
  preserveIndigoDesc: false,
  reactionRelayout: false
});

exports.MolSerializer = MolSerializer;
//# sourceMappingURL=molSerializer.js.map
