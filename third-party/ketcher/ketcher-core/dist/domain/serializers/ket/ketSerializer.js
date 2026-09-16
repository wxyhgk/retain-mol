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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var editorSingleton = require('../../../application/editor/editorSingleton.js');
var atom = require('../../entities/atom.js');
require('../../entities/atomList.js');
var bond = require('../../entities/bond.js');
require('../../entities/fixedPrecision.js');
require('../../entities/fragment.js');
require('../../entities/functionalGroup.js');
require('../../entities/halfBond.js');
require('../../entities/loop.js');
require('../../entities/rgroup.js');
require('../../entities/rgroupAttachmentPoint.js');
var rxnArrow = require('../../entities/rxnArrow.js');
var rxnPlus = require('../../entities/rxnPlus.js');
require('../../entities/sgroup.js');
require('../../entities/sgroupForest.js');
require('../../entities/simpleObject.js');
var struct = require('../../entities/struct.js');
require('../../entities/text.js');
require('../../entities/pile.js');
var vec2 = require('../../entities/vec2.js');
require('../../entities/box2Abs.js');
require('../../entities/pool.js');
require('../../entities/image.js');
var multitailArrow$1 = require('../../entities/multitailArrow.js');
require('../../entities/highlight.js');
var sGroupAttachmentPoint = require('../../entities/sGroupAttachmentPoint.js');
require('../../entities/monomerMicromolecule.js');
require('../../entities/Peptide.js');
require('../../entities/BaseMonomer.js');
var Chem = require('../../entities/Chem.js');
require('../../entities/Sugar.js');
require('../../entities/RNABase.js');
require('../../entities/Phosphate.js');
require('../../entities/Axis.js');
require('../../entities/Nucleoside.js');
require('../../entities/Nucleotide.js');
require('../../entities/monomer-chains/types.js');
require('../../entities/monomer-chains/Chain.js');
require('../../entities/monomer-chains/ChainsCollection.js');
require('../../entities/MonomerSequenceNode.js');
require('../../entities/EmptySequenceNode.js');
require('../../entities/LinkerSequenceNode.js');
require('../../entities/UnresolvedMonomer.js');
require('../../entities/UnsplitNucleotide.js');
require('../../entities/PolymerBond.js');
var AmbiguousMonomer = require('../../entities/AmbiguousMonomer.js');
require('../../entities/MonomerToAtomBond.js');
var HydrogenBond = require('../../entities/HydrogenBond.js');
require('../../entities/SGroupDrawingEntity.js');
require('../../entities/BackBoneSequenceNode.js');
var Command = require('../../entities/Command.js');
require('../../../utilities/runAsyncAction.js');
var KetcherLogger = require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var monomers$1 = require('../../../utilities/monomers.js');
var assert = require('../../../utilities/assert.js');
require('../../entities/CoreAtom.js');
require('../../entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
var image = require('../../constants/image.js');
var multitailArrow = require('../../constants/multitailArrow.js');
require('../../constants/chains.js');
require('../../constants/monomers.js');
var rxnToKet = require('./toKet/rxnToKet.js');
var headerToKet = require('./toKet/headerToKet.js');
var moleculeToKet = require('./toKet/moleculeToKet.js');
var moleculeToStruct = require('./fromKet/moleculeToStruct.js');
var prepare = require('./toKet/prepare.js');
var rgroupToKet = require('./toKet/rgroupToKet.js');
var rgroupToStruct = require('./fromKet/rgroupToStruct.js');
var rxnToStruct = require('./fromKet/rxnToStruct.js');
var simpleObjectToKet = require('./toKet/simpleObjectToKet.js');
var simpleObjectToStruct = require('./fromKet/simpleObjectToStruct.js');
var textToKet = require('./toKet/textToKet.js');
var textToStruct = require('./fromKet/textToStruct.js');
var ket = require('../../../application/formatters/types/ket.js');
var monomerToDrawingEntity = require('./fromKet/monomerToDrawingEntity.js');
var polymerBondToDrawingEntity = require('./fromKet/polymerBondToDrawingEntity.js');
var monomers$2 = require('../../helpers/monomers.js');
var monomerTemplateUtils = require('./fromKet/monomerTemplateUtils.js');
var DrawingEntitiesManager = require('../../entities/DrawingEntitiesManager.js');
var helpers = require('./helpers.js');
var validate = require('./validate.js');
var MacromoleculesConverter = require('../../../application/editor/MacromoleculesConverter.js');
var _ = require('lodash');
var monomers = require('../../types/monomers.js');
require('../../types/entities.js');
var imageToKet = require('./toKet/imageToKet.js');
var imageToStruct = require('./fromKet/imageToStruct.js');
var multitailArrowToKet = require('./toKet/multitailArrowToKet.js');
var multitailArrowToStruct = require('./fromKet/multitailArrowToStruct.js');
var types = require('../../../application/editor/tools/types.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function parseNode(node, struct) {
  var type = node.type;
  switch (type) {
    case 'arrow':
    case 'plus':
      {
        rxnToStruct.rxnToStruct(node, struct);
        break;
      }
    case 'simpleObject':
      {
        simpleObjectToStruct.simpleObjectToStruct(node, struct);
        break;
      }
    case 'molecule':
      {
        var currentStruct = moleculeToStruct.moleculeToStruct(node);
        if (node.stereoFlagPosition) {
          var fragment = currentStruct.frags.get(0);
          if (fragment) {
            fragment.stereoFlagPosition = new vec2.Vec2(node.stereoFlagPosition);
          }
        }
        currentStruct.mergeInto(struct);
        break;
      }
    case 'rgroup':
      {
        rgroupToStruct.rgroupToStruct(node).mergeInto(struct);
        break;
      }
    case 'text':
      {
        textToStruct.textToStruct(node, struct);
        break;
      }
    case multitailArrow.MULTITAIL_ARROW_SERIALIZE_KEY:
      {
        multitailArrowToStruct.multitailArrowToStruct(node, struct);
        break;
      }
    case image.IMAGE_SERIALIZE_KEY:
      {
        imageToStruct.imageToStruct(node, struct);
        break;
      }
  }
}
var KetSerializer = function () {
  function KetSerializer() {
    _classCallCheck__default["default"](this, KetSerializer);
  }
  _createClass__default["default"](KetSerializer, [{
    key: "deserializeMicromolecules",
    value: function deserializeMicromolecules(content) {
      var ket = JSON.parse(content);
      if (!validate.validate(ket)) {
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
      var header = headerToKet.headerToKet(struct);
      if (header) result.header = header;
      var ketNodes = prepare.prepareStructForKet(struct);
      var moleculeId = 0;
      ketNodes.forEach(function (item) {
        switch (item.type) {
          case 'molecule':
            {
              if (!item.fragment) break;
              result.root.nodes.push({
                $ref: "mol".concat(moleculeId)
              });
              result["mol".concat(moleculeId++)] = moleculeToKet.moleculeToKet(item.fragment, monomer);
              break;
            }
          case 'rgroup':
            {
              if (!item.fragment) break;
              var rgnumber = item.data.rgnumber;
              result.root.nodes.push({
                $ref: "rg".concat(rgnumber)
              });
              result["rg".concat(rgnumber)] = rgroupToKet.rgroupToKet(item.fragment, item.data);
              break;
            }
          case 'plus':
            {
              result.root.nodes.push(rxnToKet.plusToKet(item));
              break;
            }
          case 'arrow':
            {
              result.root.nodes.push(rxnToKet.arrowToKet(item));
              break;
            }
          case 'simpleObject':
            {
              result.root.nodes.push(simpleObjectToKet.simpleObjectToKet(item));
              break;
            }
          case 'text':
            {
              result.root.nodes.push(textToKet.textToKet(item));
              break;
            }
          case image.IMAGE_SERIALIZE_KEY:
            {
              result.root.nodes.push(imageToKet.imageToKet(item));
              break;
            }
          case multitailArrow.MULTITAIL_ARROW_SERIALIZE_KEY:
            result.root.nodes.push(multitailArrowToKet.multitailArrowToKet(item));
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
      var template = parsedFileContent[helpers.setMonomerTemplatePrefix(node.templateId)];
      if (!template) {
        editor.events.error.dispatch('Error during file parsing');
        return true;
      }
      return false;
    }
  }, {
    key: "validateConnectionTypeAndEndpoints",
    value: function validateConnectionTypeAndEndpoints(connection, editor) {
      if (connection.connectionType !== ket.KetConnectionType.SINGLE && connection.connectionType !== ket.KetConnectionType.HYDROGEN) {
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
      var editor = editorSingleton.provideEditorInstance();
      var parsedFileContent;
      try {
        parsedFileContent = JSON.parse(fileContent);
      } catch (e) {
        KetcherLogger.KetcherLogger.error('ketSerializer.ts::KetSerializer::parseAndValidateMacromolecules', e);
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
      var struct$1 = new struct.Struct();
      var deserializedContent = this.deserializeToDrawingEntities(fileContent);
      assert.assert(deserializedContent);
      MacromoleculesConverter.MacromoleculesConverter.convertDrawingEntitiesToStruct(deserializedContent === null || deserializedContent === void 0 ? void 0 : deserializedContent.drawingEntitiesManager, struct$1);
      return struct$1;
    }
  }, {
    key: "filterMacromoleculesContent",
    value: function filterMacromoleculesContent(parsedFileContent) {
      var _parsedFileContent$ro2;
      var fileContentForMicromolecules = _objectSpread(_objectSpread({}, parsedFileContent), {}, {
        root: {
          nodes: parsedFileContent.root.nodes.filter(function (node) {
            var nodeDefinition = parsedFileContent[node.$ref];
            return (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) !== ket.KetNodeType.MONOMER && (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) !== ket.KetNodeType.AMBIGUOUS_MONOMER;
          })
        }
      });
      parsedFileContent.root.nodes.forEach(function (node) {
        var nodeDefinition = parsedFileContent[node.$ref];
        if ((nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) === ket.KetNodeType.MONOMER || (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) === ket.KetNodeType.AMBIGUOUS_MONOMER) {
          fileContentForMicromolecules[node.$ref] = undefined;
        }
      });
      (_parsedFileContent$ro2 = parsedFileContent.root.templates) === null || _parsedFileContent$ro2 === void 0 || _parsedFileContent$ro2.forEach(function (template) {
        fileContentForMicromolecules[template.$ref] = undefined;
      });
      Object.entries(fileContentForMicromolecules).forEach(function (_ref) {
        var _ref2 = _slicedToArray__default["default"](_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        if ((value === null || value === void 0 ? void 0 : value.type) === ket.KetTemplateType.AMBIGUOUS_MONOMER_TEMPLATE) {
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
        struct: monomerTemplateUtils.convertMonomerTemplateToStruct(template),
        props: monomerToDrawingEntity.templateToMonomerProps(template),
        attachmentPoints: monomerTemplateUtils.getTemplateAttachmentPoints(template)
      };
      monomerTemplateUtils.fillStructRgLabelsByMonomerTemplate(template, monomerLibraryItem);
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
      var command = new Command.Command();
      var drawingEntitiesManager = new DrawingEntitiesManager.DrawingEntitiesManager();
      var monomerIdsMap = {};
      parsedFileContent.root.nodes.forEach(function (node) {
        var nodeDefinition = parsedFileContent[node.$ref];
        switch (nodeDefinition === null || nodeDefinition === void 0 ? void 0 : nodeDefinition.type) {
          case ket.KetNodeType.MONOMER:
            {
              var template = parsedFileContent[helpers.setMonomerTemplatePrefix(nodeDefinition.templateId)];
              assert.assert(template);
              KetSerializer.enrichTemplateWithLibraryData(template);
              var struct = monomerTemplateUtils.convertMonomerTemplateToStruct(template);
              var monomerAdditionCommand = monomerToDrawingEntity.monomerToDrawingEntity(nodeDefinition, template, struct, drawingEntitiesManager);
              var monomer = monomerAdditionCommand.operations[0].monomer;
              monomerIdsMap[node.$ref] = monomer === null || monomer === void 0 ? void 0 : monomer.id;
              monomerTemplateUtils.fillStructRgLabelsByMonomerTemplate(template, monomer.monomerItem);
              command.merge(monomerAdditionCommand);
              break;
            }
          case ket.KetNodeType.AMBIGUOUS_MONOMER:
            {
              var _template = parsedFileContent[helpers.setAmbiguousMonomerTemplatePrefix(nodeDefinition.templateId)];
              assert.assert(_template);
              var _monomerAdditionCommand = monomerToDrawingEntity.variantMonomerToDrawingEntity(drawingEntitiesManager, nodeDefinition, _template, parsedFileContent, KetSerializer.getMonomerFactory());
              var _monomer = _monomerAdditionCommand.operations[0].monomer;
              monomerIdsMap[node.$ref] = _monomer === null || _monomer === void 0 ? void 0 : _monomer.id;
              command.merge(_monomerAdditionCommand);
              break;
            }
        }
      });
      var fileContentForMicromolecules = this.filterMacromoleculesContent(parsedFileContent);
      var deserializedMicromolecules = this.deserializeMicromolecules(JSON.stringify(fileContentForMicromolecules));
      var structToDrawingEntitiesConversionResult = MacromoleculesConverter.MacromoleculesConverter.convertStructToDrawingEntities(deserializedMicromolecules, drawingEntitiesManager);
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
          case ket.KetConnectionType.SINGLE:
            {
              var _connection$endpoint, _connection$endpoint2;
              var firstMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint = connection.endpoint1.monomerId) !== null && _connection$endpoint !== void 0 ? _connection$endpoint : connection.endpoint1.moleculeId]));
              var secondMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint2 = connection.endpoint2.monomerId) !== null && _connection$endpoint2 !== void 0 ? _connection$endpoint2 : connection.endpoint2.moleculeId]));
              if (!firstMonomer || !secondMonomer) {
                return;
              }
              if (!monomers$1.isMonomerSgroupWithAttachmentPoints(firstMonomer) && !monomers$1.isMonomerSgroupWithAttachmentPoints(secondMonomer) && (firstMonomer.monomerItem.props.isMicromoleculeFragment || secondMonomer.monomerItem.props.isMicromoleculeFragment)) {
                var _connection$endpoint3, _connection$endpoint4;
                var atomId = Number((_connection$endpoint3 = connection.endpoint1.atomId) !== null && _connection$endpoint3 !== void 0 ? _connection$endpoint3 : connection.endpoint2.atomId);
                var atom = MacromoleculesConverter.MacromoleculesConverter.findAtomByMicromoleculeAtomId(drawingEntitiesManager, atomId, firstMonomer.monomerItem.props.isMicromoleculeFragment ? firstMonomer : secondMonomer);
                var attachmentPointName = (_connection$endpoint4 = connection.endpoint1.attachmentPointId) !== null && _connection$endpoint4 !== void 0 ? _connection$endpoint4 : connection.endpoint2.attachmentPointId;
                if (!atom || !attachmentPointName) {
                  return;
                }
                var bondAdditionCommand = drawingEntitiesManager.addMonomerToAtomBond(firstMonomer.monomerItem.props.isMicromoleculeFragment ? secondMonomer : firstMonomer, atom, attachmentPointName);
                command.merge(bondAdditionCommand);
              } else {
                var _bondAdditionCommand = polymerBondToDrawingEntity.polymerBondToDrawingEntity(connection, drawingEntitiesManager, localAtomIdToGlobalAtomId, superatomMonomerToUsedAttachmentPoint, firstMonomer, secondMonomer);
                command.merge(_bondAdditionCommand);
              }
              break;
            }
          case ket.KetConnectionType.HYDROGEN:
            {
              var _connection$endpoint5, _connection$endpoint6;
              var _firstMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint5 = connection.endpoint1.monomerId) !== null && _connection$endpoint5 !== void 0 ? _connection$endpoint5 : connection.endpoint1.moleculeId]));
              var _secondMonomer = drawingEntitiesManager.monomers.get(Number(monomerIdsMap[(_connection$endpoint6 = connection.endpoint2.monomerId) !== null && _connection$endpoint6 !== void 0 ? _connection$endpoint6 : connection.endpoint2.moleculeId]));
              if (!_firstMonomer || !_secondMonomer) {
                return;
              }
              command.merge(drawingEntitiesManager.createPolymerBond(_firstMonomer, _secondMonomer, monomers.AttachmentPointName.HYDROGEN, monomers.AttachmentPointName.HYDROGEN, types.MACROMOLECULES_BOND_TYPES.HYDROGEN));
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
        monomerId: helpers.setMonomerPrefix(_.isNumber(monomerId) ? monomerId : monomer.id),
        attachmentPointId: polymerBond instanceof HydrogenBond.HydrogenBond ? undefined : monomer.getAttachmentPointByBond(polymerBond)
      };
    }
  }, {
    key: "getConnectionMoleculeEndpoint",
    value: function getConnectionMoleculeEndpoint(monomer, polymerBond, monomerToAtomIdMap, struct) {
      var _struct$atoms$get;
      var _MacromoleculesConver = MacromoleculesConverter.MacromoleculesConverter.findAttachmentPointAtom(polymerBond, monomer, monomerToAtomIdMap),
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
        _KetSerializer$getMon2 = _slicedToArray__default["default"](_KetSerializer$getMon, 3),
        monomerClass = _KetSerializer$getMon2[2];
      var templateNameWithPrefix = helpers.setMonomerTemplatePrefix(templateId);
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
      fileContent.root.templates.push(helpers.getKetRef(templateNameWithPrefix));
    }
  }, {
    key: "serializeVariantMonomerTemplate",
    value: function serializeVariantMonomerTemplate(templateId, variantMonomer, fileContent) {
      var _this2 = this;
      var templateNameWithPrefix = helpers.setAmbiguousMonomerTemplatePrefix(templateId);
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
      fileContent.root.templates.push(helpers.getKetRef(templateNameWithPrefix));
      variantMonomer.monomers.forEach(function (monomer) {
        var _monomer$monomerItem$2;
        var monomerTemplateId = (_monomer$monomerItem$2 = monomer.monomerItem.props.id) !== null && _monomer$monomerItem$2 !== void 0 ? _monomer$monomerItem$2 : monomers$2.getMonomerUniqueKey(monomer.monomerItem);
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
        if (monomer instanceof Chem.Chem && monomerItem.props.isMicromoleculeFragment) {
          var atomIdMap = new Map();
          var bondIdMap = new Map();
          monomerItem.struct.mergeInto(struct, null, null, false, false, atomIdMap, null, null, null, null, null, bondIdMap);
          monomerToAtomIdMap.set(monomer, atomIdMap);
          monomerToBondIdMap.set(monomer, bondIdMap);
        } else {
          var templateId;
          var monomerKey = helpers.setMonomerPrefix(nextMonomerId);
          var position = helpers.switchIntoChemistryCoordSystem(new vec2.Vec2(monomer.position.x, monomer.position.y));
          monomerIdMap.set(monomer.id, nextMonomerId);
          if (monomer instanceof AmbiguousMonomer.AmbiguousMonomer) {
            var ambiguousMonomerItem = monomer.variantMonomerItem;
            templateId = ambiguousMonomerItem.subtype + '_' + ambiguousMonomerItem.options.reduce(function (templateId, option) {
              var _ref3, _option$probability;
              return templateId + '_' + option.templateId + '_' + ((_ref3 = (_option$probability = option.probability) !== null && _option$probability !== void 0 ? _option$probability : option.ratio) !== null && _ref3 !== void 0 ? _ref3 : '');
            }, '');
          } else {
            var _monomerItem$props$id;
            templateId = (_monomerItem$props$id = monomerItem.props.id) !== null && _monomerItem$props$id !== void 0 ? _monomerItem$props$id : monomers$2.getMonomerUniqueKey(monomerItem);
          }
          var seqId = monomerItem.seqId,
            expanded = monomerItem.expanded,
            transformation = monomerItem.transformation;
          var isExpandedDefined = expanded !== undefined;
          var isTransformationDefined = transformation !== undefined && Object.keys(transformation).length > 0;
          fileContent[monomerKey] = _objectSpread(_objectSpread(_objectSpread({
            type: monomer instanceof AmbiguousMonomer.AmbiguousMonomer ? ket.KetNodeType.AMBIGUOUS_MONOMER : ket.KetNodeType.MONOMER,
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
            transformation: helpers.modifyTransformation(transformation)
          }), {}, {
            selected: needSetSelection && monomer.selected || undefined
          });
          fileContent.root.nodes.push(helpers.getKetRef(monomerKey));
          nextMonomerId++;
          if (monomer instanceof AmbiguousMonomer.AmbiguousMonomer) {
            _this3.serializeVariantMonomerTemplate(templateId, monomer, fileContent);
          } else {
            _this3.serializeMonomerTemplate(templateId, monomer, fileContent);
          }
        }
      });
      drawingEntitiesManager.polymerBonds.forEach(function (polymerBond) {
        assert.assert(polymerBond.secondMonomer);
        fileContent.root.connections.push({
          connectionType: polymerBond instanceof HydrogenBond.HydrogenBond ? ket.KetConnectionType.HYDROGEN : ket.KetConnectionType.SINGLE,
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
        if (!_.isNumber(globalAtomId) || !_.isNumber(monomerId)) {
          return;
        }
        fileContent.root.connections.push({
          connectionType: ket.KetConnectionType.SINGLE,
          endpoint1: {
            monomerId: helpers.setMonomerPrefix(monomerId),
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
            if (_.isNumber(globalAtomId)) {
              moleculesSelection.atoms.push(globalAtomId);
            }
          }
        });
        drawingEntitiesManager.bonds.forEach(function (bond) {
          if (bond.selected) {
            var bondIdMap = monomerToBondIdMap.get(bond.firstAtom.monomer);
            var globalBondId = bondIdMap === null || bondIdMap === void 0 ? void 0 : bondIdMap.get(bond.bondIdInMicroMode);
            if (_.isNumber(globalBondId)) {
              moleculesSelection.bonds.push(globalBondId);
            }
          }
        });
      }
      drawingEntitiesManager.rxnArrows.forEach(function (rxnArrow$1) {
        var arrow = new rxnArrow.RxnArrow({
          mode: rxnArrow$1.type,
          pos: [rxnArrow$1.startPosition, rxnArrow$1.endPosition],
          height: rxnArrow$1.height,
          initiallySelected: rxnArrow$1.initiallySelected,
          arrowId: rxnArrow$1.arrowId
        });
        struct.addRxnArrow(arrow);
      });
      drawingEntitiesManager.multitailArrows.forEach(function (multitailArrow) {
        var arrow = multitailArrow$1.MultitailArrow.fromKetNode(multitailArrow.toKetNode());
        arrow.arrowId = multitailArrow.arrowId;
        struct.addMultitailArrow(arrow);
      });
      drawingEntitiesManager.rxnPluses.forEach(function (rxnPlus$1) {
        var micromoleculeRxnPlus = new rxnPlus.RxnPlus({
          pp: rxnPlus$1.position,
          initiallySelected: rxnPlus$1.initiallySelected
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
      var drawingEntitiesManager = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new DrawingEntitiesManager.DrawingEntitiesManager();
      var selection = arguments.length > 2 ? arguments[2] : undefined;
      var isBeautified = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
      var needSetSelectionToMacromolecules = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var struct$1 = KetSerializer.removeLeavingGroupsFromConnectedAtoms(_struct);
      struct$1.enableInitiallySelected();
      var populatedStruct = helpers.populateStructWithSelection(struct$1, selection, true);
      MacromoleculesConverter.MacromoleculesConverter.convertStructToDrawingEntities(populatedStruct, drawingEntitiesManager);
      var _this$serializeMacrom = this.serializeMacromolecules(new struct.Struct(), drawingEntitiesManager, needSetSelectionToMacromolecules),
        serializedMacromolecules = _this$serializeMacrom.serializedMacromolecules,
        micromoleculesStruct = _this$serializeMacrom.micromoleculesStruct,
        moleculesSelection = _this$serializeMacrom.moleculesSelection;
      if (selection === undefined) {
        micromoleculesStruct.enableInitiallySelected();
      }
      if (needSetSelectionToMacromolecules) {
        helpers.populateStructWithSelection(micromoleculesStruct, moleculesSelection);
      }
      var serializedMicromoleculesStruct = JSON.parse(this.serializeMicromolecules(micromoleculesStruct));
      micromoleculesStruct.disableInitiallySelected();
      var fileContent = _objectSpread(_objectSpread({}, serializedMicromoleculesStruct), serializedMacromolecules);
      fileContent.root.nodes = [].concat(_toConsumableArray__default["default"](serializedMacromolecules.root.nodes), _toConsumableArray__default["default"](serializedMicromoleculesStruct.root.nodes));
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
          KetcherLogger.KetcherLogger.error("There is a ref for monomer template ".concat(templateRef.$ref, ", but template definition is not found"));
          return;
        }
        switch (template.type) {
          case ket.KetTemplateType.MONOMER_TEMPLATE:
            {
              library.push(_this4.convertMonomerTemplateToLibraryItem(template));
              break;
            }
          case ket.KetTemplateType.AMBIGUOUS_MONOMER_TEMPLATE:
            {
              var _variantMonomerTempla;
              var variantMonomerTemplate = template;
              var variantMonomerLibraryItem = {
                id: variantMonomerTemplate.id,
                label: (_variantMonomerTempla = variantMonomerTemplate.alias) !== null && _variantMonomerTempla !== void 0 ? _variantMonomerTempla : '%',
                idtAliases: variantMonomerTemplate.idtAliases,
                isAmbiguous: true,
                monomers: monomerToDrawingEntity.createMonomersForVariantMonomer(variantMonomerTemplate, monomersLibrary, KetSerializer.getMonomerFactory()),
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
      var resultingStruct = new struct.Struct();
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
      var library = (_provideEditorInstanc = editorSingleton.provideEditorInstance()) === null || _provideEditorInstanc === void 0 ? void 0 : _provideEditorInstanc.monomersLibraryParsedJson;
      if (!library) return;
      var libraryTemplate = library[helpers.setMonomerTemplatePrefix(template.id)];
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
        if (atom.Atom.isHiddenLeavingGroupAtom(struct, atomId, false, true)) {
          struct.atoms["delete"](atomId);
        }
      });
      struct.bonds.forEach(function (bond$1, bondId) {
        if (bond.Bond.isBondToHiddenLeavingGroup(struct, bond$1)) {
          struct.bonds["delete"](bondId);
        }
      });
      struct.sgroups.forEach(function (sgroup) {
        var attachmentPoints = sgroup.getAttachmentPoints();
        var attachmentPointsToReplace = new Map();
        attachmentPoints.forEach(function (attachmentPoint) {
          if (_.isNumber(attachmentPoint.leaveAtomId) && atom.Atom.isHiddenLeavingGroupAtom(struct, attachmentPoint.leaveAtomId, true, true)) {
            var attachmentPointClone = new sGroupAttachmentPoint.SGroupAttachmentPoint(attachmentPoint.atomId, undefined, attachmentPoint.attachmentId, attachmentPoint.attachmentPointNumber);
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
_defineProperty__default["default"](KetSerializer, "_monomerFactory", null);

exports.KetSerializer = KetSerializer;
//# sourceMappingURL=ketSerializer.js.map
