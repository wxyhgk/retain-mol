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

var MOLFILE_V2000_ATOM_BOND_LIMIT = 999;
function exceedsMolfileV2000Limit(struct) {
  return struct.atoms.size > MOLFILE_V2000_ATOM_BOND_LIMIT || struct.bonds.size > MOLFILE_V2000_ATOM_BOND_LIMIT;
}
var macromoleculesFilesInputFormats = {
  ket: 'chemical/x-indigo-ket',
  mol: 'chemical/x-mdl-molfile',
  seq: {
    rna: 'chemical/x-rna-sequence',
    dna: 'chemical/x-dna-sequence',
    peptide: 'chemical/x-peptide-sequence',
    peptide3Letter: 'chemical/x-peptide-sequence-3-letter'
  },
  fasta: {
    rna: 'chemical/x-rna-fasta',
    dna: 'chemical/x-dna-fasta',
    peptide: 'chemical/x-peptide-fasta'
  },
  idt: 'chemical/x-idt',
  'axo-labs': 'chemical/x-axo-labs',
  helm: 'chemical/x-helm',
  biln: 'chemical/x-biln'
};

exports.MOLFILE_V2000_ATOM_BOND_LIMIT = MOLFILE_V2000_ATOM_BOND_LIMIT;
exports.exceedsMolfileV2000Limit = exceedsMolfileV2000Limit;
exports.macromoleculesFilesInputFormats = macromoleculesFilesInputFormats;
//# sourceMappingURL=constants.js.map
