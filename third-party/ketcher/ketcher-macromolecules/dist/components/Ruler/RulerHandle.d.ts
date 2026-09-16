import { D3DragEvent } from 'd3';
type Props = {
    offsetX: number;
    onDragStart: (event: D3DragEvent<SVGGElement, unknown, unknown>) => void;
    onDrag: (event: D3DragEvent<SVGGElement, unknown, unknown>) => void;
    onDragEnd: (event: D3DragEvent<SVGGElement, unknown, unknown>) => void;
};
declare const _default: import("react").MemoExoticComponent<({ offsetX, onDragStart, onDrag, onDragEnd }: Props) => import("@emotion/react/jsx-runtime").JSX.Element>;
export default _default;
