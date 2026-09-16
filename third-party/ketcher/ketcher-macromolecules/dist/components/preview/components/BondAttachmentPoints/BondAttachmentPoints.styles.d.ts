interface AttachmentPointProps {
    connected: boolean;
    inBond: boolean;
}
export declare const AttachmentPoint: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & AttachmentPointProps, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
interface AttachmentPointNameProps {
    connected?: boolean;
}
export declare const AttachmentPointName: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & AttachmentPointNameProps, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, {}>;
interface LeavingGroupProps {
    inBond: boolean;
}
export declare const LeavingGroup: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & LeavingGroupProps, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, {}>;
export {};
