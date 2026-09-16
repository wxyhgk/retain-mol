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

require('../../../constants/elements.js');
require('../../../constants/element.types.js');
require('../../../constants/generics.js');
var image = require('../../../constants/image.js');
require('../../../constants/chains.js');
require('../../../constants/monomers.js');

function imageToKet(imageNode) {
  return {
    type: image.IMAGE_SERIALIZE_KEY,
    format: imageNode.format,
    boundingBox: imageNode.boundingBox,
    data: imageNode.data,
    selected: imageNode.selected
  };
}

exports.imageToKet = imageToKet;
//# sourceMappingURL=imageToKet.js.map
