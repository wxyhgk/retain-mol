import { LoaderCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@retainmol/ui-kit'
import { useJobArtifactTextQuery } from '../application/jobQueries'
import type { JobArtifact } from '../domain/jobTypes'
import { resolveJobArtifactUrl } from '../infrastructure/jobsApiClient'

export function ArtifactPreviewDialog({
  artifact,
  onOpenChange,
}: {
  artifact: JobArtifact | null
  onOpenChange: (open: boolean) => void
}) {
  const isImage = artifact?.mediaType?.startsWith('image/') || artifact?.format === 'png'
  const textQuery = useJobArtifactTextQuery(
    artifact?.jobId ?? '',
    artifact?.id ?? '',
    Boolean(artifact && !isImage),
  )
  const imageUrl = artifact ? resolveJobArtifactUrl(artifact) : null

  return (
    <Dialog open={Boolean(artifact)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[82vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>{artifact?.name ?? '产物预览'}</DialogTitle>
          <DialogDescription>
            {artifact ? `${artifact.format}${artifact.mediaType ? ` · ${artifact.mediaType}` : ''}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-64 overflow-auto border border-border bg-muted/30">
          {isImage && imageUrl && <img src={imageUrl} alt={artifact?.name} className="mx-auto max-h-[62vh] object-contain" />}
          {!isImage && textQuery.isLoading && <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin" /></div>}
          {!isImage && textQuery.error && <p className="p-4 text-sm text-destructive">{textQuery.error.message}</p>}
          {!isImage && textQuery.data !== undefined && (
            <pre className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-5">{formatPreview(textQuery.data, artifact?.format)}</pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatPreview(content: string, format: string | undefined) {
  if (!format?.includes('json')) return content
  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    return content
  }
}
