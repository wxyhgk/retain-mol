import { type CSSProperties } from 'react';
import type { AmbiguousMonomerPreviewState } from './types';
interface Props {
    className?: string;
    preview: AmbiguousMonomerPreviewState;
    style?: CSSProperties;
}
declare const AmbiguousMonomerPreview: ({ className, preview, style }: Props) => import("react").JSX.Element;
export { AmbiguousMonomerPreview };
