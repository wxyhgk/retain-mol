import { RequiredModalProps } from '../modalContainer';
export interface Props {
    onClose: () => void;
    isModalOpen: boolean;
}
declare const Open: ({ isModalOpen, onClose }: RequiredModalProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export { Open };
