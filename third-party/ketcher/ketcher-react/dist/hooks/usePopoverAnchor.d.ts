import { type MouseEvent } from 'react';
export declare const usePopoverAnchor: () => {
    anchorEl: HTMLElement | null;
    handleOpen: (event: MouseEvent<HTMLElement>) => void;
    handleClose: () => void;
};
