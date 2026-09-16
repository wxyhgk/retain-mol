export type OpenOptionsProps = {
    selectClipboard: () => void;
    errorHandler: (err: string) => void;
    fileLoadHandler: (files: File[]) => void;
};
declare const OpenOptions: ({ selectClipboard, fileLoadHandler, errorHandler, }: OpenOptionsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export { OpenOptions };
