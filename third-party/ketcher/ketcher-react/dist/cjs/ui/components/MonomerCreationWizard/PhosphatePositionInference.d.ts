import { AttachmentPointName } from 'ketcher-core';
type PhosphatePosition = '3' | '5';
export declare const inferPhosphatePosition: (sugarAttachmentPoints: Map<AttachmentPointName, [number, number]>, phosphateAttachmentPoints: Map<AttachmentPointName, [number, number]>) => PhosphatePosition;
export {};
