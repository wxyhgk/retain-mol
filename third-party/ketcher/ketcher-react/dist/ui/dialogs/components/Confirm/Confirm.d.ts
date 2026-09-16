type ConfirmProps = {
    onOk: () => void;
    onCancel: () => void;
    text?: string;
    title?: string;
};
export declare const Confirm: ({ onOk, onCancel, text, title }: ConfirmProps) => import("react").JSX.Element;
export {};
