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

var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _slicedToArray = require('@babel/runtime/helpers/slicedToArray');
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
var struct = require('../../../entities/struct.js');
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
var BaseMonomer = require('../../../entities/BaseMonomer.js');
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
var assert = require('../../../../utilities/assert.js');
require('../../../entities/CoreAtom.js');
require('../../../entities/CoreStereoFlag.js');
require('@babel/runtime/helpers/typeof');
require('../../../constants/elements.js');
require('../../../constants/element.types.js');
require('../../../constants/generics.js');
var image = require('../../../constants/image.js');
var multitailArrow = require('../../../constants/multitailArrow.js');
require('../../../constants/chains.js');
require('../../../constants/monomers.js');
var monomers = require('../../../types/monomers.js');
require('../../../types/entities.js');
var attachmentPointCalculations = require('../../../helpers/attachmentPointCalculations.js');
var _ = require('lodash');
var moleculeToStruct = require('./moleculeToStruct.js');
var rxnToStruct = require('./rxnToStruct.js');
var simpleObjectToStruct = require('./simpleObjectToStruct.js');
var textToStruct = require('./textToStruct.js');
var imageToStruct = require('./imageToStruct.js');
var multitailArrowToStruct = require('./multitailArrowToStruct.js');
var rgroupToStruct = require('./rgroupToStruct.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

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
function fillMonomerTemplateStruct(ket) {
  var _ket$header$moleculeN, _ket$header;
  var resultingStruct = new struct.Struct();
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
    var _ref2 = _slicedToArray__default["default"](_ref, 2),
      key = _ref2[0],
      attachmentPoint = _ref2[1];
    var normalizedLabel;
    if (attachmentPoint.type === 'left') {
      normalizedLabel = monomers.AttachmentPointName.R1;
    } else if (attachmentPoint.type === 'right') {
      normalizedLabel = monomers.AttachmentPointName.R2;
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
  var _BaseMonomer$getAttac = BaseMonomer.BaseMonomer.getAttachmentPointDictFromMonomerDefinition(attachmentPoints),
    attachmentPointsList = _BaseMonomer$getAttac.attachmentPointsList;
  attachmentPoints === null || attachmentPoints === void 0 || attachmentPoints.forEach(function (attachmentPoint, attachmentPointIndex) {
    var _attachmentPoint$leav;
    var firstAtomInLeavingGroup = (_attachmentPoint$leav = attachmentPoint.leavingGroup) === null || _attachmentPoint$leav === void 0 ? void 0 : _attachmentPoint$leav.atoms[0];
    var leavingGroupAtom = monomerItem.struct.atoms.get(_.isNumber(firstAtomInLeavingGroup) ? firstAtomInLeavingGroup : attachmentPoint.attachmentAtom);
    assert.assert(leavingGroupAtom);
    leavingGroupAtom.rglabel = 0 | 1 << Number((attachmentPoint.label ? attachmentPoint.label : attachmentPointsList[attachmentPointIndex]).replace('R', '')) - 1;
    assert.assert(monomerItem.props.MonomerCaps);
    monomerItem.props.MonomerCaps[attachmentPointCalculations.getAttachmentPointLabelWithBinaryShift(leavingGroupAtom.rglabel)] = leavingGroupAtom.label;
  });
}

exports.convertMonomerTemplateToStruct = convertMonomerTemplateToStruct;
exports.fillMonomerTemplateStruct = fillMonomerTemplateStruct;
exports.fillStructRgLabelsByMonomerTemplate = fillStructRgLabelsByMonomerTemplate;
exports.getTemplateAttachmentPoints = getTemplateAttachmentPoints;
exports.normalizeTemplateAttachmentPoints = normalizeTemplateAttachmentPoints;
//# sourceMappingURL=monomerTemplateUtils.js.map
