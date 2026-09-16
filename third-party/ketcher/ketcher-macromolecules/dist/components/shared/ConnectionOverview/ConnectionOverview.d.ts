import { ReactNode } from 'react';
import { BaseMonomer } from 'ketcher-core';
interface Props {
    firstMonomer: BaseMonomer;
    secondMonomer: BaseMonomer;
    expanded?: boolean;
    firstMonomerOverview: ReactNode;
    secondMonomerOverview: ReactNode;
}
declare const ConnectionOverview: ({ firstMonomer, secondMonomer, expanded, firstMonomerOverview, secondMonomerOverview, }: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default ConnectionOverview;
