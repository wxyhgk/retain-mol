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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _classPrivateFieldGet = require('@babel/runtime/helpers/classPrivateFieldGet');
var _classPrivateFieldSet = require('@babel/runtime/helpers/classPrivateFieldSet');
var structFormatter_types = require('./structFormatter.types.js');
var ketSerializer = require('../../domain/serializers/ket/ketSerializer.js');
var molSerializer = require('../../domain/serializers/mol/molSerializer.js');
var ketFormatter = require('./ketFormatter.js');
var serverFormatter = require('./serverFormatter.js');
var molfileV2000Formatter = require('./molfileV2000Formatter.js');
var constants = require('./constants.js');
var mol2Formatter = require('./mol2Formatter.js');
var xyzFormatter = require('./xyzFormatter.js');
var qcSchemaFormatter = require('./qcSchemaFormatter.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _objectWithoutProperties__default = /*#__PURE__*/_interopDefaultLegacy(_objectWithoutProperties);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _classPrivateFieldGet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldGet);
var _classPrivateFieldSet__default = /*#__PURE__*/_interopDefaultLegacy(_classPrivateFieldSet);

var _excluded = ["reactionRelayout", "badHeaderRecover", "ignoreChiralFlag"];
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _structService = new WeakMap();
var FormatterFactory = function () {
  function FormatterFactory(structService) {
    _classCallCheck__default["default"](this, FormatterFactory);
    _classPrivateFieldInitSpec(this, _structService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet__default["default"](this, _structService, structService);
  }
  _createClass__default["default"](FormatterFactory, [{
    key: "separateOptions",
    value: function separateOptions(options) {
      if (!options) {
        return [{}, {}];
      }
      var reactionRelayout = options.reactionRelayout,
        badHeaderRecover = options.badHeaderRecover,
        ignoreChiralFlag = options.ignoreChiralFlag,
        structServiceOptions = _objectWithoutProperties__default["default"](options, _excluded);
      var molfileParseOptions = {};
      if (typeof reactionRelayout === 'boolean') {
        molfileParseOptions.reactionRelayout = reactionRelayout;
      }
      if (typeof badHeaderRecover === 'boolean') {
        molfileParseOptions.badHeaderRecover = badHeaderRecover;
      }
      if (typeof ignoreChiralFlag === 'boolean') {
        molfileParseOptions.ignoreChiralFlag = ignoreChiralFlag;
        structServiceOptions['ignore-no-chiral-flag'] = ignoreChiralFlag;
      }
      return [molfileParseOptions, structServiceOptions];
    }
  }, {
    key: "create",
    value: function create(format, options, queryPropertiesAreUsed, struct) {
      var _this$separateOptions = this.separateOptions(options),
        _this$separateOptions2 = _slicedToArray__default["default"](_this$separateOptions, 2),
        molSerializerOptions = _this$separateOptions2[0],
        structServiceOptions = _this$separateOptions2[1];
      var formatter;
      switch (format) {
        case structFormatter_types.SupportedFormat.ket:
          formatter = new ketFormatter.KetFormatter(new ketSerializer.KetSerializer());
          break;
        case structFormatter_types.SupportedFormat.mol:
          if (queryPropertiesAreUsed) {
            formatter = new serverFormatter.ServerFormatter(_classPrivateFieldGet__default["default"](this, _structService), new ketSerializer.KetSerializer(), format, structServiceOptions);
          } else if (struct && constants.exceedsMolfileV2000Limit(struct)) {
            formatter = new serverFormatter.ServerFormatter(_classPrivateFieldGet__default["default"](this, _structService), new ketSerializer.KetSerializer(), structFormatter_types.SupportedFormat.molAuto, structServiceOptions);
          } else {
            formatter = new molfileV2000Formatter.MolfileV2000Formatter(new molSerializer.MolSerializer(molSerializerOptions));
          }
          break;
        case structFormatter_types.SupportedFormat.mol2:
          formatter = new mol2Formatter.Mol2Formatter();
          break;
        case structFormatter_types.SupportedFormat.xyz:
          formatter = new xyzFormatter.XYZFormatter();
          break;
        case structFormatter_types.SupportedFormat.extendedXYZ:
          formatter = new xyzFormatter.ExtendedXYZFormatter();
          break;
        case structFormatter_types.SupportedFormat.qcSchema:
          formatter = new qcSchemaFormatter.QCSchemaFormatter();
          break;
        case structFormatter_types.SupportedFormat.cml:
        case structFormatter_types.SupportedFormat.inChIAuxInfo:
        case structFormatter_types.SupportedFormat.inChI:
        case structFormatter_types.SupportedFormat.inChIKey:
        case structFormatter_types.SupportedFormat.molV3000:
        case structFormatter_types.SupportedFormat.smiles:
        case structFormatter_types.SupportedFormat.rxnV3000:
        case structFormatter_types.SupportedFormat.smilesExt:
        case structFormatter_types.SupportedFormat.smarts:
        case structFormatter_types.SupportedFormat.cdxml:
        case structFormatter_types.SupportedFormat.cdx:
        case structFormatter_types.SupportedFormat.binaryCdx:
        case structFormatter_types.SupportedFormat.unknown:
        case structFormatter_types.SupportedFormat.rxn:
        default:
          formatter = new serverFormatter.ServerFormatter(_classPrivateFieldGet__default["default"](this, _structService), new ketSerializer.KetSerializer(), format, structServiceOptions);
      }
      return formatter;
    }
  }]);
  return FormatterFactory;
}();

exports.FormatterFactory = FormatterFactory;
//# sourceMappingURL=formatterFactory.js.map
