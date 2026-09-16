export declare const StyledToastContainer: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const StyledToast: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const StyledToastContent: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const StyledIconButton: import("@emotion/styled").StyledComponent<{
    iconName: import("src/uiBridge").MacromoleculesIconName;
    onClick: (e: import("react").MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    className?: string;
    disabled?: boolean;
    isActive?: boolean;
    isHidden?: boolean;
    shortcut?: string;
    testId?: string;
    children?: import("react").ReactNode;
} & {
    theme?: import("@emotion/react").Theme;
}, {}, {}>;
