/**
 * Cloudflare Pages hostname parser.
 *
 * Recognized hostname shapes (project = `dayaberkah`):
 *   - `dayaberkah.pages.dev`                          → hub production
 *   - `<branch>.dayaberkah.pages.dev`                 → hub branch preview
 *   - `<spoke>.dayaberkah.pages.dev`                  → spoke production
 *   - `<spoke>.<branch>.dayaberkah.pages.dev`         → spoke branch preview
 *   - `dashboard.dayaberkah.pages.dev`                → dashboard production
 *   - `dashboard.<branch>.dayaberkah.pages.dev`       → dashboard branch preview
 *
 * Disambiguation: when the leading label of a 4-part host matches a known spoke
 * or `dashboard`, it is treated as the subdomain (whitelist-first). Otherwise
 * the entire prefix is treated as a branch name and resolved as hub preview.
 * This means a git branch literally named `pju` will be shadowed by the spoke
 * on preview URLs — operators should avoid branch names that collide with the
 * spoke/dashboard whitelist.
 *
 * Invariants that make `split('.')` safe:
 *   - Cloudflare Pages project names cannot contain `.`.
 *   - Branch names have `/` encoded as `-` (no `.` introduced).
 */

export const CLOUDFLARE_PAGES_PROJECTS = ['dayaberkah', 'dbsn-website'] as const
export const CLOUDFLARE_PAGES_PROJECT = 'dayaberkah'
export const CLOUDFLARE_PAGES_BASE = `${CLOUDFLARE_PAGES_PROJECT}.pages.dev`
export const CLOUDFLARE_PAGES_BASES = ['dayaberkah.pages.dev', 'dbsn-website.pages.dev'] as const

export const SPOKE_SUBDOMAINS = ['pju', 'solarpanel', 'penangkalpetir', 'baterai'] as const
export const DASHBOARD_SUBDOMAIN = 'dashboard'

export const SUBDOMAIN_ALIASES: Record<string, string> = {
  solarcell: 'solarpanel',
  alatpetir: 'penangkalpetir',
}

export function resolveSubdomainAlias(subdomain: string): string {
  return SUBDOMAIN_ALIASES[subdomain] || subdomain
}

const SPOKE_SET: ReadonlySet<string> = new Set(SPOKE_SUBDOMAINS)

export interface PagesHost {
  /** Detected subdomain (`pju`, `solarpanel`, `penangkalpetir`, `baterai`, `dashboard`) or null for hub. */
  subdomain: string | null
  /** Root domain including any branch segment, e.g. `dbsn-website.pages.dev` or `staging.dbsn-website.pages.dev`. */
  previewRoot: string
}

/**
 * Returns true when the hostname is rooted at a recognized Cloudflare Pages base or Workers.
 */
export function isCloudflarePagesHost(hostname: string): boolean {
  if (!hostname) return false
  const host = hostname.toLowerCase()
  if (host.endsWith('.workers.dev')) return true
  return CLOUDFLARE_PAGES_BASES.some(
    (base) => host === base || host.endsWith(`.${base}`)
  )
}

/**
 * Parses a Cloudflare Pages or Workers hostname into its subdomain and preview root.
 *
 * @returns `PagesHost` when the hostname is on the project's Pages or Workers base, otherwise `null`.
 */
export function parseCloudflarePagesHost(hostname: string): PagesHost | null {
  if (!hostname) return null
  const host = hostname.toLowerCase()

  if (host.endsWith('.workers.dev')) {
    const parts = host.split('.')
    const firstPart = parts[0]
    const resolved = resolveSubdomainAlias(firstPart)
    if (SPOKE_SET.has(resolved) || resolved === DASHBOARD_SUBDOMAIN) {
      return { subdomain: resolved, previewRoot: host }
    }
    return { subdomain: null, previewRoot: host }
  }

  const matchingBase = CLOUDFLARE_PAGES_BASES.find(
    (base) => host === base || host.endsWith(`.${base}`)
  )
  if (!matchingBase) return null

  if (host === matchingBase) {
    return { subdomain: null, previewRoot: matchingBase }
  }

  const suffix = `.${matchingBase}`
  const prefix = host.slice(0, -suffix.length)
  if (!prefix) return null

  const parts = prefix.split('.')
  const firstPart = parts[0]
  const resolvedFirst = resolveSubdomainAlias(firstPart)

  if (SPOKE_SET.has(resolvedFirst) || resolvedFirst === DASHBOARD_SUBDOMAIN) {
    const rest = parts.slice(1)
    if (rest.length === 0) {
      return { subdomain: resolvedFirst, previewRoot: matchingBase }
    }
    return { subdomain: resolvedFirst, previewRoot: `${rest.join('.')}.${matchingBase}` }
  }

  // Leading label is not a spoke/dashboard — treat the whole prefix as a branch name.
  return { subdomain: null, previewRoot: `${prefix}.${matchingBase}` }
}
