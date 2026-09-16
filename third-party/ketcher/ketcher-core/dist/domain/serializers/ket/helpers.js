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

var _typeof = require('@babel/runtime/helpers/typeof');
var Axis = require('../../entities/Axis.js');
var vec2 = require('../../entities/vec2.js');
var _ = require('lodash');
var ket = require('../../../application/formatters/types/ket.js');
require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
require('../../constants/chains.js');
var monomers$1 = require('../../constants/monomers.js');
var monomers = require('../../helpers/monomers.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _typeof__default = /*#__PURE__*/_interopDefaultLegacy(_typeof);

var hasNumericYCoordinate = function hasNumericYCoordinate(value) {
  return _typeof__default["default"](value) === 'object' && value !== null && 'y' in value && typeof value.y === 'number';
};
var customizer = function customizer(value) {
  if (hasNumericYCoordinate(value) && value.y) {
    var clonedValue = _.cloneDeep(value);
    clonedValue.y = -clonedValue.y;
    return clonedValue;
  }
  return undefined;
};
var getNodeWithInvertedYCoord = function getNodeWithInvertedYCoord(node) {
  return _.cloneDeepWith(node, customizer);
};
var setMonomerTemplatePrefix = function setMonomerTemplatePrefix(templateName) {
  return "monomerTemplate-".concat(templateName);
};
var setMonomerPrefix = function setMonomerPrefix(monomerId) {
  return "monomer".concat(monomerId);
};
var setMonomerGroupTemplatePrefix = function setMonomerGroupTemplatePrefix(templateName) {
  return "".concat(ket.KetTemplateType.MONOMER_GROUP_TEMPLATE, "-").concat(templateName);
};
var setAmbiguousMonomerTemplatePrefix = function setAmbiguousMonomerTemplatePrefix(templateName) {
  return "ambiguousMonomerTemplate-".concat(templateName);
};
var setAmbiguousMonomerPrefix = function setAmbiguousMonomerPrefix(monomerId) {
  return "ambiguousMonomer".concat(monomerId);
};
var getKetRef = function getKetRef(entityId) {
  return {
    $ref: entityId
  };
};
var getMonomerTemplateRefFromMonomerItem = function getMonomerTemplateRefFromMonomerItem(monomerItem) {
  var props = monomerItem.props;
  if (props.id) {
    return setMonomerTemplatePrefix(props.id);
  }
  return setMonomerTemplatePrefix(monomers.getMonomerUniqueKey(monomerItem));
};
var getHELMClassByKetMonomerClass = function getHELMClassByKetMonomerClass(monomerClass) {
  if (monomerClass === monomers$1.KetMonomerClass.AminoAcid) {
    return monomers$1.MONOMER_CONST.PEPTIDE;
  }
  if (monomerClass === monomers$1.KetMonomerClass.CHEM) {
    return monomers$1.MONOMER_CONST.CHEM;
  }
  return monomers$1.MONOMER_CONST.RNA;
};
var fillNaturalAnalogueForPhosphateAndSugar = function fillNaturalAnalogueForPhosphateAndSugar(naturalAnalogue, monomerClass) {
  if (naturalAnalogue !== '') {
    return naturalAnalogue;
  }
  if (monomerClass === monomers$1.KetMonomerClass.Sugar) {
    return monomers$1.RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
  }
  if (monomerClass === monomers$1.KetMonomerClass.Phosphate) {
    return monomers$1.RNA_DNA_NON_MODIFIED_PART.PHOSPHATE;
  }
  return naturalAnalogue;
};
var rotateCoordAxisBy180Degrees = function rotateCoordAxisBy180Degrees(position, axis) {
  var rotatedPosition = {
    x: position.x,
    y: position.y,
    z: position.z
  };
  rotatedPosition[axis] = -rotatedPosition[axis];
  return new vec2.Vec2(rotatedPosition.x, rotatedPosition.y, rotatedPosition.z);
};
var switchIntoChemistryCoordSystem = function switchIntoChemistryCoordSystem(position) {
  return rotateCoordAxisBy180Degrees(position, Axis.Axis.y);
};
var modifyTransformation = function modifyTransformation(transformation) {
  var rotate = transformation.rotate;
  var newTransformation = _.cloneDeep(transformation);
  if (rotate) {
    newTransformation.rotate = -rotate;
  }
  return newTransformation;
};
var populateStructWithSelection = function populateStructWithSelection(populatedStruct, selection) {
  var resetSelection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!selection) {
    return populatedStruct;
  }
  Object.keys(selection).forEach(function (entity) {
    var _populatedStruct$enti;
    var selectedEntities = selection[entity];
    (_populatedStruct$enti = populatedStruct[entity]) === null || _populatedStruct$enti === void 0 || _populatedStruct$enti.forEach(function (value, key) {
      if (typeof value.setInitiallySelected === 'function') {
        if (resetSelection) {
          value.setInitiallySelected(selectedEntities.includes(key) || undefined);
        } else if (selectedEntities.includes(key)) {
          value.setInitiallySelected(true);
        }
      }
    });
  });
  return populatedStruct;
};

exports.fillNaturalAnalogueForPhosphateAndSugar = fillNaturalAnalogueForPhosphateAndSugar;
exports.getHELMClassByKetMonomerClass = getHELMClassByKetMonomerClass;
exports.getKetRef = getKetRef;
exports.getMonomerTemplateRefFromMonomerItem = getMonomerTemplateRefFromMonomerItem;
exports.getNodeWithInvertedYCoord = getNodeWithInvertedYCoord;
exports.modifyTransformation = modifyTransformation;
exports.populateStructWithSelection = populateStructWithSelection;
exports.setAmbiguousMonomerPrefix = setAmbiguousMonomerPrefix;
exports.setAmbiguousMonomerTemplatePrefix = setAmbiguousMonomerTemplatePrefix;
exports.setMonomerGroupTemplatePrefix = setMonomerGroupTemplatePrefix;
exports.setMonomerPrefix = setMonomerPrefix;
exports.setMonomerTemplatePrefix = setMonomerTemplatePrefix;
exports.switchIntoChemistryCoordSystem = switchIntoChemistryCoordSystem;
//# sourceMappingURL=helpers.js.map
