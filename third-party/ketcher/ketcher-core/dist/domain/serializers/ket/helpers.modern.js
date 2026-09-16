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
import _typeof from '@babel/runtime/helpers/typeof';
import { Axis } from '../../entities/Axis.modern.js';
import { Vec2 } from '../../entities/vec2.modern.js';
import { cloneDeepWith, cloneDeep } from 'lodash';
import { KetTemplateType } from '../../../application/formatters/types/ket.modern.js';
import '../../constants/elements.modern.js';
import '../../constants/element.types.modern.js';
import '../../constants/generics.modern.js';
import '../../constants/chains.modern.js';
import { KetMonomerClass, MONOMER_CONST, RNA_DNA_NON_MODIFIED_PART } from '../../constants/monomers.modern.js';
import { getMonomerUniqueKey } from '../../helpers/monomers.modern.js';

var hasNumericYCoordinate = function hasNumericYCoordinate(value) {
  return _typeof(value) === 'object' && value !== null && 'y' in value && typeof value.y === 'number';
};
var customizer = function customizer(value) {
  if (hasNumericYCoordinate(value) && value.y) {
    var clonedValue = cloneDeep(value);
    clonedValue.y = -clonedValue.y;
    return clonedValue;
  }
  return undefined;
};
var getNodeWithInvertedYCoord = function getNodeWithInvertedYCoord(node) {
  return cloneDeepWith(node, customizer);
};
var setMonomerTemplatePrefix = function setMonomerTemplatePrefix(templateName) {
  return "monomerTemplate-".concat(templateName);
};
var setMonomerPrefix = function setMonomerPrefix(monomerId) {
  return "monomer".concat(monomerId);
};
var setMonomerGroupTemplatePrefix = function setMonomerGroupTemplatePrefix(templateName) {
  return "".concat(KetTemplateType.MONOMER_GROUP_TEMPLATE, "-").concat(templateName);
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
  return setMonomerTemplatePrefix(getMonomerUniqueKey(monomerItem));
};
var getHELMClassByKetMonomerClass = function getHELMClassByKetMonomerClass(monomerClass) {
  if (monomerClass === KetMonomerClass.AminoAcid) {
    return MONOMER_CONST.PEPTIDE;
  }
  if (monomerClass === KetMonomerClass.CHEM) {
    return MONOMER_CONST.CHEM;
  }
  return MONOMER_CONST.RNA;
};
var fillNaturalAnalogueForPhosphateAndSugar = function fillNaturalAnalogueForPhosphateAndSugar(naturalAnalogue, monomerClass) {
  if (naturalAnalogue !== '') {
    return naturalAnalogue;
  }
  if (monomerClass === KetMonomerClass.Sugar) {
    return RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
  }
  if (monomerClass === KetMonomerClass.Phosphate) {
    return RNA_DNA_NON_MODIFIED_PART.PHOSPHATE;
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
  return new Vec2(rotatedPosition.x, rotatedPosition.y, rotatedPosition.z);
};
var switchIntoChemistryCoordSystem = function switchIntoChemistryCoordSystem(position) {
  return rotateCoordAxisBy180Degrees(position, Axis.y);
};
var modifyTransformation = function modifyTransformation(transformation) {
  var rotate = transformation.rotate;
  var newTransformation = cloneDeep(transformation);
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

export { fillNaturalAnalogueForPhosphateAndSugar, getHELMClassByKetMonomerClass, getKetRef, getMonomerTemplateRefFromMonomerItem, getNodeWithInvertedYCoord, modifyTransformation, populateStructWithSelection, setAmbiguousMonomerPrefix, setAmbiguousMonomerTemplatePrefix, setMonomerGroupTemplatePrefix, setMonomerPrefix, setMonomerTemplatePrefix, switchIntoChemistryCoordSystem };
//# sourceMappingURL=helpers.modern.js.map
