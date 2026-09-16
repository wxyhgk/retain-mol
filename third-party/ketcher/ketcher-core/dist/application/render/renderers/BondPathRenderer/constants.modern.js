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
import { BondType } from '../../../../domain/entities/CoreBond.modern.js';

var BondWidth = 2;
var StereoBondWidth = 6;
var BondSpace = 6;
var LinesOffset = BondSpace / 2;
var BondDashArrayMap = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, BondType.Aromatic, '6'), BondType.SingleDouble, '6'), BondType.SingleAromatic, '4 4 1 4'), BondType.DoubleAromatic, '4 4 1 4'), BondType.Any, '6'), BondType.Hydrogen, '3');

export { BondDashArrayMap, BondSpace, BondWidth, LinesOffset, StereoBondWidth };
//# sourceMappingURL=constants.modern.js.map
