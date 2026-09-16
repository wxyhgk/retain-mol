import type { ItemEventParams, SelectionContextMenuProps } from '../contextMenu.types';
type Params = ItemEventParams<SelectionContextMenuProps>;
declare const useDelete: () => ({ props }: Params) => Promise<void>;
export default useDelete;
