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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
import { SupportedFormat } from './structFormatter.types.modern.js';
import { KetSerializer } from '../../domain/serializers/ket/ketSerializer.modern.js';
import { MolSerializer } from '../../domain/serializers/mol/molSerializer.modern.js';
import { KetFormatter } from './ketFormatter.modern.js';
import { ServerFormatter } from './serverFormatter.modern.js';
import { MolfileV2000Formatter } from './molfileV2000Formatter.modern.js';
import { exceedsMolfileV2000Limit } from './constants.modern.js';
import { Mol2Formatter } from './mol2Formatter.modern.js';
import { ExtendedXYZFormatter, XYZFormatter } from './xyzFormatter.modern.js';
import { QCSchemaFormatter } from './qcSchemaFormatter.modern.js';

var _excluded = ["reactionRelayout", "badHeaderRecover", "ignoreChiralFlag"];
function _classPrivateFieldInitSpec(e, t, a) { _checkPrivateRedeclaration(e, t), t.set(e, a); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
var _structService = new WeakMap();
var FormatterFactory = function () {
  function FormatterFactory(structService) {
    _classCallCheck(this, FormatterFactory);
    _classPrivateFieldInitSpec(this, _structService, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _structService, structService);
  }
  _createClass(FormatterFactory, [{
    key: "separateOptions",
    value: function separateOptions(options) {
      if (!options) {
        return [{}, {}];
      }
      var reactionRelayout = options.reactionRelayout,
        badHeaderRecover = options.badHeaderRecover,
        ignoreChiralFlag = options.ignoreChiralFlag,
        structServiceOptions = _objectWithoutProperties(options, _excluded);
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
        _this$separateOptions2 = _slicedToArray(_this$separateOptions, 2),
        molSerializerOptions = _this$separateOptions2[0],
        structServiceOptions = _this$separateOptions2[1];
      var formatter;
      switch (format) {
        case SupportedFormat.ket:
          formatter = new KetFormatter(new KetSerializer());
          break;
        case SupportedFormat.mol:
          if (queryPropertiesAreUsed) {
            formatter = new ServerFormatter(_classPrivateFieldGet(this, _structService), new KetSerializer(), format, structServiceOptions);
          } else if (struct && exceedsMolfileV2000Limit(struct)) {
            formatter = new ServerFormatter(_classPrivateFieldGet(this, _structService), new KetSerializer(), SupportedFormat.molAuto, structServiceOptions);
          } else {
            formatter = new MolfileV2000Formatter(new MolSerializer(molSerializerOptions));
          }
          break;
        case SupportedFormat.mol2:
          formatter = new Mol2Formatter();
          break;
        case SupportedFormat.xyz:
          formatter = new XYZFormatter();
          break;
        case SupportedFormat.extendedXYZ:
          formatter = new ExtendedXYZFormatter();
          break;
        case SupportedFormat.qcSchema:
          formatter = new QCSchemaFormatter();
          break;
        case SupportedFormat.cml:
        case SupportedFormat.inChIAuxInfo:
        case SupportedFormat.inChI:
        case SupportedFormat.inChIKey:
        case SupportedFormat.molV3000:
        case SupportedFormat.smiles:
        case SupportedFormat.rxnV3000:
        case SupportedFormat.smilesExt:
        case SupportedFormat.smarts:
        case SupportedFormat.cdxml:
        case SupportedFormat.cdx:
        case SupportedFormat.binaryCdx:
        case SupportedFormat.unknown:
        case SupportedFormat.rxn:
        default:
          formatter = new ServerFormatter(_classPrivateFieldGet(this, _structService), new KetSerializer(), format, structServiceOptions);
      }
      return formatter;
    }
  }]);
  return FormatterFactory;
}();

export { FormatterFactory };
//# sourceMappingURL=formatterFactory.modern.js.map
