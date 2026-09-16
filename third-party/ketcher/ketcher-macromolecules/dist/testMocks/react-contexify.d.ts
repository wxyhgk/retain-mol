import React from 'react';
export declare const contextMenu: {
    hideAll: jest.Mock<any, any, any>;
};
export declare const Menu: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const Item: ({ children, disabled, ...props }: React.HTMLAttributes<HTMLDivElement> & {
    disabled?: boolean;
}) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const Separator: (props: React.HTMLAttributes<HTMLDivElement>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const Submenu: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const useContextMenu: () => {
    show: jest.Mock<any, any, any>;
    hideAll: jest.Mock<any, any, any>;
};
