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

var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray');
require('../../../utilities/runAsyncAction.js');
require('../../../utilities/KetcherLogger.js');
require('../../../utilities/SettingsManager.js');
require('../../../utilities/keynorm.js');
require('react-device-detect');
require('../../../utilities/clipboardUtils.js');
var monomers = require('../../../utilities/monomers.js');
var assert = require('../../../utilities/assert.js');
var editorSingleton = require('../../editor/editorSingleton.js');
var BaseMonomerRenderer = require('./BaseMonomerRenderer.js');
var BaseSequenceItemRenderer = require('./sequence/BaseSequenceItemRenderer.js');
var AtomRenderer = require('./AtomRenderer.js');
var Chem = require('../../../domain/entities/Chem.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _toConsumableArray__default = /*#__PURE__*/_interopDefaultLegacy(_toConsumableArray);

function getRenderedStructuresBbox(drawingEntities) {
  var left;
  var right;
  var top;
  var bottom;
  var editor = editorSingleton.provideEditorInstance();
  (drawingEntities || [].concat(_toConsumableArray__default["default"](editor.drawingEntitiesManager.monomers.values()), _toConsumableArray__default["default"](editor.drawingEntitiesManager.atoms.values())).filter(function (drawindEntity) {
    return !(drawindEntity instanceof Chem.Chem && drawindEntity.monomerItem.props.isMicromoleculeFragment && !monomers.isMonomerSgroupWithAttachmentPoints(drawindEntity));
  })).forEach(function (monomer) {
    var _monomer$baseRenderer;
    if (!(monomer.baseRenderer instanceof BaseSequenceItemRenderer.BaseSequenceItemRenderer) && !(monomer.baseRenderer instanceof BaseMonomerRenderer.BaseMonomerRenderer) && !(monomer.baseRenderer instanceof AtomRenderer.AtomRenderer)) {
      return;
    }
    var monomerPosition = (_monomer$baseRenderer = monomer.baseRenderer) === null || _monomer$baseRenderer === void 0 ? void 0 : _monomer$baseRenderer.scaledPosition;
    assert.assert(monomerPosition);
    left = left !== undefined ? Math.min(left, monomerPosition.x) : monomerPosition.x;
    right = right !== undefined ? Math.max(right, monomerPosition.x) : monomerPosition.x;
    top = top !== undefined ? Math.min(top, monomerPosition.y) : monomerPosition.y;
    bottom = bottom !== undefined ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
  });
  assert.assert(left !== undefined && right !== undefined && top !== undefined && bottom !== undefined);
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: right - left,
    height: bottom - top
  };
}

exports.getRenderedStructuresBbox = getRenderedStructuresBbox;
//# sourceMappingURL=utils.js.map
