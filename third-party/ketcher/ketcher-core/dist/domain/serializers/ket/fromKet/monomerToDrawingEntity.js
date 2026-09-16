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

var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
require('../../../entities/atom.js');
require('../../../entities/atomList.js');
require('../../../entities/bond.js');
require('../../../entities/fixedPrecision.js');
require('../../../entities/fragment.js');
require('../../../entities/functionalGroup.js');
require('../../../entities/halfBond.js');
require('../../../entities/loop.js');
require('../../../entities/rgroup.js');
require('../../../entities/rgroupAttachmentPoint.js');
require('../../../entities/rxnArrow.js');
require('../../../entities/rxnPlus.js');
require('../../../entities/sgroup.js');
require('../../../entities/sgroupForest.js');
require('../../../entities/simpleObject.js');
require('../../../entities/struct.js');
require('../../../entities/text.js');
require('../../../entities/pile.js');
var vec2 = require('../../../entities/vec2.js');
require('../../../entities/box2Abs.js');
require('../../../entities/pool.js');
require('../../../entities/image.js');
require('../../../entities/multitailArrow.js');
require('../../../entities/highlight.js');
require('../../../entities/sGroupAttachmentPoint.js');
require('../../../entities/monomerMicromolecule.js');
require('../../../entities/Peptide.js');
require('../../../entities/BaseMonomer.js');
require('../../../entities/Chem.js');
require('../../../entities/Sugar.js');
require('../../../entities/RNABase.js');
require('../../../entities/Phosphate.js');
require('../../../entities/Axis.js');
require('../../../entities/Nucleoside.js');
require('../../../entities/Nucleotide.js');
require('../../../entities/monomer-chains/types.js');
require('../../../entities/monomer-chains/Chain.js');
require('../../../entities/monomer-chains/ChainsCollection.js');
require('../../../entities/MonomerSequenceNode.js');
require('../../../entities/EmptySequenceNode.js');
require('../../../entities/LinkerSequenceNode.js');
require('../../../entities/UnresolvedMonomer.js');
require('../../../entities/UnsplitNucleotide.js');
require('../../../entities/PolymerBond.js');
require('../../../entities/AmbiguousMonomer.js');
require('../../../entities/MonomerToAtomBond.js');
require('../../../entities/HydrogenBond.js');
require('../../../entities/SGroupDrawingEntity.js');
require('../../../entities/BackBoneSequenceNode.js');
require('../../../entities/Command.js');
require('../../../../utilities/runAsyncAction.js');
require('../../../../utilities/KetcherLogger.js');
require('../../../../utilities/SettingsManager.js');
require('../../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../../utilities/clipboardUtils.js');
require('../../../entities/CoreAtom.js');
require('../../../entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../constants/elements.js');
require('../../../constants/element.types.js');
require('../../../constants/generics.js');
require('../../../constants/chains.js');
require('../../../constants/monomers.js');
var helpers = require('../helpers.js');
var monomerTemplateUtils = require('./monomerTemplateUtils.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty__default["default"](e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function templateToMonomerProps(template) {
  var _ref, _ref2, _template$fullName, _template$naturalAnal, _template$naturalAnal2, _ref3, _template$name;
  return _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
    id: template.id,
    Name: (_ref = (_ref2 = (_template$fullName = template.fullName) !== null && _template$fullName !== void 0 ? _template$fullName : template.name) !== null && _ref2 !== void 0 ? _ref2 : template.alias) !== null && _ref !== void 0 ? _ref : template.id,
    MonomerNaturalAnalogCode: (_template$naturalAnal = template.naturalAnalogShort) !== null && _template$naturalAnal !== void 0 ? _template$naturalAnal : '',
    MonomerNaturalAnalogThreeLettersCode: (_template$naturalAnal2 = template.naturalAnalog) !== null && _template$naturalAnal2 !== void 0 ? _template$naturalAnal2 : '',
    MonomerName: (_ref3 = (_template$name = template.name) !== null && _template$name !== void 0 ? _template$name : template.alias) !== null && _ref3 !== void 0 ? _ref3 : template.id,
    MonomerFullName: template.fullName,
    MonomerType: template.classHELM,
    MonomerClass: template["class"],
    MonomerCaps: {},
    idtAliases: template.idtAliases,
    unresolved: template.unresolved,
    modificationTypes: template.modificationTypes
  }, template.aliasHELM ? {
    aliasHELM: template.aliasHELM
  } : {}), template.aliasBILN ? {
    aliasBILN: template.aliasBILN
  } : {}), template.aliasAxoLabs ? {
    aliasAxoLabs: template.aliasAxoLabs
  } : {}), template.aliasBILN ? {
    aliasBILN: template.aliasBILN
  } : {}), template.hidden ? {
    hidden: template.hidden
  } : {});
}
function monomerToDrawingEntity(node, template, struct, drawingEntitiesManager) {
  var position = helpers.switchIntoChemistryCoordSystem(new vec2.Vec2(node.position.x, node.position.y));
  var alias = template.alias,
    id = template.id;
  var seqid = node.seqid,
    expanded = node.expanded,
    transformation = node.transformation;
  return drawingEntitiesManager.addMonomer(_objectSpread(_objectSpread({
    struct: struct,
    label: alias !== null && alias !== void 0 ? alias : id,
    colorScheme: undefined,
    favorite: false,
    props: templateToMonomerProps(template),
    attachmentPoints: monomerTemplateUtils.getTemplateAttachmentPoints(template),
    seqId: seqid
  }, expanded !== undefined && {
    expanded: expanded
  }), transformation !== undefined && {
    transformation: helpers.modifyTransformation(transformation)
  }), position);
}
function createMonomersForVariantMonomer(variantMonomerTemplate, parsedFileContent, monomerFactory) {
  var monomerTemplates = variantMonomerTemplate.options.map(function (option) {
    return parsedFileContent[helpers.setMonomerTemplatePrefix(option.templateId)];
  });
  var monomers = monomerTemplates.map(function (monomerTemplate) {
    var monomerItem = {
      label: monomerTemplate.alias,
      expanded: false,
      struct: monomerTemplateUtils.convertMonomerTemplateToStruct(monomerTemplate),
      props: templateToMonomerProps(monomerTemplate),
      attachmentPoints: monomerTemplateUtils.getTemplateAttachmentPoints(monomerTemplate)
    };
    var _monomerFactory = monomerFactory(monomerItem),
      _monomerFactory2 = _slicedToArray__default["default"](_monomerFactory, 1),
      MonomerConstructor = _monomerFactory2[0];
    monomerTemplateUtils.fillStructRgLabelsByMonomerTemplate(monomerTemplate, monomerItem);
    return new MonomerConstructor(monomerItem, undefined, {
      generateId: false
    });
  });
  return monomers;
}
function variantMonomerToDrawingEntity(drawingEntitiesManager, node, template, parsedFileContent, monomerFactory) {
  var position = helpers.switchIntoChemistryCoordSystem(new vec2.Vec2(node.position.x, node.position.y));
  var monomers = createMonomersForVariantMonomer(template, parsedFileContent, monomerFactory);
  return drawingEntitiesManager.addAmbiguousMonomer({
    monomers: monomers,
    id: template.id,
    subtype: template.subtype,
    label: node.alias,
    options: template.options,
    idtAliases: template.idtAliases,
    isAmbiguous: true,
    transformation: node.transformation
  }, position);
}

exports.createMonomersForVariantMonomer = createMonomersForVariantMonomer;
exports.monomerToDrawingEntity = monomerToDrawingEntity;
exports.templateToMonomerProps = templateToMonomerProps;
exports.variantMonomerToDrawingEntity = variantMonomerToDrawingEntity;
//# sourceMappingURL=monomerToDrawingEntity.js.map
