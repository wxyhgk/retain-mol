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

var multitailArrow$1 = require('../../entities/multitailArrow.js');
require('../../constants/elements.js');
require('../../constants/element.types.js');
require('../../constants/generics.js');
var multitailArrow = require('../../constants/multitailArrow.js');
require('../../constants/chains.js');
require('../../constants/monomers.js');

var validateMultitailArrows = function validateMultitailArrows(json) {
  var nodes = json.root.nodes;
  return nodes.every(function (node) {
    if (node.type === multitailArrow.MULTITAIL_ARROW_SERIALIZE_KEY) {
      var result = multitailArrow$1.MultitailArrow.validateKetNode(node.data);
      if (result !== null) {
        return null;
      }
    }
    return true;
  });
};

exports.validateMultitailArrows = validateMultitailArrows;
//# sourceMappingURL=multitailArrowsValidator.js.map
