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
import { KetSerializer } from '../../domain/serializers/ket/ketSerializer.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../domain/entities/Axis.modern.js';
import '../../domain/entities/vec2.modern.js';
import 'lodash';
import '../formatters/types/ket.modern.js';
import '../../domain/constants/elements.modern.js';
import '../../domain/constants/element.types.modern.js';
import '../../domain/constants/generics.modern.js';
import '../../domain/constants/chains.modern.js';
import '../../domain/constants/monomers.modern.js';
import '../../domain/helpers/monomers.modern.js';
import '../../domain/serializers/mol/molSerializer.modern.js';
import '../../domain/serializers/sdf/sdfSerializer.modern.js';
import '../../utilities/runAsyncAction.modern.js';
import '../../utilities/KetcherLogger.modern.js';
import '../../utilities/SettingsManager.modern.js';
import '../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../utilities/clipboardUtils.modern.js';
import { MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH } from '../../utilities/monomers.modern.js';

var parseMonomersLibrary = function parseMonomersLibrary(monomersDataRaw) {
  var monomersLibraryParsedJson = typeof monomersDataRaw === 'string' ? JSON.parse(monomersDataRaw) : monomersDataRaw;
  var serializer = new KetSerializer();
  var monomersLibrary = serializer.convertMonomersLibrary(monomersLibraryParsedJson);
  return {
    monomersLibraryParsedJson: monomersLibraryParsedJson,
    monomersLibrary: monomersLibrary
  };
};
var MonomerNameValidationErrorType;
(function (MonomerNameValidationErrorType) {
  MonomerNameValidationErrorType["Empty"] = "empty";
  MonomerNameValidationErrorType["TooLong"] = "tooLong";
  MonomerNameValidationErrorType["InvalidCharacters"] = "invalidCharacters";
})(MonomerNameValidationErrorType || (MonomerNameValidationErrorType = {}));
var MONOMER_NAME_ALLOWED_CHARACTERS_REGEXP = /^[A-Za-z0-9_*-]+$/;
var validateMonomerName = function validateMonomerName(monomerName) {
  if (!(monomerName !== null && monomerName !== void 0 && monomerName.trim())) {
    return {
      isValid: false,
      error: MonomerNameValidationErrorType.Empty
    };
  }
  if (monomerName.length > MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: MonomerNameValidationErrorType.TooLong
    };
  }
  if (!MONOMER_NAME_ALLOWED_CHARACTERS_REGEXP.test(monomerName)) {
    return {
      isValid: false,
      error: MonomerNameValidationErrorType.InvalidCharacters
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

export { MonomerNameValidationErrorType, getEmptyMonomersLibraryJson, parseMonomersLibrary, validateMonomerName };
//# sourceMappingURL=helpers.modern.js.map
