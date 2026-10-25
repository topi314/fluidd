import { Icons } from '@/globals'

export const SIDEBAR_POSITIONS = [
  'start',
  'home',
  'console',
  'gcode_preview',
  'jobs',
  'history',
  'timelapse',
  'tune',
  'diagnostics',
  'configure',
  'system',
  'settings'
] as const

export type SidebarPosition = typeof SIDEBAR_POSITIONS[number]

const isPosition = (value: string): value is SidebarPosition => (
  (SIDEBAR_POSITIONS as readonly string[]).includes(value)
)

export const sidebarPosition = (after: string | undefined): SidebarPosition => (
  after && isPosition(after) ? after : 'home'
)

export const sidebarIconName = (entry: { icon?: string, type: 'link' | 'page' }): string => {
  if (entry.icon && Object.prototype.hasOwnProperty.call(Icons, entry.icon)) {
    return entry.icon
  }

  return entry.type === 'link' ? 'openInNew' : 'web'
}

/**
 * Where an entry is drawn. A position whose built-in item is hidden falls back
 * to the nearest visible item above it, then to the top of the list.
 */
export const sidebarInsertAfter = (
  after: string | undefined,
  visible: readonly string[]
): SidebarPosition => {
  const wanted = sidebarPosition(after)
  if (wanted === 'start' || visible.includes(wanted)) return wanted

  const index = SIDEBAR_POSITIONS.indexOf(wanted)

  for (let i = index - 1; i >= 1; i--) {
    const id = SIDEBAR_POSITIONS[i]
    if (visible.includes(id)) return id
  }

  return 'start'
}
