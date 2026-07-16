import type { MouseEvent, ReactNode } from 'react'
import { Atom, Blocks, FlaskConical, GitBranch, LayoutDashboard, Moon, Sun } from 'lucide-react'
import type { AppRoute } from '@/app/appRoute'
import { Button } from '@/components/ui/button'
import { useUiThemeStore } from '@/domain/uiThemeStore'
import { cn } from '@/lib/utils'

type PlatformRoute = Extract<AppRoute, 'dashboard' | 'jobs' | 'workflows'>

export interface PlatformShellProps {
  route: PlatformRoute
  onNavigate: (path: string) => void
  children: ReactNode
}

const navigation: Array<{ route: PlatformRoute; label: string; path: string; icon: typeof LayoutDashboard }> = [
  { route: 'dashboard', label: '概览', path: '/', icon: LayoutDashboard },
  { route: 'jobs', label: '任务', path: '/jobs', icon: FlaskConical },
  { route: 'workflows', label: '工作流', path: '/workflows', icon: GitBranch },
]

export function PlatformShell({ route, onNavigate, children }: PlatformShellProps) {
  const theme = useUiThemeStore(state => state.theme)
  const toggleTheme = useUiThemeStore(state => state.toggleTheme)

  function followLink(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-4">
        <a href="/" onClick={event => followLink(event, '/')} className="flex items-center gap-2" aria-label="RetainMol 计算平台首页">
          <span className="grid size-8 place-items-center bg-foreground text-background"><Atom className="size-4" /></span>
          <span className="text-sm font-semibold">RetainMol</span>
        </a>

        <nav aria-label="平台导航" className="ml-8 flex h-full items-center gap-1">
          {navigation.map(item => {
            const Icon = item.icon
            const active = route === item.route
            return (
              <a
                key={item.route}
                href={item.path}
                aria-current={active ? 'page' : undefined}
                onClick={event => followLink(event, item.path)}
                className={cn(
                  'flex h-9 items-center gap-2 px-3 text-xs font-medium transition-colors',
                  active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-9" onClick={toggleTheme} title={theme === 'day' ? '切换到夜间主题' : '切换到白天主题'}>
            {theme === 'day' ? <Moon /> : <Sun />}
          </Button>
          <Button asChild size="sm" className="h-9">
            <a href="/editor" onClick={event => followLink(event, '/editor')}><Blocks />打开分子编辑器</a>
          </Button>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
