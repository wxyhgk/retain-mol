import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, Check, Copy, Download, ScrollText } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import { isTerminalJobStatus, useJobLogQuery } from '../application/jobQueries'
import { isNearBottom } from '../domain/logViewport'
import type { JobStatus } from '../domain/jobTypes'
import { JobSectionHeader } from './shared/JobSectionHeader'

export function JobLogViewer({ jobId, jobName, status }: { jobId: string; jobName: string; status: JobStatus }) {
  const logQuery = useJobLogQuery(jobId)
  const snapshot = logQuery.data
  const scrollRef = useRef<HTMLPreElement>(null)
  const [follow, setFollow] = useState(() => !isTerminalJobStatus(status))
  const [copied, setCopied] = useState(false)
  const content = snapshot?.content ?? ''

  useEffect(() => {
    if (!follow) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [content, follow])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    setFollow(isNearBottom(el.scrollTop, el.clientHeight, el.scrollHeight))
  }

  async function copyLog() {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadLog() {
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${jobName || jobId}.log`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="border border-border bg-card">
      <JobSectionHeader
        icon={ScrollText}
        title="计算日志"
        subtitle={snapshot?.source ? `${snapshot.source} · ${snapshot.complete ? '已结束' : '每秒更新'}` : '等待计算引擎写入日志'}
        action={
          <div className="flex items-center gap-1">
            <Button
              variant={follow ? 'default' : 'ghost'}
              size="sm"
              className="h-7"
              aria-pressed={follow}
              title="自动滚动到最新日志"
              onClick={() => setFollow(current => !current)}
            >
              <ArrowDownToLine />跟随
            </Button>
            <Button variant="ghost" size="icon" className="size-7" title={copied ? '已复制' : '复制日志'} disabled={!content} onClick={() => void copyLog()}>
              {copied ? <Check /> : <Copy />}
            </Button>
            <Button variant="ghost" size="icon" className="size-7" title="下载日志" disabled={!content} onClick={downloadLog}>
              <Download />
            </Button>
          </div>
        }
      />
      {logQuery.error && <p className="p-4 text-sm text-destructive">{logQuery.error.message}</p>}
      <pre
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-80 max-h-[58vh] overflow-auto whitespace-pre-wrap break-words bg-muted/40 p-4 font-mono text-xs leading-5 text-foreground"
      >
        {content || (status === 'queued' ? '任务正在排队，运行后将在这里显示日志。' : '暂时没有日志输出。')}
      </pre>
    </section>
  )
}
