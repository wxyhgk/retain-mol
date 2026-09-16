import { MODAL_STATES_VALUES } from './openModalStates';
interface OpenFileWrapperProps {
    currentState: MODAL_STATES_VALUES;
}
export declare const OpenFileWrapper: import("@emotion/styled").StyledComponent<{
    theme?: import("@emotion/react").Theme;
    as?: React.ElementType;
} & OpenFileWrapperProps, import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, {}>;
export declare const CancelButton: import("@emotion/styled").StyledComponent<{
    label: string;
    clickHandler: () => void;
    styleType?: string;
} & import("@mui/material").ButtonBaseOwnProps & import("@mui/material/OverridableComponent").CommonProps & Omit<import("react").DetailedHTMLProps<import("react").ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "style" | "className" | "classes" | "action" | "centerRipple" | "children" | "disabled" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "sx" | "tabIndex" | "TouchRippleProps" | "touchRippleRef"> & {
    component?: React.ElementType;
} & {
    theme?: import("@emotion/react").Theme;
}, {}, {}>;
export {};
