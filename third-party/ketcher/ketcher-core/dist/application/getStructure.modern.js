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
import { ketcherProvider } from './ketcherProvider.modern.js';
import './formatters/supportedFormatProperties.modern.js';
import './formatters/formatProperties.modern.js';
import { SupportedFormat } from './formatters/structFormatter.types.modern.js';
import './formatters/formatterFactory.modern.js';
import './formatters/mol2Formatter.modern.js';
import './formatters/xyzFormatter.modern.js';
import './formatters/qcSchemaFormatter.modern.js';
import '@babel/runtime/helpers/defineProperty';
import '../utilities/runAsyncAction.modern.js';
import '../utilities/KetcherLogger.modern.js';
import '../utilities/SettingsManager.modern.js';
import '../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../utilities/clipboardUtils.modern.js';
import './formatters/types/ket.modern.js';
import { DrawingEntitiesManager } from '../domain/entities/DrawingEntitiesManager.modern.js';

function getStructure(ketcherId, formatterFactory, struct) {
  var structureFormat = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : SupportedFormat.rxn;
  var drawingEntitiesManager = arguments.length > 4 ? arguments[4] : undefined;
  var selection = arguments.length > 5 ? arguments[5] : undefined;
  var serverSettings = ketcherProvider.getKetcher(ketcherId).editor.serverSettings;
  var formatter = formatterFactory.create(structureFormat, serverSettings, undefined, struct);
  var drawingEntitiesManagerCloningResult = drawingEntitiesManager === null || drawingEntitiesManager === void 0 ? void 0 : drawingEntitiesManager.mergeInto(new DrawingEntitiesManager());
  return formatter.getStringFromStructureAsync(struct, drawingEntitiesManagerCloningResult === null || drawingEntitiesManagerCloningResult === void 0 ? void 0 : drawingEntitiesManagerCloningResult.mergedDrawingEntities, selection);
}

export { getStructure };
//# sourceMappingURL=getStructure.modern.js.map
