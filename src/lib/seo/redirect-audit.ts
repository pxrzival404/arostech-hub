import { prisma } from '../db/prisma'

const ROOT_DOMAIN = 'dayaberkah.id'

export interface AuditOptions {
  baseUrl?: string
  checkStatus?: boolean
}

export interface BrokenTarget {
  source: string
  target: string
  status: number
  error?: string
}

export interface RedirectChain {
  source: string
  intermediate: string
  finalTarget: string
}

export interface RedirectLoop {
  urls: string[]
}

export interface AuditReport {
  totalRedirects: number
  chains: RedirectChain[]
  loops: RedirectLoop[]
  brokenTargets: BrokenTarget[]
}

export async function auditRedirects(options: AuditOptions = {}): Promise<AuditReport> {
  const baseUrl = options.baseUrl || 'https://dayaberkah.id'
  const checkStatus = options.checkStatus ?? false

  const redirects = await prisma.redirectMap.findMany()

  const chains: RedirectChain[] = []
  const loops: RedirectLoop[] = []
  const brokenTargets: BrokenTarget[] = []

  // 1. Static Analysis: Chains
  for (const r of redirects) {
    const nextRedirect = redirects.find(item => item.legacyUrl === r.targetUrl)
    if (nextRedirect) {
      // Find final target to report the complete chain
      let finalTarget = nextRedirect.targetUrl
      let current = nextRedirect
      const visited = new Set<string>([r.legacyUrl, r.targetUrl, finalTarget])
      let isLoop = false

      while (true) {
        const next = redirects.find(item => item.legacyUrl === current.targetUrl)
        if (next) {
          if (visited.has(next.targetUrl)) {
            isLoop = true
            break
          }
          visited.add(next.targetUrl)
          finalTarget = next.targetUrl
          current = next
        } else {
          break
        }
      }

      if (!isLoop) {
        chains.push({
          source: r.legacyUrl,
          intermediate: r.targetUrl,
          finalTarget,
        })
      }
    }
  }

  // 2. Static Analysis: Loops
  const processed = new Set<string>()
  for (const r of redirects) {
    if (processed.has(r.legacyUrl)) continue

    const path = [r.legacyUrl]
    const pathSet = new Set<string>([r.legacyUrl])
    let current = r

    while (true) {
      const next = redirects.find(item => item.legacyUrl === current.targetUrl)
      if (!next) break

      if (pathSet.has(next.legacyUrl)) {
        const loopStartIndex = path.indexOf(next.legacyUrl)
        loops.push({
          urls: path.slice(loopStartIndex),
        })
        break
      }

      path.push(next.legacyUrl)
      pathSet.add(next.legacyUrl)
      current = next
    }

    path.forEach(url => processed.add(url))
  }

  // 3. Network Analysis: Target Status Check
  if (checkStatus && redirects.length > 0) {
    const checkPromises = redirects.map(async r => {
      let urlToCheck = r.targetUrl
      if (urlToCheck.startsWith('/')) {
        if (r.spoke) {
          urlToCheck = `https://${r.spoke}.${ROOT_DOMAIN}${r.targetUrl}`
        } else {
          urlToCheck = `${baseUrl}${r.targetUrl}`
        }
      }

      try {
        const res = await fetch(urlToCheck, { method: 'HEAD', redirect: 'manual' })
        // A target is healthy if it returns 200 OK or is a redirect itself (though redirect chains are flagged above)
        if (!res.ok && res.status !== 301 && res.status !== 302 && res.status !== 307 && res.status !== 308) {
          brokenTargets.push({
            source: r.legacyUrl,
            target: r.targetUrl,
            status: res.status,
            error: `HTTP ${res.status}`,
          })
        }
      } catch (err: any) {
        brokenTargets.push({
          source: r.legacyUrl,
          target: r.targetUrl,
          status: 0,
          error: err.message || 'Fetch failed',
        })
      }
    })

    await Promise.all(checkPromises)
  }

  return {
    totalRedirects: redirects.length,
    chains,
    loops,
    brokenTargets,
  }
}
