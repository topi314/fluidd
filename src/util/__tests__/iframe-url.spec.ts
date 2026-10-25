import { iframeHttpUrl } from '../iframe-url'

describe('iframeHttpUrl', () => {
  it('keeps absolute http and https urls', () => {
    expect(iframeHttpUrl('https://example.com/tile')).toBe('https://example.com/tile')
    expect(iframeHttpUrl('http://printer.local:4000/panel')).toBe('http://printer.local:4000/panel')
  })

  it('refuses anything that is not an absolute http(s) url', () => {
    expect(iframeHttpUrl('javascript:alert(1)')).toBeUndefined()
    expect(iframeHttpUrl('data:text/html,hi')).toBeUndefined()
    expect(iframeHttpUrl('/relative')).toBeUndefined()
    expect(iframeHttpUrl('not a url')).toBeUndefined()
    expect(iframeHttpUrl('')).toBeUndefined()
  })
})
