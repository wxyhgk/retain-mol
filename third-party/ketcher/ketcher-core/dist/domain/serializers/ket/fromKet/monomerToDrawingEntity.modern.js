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
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import '../../../entities/atom.modern.js';
import '../../../entities/atomList.modern.js';
import '../../../entities/bond.modern.js';
import '../../../entities/fixedPrecision.modern.js';
import '../../../entities/fragment.modern.js';
import '../../../entities/functionalGroup.modern.js';
import '../../../entities/halfBond.modern.js';
import '../../../entities/loop.modern.js';
import '../../../entities/rgroup.modern.js';
import '../../../entities/rgroupAttachmentPoint.modern.js';
import '../../../entities/rxnArrow.modern.js';
import '../../../entities/rxnPlus.modern.js';
import '../../../entities/sgroup.modern.js';
import '../../../entities/sgroupForest.modern.js';
import '../../../entities/simpleObject.modern.js';
import '../../../entities/struct.modern.js';
import '../../../entities/text.modern.js';
import '../../../entities/pile.modern.js';
import { Vec2 } from '../../../entities/vec2.modern.js';
import '../../../entities/box2Abs.modern.js';
import '../../../entities/pool.modern.js';
import '../../../entities/image.modern.js';
import '../../../entities/multitailArrow.modern.js';
import '../../../entities/highlight.modern.js';
import '../../../entities/sGroupAttachmentPoint.modern.js';
import '../../../entities/monomerMicromolecule.modern.js';
import '../../../entities/Peptide.modern.js';
import '../../../entities/BaseMonomer.modern.js';
import '../../../entities/Chem.modern.js';
import '../../../entities/Sugar.modern.js';
import '../../../entities/RNABase.modern.js';
import '../../../entities/Phosphate.modern.js';
import '../../../entities/Axis.modern.js';
import '../../../entities/Nucleoside.modern.js';
import '../../../entities/Nucleotide.modern.js';
import '../../../entities/monomer-chains/types.modern.js';
import '../../../entities/monomer-chains/Chain.modern.js';
import '../../../entities/monomer-chains/ChainsCollection.modern.js';
import '../../../entities/MonomerSequenceNode.modern.js';
import '../../../entities/EmptySequenceNode.modern.js';
import '../../../entities/LinkerSequenceNode.modern.js';
import '../../../entities/UnresolvedMonomer.modern.js';
import '../../../entities/UnsplitNucleotide.modern.js';
import '../../../entities/PolymerBond.modern.js';
import '../../../entities/AmbiguousMonomer.modern.js';
import '../../../entities/MonomerToAtomBond.modern.js';
import '../../../entities/HydrogenBond.modern.js';
import '../../../entities/SGroupDrawingEntity.modern.js';
import '../../../entities/BackBoneSequenceNode.modern.js';
import '../../../entities/Command.modern.js';
import '../../../../utilities/runAsyncAction.modern.js';
import '../../../../utilities/KetcherLogger.modern.js';
import '../../../../utilities/SettingsManager.modern.js';
import '../../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../../utilities/clipboardUtils.modern.js';
import '../../../entities/CoreAtom.modern.js';
import '../../../entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../constants/elements.modern.js';
import '../../../constants/element.types.modern.js';
import '../../../constants/generics.modern.js';
import '../../../constants/chains.modern.js';
import '../../../constants/monomers.modern.js';
import { switchIntoChemistryCoordSystem, modifyTransformation, setMonomerTemplatePrefix } from '../helpers.modern.js';
import { getTemplateAttachmentPoints, convertMonomerTemplateToStruct, fillStructRgLabelsByMonomerTemplate } from './monomerTemplateUtils.modern.js';

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
  var position = switchIntoChemistryCoordSystem(new Vec2(node.position.x, node.position.y));
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
    attachmentPoints: getTemplateAttachmentPoints(template),
    seqId: seqid
  }, expanded !== undefined && {
    expanded: expanded
  }), transformation !== undefined && {
    transformation: modifyTransformation(transformation)
  }), position);
}
function createMonomersForVariantMonomer(variantMonomerTemplate, parsedFileContent, monomerFactory) {
  var monomerTemplates = variantMonomerTemplate.options.map(function (option) {
    return parsedFileContent[setMonomerTemplatePrefix(option.templateId)];
  });
  var monomers = monomerTemplates.map(function (monomerTemplate) {
    var monomerItem = {
      label: monomerTemplate.alias,
      expanded: false,
      struct: convertMonomerTemplateToStruct(monomerTemplate),
      props: templateToMonomerProps(monomerTemplate),
      attachmentPoints: getTemplateAttachmentPoints(monomerTemplate)
    };
    var _monomerFactory = monomerFactory(monomerItem),
      _monomerFactory2 = _slicedToArray(_monomerFactory, 1),
      MonomerConstructor = _monomerFactory2[0];
    fillStructRgLabelsByMonomerTemplate(monomerTemplate, monomerItem);
    return new MonomerConstructor(monomerItem, undefined, {
      generateId: false
    });
  });
  return monomers;
}
function variantMonomerToDrawingEntity(drawingEntitiesManager, node, template, parsedFileContent, monomerFactory) {
  var position = switchIntoChemistryCoordSystem(new Vec2(node.position.x, node.position.y));
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

export { createMonomersForVariantMonomer, monomerToDrawingEntity, templateToMonomerProps, variantMonomerToDrawingEntity };
//# sourceMappingURL=monomerToDrawingEntity.modern.js.map
