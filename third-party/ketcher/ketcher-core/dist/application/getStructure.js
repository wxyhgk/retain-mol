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

var ketcherProvider = require('./ketcherProvider.js');
require('./formatters/supportedFormatProperties.js');
require('./formatters/formatProperties.js');
var structFormatter_types = require('./formatters/structFormatter.types.js');
require('./formatters/formatterFactory.js');
require('./formatters/mol2Formatter.js');
require('./formatters/xyzFormatter.js');
require('./formatters/qcSchemaFormatter.js');
require('@babel/runtime/helpers/defineProperty');
require('../utilities/runAsyncAction.js');
require('../utilities/KetcherLogger.js');
require('../utilities/SettingsManager.js');
require('../utilities/keynorm.js');
require('react-device-detect');
require('../utilities/clipboardUtils.js');
require('./formatters/types/ket.js');
var DrawingEntitiesManager = require('../domain/entities/DrawingEntitiesManager.js');

function getStructure(ketcherId, formatterFactory, struct) {
  var structureFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : structFormatter_types.SupportedFormat.rxn;
  var drawingEntitiesManager = arguments.length > 4 ? arguments[4] : undefined;
  var selection = arguments.length > 5 ? arguments[5] : undefined;
  var serverSettings = ketcherProvider.ketcherProvider.getKetcher(ketcherId).editor.serverSettings;
  var formatter = formatterFactory.create(structureFormat, serverSettings, undefined, struct);
  var drawingEntitiesManagerCloningResult = drawingEntitiesManager === null || drawingEntitiesManager === void 0 ? void 0 : drawingEntitiesManager.mergeInto(new DrawingEntitiesManager.DrawingEntitiesManager());
  return formatter.getStringFromStructureAsync(struct, drawingEntitiesManagerCloningResult === null || drawingEntitiesManagerCloningResult === void 0 ? void 0 : drawingEntitiesManagerCloningResult.mergedDrawingEntities, selection);
}

exports.getStructure = getStructure;
//# sourceMappingURL=getStructure.js.map
