import type { BondsContextMenuProps, ItemEventParams } from '../contextMenu.types';
type Params = ItemEventParams<BondsContextMenuProps>;
declare const useBondTypeChange: () => readonly [({ id, props }: Params) => void, ({ props }: Params) => boolean];
export default useBondTypeChange;
