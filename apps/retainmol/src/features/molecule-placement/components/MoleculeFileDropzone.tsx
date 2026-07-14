import { FileDropzone } from '@/components/data'

const MOLECULE_ACCEPT = {
  'chemical/x-xyz': ['.xyz'],
  'chemical/x-mdl-molfile': ['.mol'],
  'chemical/x-mdl-sdfile': ['.sdf'],
}

export function MoleculeFileDropzone({
  onFiles,
  label = '拖入 XYZ、MOL 或 SDF',
  description = '编辑画布一次只接收一个结构文件',
}: {
  onFiles: (files: readonly File[]) => void | Promise<void>
  label?: string
  description?: string
}) {
  return (
    <FileDropzone
      label={label}
      description={description}
      accept={MOLECULE_ACCEPT}
      multiple={false}
      maxFiles={1}
      maxSize={20 * 1024 * 1024}
      onDrop={accepted => void onFiles(accepted)}
    />
  )
}
