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

function getStructureBbox(drawingEntities) {
  var left = 0;
  var right = 0;
  var top = 0;
  var bottom = 0;
  drawingEntities.forEach(function (drawingEntity) {
    var monomerPosition = drawingEntity.position;
    left = left ? Math.min(left, monomerPosition.x) : monomerPosition.x;
    right = right ? Math.max(right, monomerPosition.x) : monomerPosition.x;
    top = top ? Math.min(top, monomerPosition.y) : monomerPosition.y;
    bottom = bottom ? Math.max(bottom, monomerPosition.y) : monomerPosition.y;
  });
  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    width: right - left,
    height: bottom - top
  };
}

exports.getStructureBbox = getStructureBbox;
//# sourceMappingURL=structureBbox.js.map
