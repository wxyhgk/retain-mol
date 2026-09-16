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
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
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
import { Struct } from '../../../entities/struct.modern.js';
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
import { BaseMonomer } from '../../../entities/BaseMonomer.modern.js';
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
import { assert } from '../../../../utilities/assert.modern.js';
import '../../../entities/CoreAtom.modern.js';
import '../../../entities/CoreStereoFlag.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../constants/elements.modern.js';
import '../../../constants/element.types.modern.js';
import '../../../constants/generics.modern.js';
import { IMAGE_SERIALIZE_KEY } from '../../../constants/image.modern.js';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from '../../../constants/multitailArrow.modern.js';
import '../../../constants/chains.modern.js';
import '../../../constants/monomers.modern.js';
import { AttachmentPointName } from '../../../types/monomers.modern.js';
import '../../../types/entities.modern.js';
import { getAttachmentPointLabelWithBinaryShift } from '../../../helpers/attachmentPointCalculations.modern.js';
import { isNumber } from 'lodash';
import { moleculeToStruct } from './moleculeToStruct.modern.js';
import { rxnToStruct } from './rxnToStruct.modern.js';
import { simpleObjectToStruct } from './simpleObjectToStruct.modern.js';
import { textToStruct } from './textToStruct.modern.js';
import { imageToStruct } from './imageToStruct.modern.js';
import { multitailArrowToStruct } from './multitailArrowToStruct.modern.js';
import { rgroupToStruct } from './rgroupToStruct.modern.js';

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
function fillMonomerTemplateStruct(ket) {
  var _ket$header$moleculeN, _ket$header;
  var resultingStruct = new Struct();
  var nodes = ket.root.nodes;
  Object.keys(nodes).forEach(function (i) {
    if (nodes[i].type) parseNode(nodes[i], resultingStruct);else if (nodes[i].$ref) parseNode(ket[nodes[i].$ref], resultingStruct);
  });
  resultingStruct.name = (_ket$header$moleculeN = (_ket$header = ket.header) === null || _ket$header === void 0 ? void 0 : _ket$header.moleculeName) !== null && _ket$header$moleculeN !== void 0 ? _ket$header$moleculeN : '';
  return resultingStruct;
}
function normalizeTemplateAttachmentPoints(template) {
  var attachmentPointsDict = template.attachmentPointsDict;
  if (!attachmentPointsDict) {
    return template.attachmentPoints;
  }
  return Object.entries(attachmentPointsDict).map(function (_ref) {
    var _attachmentPoint$labe;
    var _ref2 = _slicedToArray(_ref, 2),
      key = _ref2[0],
      attachmentPoint = _ref2[1];
    var normalizedLabel;
    if (attachmentPoint.type === 'left') {
      normalizedLabel = AttachmentPointName.R1;
    } else if (attachmentPoint.type === 'right') {
      normalizedLabel = AttachmentPointName.R2;
    } else {
      normalizedLabel = undefined;
    }
    return _objectSpread(_objectSpread({}, attachmentPoint), {}, {
      label: (_attachmentPoint$labe = attachmentPoint.label) !== null && _attachmentPoint$labe !== void 0 ? _attachmentPoint$labe : key
    }, normalizedLabel ? {
      type: attachmentPoint.type
    } : {});
  });
}
function getTemplateAttachmentPoints(template) {
  var _normalizeTemplateAtt;
  var attachmentPoints = (_normalizeTemplateAtt = normalizeTemplateAttachmentPoints(template)) !== null && _normalizeTemplateAtt !== void 0 ? _normalizeTemplateAtt : [];
  return template.unresolved ? attachmentPoints.map(function (_, index) {
    return {
      attachmentAtom: index,
      leavingGroup: {
        atoms: []
      }
    };
  }) : attachmentPoints;
}
function convertMonomerTemplateToStruct(template) {
  var _getTemplateAttachmen;
  var attachmentPoints = (_getTemplateAttachmen = getTemplateAttachmentPoints(template)) !== null && _getTemplateAttachmen !== void 0 ? _getTemplateAttachmen : [];
  return fillMonomerTemplateStruct({
    root: {
      nodes: [{
        $ref: 'mol0'
      }]
    },
    mol0: _objectSpread(_objectSpread({}, template), {}, {
      type: 'molecule',
      atoms: template.unresolved ? attachmentPoints === null || attachmentPoints === void 0 ? void 0 : attachmentPoints.map(function (_, index) {
        return {
          label: 'C',
          location: [index, index, index]
        };
      }) : template.atoms,
      bonds: template.unresolved ? attachmentPoints === null || attachmentPoints === void 0 ? void 0 : attachmentPoints.map(function (_, index) {
        if (index === attachmentPoints.length - 1) {
          return {
            type: 1,
            atoms: [0, attachmentPoints.length - 1]
          };
        }
        return {
          type: 1,
          atoms: [index, index + 1]
        };
      }) : template.bonds,
      attachmentPoints: attachmentPoints
    }),
    header: {
      moleculeName: template.fullName
    }
  });
}
function fillStructRgLabelsByMonomerTemplate(template, monomerItem) {
  if (monomerItem.props.unresolved) {
    return;
  }
  var attachmentPoints = getTemplateAttachmentPoints(template);
  var _BaseMonomer$getAttac = BaseMonomer.getAttachmentPointDictFromMonomerDefinition(attachmentPoints),
    attachmentPointsList = _BaseMonomer$getAttac.attachmentPointsList;
  attachmentPoints === null || attachmentPoints === void 0 || attachmentPoints.forEach(function (attachmentPoint, attachmentPointIndex) {
    var _attachmentPoint$leav;
    var firstAtomInLeavingGroup = (_attachmentPoint$leav = attachmentPoint.leavingGroup) === null || _attachmentPoint$leav === void 0 ? void 0 : _attachmentPoint$leav.atoms[0];
    var leavingGroupAtom = monomerItem.struct.atoms.get(isNumber(firstAtomInLeavingGroup) ? firstAtomInLeavingGroup : attachmentPoint.attachmentAtom);
    assert(leavingGroupAtom);
    leavingGroupAtom.rglabel = 0 | 1 << Number((attachmentPoint.label ? attachmentPoint.label : attachmentPointsList[attachmentPointIndex]).replace('R', '')) - 1;
    assert(monomerItem.props.MonomerCaps);
    monomerItem.props.MonomerCaps[getAttachmentPointLabelWithBinaryShift(leavingGroupAtom.rglabel)] = leavingGroupAtom.label;
  });
}

export { convertMonomerTemplateToStruct, fillMonomerTemplateStruct, fillStructRgLabelsByMonomerTemplate, getTemplateAttachmentPoints, normalizeTemplateAttachmentPoints };
//# sourceMappingURL=monomerTemplateUtils.modern.js.map
