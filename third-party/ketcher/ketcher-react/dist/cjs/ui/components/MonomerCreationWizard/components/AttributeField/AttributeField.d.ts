import type { ReactNode } from 'react';
type Props = {
    title: string;
    control: ReactNode;
    required?: boolean;
    disabled?: boolean;
};
declare const AttributeField: ({ title, control, required, disabled }: Props) => import("react").JSX.Element;
export default AttributeField;
