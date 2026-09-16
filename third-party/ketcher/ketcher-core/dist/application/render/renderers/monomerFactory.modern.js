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
import { AmbiguousMonomer } from '../../../domain/entities/AmbiguousMonomer.modern.js';
import { isAmbiguousMonomerLibraryItem } from '../../../domain/helpers/monomers.modern.js';
import { AmbiguousMonomerRenderer } from './AmbiguousMonomerRenderer.modern.js';
import { monomerRendererFactory } from './monomerRendererFactory.modern.js';

function monomerFactory(monomer) {
  if (isAmbiguousMonomerLibraryItem(monomer)) {
    return [AmbiguousMonomer, AmbiguousMonomerRenderer, AmbiguousMonomer.getMonomerClass(monomer.monomers)];
  }
  return monomerRendererFactory(monomer);
}

export { monomerFactory };
//# sourceMappingURL=monomerFactory.modern.js.map
