import { MonomerConnectionProps } from '../modalContainer/types';
interface IStyledButtonProps {
    disabled: boolean;
}
export declare const ActionButtonLeft: import("@emotion/styled").StyledComponent<{
    label: string;
    clickHandler: () => void;
    styleType?: string;
} & import("@mui/material").ButtonBaseOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "style" | "children" | "className" | "classes" | "action" | "centerRipple" | "disabled" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "sx" | "tabIndex" | "TouchRippleProps" | "touchRippleRef"> & {
    component?: React.ElementType;
} & {
    theme?: import("@emotion/react").Theme;
}, {}, {}>;
export declare const ActionButtonRight: import("@emotion/styled").StyledComponent<{
    label: string;
    clickHandler: () => void;
    styleType?: string;
} & import("@mui/material").ButtonBaseOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "style" | "children" | "className" | "classes" | "action" | "centerRipple" | "disabled" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "sx" | "tabIndex" | "TouchRippleProps" | "touchRippleRef"> & {
    component?: React.ElementType;
} & {
    theme?: import("@emotion/react").Theme;
} & IStyledButtonProps, {}, {}>;
export declare const ActionButtonAttachmentPoint: import("@emotion/styled").StyledComponent<{
    label: string;
    clickHandler: () => void;
    styleType?: string;
} & import("@mui/material").ButtonBaseOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "style" | "children" | "className" | "classes" | "action" | "centerRipple" | "disabled" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "sx" | "tabIndex" | "TouchRippleProps" | "touchRippleRef"> & {
    component?: React.ElementType;
} & {
    theme?: import("@emotion/react").Theme;
}, {}, {}>;
declare const MonomerConnection: ({ onClose, isModalOpen, firstMonomer, secondMonomer, polymerBond, isReconnectionDialog, }: Readonly<MonomerConnectionProps>) => React.ReactElement;
export { MonomerConnection };
