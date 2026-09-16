import React from 'react';
interface ModalProps {
    children: JSX.Element | Array<JSX.Element>;
    title: React.ReactNode;
    isOpen: boolean;
    showCloseButton?: boolean;
    showExpandButton?: boolean;
    onClose: VoidFunction;
    className?: string;
    modalWidth?: string;
    expanded?: boolean;
    setExpanded?: (boolean: any) => void;
    testId?: string;
    hideHeaderBorder?: boolean;
}
interface FooterProps {
    withborder?: string;
}
export declare const Modal: {
    ({ children, title, isOpen, showCloseButton, showExpandButton, onClose, className, modalWidth, expanded, setExpanded, testId, hideHeaderBorder, }: ModalProps): import("@emotion/react/jsx-runtime").JSX.Element;
    Content: import("@emotion/styled").StyledComponent<import("@mui/material").DialogContentProps & {
        theme?: import("@emotion/react").Theme;
    }, {}, {}>;
    Footer: import("@emotion/styled").StyledComponent<import("@mui/material").DialogActionsProps & {
        theme?: import("@emotion/react").Theme;
    } & FooterProps, {}, {}>;
};
export {};
