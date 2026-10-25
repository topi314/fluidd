import { sidebarIconName, sidebarInsertAfter, sidebarPosition } from '../sidebar-entry'

describe('sidebarPosition', () => {
  it('keeps a known position', () => {
    expect(sidebarPosition('console')).toBe('console')
  })

  it('uses below Home when the position is missing', () => {
    expect(sidebarPosition(undefined)).toBe('home')
    expect(sidebarPosition('nope')).toBe('home')
  })
})

describe('sidebarInsertAfter', () => {
  const visible = ['home', 'console', 'jobs', 'tune', 'settings']

  it('keeps a visible anchor', () => {
    expect(sidebarInsertAfter('console', visible)).toBe('console')
  })

  it('moves a hidden anchor up to the previous visible item', () => {
    expect(sidebarInsertAfter('history', visible)).toBe('jobs')
  })

  it('uses the top when nothing above the anchor is visible', () => {
    expect(sidebarInsertAfter('console', [])).toBe('start')
  })
})

describe('sidebarIconName', () => {
  it('keeps a known icon', () => {
    expect(sidebarIconName({ icon: 'console', type: 'page' })).toBe('console')
  })

  it('falls back from the entry type', () => {
    expect(sidebarIconName({ type: 'link' })).toBe('openInNew')
    expect(sidebarIconName({ icon: 'not-an-icon', type: 'page' })).toBe('web')
  })
})
