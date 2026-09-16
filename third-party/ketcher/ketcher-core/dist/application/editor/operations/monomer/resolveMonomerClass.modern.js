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
import { KetMonomerClass, MONOMER_CONST, rnaDnaNaturalAnalogues, unknownNaturalAnalogues } from '../../../../domain/constants/monomers.modern.js';
import '../../../formatters/types/ket.modern.js';

var resolveMonomerClass = function resolveMonomerClass(monomer) {
  if (monomer.props.MonomerClass === KetMonomerClass.RNA || monomer.props.MonomerClass === KetMonomerClass.DNA) {
    return KetMonomerClass.RNA;
  }
  if (monomer.props.MonomerClass === KetMonomerClass.AminoAcid || monomer.props.MonomerType === MONOMER_CONST.PEPTIDE) {
    return KetMonomerClass.AminoAcid;
  }
  if (monomer.props.MonomerClass === KetMonomerClass.Sugar || monomer.props.MonomerType === MONOMER_CONST.RNA && monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.R) {
    return KetMonomerClass.Sugar;
  }
  if (monomer.props.MonomerClass === KetMonomerClass.Phosphate || monomer.props.MonomerType === MONOMER_CONST.RNA && monomer.props.MonomerNaturalAnalogCode === MONOMER_CONST.P) {
    return KetMonomerClass.Phosphate;
  }
  if (monomer.props.MonomerClass === KetMonomerClass.Base || monomer.props.MonomerType === MONOMER_CONST.RNA && [].concat(_toConsumableArray(rnaDnaNaturalAnalogues), _toConsumableArray(unknownNaturalAnalogues)).includes(monomer.props.MonomerNaturalAnalogCode)) {
    return KetMonomerClass.Base;
  }
  return KetMonomerClass.CHEM;
};

export { resolveMonomerClass };
//# sourceMappingURL=resolveMonomerClass.modern.js.map
