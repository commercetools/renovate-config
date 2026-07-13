// @ts-check
'use strict'

/**
 * Dependency Dashboard generator.
 *
 * Collects merged, risk-labeled Renovate PRs across the org via a single
 * paginated GraphQL search, computes every statistic in memory, renders a
 * polished-hybrid Markdown body (Shields badges + Mermaid + tables), and
 * upserts a single dashboard issue in this repository.
 *
 * Loaded by actions/github-script, which injects an authenticated `github`
 * (Octokit) client. Pure helpers are exported via `__internals` for tests.
 */

const ORG = 'commercetools'
const RISK_LABELS = {
  Low: '🤖 Risk: Low',
  Medium: '🤖 Risk: Medium',
  High: '🤖 Risk: High',
}
const RISK_ORDER = ['Low', 'Medium', 'High']
const TYPE_ORDER = ['Major', 'Minor', 'Patch', 'Fix']
const TYPE_LABEL = (t) => `🤖 Dependencies: ${t}`

const ISSUE_TITLE = '📊 Dependency Update Dashboard'
const ISSUE_LABEL = 'dependency-dashboard'
const MARKER = '<!-- dependency-dashboard -->'

const TOP_N = 8
const TREND_WEEKS = 8
const PAGE_CAP = 20
const MS_DAY = 24 * 60 * 60 * 1000

// --- collect ---------------------------------------------------------------

const SEARCH_QUERY = `
query($q: String!, $cursor: String) {
  search(query: $q, type: ISSUE, first: 100, after: $cursor) {
    issueCount
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        number
        title
        createdAt
        mergedAt
        repository { nameWithOwner }
        mergedBy { login }
        labels(first: 20) { nodes { name } }
      }
    }
  }
}`

/**
 * Pull all merged PRs carrying a risk label. Risk levels are queried
 * separately (search cannot OR labels) and merged, deduped by repo+number.
 */
async function collect({ github, log }) {
  const byKey = new Map()
  for (const [level, label] of Object.entries(RISK_LABELS)) {
    const q = `org:${ORG} is:pr is:merged label:"${label}"`
    let cursor = null
    let pages = 0
    for (;;) {
      const res = await github.graphql(SEARCH_QUERY, { q, cursor })
      const { nodes, pageInfo, issueCount } = res.search
      for (const n of nodes) {
        if (!n || !n.mergedAt) continue
        const key = `${n.repository.nameWithOwner}#${n.number}`
        if (byKey.has(key)) continue
        byKey.set(key, {
          number: n.number,
          title: n.title,
          repo: n.repository.nameWithOwner,
          createdAt: n.createdAt,
          mergedAt: n.mergedAt,
          mergedBy: n.mergedBy ? n.mergedBy.login : null,
          labels: n.labels.nodes.map((l) => l.name),
        })
      }
      pages += 1
      log(`risk=${level} page=${pages} nodes=${nodes.length} issueCount=${issueCount}`)
      if (pages >= PAGE_CAP) {
        log(`WARNING: hit page cap (${PAGE_CAP}) for risk=${level}; results may be truncated`)
        break
      }
      if (!pageInfo.hasNextPage) break
      cursor = pageInfo.endCursor
    }
  }
  return [...byKey.values()]
}

// --- pure helpers ----------------------------------------------------------

function riskOf(labels) {
  for (const level of ['High', 'Medium', 'Low']) {
    if (labels.includes(RISK_LABELS[level])) return level
  }
  return null
}

function typeOf(labels) {
  for (const t of TYPE_ORDER) {
    if (labels.includes(TYPE_LABEL(t))) return t
  }
  return 'Other'
}

/** Extract the dependency name from a Renovate PR title. */
function parsePackage(title) {
  const stripped = title.replace(/^[a-z]+(\([^)]*\))?!?:\s*/i, '')
  const m = stripped.match(/^update (?:dependency )?(.+?) (?:to|digest|action)\b/i)
  if (m) return m[1].trim()
  return stripped.replace(/^update\s+/i, '').replace(/\s+to\s+.*$/i, '').trim()
}

function hoursBetween(a, b) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 36e5
}

function median(nums) {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function countBy(prs, fn) {
  const m = new Map()
  for (const pr of prs) {
    const k = fn(pr)
    if (k == null) continue
    m.set(k, (m.get(k) || 0) + 1)
  }
  return m
}

/** Turn a count Map into an ordered plain object, seeding known keys with 0. */
function mapToObj(map, order) {
  const obj = {}
  for (const k of order) obj[k] = map.get(k) || 0
  for (const [k, v] of map) if (!(k in obj)) obj[k] = v
  return obj
}

function topN(map, n) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }))
}

function automergePct(set) {
  if (!set.length) return null
  const auto = set.filter((p) => p.mergedBy === 'renovate').length
  return Math.round((auto / set.length) * 100)
}

