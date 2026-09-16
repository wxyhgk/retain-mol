import { ReactNode, RefObject } from 'react';
export declare const RootSizeContext: import("react").Context<{
    width: number;
    height: number;
}>;
type Props = {
    children: ReactNode;
    rootRef: RefObject<HTMLElement> | null;
    isMacromoleculesEditorTurnedOn?: boolean;
};
export declare const RootSizeProvider: ({ children, rootRef, isMacromoleculesEditorTurnedOn, }: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
