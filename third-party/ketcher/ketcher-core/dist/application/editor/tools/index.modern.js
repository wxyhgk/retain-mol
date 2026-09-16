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
import { MonomerTool } from './Monomer.modern.js';
import { RnaPresetTool } from './RnaPreset.modern.js';
import { SelectRectangle } from './select/SelectRectangle.modern.js';
export { SelectRectangle } from './select/SelectRectangle.modern.js';
import { PolymerBond } from './Bond.modern.js';
import { EraserTool } from './Erase.modern.js';
import { ClearTool } from './Clear.modern.js';
import { HandTool } from './Hand.modern.js';
import { ToolName } from './types.modern.js';
import { SelectLasso } from './select/SelectLasso.modern.js';
export { SelectLasso } from './select/SelectLasso.modern.js';
import { SelectFragment } from './select/SelectFragment.modern.js';
export { SelectFragment } from './select/SelectFragment.modern.js';
export { SCROLL_POSITION, ZoomTool } from './Zoom.modern.js';
export { SelectBase } from './select/SelectBase.modern.js';
import '../../formatters/types/ket.modern.js';
import '../../../domain/types/monomers.modern.js';
import '../../../domain/types/entities.modern.js';
import '@babel/runtime/helpers/typeof';
import '../../../domain/entities/Axis.modern.js';
import '../../../domain/entities/vec2.modern.js';
import 'lodash';
import '../../../domain/constants/elements.modern.js';
import '../../../domain/constants/element.types.modern.js';
import '../../../domain/constants/generics.modern.js';
import '../../../domain/constants/chains.modern.js';
import '../../../domain/constants/monomers.modern.js';
import '../../../domain/helpers/monomers.modern.js';

var toolsMap = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, ToolName.monomer, MonomerTool), ToolName.preset, RnaPresetTool), ToolName.selectRectangle, SelectRectangle), ToolName.selectLasso, SelectLasso), ToolName.selectStructure, SelectFragment), ToolName.bondSingle, PolymerBond), ToolName.bondHydrogen, PolymerBond), ToolName.erase, EraserTool), ToolName.clear, ClearTool), ToolName.hand, HandTool);

export { toolsMap };
//# sourceMappingURL=index.modern.js.map
