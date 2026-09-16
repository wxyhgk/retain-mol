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
import { provideEditorInstance } from '../../../../application/editor/editorSingleton.modern.js';
import { Command } from '../../../entities/Command.modern.js';
import { getAttachmentPointLabel } from '../../../helpers/attachmentPointCalculations.modern.js';

function polymerBondToDrawingEntity(connection, drawingEntitiesManager, atomIdMap, superatomMonomerToUsedAttachmentPoint, firstMonomer, secondMonomer) {
  var _connection$endpoint, _firstMonomer$monomer, _connection$endpoint2, _secondMonomer$monome, _superatomMonomerToUs3, _superatomMonomerToUs4;
  var command = new Command();
  var firstAttachmentPoint = (_connection$endpoint = connection.endpoint1.attachmentPointId) !== null && _connection$endpoint !== void 0 ? _connection$endpoint : getAttachmentPointLabel((_firstMonomer$monomer = firstMonomer.monomerItem.struct.sgroups.get(0)) === null || _firstMonomer$monomer === void 0 || (_firstMonomer$monomer = _firstMonomer$monomer.getAttachmentPoints().find(function (attachmentPoint) {
    var _superatomMonomerToUs;
    return attachmentPoint.atomId === atomIdMap.get(Number(connection.endpoint1.atomId)) && !((_superatomMonomerToUs = superatomMonomerToUsedAttachmentPoint.get(firstMonomer)) !== null && _superatomMonomerToUs !== void 0 && _superatomMonomerToUs.has(getAttachmentPointLabel(attachmentPoint.attachmentPointNumber)));
  })) === null || _firstMonomer$monomer === void 0 ? void 0 : _firstMonomer$monomer.attachmentPointNumber);
  var secondAttachmentPoint = (_connection$endpoint2 = connection.endpoint2.attachmentPointId) !== null && _connection$endpoint2 !== void 0 ? _connection$endpoint2 : getAttachmentPointLabel((_secondMonomer$monome = secondMonomer.monomerItem.struct.sgroups.get(0)) === null || _secondMonomer$monome === void 0 || (_secondMonomer$monome = _secondMonomer$monome.getAttachmentPoints().find(function (attachmentPoint) {
    var _superatomMonomerToUs2;
    return attachmentPoint.atomId === atomIdMap.get(Number(connection.endpoint2.atomId)) && !((_superatomMonomerToUs2 = superatomMonomerToUsedAttachmentPoint.get(secondMonomer)) !== null && _superatomMonomerToUs2 !== void 0 && _superatomMonomerToUs2.has(getAttachmentPointLabel(attachmentPoint.attachmentPointNumber)));
  })) === null || _secondMonomer$monome === void 0 ? void 0 : _secondMonomer$monome.attachmentPointNumber);
  if (!firstMonomer.isAttachmentPointExistAndFree(firstAttachmentPoint) || !secondMonomer.isAttachmentPointExistAndFree(secondAttachmentPoint)) {
    var editor = provideEditorInstance();
    editor.events.error.dispatch('There is no free attachment point for bond creation.');
    return new Command();
  }
  if (!superatomMonomerToUsedAttachmentPoint.get(firstMonomer)) {
    superatomMonomerToUsedAttachmentPoint.set(firstMonomer, new Set());
  }
  if (!superatomMonomerToUsedAttachmentPoint.get(secondMonomer)) {
    superatomMonomerToUsedAttachmentPoint.set(secondMonomer, new Set());
  }
  (_superatomMonomerToUs3 = superatomMonomerToUsedAttachmentPoint.get(firstMonomer)) === null || _superatomMonomerToUs3 === void 0 || _superatomMonomerToUs3.add(firstAttachmentPoint);
  (_superatomMonomerToUs4 = superatomMonomerToUsedAttachmentPoint.get(secondMonomer)) === null || _superatomMonomerToUs4 === void 0 || _superatomMonomerToUs4.add(secondAttachmentPoint);
  command.merge(drawingEntitiesManager.createPolymerBond(firstMonomer, secondMonomer, firstAttachmentPoint, secondAttachmentPoint));
  return command;
}

export { polymerBondToDrawingEntity };
//# sourceMappingURL=polymerBondToDrawingEntity.modern.js.map
