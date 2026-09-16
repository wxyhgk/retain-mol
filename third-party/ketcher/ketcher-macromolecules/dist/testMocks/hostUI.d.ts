import React from 'react';
export declare const Icon: ({ children, iconName, dataTestId, testId, testid, isActive: _isActive, expanded: _expanded, ...props }: React.SVGProps<SVGSVGElement> & {
    iconName?: string;
    dataTestId?: string;
    testId?: string;
    testid?: string;
    isActive?: boolean;
    expanded?: boolean;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const IconButton: ({ children, testId, testid, dataTestId, iconName: _iconName, isActive: _isActive, primary: _primary, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    testId?: string;
    testid?: string;
    dataTestId?: string;
    iconName?: string;
    isActive?: boolean;
    primary?: boolean;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const Button: ({ children, testId, testid, dataTestId, iconName: _iconName, isActive: _isActive, primary: _primary, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    testId?: string;
    testid?: string;
    dataTestId?: string;
    iconName?: string;
    isActive?: boolean;
    primary?: boolean;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const Accordion: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const IndigoProvider: {
    getIndigo: () => undefined;
};
export declare const StructRender: ({ children, struct: _struct, options: _options, update: _update, isExpanded: _isExpanded, testId, testid, dataTestId, ...props }: React.HTMLAttributes<HTMLDivElement> & {
    struct?: unknown;
    options?: unknown;
    update?: unknown;
    isExpanded?: boolean;
    testId?: string;
    testid?: string;
    dataTestId?: string;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const preview: {
    widthForBond: number;
    heightForBond: number;
};
export declare const AmbiguousMonomerPreview: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const ArrowScroll: ({ children, startInView: _startInView, endInView: _endInView, scrollForward: _scrollForward, scrollBack: _scrollBack, isLeftRight: _isLeftRight, ...props }: React.HTMLAttributes<HTMLDivElement> & {
    startInView?: boolean;
    endInView?: boolean;
    scrollForward?: (dtMs: number) => void;
    scrollBack?: (dtMs: number) => void;
    isLeftRight?: boolean;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const EditorClassName = "Ketcher-editor";
export declare const KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR = ".Ketcher-polymer-editor-root, .Ketcher-macromolecules-root";
export declare const getFullscreenElement: () => null;
export declare const calculateBondPreviewPosition: () => {};
export declare const PresetPosition = "Library";
export declare const usePortalStyle: () => readonly [{}];
export declare const calculateAmbiguousMonomerPreviewTop: () => () => string;
export declare const calculateMonomerPreviewTop: () => string;
export declare const calculateNucleoElementPreviewTop: () => string;
