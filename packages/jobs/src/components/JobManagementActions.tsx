import { useState, type FormEvent } from 'react'
import { Copy, LoaderCircle, OctagonX, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@retainmol/ui-kit'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@retainmol/ui-kit'
import { Input } from '@retainmol/ui-kit'
import { Textarea } from '@retainmol/ui-kit'
import {
  useCancelJobMutation,
  useCloneJobMutation,
  useDeleteJobMutation,
  useRetryJobMutation,
  useUpdateJobMutation,
} from '../application/jobQueries'
import type { JobDetail } from '../domain/jobTypes'

export function JobManagementActions({ job, onDeleted, onCloned }: { job: JobDetail; onDeleted?: () => void; onCloned?: (jobId: string) => void }) {
  const updateJob = useUpdateJobMutation()
  const deleteJob = useDeleteJobMutation()
  const cloneJob = useCloneJobMutation()
  const retryJob = useRetryJobMutation()
  const cancelJob = useCancelJobMutation()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [cloneOpen, setCloneOpen] = useState(false)
  const [retryOpen, setRetryOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [name, setName] = useState(job.name)
  const [cloneName, setCloneName] = useState(`${job.name} 副本`)
  const [retryName, setRetryName] = useState(`${job.name} 重试`)
  const [description, setDescription] = useState(job.description ?? '')

  function changeEditOpen(open: boolean) {
    setEditOpen(open)
    if (open) {
      setName(job.name)
      setDescription(job.description ?? '')
      updateJob.reset()
    }
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    await updateJob.mutateAsync({
      jobId: job.id,
      request: {
        name: trimmedName,
        description: description.trim() || null,
      },
    })
    setEditOpen(false)
  }

  async function confirmDelete() {
    await deleteJob.mutateAsync(job.id)
    setDeleteOpen(false)
    onDeleted?.()
  }

  async function confirmClone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cloned = await cloneJob.mutateAsync({
      jobId: job.id,
      request: { name: cloneName.trim() || undefined },
    })
    setCloneOpen(false)
    onCloned?.(cloned.id)
  }

  async function confirmCancel() {
    await cancelJob.mutateAsync(job.id)
    setCancelOpen(false)
  }

  async function confirmRetry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const retried = await retryJob.mutateAsync({
      jobId: job.id,
      request: { name: retryName.trim() || undefined },
    })
    setRetryOpen(false)
    onCloned?.(retried.id)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="重试任务"
        aria-label="重试任务"
        disabled={!['failed', 'cancelled', 'interrupted'].includes(job.status)}
        onClick={() => {
          setRetryName(`${job.name} 重试`)
          retryJob.reset()
          setRetryOpen(true)
        }}
      >
        <RotateCcw />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="复制为新任务"
        aria-label="复制为新任务"
        onClick={() => {
          setCloneName(`${job.name} 副本`)
          cloneJob.reset()
          setCloneOpen(true)
        }}
      >
        <Copy />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="取消任务"
        aria-label="取消任务"
        disabled={!['created', 'queued', 'running'].includes(job.status)}
        onClick={() => {
          cancelJob.reset()
          setCancelOpen(true)
        }}
      >
        <OctagonX />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="编辑任务信息"
        aria-label="编辑任务信息"
        onClick={() => changeEditOpen(true)}
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:text-destructive"
        title={job.status === 'running' ? '运行中的任务不能删除' : '删除任务'}
        aria-label="删除任务"
        disabled={job.status === 'running'}
        onClick={() => {
          deleteJob.reset()
          setDeleteOpen(true)
        }}
      >
        <Trash2 />
      </Button>

      <Dialog open={editOpen} onOpenChange={changeEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={event => void submitEdit(event)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>编辑任务</DialogTitle>
              <DialogDescription>只修改任务名称和说明，不改变冻结的计算输入。</DialogDescription>
            </DialogHeader>
            <label className="grid gap-1.5 text-sm">
              <span>任务名称</span>
              <Input value={name} maxLength={160} onChange={event => setName(event.target.value)} autoFocus />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span>说明</span>
              <Textarea
                value={description}
                maxLength={2000}
                rows={5}
                onChange={event => setDescription(event.target.value)}
                className="resize-y"
              />
            </label>
            {updateJob.error && <p role="alert" className="text-xs text-destructive">{updateJob.error.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
              <Button type="submit" disabled={!name.trim() || updateJob.isPending}>
                {updateJob.isPending && <LoaderCircle className="animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={cloneOpen} onOpenChange={setCloneOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={event => void confirmClone(event)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>复制任务</DialogTitle>
              <DialogDescription>复制冻结的计算参数和输入引用，创建一个新的排队任务。原任务不会被修改。</DialogDescription>
            </DialogHeader>
            <label className="grid gap-1.5 text-sm">
              <span>新任务名称</span>
              <Input value={cloneName} maxLength={160} onChange={event => setCloneName(event.target.value)} autoFocus />
            </label>
            {cloneJob.error && <p role="alert" className="text-xs text-destructive">{cloneJob.error.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCloneOpen(false)}>取消</Button>
              <Button type="submit" disabled={cloneJob.isPending || !cloneName.trim()}>
                {cloneJob.isPending && <LoaderCircle className="animate-spin" />}
                创建副本
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={retryOpen} onOpenChange={setRetryOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={event => void confirmRetry(event)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>重试任务</DialogTitle>
              <DialogDescription>
                使用原任务冻结的计算参数和输入创建一次新尝试。原日志与产物保持不变，并记录重试来源。
              </DialogDescription>
            </DialogHeader>
            <label className="grid gap-1.5 text-sm">
              <span>新任务名称</span>
              <Input value={retryName} maxLength={160} onChange={event => setRetryName(event.target.value)} autoFocus />
            </label>
            {retryJob.error && <p role="alert" className="text-xs text-destructive">{retryJob.error.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRetryOpen(false)}>取消</Button>
              <Button type="submit" disabled={retryJob.isPending || !retryName.trim()}>
                {retryJob.isPending && <LoaderCircle className="animate-spin" />}
                创建重试
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>取消任务</DialogTitle>
            <DialogDescription>排队任务会立即取消；运行中的计算子进程会收到终止信号。已经生成的日志会保留。</DialogDescription>
          </DialogHeader>
          {cancelJob.error && <p role="alert" className="text-xs text-destructive">{cancelJob.error.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>返回</Button>
            <Button type="button" variant="destructive" disabled={cancelJob.isPending} onClick={() => void confirmCancel()}>
              {cancelJob.isPending && <LoaderCircle className="animate-spin" />}
              确认取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除任务</DialogTitle>
            <DialogDescription>
              将删除“{job.name}”的任务记录和专属工作目录。仍被工作流引用的任务不会被删除。
            </DialogDescription>
          </DialogHeader>
          {deleteJob.error && <p role="alert" className="text-xs text-destructive">{deleteJob.error.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button type="button" variant="destructive" disabled={deleteJob.isPending} onClick={() => void confirmDelete()}>
              {deleteJob.isPending && <LoaderCircle className="animate-spin" />}
              删除任务
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