/** Monday 00:00 UTC of the week containing `ms`. */
function startOfWeekUTC(ms) {
  const d = new Date(ms)
  const dow = (d.getUTCDay() + 6) % 7 // Mon=0 .. Sun=6
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow)
}

function weeklyTrend(prs, nowMs, weeks) {
  const current = startOfWeekUTC(nowMs)
  const buckets = []
  for (let i = weeks - 1; i >= 0; i--) {
    buckets.push({ start: current - i * 7 * MS_DAY, count: 0 })
  }
  const index = new Map(buckets.map((b, i) => [b.start, i]))
  for (const pr of prs) {
    const wk = startOfWeekUTC(new Date(pr.mergedAt).getTime())
    if (index.has(wk)) buckets[index.get(wk)].count += 1
  }
  return buckets
}

function momDeltas(cur, prev) {
  if (!prev || prev.total === 0) return null
  return {
    total: cur.total - prev.total,
    automergePct: (cur.automergePct ?? 0) - (prev.automergePct ?? 0),
    medianTtmHours: cur.medianTtmHours - prev.medianTtmHours,
  }
}

// --- derive ----------------------------------------------------------------

function windowStats(set) {
  return {
    total: set.length,
    repos: new Set(set.map((p) => p.repo)).size,
    risk: mapToObj(countBy(set, (p) => riskOf(p.labels)), RISK_ORDER),
    type: mapToObj(countBy(set, (p) => typeOf(p.labels)), [...TYPE_ORDER, 'Other']),
    automergePct: automergePct(set),
    medianTtmHours: median(set.map((p) => hoursBetween(p.createdAt, p.mergedAt))),
  }
}

function derive(prs, nowMs) {
  const day30 = nowMs - 30 * MS_DAY
  const day60 = nowMs - 60 * MS_DAY
  const at = (p) => new Date(p.mergedAt).getTime()

  const last30 = prs.filter((p) => at(p) >= day30)
  const prev30 = prs.filter((p) => at(p) >= day60 && at(p) < day30)
  const w30 = windowStats(last30)
  const wPrev = windowStats(prev30)

  return {
    generatedAt: new Date(nowMs).toISOString(),
    allTime: windowStats(prs),
    last30: w30,
    trend: weeklyTrend(prs, nowMs, TREND_WEEKS),
    topRepos: topN(countBy(prs, (p) => p.repo), TOP_N),
    topPackages: topN(countBy(prs, (p) => parsePackage(p.title)), TOP_N),
    mom: momDeltas(w30, wPrev),
  }
}

// --- render ----------------------------------------------------------------

function shield(label, message, color) {
  const esc = (s) =>
    encodeURIComponent(String(s).replace(/_/g, '__').replace(/-/g, '--').replace(/ /g, '_'))
  return `![${label}](https://img.shields.io/badge/${esc(label)}-${esc(message)}-${color}?style=flat-square)`
}

function fmtDuration(h) {
  if (h == null) return 'n/a'
  if (h < 1) return `~${Math.round(h * 60)}min`
  if (h < 48) return `~${h.toFixed(1)}h`
  return `~${(h / 24).toFixed(1)}d`
}

function shortRepo(nameWithOwner) {
  return nameWithOwner.replace(new RegExp(`^${ORG}/`), '')
}

function pie(title, obj) {
  const lines = Object.entries(obj)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `  "${k}" : ${v}`)
  if (!lines.length) return ''
  return ['```mermaid', `pie showData title ${title}`, ...lines, '```'].join('\n')
}

function trendChart(trend) {
  const labels = trend.map((b) => {
    const d = new Date(b.start)
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    return `"${mm}-${dd}"`
  })
  const data = trend.map((b) => b.count)
  const yMax = Math.max(10, Math.ceil(Math.max(...data) / 10) * 10)
  return [
    '```mermaid',
    'xychart-beta',
    '  title "Risk-labeled PRs merged / week (Mon start, UTC)"',
    `  x-axis [${labels.join(', ')}]`,
    `  y-axis "Merged" 0 --> ${yMax}`,
    `  bar [${data.join(', ')}]`,
    '```',
  ].join('\n')
}

function leaderboard(topRepos, topPackages) {
  const rows = Math.max(topRepos.length, topPackages.length)
  const out = ['| Repo | Merged |  | Package | Bumps |', '|------|-------:|--|---------|------:|']
  for (let i = 0; i < rows; i++) {
    const r = topRepos[i]
    const p = topPackages[i]
    out.push(
      `| ${r ? shortRepo(r.name) : ''} | ${r ? r.count : ''} |  | ${p ? '`' + p.name + '`' : ''} | ${p ? p.count : ''} |`,
    )
  }
  return out.join('\n')
}

