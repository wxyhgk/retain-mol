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

var rxnArrow = require('../../../entities/rxnArrow.js');
var rxnPlus = require('../../../entities/rxnPlus.js');
var helpers = require('../helpers.js');

function rxnToStruct(ketItem, struct) {
  if (ketItem.type === 'arrow') {
    var arrow = new rxnArrow.RxnArrow(helpers.getNodeWithInvertedYCoord(ketItem.data));
    arrow.setInitiallySelected(ketItem.selected);
    struct.addRxnArrow(arrow);
  } else {
    var plus = new rxnPlus.RxnPlus({
      pp: {
        x: ketItem.location[0],
        y: -ketItem.location[1],
        z: ketItem.location[2]
      }
    });
    plus.setInitiallySelected(ketItem.selected);
    struct.rxnPluses.add(plus);
  }
  return struct;
}

exports.rxnToStruct = rxnToStruct;
//# sourceMappingURL=rxnToStruct.js.map
