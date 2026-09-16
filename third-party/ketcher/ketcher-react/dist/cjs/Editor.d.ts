import { type EditorProps } from './MicromoleculesEditor';
type Props = Omit<EditorProps, 'ketcherId'> & {
    disableMacromoleculesEditor?: boolean;
    monomersLibraryUpdate?: string | JSON;
    monomersLibraryReplace?: string | JSON;
};
export declare const Editor: (props: Props) => import("react").JSX.Element;
export {};
