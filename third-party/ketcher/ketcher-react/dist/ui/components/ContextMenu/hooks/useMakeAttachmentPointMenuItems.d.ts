import type { AtomContextMenuProps, MenuItemsProps } from '../contextMenu.types';
import type { Editor } from 'src/editor/index';
import type { ReactNode } from 'react';
type Props = {
    props: MenuItemsProps<AtomContextMenuProps>;
    selectedAtomId: number | undefined;
    editor: Editor;
};
declare const useMakeAttachmentPointMenuItems: ({ props, selectedAtomId, editor, }: Props) => ReactNode[] | null;
export default useMakeAttachmentPointMenuItems;
