import type { MacromoleculeContextMenuProps, ItemEventParams } from '../contextMenu.types';
type Params = ItemEventParams<MacromoleculeContextMenuProps>;
/**
 * Returns a handler that removes the S-group grouping for each monomer in the
 * context (mirrors `useFunctionalGroupRemove` but typed for macromolecule props).
 *
 * Per the spec (1.1.4), if a collapsed monomer's abbreviation is deleted the
 * underlying `fromSgroupDeletion` action already expands the monomer atoms
 * before removing the S-group, so no extra step is needed here.
 */
declare const useRemoveGrouping: () => ({ props }: Params) => void;
export default useRemoveGrouping;
