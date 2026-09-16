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
import { MultitailArrow } from '../../entities/multitailArrow.modern.js';
import '../../constants/elements.modern.js';
import '../../constants/element.types.modern.js';
import '../../constants/generics.modern.js';
import { MULTITAIL_ARROW_SERIALIZE_KEY } from '../../constants/multitailArrow.modern.js';
import '../../constants/chains.modern.js';
import '../../constants/monomers.modern.js';

var validateMultitailArrows = function validateMultitailArrows(json) {
  var nodes = json.root.nodes;
  return nodes.every(function (node) {
    if (node.type === MULTITAIL_ARROW_SERIALIZE_KEY) {
      var result = MultitailArrow.validateKetNode(node.data);
      if (result !== null) {
        return null;
      }
    }
    return true;
  });
};

export { validateMultitailArrows };
//# sourceMappingURL=multitailArrowsValidator.modern.js.map
