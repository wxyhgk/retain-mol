import { type UiActionAction } from '../../action';
export type FloatingToolsProps = {
    visible: boolean;
    rotateHandlePosition: {
        x: number;
        y: number;
    };
    status: {
        disabled?: boolean;
        hidden?: boolean;
    };
    indigoVerification: boolean;
};
export type FloatingToolsCallProps = {
    onAction: (action: UiActionAction) => void;
};
type Props = FloatingToolsProps & FloatingToolsCallProps;
export declare const FloatingTools: React.FC<Props>;
export {};
