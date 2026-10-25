/**
 * Accept only absolute http(s) URLs for a dashboard iframe tile.
 * Anything else (relative, javascript:, data:) is refused.
 */
export const iframeHttpUrl = (url: string): string | undefined => {
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return undefined
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return undefined
  }

  return parsed.toString()
}
