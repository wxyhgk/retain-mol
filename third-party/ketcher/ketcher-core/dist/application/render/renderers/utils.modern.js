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
import '../../../utilities/runAsyncAction.modern.js';
import '../../../utilities/KetcherLogger.modern.js';
import '../../../utilities/SettingsManager.modern.js';
import '../../../utilities/keynorm.modern.js';
import 'react-device-detect';
import '../../../utilities/clipboardUtils.modern.js';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers.modern.js';
import { assert } from '../../../utilities/assert.modern.js';
import { provideEditorInstance } from '../../editor/editorSingleton.modern.js';
import { BaseMonomerRenderer } from './BaseMonomerRenderer.modern.js';
import { BaseSequenceItemRenderer } from './sequence/BaseSequenceItemRenderer.modern.js';
import { AtomRenderer } from './AtomRenderer.modern.js';
import { Chem } from '../../../domain/entities/Chem.modern.js';

function getRenderedStructuresBbox(drawingEntities) {
  var left;
  var right;
  var top;
  var bottom;
  var editor = provideEditorInstance();
  (drawingEntities || [].concat(_toConsumableArray(editor.drawingEntitiesManager.monomers.values()), _toConsumableArray(editor.drawingEntitiesManager.atoms.values())).filter(function (drawindEntity) {
    return !(drawindEntity instanceof Chem && drawindEntity.monomerItem.props.isMicromoleculeFragment && !isMonomerSgroupWithAttachmentPoints(drawindEntity));
  })).forEach(function (monomer) {
    var _monomer$baseRenderer;
    if (!(monomer.baseRenderer instanceof BaseSequenceItemRenderer) && !(monomer.baseRenderer instanceof BaseMonomerRenderer) && !(monomer.baseRenderer instanceof AtomRenderer)) {
      return;
    }
    var monomerPosition = (_monomer$baseRenderer = monomer.baseRenderer) === null || _monomer$baseRenderer === void 0 ? void 0 : _monomer$baseRenderer.scaledPosition;
    assert(monomerPosition);
    left = left !== undefined ? Math.min(left, monomerPosition.x) : monomerPosition.x;
    right = right !== undefined ? Math.max(right, monomerPosition.x) : monomerPosition.x;
    top = top !== undefined ? Math.min(top, monomerPosition.y) : monomerPosition.y;
    bottom = bottom !== undefined ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
  });
  assert(left !== undefined && right !== undefined && top !== undefined && bottom !== undefined);
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: right - left,
    height: bottom - top
  };
}

export { getRenderedStructuresBbox };
//# sourceMappingURL=utils.modern.js.map
