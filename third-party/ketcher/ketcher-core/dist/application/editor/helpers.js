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

var ketSerializer = require('../../domain/serializers/ket/ketSerializer.js');
require('@babel/runtime/helpers/typeof');
require('../../domain/entities/Axis.js');
require('../../domain/entities/vec2.js');
require('lodash');
require('../formatters/types/ket.js');
require('../../domain/constants/elements.js');
require('../../domain/constants/element.types.js');
require('../../domain/constants/generics.js');
require('../../domain/constants/chains.js');
require('../../domain/constants/monomers.js');
require('../../domain/helpers/monomers.js');
require('../../domain/serializers/mol/molSerializer.js');
require('../../domain/serializers/sdf/sdfSerializer.js');
require('../../utilities/runAsyncAction.js');
require('../../utilities/KetcherLogger.js');
require('../../utilities/SettingsManager.js');
require('../../utilities/keynorm.js');
require('react-device-detect');
require('../../utilities/clipboardUtils.js');
var monomers = require('../../utilities/monomers.js');

var parseMonomersLibrary = function parseMonomersLibrary(monomersDataRaw) {
  var monomersLibraryParsedJson = typeof monomersDataRaw === 'string' ? JSON.parse(monomersDataRaw) : monomersDataRaw;
  var serializer = new ketSerializer.KetSerializer();
  var monomersLibrary = serializer.convertMonomersLibrary(monomersLibraryParsedJson);
  return {
    monomersLibraryParsedJson: monomersLibraryParsedJson,
    monomersLibrary: monomersLibrary
  };
};
exports.MonomerNameValidationErrorType = void 0;
(function (MonomerNameValidationErrorType) {
  MonomerNameValidationErrorType["Empty"] = "empty";
  MonomerNameValidationErrorType["TooLong"] = "tooLong";
  MonomerNameValidationErrorType["InvalidCharacters"] = "invalidCharacters";
})(exports.MonomerNameValidationErrorType || (exports.MonomerNameValidationErrorType = {}));
var MONOMER_NAME_ALLOWED_CHARACTERS_REGEXP = /^[A-Za-z0-9_*-]+$/;
var validateMonomerName = function validateMonomerName(monomerName) {
  if (!(monomerName !== null && monomerName !== void 0 && monomerName.trim())) {
    return {
      isValid: false,
      error: exports.MonomerNameValidationErrorType.Empty
    };
  }
  if (monomerName.length > monomers.MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: exports.MonomerNameValidationErrorType.TooLong
    };
  }
  if (!MONOMER_NAME_ALLOWED_CHARACTERS_REGEXP.test(monomerName)) {
    return {
      isValid: false,
      error: exports.MonomerNameValidationErrorType.InvalidCharacters
    };
  }
  return {
    isValid: true
  };
};
var getEmptyMonomersLibraryJson = function getEmptyMonomersLibraryJson() {
  var emptyMonomersLibraryJson = {
    root: {
      templates: [],
      nodes: [],
      connections: []
    }
  };
  return emptyMonomersLibraryJson;
};

exports.getEmptyMonomersLibraryJson = getEmptyMonomersLibraryJson;
exports.parseMonomersLibrary = parseMonomersLibrary;
exports.validateMonomerName = validateMonomerName;
//# sourceMappingURL=helpers.js.map
