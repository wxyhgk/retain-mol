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

var monomers = require('../constants/monomers.js');
var monomers$1 = require('../types/monomers.js');
require('../types/entities.js');

function getAttachmentPointTooltip(monomerClass, ap) {
  var isTargetClass = monomerClass === monomers.KetMonomerClass.Sugar || monomerClass === monomers.KetMonomerClass.Phosphate || monomerClass === monomers.KetMonomerClass.RNA;
  if (!isTargetClass) return null;
  if (ap === monomers$1.AttachmentPointName.R1) return "5'";
  if (ap === monomers$1.AttachmentPointName.R2) return "3'";
  return null;
}

exports.getAttachmentPointTooltip = getAttachmentPointTooltip;
//# sourceMappingURL=attachmentPointTooltips.js.map