function momSection(mom) {
  if (!mom) {
    return '_Not enough history yet. Deltas populate once a full prior 30-day period exists._'
  }
  const arrow = (n, unit = '') =>
    n > 0 ? `▲ +${n}${unit}` : n < 0 ? `▼ ${n}${unit}` : `± 0${unit}`
  return [
    `- Merged: ${arrow(mom.total)} vs previous 30 days`,
    `- Automerge: ${arrow(mom.automergePct, ' pts')}`,
    `- Median merge time: ${mom.medianTtmHours >= 0 ? '+' : ''}${mom.medianTtmHours.toFixed(1)}h`,
  ].join('\n')
}

function render(d) {
  const s = []
  s.push(MARKER)
  s.push(`# ${ISSUE_TITLE}`)
  s.push('')
  s.push(
    [
      shield('merged 30d', d.last30.total, '2ea44f'),
      shield('all time', d.allTime.total, '0969da'),
      shield('automerge', d.last30.automergePct == null ? 'n/a' : `${d.last30.automergePct}%`, '8250df'),
      shield('median merge', fmtDuration(d.last30.medianTtmHours), 'bf8700'),
      shield('active repos 30d', d.last30.repos, '6e7781'),
    ].join(' '),
  )
  s.push('')
  s.push('_Auto-updated daily · risk-labeled PRs only · "all time" = since risk-labeling began_')
  s.push('')

  if (d.allTime.total === 0) {
    s.push(
      '> No risk-labeled merged PRs found yet. This dashboard populates as `claude[bot]` labels dependency PRs across the org.',
    )
    s.push('')
    s.push(`<sub>Last updated ${d.generatedAt}</sub>`)
    return s.join('\n')
  }

  s.push('### 📈 Weekly trend')
  s.push(trendChart(d.trend))
  s.push('')
  s.push('### 🏆 Top repos & packages')
  s.push(leaderboard(d.topRepos, d.topPackages))
  s.push('')
  s.push('### 📊 vs previous 30 days')
  s.push(momSection(d.mom))
  s.push('')
  s.push('---')
  s.push('## 🥧 Breakdowns')
  s.push('### ⚖️ By risk')
  s.push(pie('Risk (30d)', d.last30.risk))
  s.push(pie('Risk (all time)', d.allTime.risk))
  s.push('### 🧩 By update type')
  s.push(pie('Update type (30d)', d.last30.type))
  s.push(pie('Update type (all time)', d.allTime.type))
  s.push('')
  s.push(`<sub>Last updated ${d.generatedAt} · generated by the dependency-dashboard workflow</sub>`)
  return s.join('\n')
}

// --- upsert ----------------------------------------------------------------

async function ensureLabel(github, owner, repo) {
  try {
    await github.rest.issues.getLabel({ owner, repo, name: ISSUE_LABEL })
  } catch (e) {
    if (e.status !== 404) throw e
    await github.rest.issues.createLabel({
      owner,
      repo,
      name: ISSUE_LABEL,
      color: '0e8a16',
      description: 'Automated dependency-update stats dashboard',
    })
  }
}

async function findIssue(github, owner, repo) {
  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    labels: ISSUE_LABEL,
    per_page: 100,
  })
  return issues.find((i) => !i.pull_request) || null
}

async function upsert({ github, context }, body) {
  const { owner, repo } = context.repo
  await ensureLabel(github, owner, repo)
  const existing = await findIssue(github, owner, repo)
  if (existing) {
    await github.rest.issues.update({ owner, repo, issue_number: existing.number, body })
    return { action: 'updated', number: existing.number }
  }
  const created = await github.rest.issues.create({
    owner,
    repo,
    title: ISSUE_TITLE,
    labels: [ISSUE_LABEL],
    body,
  })
  return { action: 'created', number: created.data.number }
}

// --- entry point -----------------------------------------------------------

async function run({ github, context, core }) {
  const log = core && core.info ? (m) => core.info(m) : (m) => console.log(m)
  const dryRun = process.env.DRY_RUN === '1'

  const prs = await collect({ github, log })
  log(`Collected ${prs.length} risk-labeled merged PRs`)

  const data = derive(prs, Date.now())
  const body = render(data)

  if (dryRun) {
    log('DRY_RUN=1 — printing dashboard body instead of writing the issue:')
    console.log(body)
    return
  }

  const res = await upsert({ github, context }, body)
  log(`Dashboard ${res.action}: #${res.number}`)
}

module.exports = run
module.exports.__internals = {
  collect,
  derive,
  render,
  parsePackage,
  riskOf,
  typeOf,
  median,
  countBy,
  mapToObj,
  topN,
  automergePct,
  weeklyTrend,
  startOfWeekUTC,
  momDeltas,
  windowStats,
  shield,
  fmtDuration,
}
