interface FileControlsProps {
    onFileOpen: () => void;
    onSave: () => void;
    shortcuts: {
        [key in string]: string;
    };
    hiddenButtons: string[];
    disabledButtons: string[];
}
export declare const FileControls: ({ onFileOpen, onSave, shortcuts, hiddenButtons, disabledButtons, }: FileControlsProps) => import("react").JSX.Element;
export {};
