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
import { NATURAL_AMINO_ACID_MODIFICATION_TYPE } from '../Editor.modern.js';

function compareStringsWithNaturalFirst(a, b) {
  var aTitle = (a || '').toLowerCase();
  var bTitle = (b || '').toLowerCase();
  var naturalType = NATURAL_AMINO_ACID_MODIFICATION_TYPE.toLowerCase();
  if (aTitle === naturalType) return -1;
  if (bTitle === naturalType) return 1;
  return aTitle.localeCompare(bTitle);
}
function compareByTitleWithNaturalFirst(a, b) {
  return compareStringsWithNaturalFirst(a.title, b.title);
}

export { compareByTitleWithNaturalFirst, compareStringsWithNaturalFirst };
//# sourceMappingURL=sort.modern.js.map
