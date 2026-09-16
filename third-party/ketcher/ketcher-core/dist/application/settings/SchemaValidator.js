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
var jsonschema = require('jsonschema');
var schema = require('./schema.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var SchemaValidator = function () {
  function SchemaValidator() {
    _classCallCheck__default["default"](this, SchemaValidator);
    _defineProperty__default["default"](this, "validator", void 0);
    _defineProperty__default["default"](this, "fullSchema", void 0);
    _defineProperty__default["default"](this, "partialSchema", void 0);
    this.validator = new jsonschema.Validator();
    this.fullSchema = schema.SCHEMA;
    this.partialSchema = _objectSpread(_objectSpread({}, schema.SCHEMA), {}, {
      required: []
    });
  }
  _createClass__default["default"](SchemaValidator, [{
    key: "validate",
    value: function validate(settings) {
      var result = this.validator.validate(settings, this.fullSchema, {
        base: 'https://ketcher.local/'
      });
      if (result.valid) {
        return {
          valid: true
        };
      }
      var errors = this.convertJsonSchemaErrors(result.errors);
      return {
        valid: false,
        errors: errors
      };
    }
  }, {
    key: "validatePartial",
    value: function validatePartial(partial) {
      var result = this.validator.validate(partial, this.partialSchema, {
        base: 'https://ketcher.local/'
      });
      if (result.valid) {
        return {
          valid: true
        };
      }
      var errors = this.convertJsonSchemaErrors(result.errors);
      return {
        valid: false,
        errors: errors
      };
    }
  }, {
    key: "convertJsonSchemaErrors",
    value: function convertJsonSchemaErrors(jsonSchemaErrors) {
      var _this = this;
      return jsonSchemaErrors.map(function (error) {
        return {
          path: _this.getErrorPath(error),
          message: error.message || 'Validation error',
          value: error.instance
        };
      });
    }
  }, {
    key: "getErrorPath",
    value: function getErrorPath(error) {
      if (error.path.length === 0) {
        return '';
      }
      return "/".concat(error.path.map(this.escapeJsonPointerToken).join('/'));
    }
  }, {
    key: "escapeJsonPointerToken",
    value: function escapeJsonPointerToken(token) {
      return String(token).replace(/~/g, '~0').replace(/\//g, '~1');
    }
  }]);
  return SchemaValidator;
}();

exports.SchemaValidator = SchemaValidator;
//# sourceMappingURL=SchemaValidator.js.map
