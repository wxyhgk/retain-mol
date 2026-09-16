export declare const Container: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & {
    isLongName?: boolean;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const MonomerName: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & {
    isLongName?: boolean;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, {}>;
export declare const StyledStructRender: import("@emotion/styled").StyledComponent<{
    struct: import("ketcher-core").Struct | string;
    options?: (import("ketcher-core").RenderOptions & {
        cachePrefix?: string;
        needCache?: boolean;
    }) | {
        cachePrefix?: string;
        needCache?: boolean;
    };
    className?: string;
    update?: boolean;
    fullsize?: boolean;
    testId?: string;
} & {
    theme?: import("@emotion/react").Theme;
}, {}, {}>;
export declare const InfoBlock: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
