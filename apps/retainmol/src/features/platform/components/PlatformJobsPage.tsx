import { jobEditorPath, jobPath } from '@/app/appRoute'
import { PlatformJobDetail, PlatformJobList } from '@/features/jobs'

export function PlatformJobsPage({ jobId, onNavigate }: { jobId: string | null; onNavigate: (path: string) => void }) {
  if (jobId) {
    return <PlatformJobDetail jobId={jobId} onBack={() => onNavigate('/jobs')} onOpenJob={id => onNavigate(jobPath(id))} onOpenEditor={artifactId => onNavigate(jobEditorPath(jobId, artifactId))} />
  }
  return <PlatformJobList onOpenJob={id => onNavigate(jobPath(id))} onOpenEditor={() => onNavigate('/editor')} />
}
