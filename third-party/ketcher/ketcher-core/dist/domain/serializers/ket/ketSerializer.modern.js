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
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { provideEditorInstance } from '../../../application/editor/editorSingleton.modern.js';
import { Atom } from '../../entities/atom.modern.js';
import '../../entities/atomList.modern.js';
import { Bond } from '../../entities/bond.modern.js';
import '../../entities/fixedPrecision.modern.js';
import '../../entities/fragment.modern.js';
import '../../entities/functionalGroup.modern.js';
import '../../entities/halfBond.modern.js';
import '../../entities/loop.modern.js';
import '../../entities/rgroup.modern.js';
import '../../entities/rgroupAttachmentPoint.modern.js';
import { RxnArrow } from '../../entities/rxnArrow.modern.js';
import { RxnPlus } from '../../entities/rxnPlus.modern.js';
import '../../entities/sgroup.modern.js';
import '../../entities/sgroupForest.modern.js';
import '../../entities/simpleObject.modern.js';
import { Struct } from '../../entities/struct.modern.js';
import '../../entities/text.modern.js';
import '../../entities/pile.modern.js';
import { Vec2 } from '../../entities/vec2.modern.js';
import '../../entities/box2Abs.modern.js';
import '../../entities/pool.modern.js';
import '../../entities/image.modern.js';
import { MultitailArrow } from '../../entities/multitailArrow.modern.js';
import '../../entities/highlight.modern.js';
import { SGroupAttachmentPoint } from '../../entities/sGroupAttachmentPoint.modern.js';
import '../../entities/monomerMicromolecule.modern.js';
import '../../entities/Peptide.modern.js';
import '../../entities/BaseMonomer.modern.js';
import { Chem } from '../../entities/Chem.modern.js';
import '../../entities/Sugar.modern.js';
import '../../entities/RNABase.modern.js';
import '../../entities/Phosphate.modern.js';
import '../../entities/Axis.modern.js';
import '../../entities/Nucleoside.modern.js';
import '../../entities/Nucleotide.modern.js';
import '../../entities/monomer-chains/types.modern.js';
import '../../entities/monomer-chains/Chain.modern.js';
import '../../entities/monomer-chains/ChainsCollection.modern.js';
import '../../entities/MonomerSequenceNode.modern.js';
import '../../entities/EmptySequenceNode.modern.js';
import '../../entities/LinkerSequenceNode.modern.js';
import '../../entities/UnresolvedMonomer.modern.js';
import '../../entities/UnsplitNucleotide.modern.js';
import '../../entities/PolymerBond.modern.js';
import { AmbiguousMonomer } from '../../entities/AmbiguousMonomer.modern.js';
import '../../entities/MonomerToAtomBond.modern.js';
import { HydrogenBond } from '../../entities/HydrogenBond.modern.js';
import '../../entities/SGroupDrawingEntity.modern.js';
import '../../entities/BackBoneSequenceNode.modern.js';
import { Command } from '../../entities/Command.modern.js';
import '../../../utilities/runAsyncAction.modern.js';
import { KetcherLogger } from '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import '../../entities/CoreAtom.modern.js';
import '../../entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../constants/elements.modern.js';
import '../../constants/element.types.modern.js';
import '../../constants/generics.modern.js';
import { IMAGE_SERIALIZE_KEY } from '../../constants/image.modern.js';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from '../../constants/multitailArrow.modern.js';
import '../../constants/chains.modern.js';
import '../../constants/monomers.modern.js';
import { arrowToKet, plusToKet } from './toKet/rxnToKet.modern.js';
import { headerToKet } from './toKet/headerToKet.modern.js';
import { moleculeToKet } from './toKet/moleculeToKet.modern.js';
import { moleculeToStruct } from './fromKet/moleculeToStruct.modern.js';
import { prepareStructForKet } from './toKet/prepare.modern.js';
import { rgroupToKet } from './toKet/rgroupToKet.modern.js';
import { rgroupToStruct } from './fromKet/rgroupToStruct.modern.js';
import { rxnToStruct } from './fromKet/rxnToStruct.modern.js';
import { simpleObjectToKet } from './toKet/simpleObjectToKet.modern.js';
import { simpleObjectToStruct } from './fromKet/simpleObjectToStruct.modern.js';
import { textToKet } from './toKet/textToKet.modern.js';
import { textToStruct } from './fromKet/textToStruct.modern.js';
import { KetConnectionType, KetNodeType, KetTemplateType } from '../../../application/formatters/types/ket.modern.js';
import { templateToMonomerProps, variantMonomerToDrawingEntity, monomerToDrawingEntity, createMonomersForVariantMonomer } from './fromKet/monomerToDrawingEntity.modern.js';
import { polymerBondToDrawingEntity } from './fromKet/polymerBondToDrawingEntity.modern.js';
import { getMonomerUniqueKey } from '../../helpers/monomers.modern.js';
import { convertMonomerTemplateToStruct, getTemplateAttachmentPoints, fillStructRgLabelsByMonomerTemplate } from './fromKet/monomerTemplateUtils.modern.js';
import { DrawingEntitiesManager } from '../../entities/DrawingEntitiesManager.modern.js';
import { setMonomerTemplatePrefix, setAmbiguousMonomerTemplatePrefix, setMonomerPrefix, getKetRef, switchIntoChemistryCoordSystem, modifyTransformation, populateStructWithSelection } from './helpers.modern.js';
import { validate } from './validate.modern.js';
import { MacromoleculesConverter } from '../../../application/editor/MacromoleculesConverter.modern.js';
import { isNumber } from 'lodash';
import { AttachmentPointName } from '../../types/monomers.modern.js';
import '../../types/entities.modern.js';
import { imageToKet } from './toKet/imageToKet.modern.js';
import { imageToStruct } from './fromKet/imageToStruct.modern.js';
import { multitailArrowToKet } from './toKet/multitailArrowToKet.modern.js';
import { multitailArrowToStruct } from './fromKet/multitailArrowToStruct.modern.js';
import { MACROMOLECULES_BOND_TYPES } from '../../../application/editor/tools/types.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function parseNode(node, struct) {
  var type = node.type;
  switch (type) {
    case 'arrow':
    case 'plus':
      {
        rxnToStruct(node, struct);
        break;
      }
    case 'simpleObject':
      {
        simpleObjectToStruct(node, struct);
        break;
      }
    case 'molecule':
      {
        var currentStruct = moleculeToStruct(node);
        if (node.stereoFlagPosition) {
          var fragment = currentStruct.frags.get(0);
          if (fragment) {
            fragment.stereoFlagPosition = new Vec2(node.stereoFlagPosition);
          }
        }
        currentStruct.mergeInto(struct);
        break;
      }
    case 'rgroup':
      {
        rgroupToStruct(node).mergeInto(struct);
        break;
      }
    case 'text':
      {
        textToStruct(node, struct);
        break;
      }
    case MULTITAIL_ARROW_SERIALIZE_KEY:
      {
        multitailArrowToStruct(node, struct);
        break;
      }
    case IMAGE_SERIALIZE_KEY:
      {
        imageToStruct(node, struct);
        break;
      }
  }
}
var KetSerializer = function () {
  function KetSerializer() {
    _classCallCheck(this, KetSerializer);
  }
  _createClass(KetSerializer, [{
    key: "deserializeMicromolecules",
    value: function deserializeMicromolecules(content) {
      var ket = JSON.parse(content);
      if (!validate(ket)) {
        throw new Error('Cannot deserialize input JSON.');
      }
      return KetSerializer.fillStruct(ket);
    }
  }, {
    key: "serializeMicromolecules",
    value: function serializeMicromolecules(struct, monomer) {
      var result = {
        root: {
          nodes: []
        }
      };
      var header = headerToKet(struct);
      if (header) result.header = header;
      var ketNodes = prepareStructForKet(struct);
      var moleculeId = 0;
      ketNodes.forEach(function (item) {
        switch (item.type) {
          case 'molecule':
            {
              if (!item.fragment) break;
              result.root.nodes.push({
                $ref: "mol".concat(moleculeId)
              });
              result["mol".concat(moleculeId++)] = moleculeToKet(item.fragment, monomer);
              break;
            }
          case 'rgroup':
            {
              if (!item.fragment) break;
              var rgnumber = item.data.rgnumber;
              result.root.nodes.push({
                $ref: "rg".concat(rgnumber)
              });
              result["rg".concat(rgnumber)] = rgroupToKet(item.fragment, item.data);
              break;
            }
          case 'plus':
            {
              result.root.nodes.push(plusToKet(item));
              break;
            }
          case 'arrow':
            {
              result.root.nodes.push(arrowToKet(item));
              break;
            }
          case 'simpleObject':
            {
              result.root.nodes.push(simpleObjectToKet(item));
              break;
            }
          case 'text':
            {
              result.root.nodes.push(textToKet(item));
              break;
            }
          case IMAGE_SERIALIZE_KEY:
            {
              result.root.nodes.push(imageToKet(item));
              break;
            }
          case MULTITAIL_ARROW_SERIALIZE_KEY:
            result.root.nodes.push(multitailArrowToKet(item));
            break;
        }
      });
      return JSON.stringify(_objectSpread({
        ket_version: '2.0.0'
      }, result), null, 4);
    }
  }, {
    key: "validateMonomerNodeTemplate",
    value: function validateMonomerNodeTemplate(node, parsedFileContent, editor) {
      var template = parsedFileContent[setMonomerTemplatePrefix(node.templateId)];
      if (!template) {
        editor.events.error.dispatch('Error during file parsing');
        return true;
      }
      return false;
    }
  }, {
    key: "validateConnectionTypeAndEndpoints",
    value: function validateConnectionTypeAndEndpoints(connection, editor) {
      if (connection.connectionType !== KetConnectionType.SINGLE && connection.connectionType !== KetConnectionType.HYDROGEN) {
        editor.events.error.dispatch('Error during file parsing');
        return true;
      }
      return false;
    }
  }, {
    key: "parseAndValidateMacromolecules",
    value: function parseAndValidateMacromolecules(fileContent) {
      var _this = this,
        _parsedFileContent$ro;
      var editor = provideEditorInstance();
      var parsedFileContent;
      try {
        parsedFileContent = JSON.parse(fileContent);
      } catch (e) {
        KetcherLogger.error('ketSerializer.ts::KetSerializer::parseAndValidateMacromolecules', e);
        return {
          error: true
        };
      }
      var error = false;
      parsedFileContent.root.nodes.forEach(function (node) {
        var nodeDefinition = parsedFileContent[node.$ref];
        if ((nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) === 'monomer') {
          error = _this.validateMonomerNodeTemplate(nodeDefinition, parsedFileContent, editor);
        }
      });
      if (error) {
        return {
          error: true
        };
      }
      (_parsedFileContent$ro = parsedFileContent.root.connections) === null || _parsedFileContent$ro === void 0 || _parsedFileContent$ro.forEach(function (connection) {
        _this.validateConnectionTypeAndEndpoints(connection, editor);
      });
      return {
        error: error,
        parsedFileContent: parsedFileContent
      };
    }
  }, {
    key: "deserializeToStruct",
    value: function deserializeToStruct(fileContent) {
      var struct = new Struct();
      var deserializedContent = this.deserializeToDrawingEntities(fileContent);
      assert(deserializedContent);
      MacromoleculesConverter.convertDrawingEntitiesToStruct(deserializedContent === null || deserializedContent === void 0 ? void 0 : deserializedContent.drawingEntitiesManager, struct);
      return struct;
    }
  }, {
    key: "filterMacromoleculesContent",
    value: function filterMacromoleculesContent(parsedFileContent) {
      var _parsedFileContent$ro2;
      var fileContentForMicromolecules = _objectSpread(_objectSpread({}, parsedFileContent), {}, {
        root: {
          nodes: parsedFileContent.root.nodes.filter(function (node) {
            var nodeDefinition = parsedFileContent[node.$ref];
            return (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) !== KetNodeType.MONOMER && (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) !== KetNodeType.AMBIGUOUS_MONOMER;
          })
        }
      });
      parsedFileContent.root.nodes.forEach(function (node) {
        var nodeDefinition = parsedFileContent[node.$ref];
        if ((nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) === KetNodeType.MONOMER || (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) === KetNodeType.AMBIGUOUS_MONOMER) {
          fileContentForMicromolecules[node.$ref] = undefined;
        }
      });
      (_parsedFileContent$ro2 = parsedFileContent.root.templates) === null || _parsedFileContent$ro2 === void 0 || _parsedFileContent$ro2.forEach(function (template) {
        fileContentForMicromolecules[template.$ref] = undefined;
      });
      Object.entries(fileContentForMicromolecules).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        if ((value === null || value === void 0 ? void 0 : value.type) === KetTemplateType.AMBIGUOUS_MONOMER_TEMPLATE) {
          fileContentForMicromolecules[key] = undefined;
        }
      });
      return fileContentForMicromolecules;
    }
  }, {
    key: "convertMonomerTemplateToLibraryItem",
    value: function convertMonomerTemplateToLibraryItem(template) {
      var _template$alias;
      var monomerLibraryItem = {
        label: (_template$alias = template.alias) !== null && _template$alias !== void 0 ? _template$alias : template.id,
        struct: convertMonomerTemplateToStruct(template),
        props: templateToMonomerProps(template),
        attachmentPoints: getTemplateAttachmentPoints(template)
      };
      fillStructRgLabelsByMonomerTemplate(template, monomerLibraryItem);
      return monomerLibraryItem;
    }
  }, {
    key: "deserializeToDrawingEntities",
    value: function deserializeToDrawingEntities(fileContent) {
      var _parsedFileContent$ro3;
      var _this$parseAndValidat = this.parseAndValidateMacromolecules(fileContent),
        hasValidationErrors = _this$parseAndValidat.error,
        parsedFileContent = _this$parseAndValidat.parsedFileContent;
      if (hasValidationErrors || !parsedFileContent) return;
      var command = new Command();
      var drawingEntitiesManager = new DrawingEntitiesManager();
      var monomerIdsMap = {};
      parsedFileContent.root.nodes.forEach(function (node) {
        var nodeDefinition = parsedFileContent[node.$ref];
        switch (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) {
          case KetNodeType.MONOMER:
            {
              var template = parsedFileContent[setMonomerTemplatePrefix(nodeDefinition.templateId)];
              assert(template);
              KetSerializer.enrichTemplateWithLibraryData(template);
              var struct = convertMonomerTemplateToStruct(template);
              var monomerAdditionCommand = monomerToDrawingEntity(nodeDefinition, template, struct, drawingEntitiesManager);
              var monomer = monomerAdditionCommand.operations[0].monomer;
              monomerIdsMap[node.$ref] = monomer === null || monomer === void 0 ? void 0 : monomer.id;
              fillStructRgLabelsByMonomerTemplate(template, monomer.monomerItem);
              command.merge(monomerAdditionCommand);
              break;
            }
          case KetNodeType.AMBIGUOUS_MONOMER:
            {
              var _template = parsedFileContent[setAmbiguousMonomerTemplatePrefix(nodeDefinition.templateId)];
              assert(_template);
              var _monomerAdditionCommand = variantMonomerToDrawingEntity(drawingEntitiesManager, nodeDefinition, _template, parsedFileContent, KetSerializer.getMonomerFactory());
              var _monomer = _monomerAdditionCommand.operations[0].monomer;
              monomerIdsMap[node.$ref] = _monomer === null || _monomer === void 0 ? void 0 : _monomer.id;
              command.merge(_monomerAdditionCommand);
              break;
            }
        }
      });
      var fileContentForMicromolecules = this.filterMacromoleculesContent(parsedFileContent);
      var deserializedMicromolecules = this.deserializeMicromolecules(JSON.stringify(fileContentForMicromolecules));
      var structToDrawingEntitiesConversionResult = MacromoleculesConverter.convertStructToDrawingEntities(deserializedMicromolecules, drawingEntitiesManager);
      var localAtomIdToGlobalAtomId = new Map();
      command.merge(structToDrawingEntitiesConversionResult.modelChanges);
      structToDrawingEntitiesConversionResult.fragmentIdToMonomer.forEach(function (monomer, fragmentId) {
        monomerIdsMap["mol".concat(fragmentId)] = monomer.id;
      });
      structToDrawingEntitiesConversionResult.fragmentIdToAtomIdMap.forEach(function (_atomIdsMap) {
        _atomIdsMap.forEach(function (globalAtomId, localAtomId) {
          localAtomIdToGlobalAtomId.set(localAtomId, globalAtomId);
        });
      });
      var superatomMonomerToUsedAttachmentPoint = new Map();
      (_parsedFileContent$ro3 = parsedFileContent.root.connections) === null || _parsedFileContent$ro3 === void 0 || _parsedFileContent$ro3.forEach(function (connection) {
        switch (connection.connectionType) {
          case KetConnectionType.SINGLE:
            {
              var _connection$endpoint, _connection$endpoint2;
              var firstMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint = connection.endpoint1.monomerId) !== null && _connection$endpoint !== void 0 ? _connection$endpoint : connection.endpoint1.moleculeId]));
              var secondMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint2 = connection.endpoint2.monomerId) !== null && _connection$endpoint2 !== void 0 ? _connection$endpoint2 : connection.endpoint2.moleculeId]));
              if (!firstMonomer || !secondMonomer) {
                return;
              }
              if (!isMonomerSgroupWithAttachmentPoints(firstMonomer) && !isMonomerSgroupWithAttachmentPoints(secondMonomer) && (firstMonomer.monomerItem.props.isMicromoleculeFragment || secondMonomer.monomerItem.props.isMicromoleculeFragment)) {
                var _connection$endpoint3, _connection$endpoint4;
                var atomId = Number((_connection$endpoint3 = connection.endpoint1.atomId) !== null && _connection$endpoint3 !== void 0 ? _connection$endpoint3 : connection.endpoint2.atomId);
                var atom = MacromoleculesConverter.findAtomByMicromoleculeAtomId(drawingEntitiesManager, atomId, firstMonomer.monomerItem.props.isMicromoleculeFragment ? firstMonomer : secondMonomer);
                var attachmentPointName = (_connection$endpoint4 = connection.endpoint1.attachmentPointId) !== null && _connection$endpoint4 !== void 0 ? _connection$endpoint4 : connection.endpoint2.attachmentPointId;
                if (!atom || !attachmentPointName) {
                  return;
                }
                var bondAdditionCommand = drawingEntitiesManager.addMonomerToAtomBond(firstMonomer.monomerItem.props.isMicromoleculeFragment ? secondMonomer : firstMonomer, atom, attachmentPointName);
                command.merge(bondAdditionCommand);
              } else {
                var _bondAdditionCommand = polymerBondToDrawingEntity(connection, drawingEntitiesManager, localAtomIdToGlobalAtomId, superatomMonomerToUsedAttachmentPoint, firstMonomer, secondMonomer);
                command.merge(_bondAdditionCommand);
              }
              break;
            }
          case KetConnectionType.HYDROGEN:
            {
              var _connection$endpoint5, _connection$endpoint6;
              var _firstMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint5 = connection.endpoint1.monomerId) !== null && _connection$endpoint5 !== void 0 ? _connection$endpoint5 : connection.endpoint1.moleculeId]));
              var _secondMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint6 = connection.endpoint2.monomerId) !== null && _connection$endpoint6 !== void 0 ? _connection$endpoint6 : connection.endpoint2.moleculeId]));
              if (!_firstMonomer || !_secondMonomer) {
                return;
              }
              command.merge(drawingEntitiesManager.createPolymerBond(_firstMonomer, _secondMonomer, AttachmentPointName.HYDROGEN, AttachmentPointName.HYDROGEN, MACROMOLECULES_BOND_TYPES.HYDROGEN));
              break;
            }
        }
      });
      return {
        modelChanges: command,
        drawingEntitiesManager: drawingEntitiesManager
      };
    }
  }, {
    key: "deserialize",
    value: function deserialize(fileContent) {
      return this.deserializeToStruct(fileContent);
    }
  }, {
    key: "getConnectionMonomerEndpoint",
    value: function getConnectionMonomerEndpoint(monomer, polymerBond, monomerIdMap) {
      var monomerId = monomerIdMap.get(monomer.id);
      return {
        monomerId: setMonomerPrefix(isNumber(monomerId) ? monomerId : monomer.id),
        attachmentPointId: polymerBond instanceof HydrogenBond ? undefined : monomer.getAttachmentPointByBond(polymerBond)
      };
    }
  }, {
    key: "getConnectionMoleculeEndpoint",
    value: function getConnectionMoleculeEndpoint(monomer, polymerBond, monomerToAtomIdMap, struct) {
      var _struct$atoms$get;
      var _MacromoleculesConver = MacromoleculesConverter.findAttachmentPointAtom(polymerBond, monomer, monomerToAtomIdMap),
        attachmentAtomId = _MacromoleculesConver.attachmentAtomId,
        globalAttachmentAtomId = _MacromoleculesConver.globalAttachmentAtomId;
      return {
        moleculeId: "mol".concat((_struct$atoms$get = struct.atoms.get(globalAttachmentAtomId)) === null || _struct$atoms$get === void 0 ? void 0 : _struct$atoms$get.fragment),
        atomId: "".concat(attachmentAtomId)
      };
    }
  }, {
    key: "serializeMonomerTemplate",
    value: function serializeMonomerTemplate(templateId, monomer, fileContent) {
      var _monomer$monomerItem$;
      var _KetSerializer$getMon = KetSerializer.getMonomerFactory()(monomer.monomerItem),
        _KetSerializer$getMon2 = _slicedToArray(_KetSerializer$getMon, 3),
        monomerClass = _KetSerializer$getMon2[2];
      var templateNameWithPrefix = setMonomerTemplatePrefix(templateId);
      if (fileContent[templateNameWithPrefix]) {
        return;
      }
      fileContent[templateNameWithPrefix] = _objectSpread(_objectSpread({}, JSON.parse(this.serializeMicromolecules(monomer.monomerItem.struct, monomer)).mol0), {}, {
        type: 'monomerTemplate',
        "class": (_monomer$monomerItem$ = monomer.monomerItem.props.MonomerClass) !== null && _monomer$monomerItem$ !== void 0 ? _monomer$monomerItem$ : monomerClass,
        classHELM: monomer.monomerItem.props.MonomerType,
        id: templateId,
        fullName: monomer.monomerItem.props.Name,
        alias: monomer.monomerItem.label,
        aliasHELM: monomer.monomerItem.props.aliasHELM,
        aliasBILN: monomer.monomerItem.props.aliasBILN,
        aliasAxoLabs: monomer.monomerItem.props.aliasAxoLabs,
        attachmentPoints: monomer.monomerItem.attachmentPoints,
        idtAliases: monomer.monomerItem.props.idtAliases,
        unresolved: monomer.monomerItem.props.unresolved ? true : undefined,
        modificationTypes: monomer.monomerItem.props.modificationTypes
      });
      if (monomer.monomerItem.props.MonomerType !== 'CHEM') {
        fileContent[templateNameWithPrefix].naturalAnalogShort = monomer.monomerItem.props.MonomerNaturalAnalogCode;
      }
      fileContent.root.templates.push(getKetRef(templateNameWithPrefix));
    }
  }, {
    key: "serializeVariantMonomerTemplate",
    value: function serializeVariantMonomerTemplate(templateId, variantMonomer, fileContent) {
      var _this2 = this;
      var templateNameWithPrefix = setAmbiguousMonomerTemplatePrefix(templateId);
      if (fileContent[templateNameWithPrefix]) {
        return;
      }
      fileContent[templateNameWithPrefix] = {
        type: 'ambiguousMonomerTemplate',
        id: templateId,
        alias: variantMonomer.label,
        idtAliases: variantMonomer.variantMonomerItem.idtAliases,
        subtype: variantMonomer.variantMonomerItem.subtype,
        options: variantMonomer.variantMonomerItem.options
      };
      fileContent.root.templates.push(getKetRef(templateNameWithPrefix));
      variantMonomer.monomers.forEach(function (monomer) {
        var _monomer$monomerItem$2;
        var monomerTemplateId = (_monomer$monomerItem$2 = monomer.monomerItem.props.id) !== null && _monomer$monomerItem$2 !== void 0 ? _monomer$monomerItem$2 : getMonomerUniqueKey(monomer.monomerItem);
        _this2.serializeMonomerTemplate(monomerTemplateId, monomer, fileContent);
      });
    }
  }, {
    key: "serializeMacromolecules",
    value: function serializeMacromolecules(struct, drawingEntitiesManager) {
      var _this3 = this;
      var needSetSelection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var fileContent = {
        root: {
          nodes: [],
          connections: [],
          templates: []
        }
      };
      var monomerToAtomIdMap = new Map();
      var monomerToBondIdMap = new Map();
      var moleculesSelection = {
        atoms: [],
        bonds: []
      };
      var monomerIdMap = new Map();
      var nextMonomerId = 0;
      drawingEntitiesManager.monomers.forEach(function (monomer) {
        var monomerItem = monomer.monomerItem;
        if (monomer instanceof Chem && monomerItem.props.isMicromoleculeFragment) {
          var atomIdMap = new Map();
          var bondIdMap = new Map();
          monomerItem.struct.mergeInto(struct, null, null, false, false, atomIdMap, null, null, null, null, null, bondIdMap);
          monomerToAtomIdMap.set(monomer, atomIdMap);
          monomerToBondIdMap.set(monomer, bondIdMap);
        } else {
          var templateId;
          var monomerKey = setMonomerPrefix(nextMonomerId);
          var position = switchIntoChemistryCoordSystem(new Vec2(monomer.position.x, monomer.position.y));
          monomerIdMap.set(monomer.id, nextMonomerId);
          if (monomer instanceof AmbiguousMonomer) {
            var ambiguousMonomerItem = monomer.variantMonomerItem;
            templateId = ambiguousMonomerItem.subtype + '_' + ambiguousMonomerItem.options.reduce(function (templateId, option) {
              var _ref3, _option$probability;
              return templateId + '_' + option.templateId + '_' + ((_ref3 = (_option$probability = option.probability) !== null && _option$probability !== void 0 ? _option$probability : option.ratio) !== null && _ref3 !== void 0 ? _ref3 : '');
            }, '');
          } else {
            var _monomerItem$props$id;
            templateId = (_monomerItem$props$id = monomerItem.props.id) !== null && _monomerItem$props$id !== void 0 ? _monomerItem$props$id : getMonomerUniqueKey(monomerItem);
          }
          var seqId = monomerItem.seqId,
            expanded = monomerItem.expanded,
            transformation = monomerItem.transformation;
          var isExpandedDefined = expanded !== undefined;
          var isTransformationDefined = transformation !== undefined && Object.keys(transformation).length > 0;
          fileContent[monomerKey] = _objectSpread(_objectSpread(_objectSpread({
            type: monomer instanceof AmbiguousMonomer ? KetNodeType.AMBIGUOUS_MONOMER : KetNodeType.MONOMER,
            id: nextMonomerId.toString(),
            position: {
              x: position.x,
              y: position.y
            },
            alias: monomer.label,
            templateId: templateId,
            seqid: seqId
          }, isExpandedDefined && {
            expanded: expanded
          }), isTransformationDefined && {
            transformation: modifyTransformation(transformation)
          }), {}, {
            selected: needSetSelection && monomer.selected || undefined
          });
          fileContent.root.nodes.push(getKetRef(monomerKey));
          nextMonomerId++;
          if (monomer instanceof AmbiguousMonomer) {
            _this3.serializeVariantMonomerTemplate(templateId, monomer, fileContent);
          } else {
            _this3.serializeMonomerTemplate(templateId, monomer, fileContent);
          }
        }
      });
      drawingEntitiesManager.polymerBonds.forEach(function (polymerBond) {
        assert(polymerBond.secondMonomer);
        fileContent.root.connections.push({
          connectionType: polymerBond instanceof HydrogenBond ? KetConnectionType.HYDROGEN : KetConnectionType.SINGLE,
          endpoint1: polymerBond.firstMonomer.monomerItem.props.isMicromoleculeFragment ? _this3.getConnectionMoleculeEndpoint(polymerBond.firstMonomer, polymerBond, monomerToAtomIdMap, struct) : _this3.getConnectionMonomerEndpoint(polymerBond.firstMonomer, polymerBond, monomerIdMap),
          endpoint2: polymerBond.secondMonomer.monomerItem.props.isMicromoleculeFragment ? _this3.getConnectionMoleculeEndpoint(polymerBond.secondMonomer, polymerBond, monomerToAtomIdMap, struct) : _this3.getConnectionMonomerEndpoint(polymerBond.secondMonomer, polymerBond, monomerIdMap),
          selected: needSetSelection && polymerBond.selected || undefined
        });
      });
      drawingEntitiesManager.monomerToAtomBonds.forEach(function (monomerToAtomBond) {
        var _struct$atoms$get2;
        var monomer = monomerToAtomBond.monomer;
        var atomIdMap = monomerToAtomIdMap.get(monomerToAtomBond.atom.monomer);
        var globalAtomId = atomIdMap === null || atomIdMap === void 0 ? void 0 : atomIdMap.get(monomerToAtomBond.atom.atomIdInMicroMode);
        var monomerId = monomerIdMap.get(monomer.id);
        if (!isNumber(globalAtomId) || !isNumber(monomerId)) {
          return;
        }
        fileContent.root.connections.push({
          connectionType: KetConnectionType.SINGLE,
          endpoint1: {
            monomerId: setMonomerPrefix(monomerId),
            attachmentPointId: monomerToAtomBond.monomer.getAttachmentPointByBond(monomerToAtomBond)
          },
          endpoint2: {
            moleculeId: "mol".concat((_struct$atoms$get2 = struct.atoms.get(globalAtomId)) === null || _struct$atoms$get2 === void 0 ? void 0 : _struct$atoms$get2.fragment),
            atomId: String(monomerToAtomBond.atom.atomIdInMicroMode)
          },
          selected: needSetSelection && monomerToAtomBond.selected || undefined
        });
      });
      if (needSetSelection) {
        drawingEntitiesManager.atoms.forEach(function (atom) {
          if (atom.selected) {
            var atomIdMap = monomerToAtomIdMap.get(atom.monomer);
            var globalAtomId = atomIdMap === null || atomIdMap === void 0 ? void 0 : atomIdMap.get(atom.atomIdInMicroMode);
            if (isNumber(globalAtomId)) {
              moleculesSelection.atoms.push(globalAtomId);
            }
          }
        });
        drawingEntitiesManager.bonds.forEach(function (bond) {
          if (bond.selected) {
            var bondIdMap = monomerToBondIdMap.get(bond.firstAtom.monomer);
            var globalBondId = bondIdMap === null || bondIdMap === void 0 ? void 0 : bondIdMap.get(bond.bondIdInMicroMode);
            if (isNumber(globalBondId)) {
              moleculesSelection.bonds.push(globalBondId);
            }
          }
        });
      }
      drawingEntitiesManager.rxnArrows.forEach(function (rxnArrow) {
        var arrow = new RxnArrow({
          mode: rxnArrow.type,
          pos: [rxnArrow.startPosition, rxnArrow.endPosition],
          height: rxnArrow.height,
          initiallySelected: rxnArrow.initiallySelected,
          arrowId: rxnArrow.arrowId
        });
        struct.addRxnArrow(arrow);
      });
      drawingEntitiesManager.multitailArrows.forEach(function (multitailArrow) {
        var arrow = MultitailArrow.fromKetNode(multitailArrow.toKetNode());
        arrow.arrowId = multitailArrow.arrowId;
        struct.addMultitailArrow(arrow);
      });
      drawingEntitiesManager.rxnPluses.forEach(function (rxnPlus) {
        var micromoleculeRxnPlus = new RxnPlus({
          pp: rxnPlus.position,
          initiallySelected: rxnPlus.initiallySelected
        });
        struct.rxnPluses.add(micromoleculeRxnPlus);
      });
      drawingEntitiesManager.micromoleculesHiddenEntities.mergeInto(struct);
      return {
        serializedMacromolecules: fileContent,
        micromoleculesStruct: struct,
        moleculesSelection: moleculesSelection
      };
    }
  }, {
    key: "serialize",
    value: function serialize(_struct) {
      var drawingEntitiesManager = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new DrawingEntitiesManager();
      var selection = arguments.length > 2 ? arguments[2] : undefined;
      var isBeautified = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var needSetSelectionToMacromolecules = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var struct = KetSerializer.removeLeavingGroupsFromConnectedAtoms(_struct);
      struct.enableInitiallySelected();
      var populatedStruct = populateStructWithSelection(struct, selection, true);
      MacromoleculesConverter.convertStructToDrawingEntities(populatedStruct, drawingEntitiesManager);
      var _this$serializeMacrom = this.serializeMacromolecules(new Struct(), drawingEntitiesManager, needSetSelectionToMacromolecules),
        serializedMacromolecules = _this$serializeMacrom.serializedMacromolecules,
        micromoleculesStruct = _this$serializeMacrom.micromoleculesStruct,
        moleculesSelection = _this$serializeMacrom.moleculesSelection;
      if (selection === undefined) {
        micromoleculesStruct.enableInitiallySelected();
      }
      if (needSetSelectionToMacromolecules) {
        populateStructWithSelection(micromoleculesStruct, moleculesSelection);
      }
      var serializedMicromoleculesStruct = JSON.parse(this.serializeMicromolecules(micromoleculesStruct));
      micromoleculesStruct.disableInitiallySelected();
      var fileContent = _objectSpread(_objectSpread({}, serializedMicromoleculesStruct), serializedMacromolecules);
      fileContent.root.nodes = [].concat(_toConsumableArray(serializedMacromolecules.root.nodes), _toConsumableArray(serializedMicromoleculesStruct.root.nodes));
      return JSON.stringify(fileContent, null, isBeautified ? 4 : undefined);
    }
  }, {
    key: "convertMonomersLibrary",
    value: function convertMonomersLibrary(monomersLibrary) {
      var _this4 = this;
      var library = [];
      monomersLibrary.root.templates.forEach(function (templateRef) {
        var template = monomersLibrary[templateRef.$ref];
        if (!template) {
          KetcherLogger.error("There is a ref for monomer template ".concat(templateRef.$ref, ", but template definition is not found"));
          return;
        }
        switch (template.type) {
          case KetTemplateType.MONOMER_TEMPLATE:
            {
              library.push(_this4.convertMonomerTemplateToLibraryItem(template));
              break;
            }
          case KetTemplateType.AMBIGUOUS_MONOMER_TEMPLATE:
            {
              var _variantMonomerTempla;
              var variantMonomerTemplate = template;
              var variantMonomerLibraryItem = {
                id: variantMonomerTemplate.id,
                label: (_variantMonomerTempla = variantMonomerTemplate.alias) !== null && _variantMonomerTempla !== void 0 ? _variantMonomerTempla : '%',
                idtAliases: variantMonomerTemplate.idtAliases,
                isAmbiguous: true,
                monomers: createMonomersForVariantMonomer(variantMonomerTemplate, monomersLibrary, KetSerializer.getMonomerFactory()),
                options: variantMonomerTemplate.options,
                subtype: variantMonomerTemplate.subtype
              };
              library.push(variantMonomerLibraryItem);
              break;
            }
        }
      });
      return library;
    }
  }], [{
    key: "setMonomerFactory",
    value: function setMonomerFactory(factory) {
      KetSerializer._monomerFactory = factory;
    }
  }, {
    key: "getMonomerFactory",
    value: function getMonomerFactory() {
      if (!KetSerializer._monomerFactory) {
        throw new Error('KetSerializer: monomerFactory has not been initialized. Call KetSerializer.setMonomerFactory() before using serializer features that require it.');
      }
      return KetSerializer._monomerFactory;
    }
  }, {
    key: "fillStruct",
    value: function fillStruct(ket) {
      var _ket$header$moleculeN, _ket$header;
      var resultingStruct = new Struct();
      var nodes = ket.root.nodes;
      Object.keys(nodes).forEach(function (i) {
        if (nodes[i].type) parseNode(nodes[i], resultingStruct);else if (nodes[i].$ref) {
          parseNode(ket[nodes[i].$ref], resultingStruct);
        }
      });
      resultingStruct.name = (_ket$header$moleculeN = (_ket$header = ket.header) === null || _ket$header === void 0 ? void 0 : _ket$header.moleculeName) !== null && _ket$header$moleculeN !== void 0 ? _ket$header$moleculeN : '';
      return resultingStruct;
    }
  }, {
    key: "enrichTemplateWithLibraryData",
    value: function enrichTemplateWithLibraryData(template) {
      var _provideEditorInstanc;
      if (template.idtAliases && template.aliasAxoLabs && template.aliasBILN && template.modificationTypes) {
        return;
      }
      var library = (_provideEditorInstanc = provideEditorInstance()) === null || _provideEditorInstanc === void 0 ? void 0 : _provideEditorInstanc.monomersLibraryParsedJson;
      if (!library) return;
      var libraryTemplate = library[setMonomerTemplatePrefix(template.id)];
      if (!libraryTemplate) return;
      if (!template.idtAliases && libraryTemplate.idtAliases) {
        template.idtAliases = libraryTemplate.idtAliases;
      }
      if (!template.aliasAxoLabs && libraryTemplate.aliasAxoLabs) {
        template.aliasAxoLabs = libraryTemplate.aliasAxoLabs;
      }
      if (!template.aliasBILN && libraryTemplate.aliasBILN) {
        template.aliasBILN = libraryTemplate.aliasBILN;
      }
      if (!template.modificationTypes && libraryTemplate.modificationTypes) {
        template.modificationTypes = libraryTemplate.modificationTypes;
      }
    }
  }, {
    key: "removeLeavingGroupsFromConnectedAtoms",
    value: function removeLeavingGroupsFromConnectedAtoms(_struct) {
      var struct = _struct.clone();
      struct.atoms.forEach(function (_atom, atomId) {
        if (Atom.isHiddenLeavingGroupAtom(struct, atomId, false, true)) {
          struct.atoms["delete"](atomId);
        }
      });
      struct.bonds.forEach(function (bond, bondId) {
        if (Bond.isBondToHiddenLeavingGroup(struct, bond)) {
          struct.bonds["delete"](bondId);
        }
      });
      struct.sgroups.forEach(function (sgroup) {
        var attachmentPoints = sgroup.getAttachmentPoints();
        var attachmentPointsToReplace = new Map();
        attachmentPoints.forEach(function (attachmentPoint) {
          if (isNumber(attachmentPoint.leaveAtomId) && Atom.isHiddenLeavingGroupAtom(struct, attachmentPoint.leaveAtomId, true, true)) {
            var attachmentPointClone = new SGroupAttachmentPoint(attachmentPoint.atomId, undefined, attachmentPoint.attachmentId, attachmentPoint.attachmentPointNumber);
            attachmentPointsToReplace.set(attachmentPoint, attachmentPointClone);
            sgroup.atoms.splice(sgroup.atoms.indexOf(attachmentPoint.leaveAtomId), 1);
          }
        });
        attachmentPointsToReplace.forEach(function (attachmentPointToAdd, attachmentPointToDelete) {
          sgroup.removeAttachmentPoint(attachmentPointToDelete);
          sgroup.addAttachmentPoint(attachmentPointToAdd, false);
        });
      });
      return struct;
    }
  }]);
  return KetSerializer;
}();
_defineProperty(KetSerializer, "_monomerFactory", null);

export { KetSerializer };
//# sourceMappingURL=ketSerializer.modern.js.map
