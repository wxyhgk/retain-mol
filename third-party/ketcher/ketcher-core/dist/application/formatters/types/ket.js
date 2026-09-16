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

var monomers = require('../../../domain/constants/monomers.js');

exports.KetNodeType = void 0;
(function (KetNodeType) {
  KetNodeType["MONOMER"] = "monomer";
  KetNodeType["AMBIGUOUS_MONOMER"] = "ambiguousMonomer";
})(exports.KetNodeType || (exports.KetNodeType = {}));
exports.KetConnectionType = void 0;
(function (KetConnectionType) {
  KetConnectionType["SINGLE"] = "single";
  KetConnectionType["HYDROGEN"] = "hydrogen";
})(exports.KetConnectionType || (exports.KetConnectionType = {}));
exports.KetTemplateType = void 0;
(function (KetTemplateType) {
  KetTemplateType["MONOMER_TEMPLATE"] = "monomerTemplate";
  KetTemplateType["MONOMER_GROUP_TEMPLATE"] = "monomerGroupTemplate";
  KetTemplateType["AMBIGUOUS_MONOMER_TEMPLATE"] = "ambiguousMonomerTemplate";
})(exports.KetTemplateType || (exports.KetTemplateType = {}));
exports.KetAmbiguousMonomerTemplateSubType = void 0;
(function (KetAmbiguousMonomerTemplateSubType) {
  KetAmbiguousMonomerTemplateSubType["ALTERNATIVES"] = "alternatives";
  KetAmbiguousMonomerTemplateSubType["MIXTURE"] = "mixture";
})(exports.KetAmbiguousMonomerTemplateSubType || (exports.KetAmbiguousMonomerTemplateSubType = {}));
exports.KetMonomerGroupTemplateClass = void 0;
(function (KetMonomerGroupTemplateClass) {
  KetMonomerGroupTemplateClass["RNA"] = "RNA";
})(exports.KetMonomerGroupTemplateClass || (exports.KetMonomerGroupTemplateClass = {}));

Object.defineProperty(exports, 'KetMonomerClass', {
    enumerable: true,
    get: function () { return monomers.KetMonomerClass; }
});
//# sourceMappingURL=ket.js.map
