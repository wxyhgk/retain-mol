import { MonomerOrAmbiguousType } from 'ketcher-core';
export declare const Card: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & {
    code?: string;
    selected?: boolean;
    disabled?: boolean;
    isVariantMonomer?: boolean;
    item?: MonomerOrAmbiguousType;
    isDragging?: boolean;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const NumberCircle: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & {
    selected?: boolean;
    monomersAmount: number;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const CardTitle: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, {}>;
export declare const AutochainIcon: import("@emotion/styled").StyledComponent<{
    name: import("src/uiBridge").MacromoleculesIconName;
    className?: string;
    title?: string;
    onClick?: (e: import("react").MouseEvent) => void;
    onMouseOver?: (e: import("react").MouseEvent) => void;
    onMouseOut?: (e: import("react").MouseEvent) => void;
    onDoubleClick?: (e: import("react").MouseEvent) => void;
    dataTestId?: string;
} & {
    theme?: import("@emotion/react").Theme;
} & {
    disabled?: boolean;
}, {}, {}>;
export declare const AutochainIconWrapper: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
}, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
