/**
 * Minimal Svelte 5 router using the History API and runes.
 * Built in-house because svelte-routing v2 uses the legacy component API
 * and renders empty content under Svelte 5.
 */

let currentPath = $state(window.location.pathname)

export function getPath(): string {
  return currentPath
}

export function navigate(path: string, options?: { replace?: boolean }) {
  if (options?.replace) {
    window.history.replaceState(null, '', path)
  } else {
    window.history.pushState(null, '', path)
  }
  currentPath = path
}

/** Extract named params from a pattern like `/articles/:id/edit`.
 *  Supports trailing optional segments via `:param?`. */
export function matchRoute(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)

  const requiredCount = patternParts.filter((p) => !p.endsWith('?')).length
  if (pathParts.length < requiredCount || pathParts.length > patternParts.length) return null

  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i++) {
    const isOptional = patternParts[i].endsWith('?')
    const isParam = patternParts[i].startsWith(':')

    if (i >= pathParts.length) {
      // Only optional segments can be missing
      if (!isOptional) return null
      continue
    }

    if (isParam) {
      const name = patternParts[i].slice(1).replace(/\?$/, '')
      params[name] = pathParts[i]
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }

  return params
}

/** Intercept `<a>` clicks for SPA navigation (same-origin, no modifier keys) */
function handleClick(e: MouseEvent) {
  const anchor = (e.target as HTMLElement).closest('a')
  if (!anchor) return
  if (anchor.target === '_blank') return
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

  const href = anchor.getAttribute('href')
  if (!href || href.startsWith('http') || href.startsWith('//')) return

  e.preventDefault()
  navigate(href)
}

function handlePopState() {
  currentPath = window.location.pathname
}

/** Call once at app startup to wire up global listeners */
export function initRouter() {
  window.addEventListener('click', handleClick)
  window.addEventListener('popstate', handlePopState)

  return () => {
    window.removeEventListener('click', handleClick)
    window.removeEventListener('popstate', handlePopState)
  }
}
