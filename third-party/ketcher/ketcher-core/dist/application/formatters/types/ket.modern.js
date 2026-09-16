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
export { KetMonomerClass } from '../../../domain/constants/monomers.modern.js';

var KetNodeType;
(function (KetNodeType) {
  KetNodeType["MONOMER"] = "monomer";
  KetNodeType["AMBIGUOUS_MONOMER"] = "ambiguousMonomer";
})(KetNodeType || (KetNodeType = {}));
var KetConnectionType;
(function (KetConnectionType) {
  KetConnectionType["SINGLE"] = "single";
  KetConnectionType["HYDROGEN"] = "hydrogen";
})(KetConnectionType || (KetConnectionType = {}));
var KetTemplateType;
(function (KetTemplateType) {
  KetTemplateType["MONOMER_TEMPLATE"] = "monomerTemplate";
  KetTemplateType["MONOMER_GROUP_TEMPLATE"] = "monomerGroupTemplate";
  KetTemplateType["AMBIGUOUS_MONOMER_TEMPLATE"] = "ambiguousMonomerTemplate";
})(KetTemplateType || (KetTemplateType = {}));
var KetAmbiguousMonomerTemplateSubType;
(function (KetAmbiguousMonomerTemplateSubType) {
  KetAmbiguousMonomerTemplateSubType["ALTERNATIVES"] = "alternatives";
  KetAmbiguousMonomerTemplateSubType["MIXTURE"] = "mixture";
})(KetAmbiguousMonomerTemplateSubType || (KetAmbiguousMonomerTemplateSubType = {}));
var KetMonomerGroupTemplateClass;
(function (KetMonomerGroupTemplateClass) {
  KetMonomerGroupTemplateClass["RNA"] = "RNA";
})(KetMonomerGroupTemplateClass || (KetMonomerGroupTemplateClass = {}));

export { KetAmbiguousMonomerTemplateSubType, KetConnectionType, KetMonomerGroupTemplateClass, KetNodeType, KetTemplateType };
//# sourceMappingURL=ket.modern.js.map
