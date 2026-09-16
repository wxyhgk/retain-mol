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
import { KetConnectionType } from '../../formatters/types/ket.modern.js';
import { AttachmentPointName } from '../../../domain/types/monomers.modern.js';
import '../../../domain/types/entities.modern.js';
import { setAmbiguousMonomerTemplatePrefix, setMonomerTemplatePrefix } from '../../../domain/serializers/ket/helpers.modern.js';

var getMonomerTemplateId = function getMonomerTemplateId(monomer) {
  var _monomer$props$id, _monomer$props;
  var templateId = (_monomer$props$id = monomer === null || monomer === void 0 || (_monomer$props = monomer.props) === null || _monomer$props === void 0 ? void 0 : _monomer$props.id) !== null && _monomer$props$id !== void 0 ? _monomer$props$id : monomer === null || monomer === void 0 ? void 0 : monomer.id;
  if (!templateId) {
    return undefined;
  }
  var isAmbiguousMonomer = Boolean(monomer === null || monomer === void 0 ? void 0 : monomer.isAmbiguous);
  return isAmbiguousMonomer ? setAmbiguousMonomerTemplatePrefix(templateId) : setMonomerTemplatePrefix(templateId);
};
var isSugarPhosphateConnection = function isSugarPhosphateConnection(connection, sugarTemplateId, phosphateTemplateId) {
  var endpointIds = [connection.endpoint1.templateId, connection.endpoint2.templateId];
  if (sugarTemplateId && phosphateTemplateId) {
    return endpointIds.includes(sugarTemplateId) && endpointIds.includes(phosphateTemplateId);
  }
  var endpointAttachmentPoints = [connection.endpoint1.attachmentPointId, connection.endpoint2.attachmentPointId];
  return !endpointAttachmentPoints.includes(AttachmentPointName.R3) && endpointAttachmentPoints.includes(AttachmentPointName.R1) && endpointAttachmentPoints.includes(AttachmentPointName.R2);
};
var getRnaPresetPhosphatePosition = function getRnaPresetPhosphatePosition(preset) {
  var _preset$connections;
  if (!(preset !== null && preset !== void 0 && preset.phosphate)) {
    return undefined;
  }
  var sugarTemplateId = getMonomerTemplateId(preset.sugar);
  var phosphateTemplateId = getMonomerTemplateId(preset.phosphate);
  var sugarPhosphateConnection = (_preset$connections = preset.connections) === null || _preset$connections === void 0 ? void 0 : _preset$connections.find(function (connection) {
    return isSugarPhosphateConnection(connection, sugarTemplateId, phosphateTemplateId);
  });
  if (!sugarPhosphateConnection) {
    return 'right';
  }
  var sugarEndpoint = !sugarTemplateId || sugarPhosphateConnection.endpoint1.templateId === sugarTemplateId ? sugarPhosphateConnection.endpoint1 : sugarPhosphateConnection.endpoint2;
  return sugarEndpoint.attachmentPointId === AttachmentPointName.R1 ? 'left' : 'right';
};
var buildRnaPresetConnections = function buildRnaPresetConnections(preset, phosphatePosition) {
  var baseTemplateId = getMonomerTemplateId(preset.base);
  var sugarTemplateId = getMonomerTemplateId(preset.sugar);
  var phosphateTemplateId = getMonomerTemplateId(preset.phosphate);
  var connections = [];
  if (baseTemplateId && sugarTemplateId) {
    connections.push({
      connectionType: KetConnectionType.SINGLE,
      endpoint1: {
        templateId: baseTemplateId,
        attachmentPointId: AttachmentPointName.R1
      },
      endpoint2: {
        templateId: sugarTemplateId,
        attachmentPointId: AttachmentPointName.R3
      }
    });
  }
  if (sugarTemplateId && phosphateTemplateId) {
    connections.push({
      connectionType: KetConnectionType.SINGLE,
      endpoint1: {
        templateId: sugarTemplateId,
        attachmentPointId: phosphatePosition === 'left' ? AttachmentPointName.R1 : AttachmentPointName.R2
      },
      endpoint2: {
        templateId: phosphateTemplateId,
        attachmentPointId: phosphatePosition === 'left' ? AttachmentPointName.R2 : AttachmentPointName.R1
      }
    });
  }
  return connections;
};

export { buildRnaPresetConnections, getRnaPresetPhosphatePosition };
//# sourceMappingURL=rnaPresetConnections.modern.js.map
