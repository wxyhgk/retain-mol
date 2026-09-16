import { ReactNode } from 'react';
type TabPanelProps = {
    index: number;
    value: number;
    children: ReactNode;
};
declare const TabPanel: ({ children, value, index }: TabPanelProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export default TabPanel;
