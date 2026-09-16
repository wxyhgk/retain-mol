import type { CustomButton } from '../../../bootstrap/builders/ketcher/CustomButtons';
interface CustomButtonsProps {
    customButtons: Array<CustomButton>;
    isCollapsed: boolean;
    onCustomAction: (name: string) => void;
}
export declare const CustomButtons: ({ isCollapsed, customButtons, onCustomAction, }: CustomButtonsProps) => import("react").JSX.Element | null;
export {};
