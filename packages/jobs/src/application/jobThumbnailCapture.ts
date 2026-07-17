import { captureViewportImage } from '@retainmol/mol-viewer/viewer'
import { useUploadJobThumbnailMutation } from './jobQueries'

export const JOB_THUMBNAIL_SCALE = 0.28

/** 抓取当前视口缩略图并作为 preview 产物上传；无 WebGL 画布时静默跳过。 */
export function useCaptureJobThumbnail(): (jobId: string) => void {
  const uploadThumbnail = useUploadJobThumbnailMutation()
  return jobId => {
    const dataUrl = captureViewportImage(JOB_THUMBNAIL_SCALE)
    if (dataUrl) uploadThumbnail.mutate({ jobId, dataUrl })
  }
}
