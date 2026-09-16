export type FileSaverReturnType = Promise<(data: Blob | string, fn: any, type: string | undefined) => void | never>;
export type SaverType = Awaited<FileSaverReturnType>;
