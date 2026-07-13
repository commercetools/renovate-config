// @ts-check
'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const run = require('./dependency-dashboard.js')
const {
  derive,
  render,
  parsePackage,
  riskOf,
  typeOf,
  median,
  startOfWeekUTC,
  momDeltas,
} = run.__internals

const NOW = Date.parse('2026-07-13T00:00:00Z')

/** Build a PR fixture. */
function pr(mergedAt, risk, type, mergedBy, title, createdAt) {
  return {
    number: Math.floor(Math.random() * 1e6),
    title: title || `chore(deps): update dependency thing to v1`,
    repo: 'commercetools/example',
    createdAt: createdAt || mergedAt,
    mergedAt,
    mergedBy,
    labels: [`🤖 Risk: ${risk}`, `🤖 Dependencies: ${type}`],
  }
}

const FIXTURE = [
  pr('2026-07-10T00:00:00Z', 'Low', 'Minor', 'renovate', 'chore(deps): update dependency prettier to v3.9.5', '2026-07-09T22:00:00Z'),
  pr('2026-07-01T00:00:00Z', 'Medium', 'Patch', 'tdeekens'),
  pr('2026-06-20T00:00:00Z', 'Low', 'Major', 'renovate'),
  pr('2026-06-01T00:00:00Z', 'Low', 'Patch', 'renovate'), // prev-30d window
  pr('2026-05-01T00:00:00Z', 'High', 'Fix', 'renovate'), // older than 60d
]

test('parsePackage handles common Renovate title shapes', () => {
  assert.equal(parsePackage('chore(deps): update dependency prettier to v3.9.5'), 'prettier')
  assert.equal(parsePackage('fix(deps): update dependency @aws-sdk/client-sqs to v3.1084.0'), '@aws-sdk/client-sqs')
  assert.equal(parsePackage('chore(deps): update pnpm to v11.11.0'), 'pnpm')
  assert.equal(parsePackage('fix(deps): update all application-kit packages to v27.8.0'), 'all application-kit packages')
  assert.equal(parsePackage('chore(deps): update actions/checkout action to v4'), 'actions/checkout')
})

test('riskOf picks the highest present risk', () => {
  assert.equal(riskOf(['🤖 Risk: Low']), 'Low')
  assert.equal(riskOf(['🤖 Risk: Low', '🤖 Risk: High']), 'High')
  assert.equal(riskOf(['🤖 Type: Dependencies']), null)
})

test('typeOf reads the update-type label', () => {
  assert.equal(typeOf(['🤖 Dependencies: Minor']), 'Minor')
  assert.equal(typeOf(['whatever']), 'Other')
})

test('median handles odd, even, and empty', () => {
  assert.equal(median([3, 1, 2]), 2)
  assert.equal(median([1, 2, 3, 4]), 2.5)
  assert.equal(median([]), 0)
})

test('startOfWeekUTC returns Monday 00:00 UTC', () => {
  // 2026-07-13 is a Monday
  assert.equal(startOfWeekUTC(Date.parse('2026-07-13T12:00:00Z')), Date.parse('2026-07-13T00:00:00Z'))
  // 2026-07-12 is a Sunday -> previous Monday 2026-07-06
  assert.equal(startOfWeekUTC(Date.parse('2026-07-12T23:59:00Z')), Date.parse('2026-07-06T00:00:00Z'))
})

test('derive computes windows and breakdowns', () => {
  const d = derive(FIXTURE, NOW)
  assert.equal(d.allTime.total, 5)
  assert.equal(d.last30.total, 3) // 07-10, 07-01, 06-20
  assert.deepEqual(d.last30.risk, { Low: 2, Medium: 1, High: 0 })
  assert.deepEqual(d.last30.type, { Major: 1, Minor: 1, Patch: 1, Fix: 0, Other: 0 })
  assert.equal(d.last30.automergePct, 67) // 2 of 3 merged by renovate
  assert.equal(d.allTime.repos, 1)
})

test('momDeltas is null when there is no prior period', () => {
  const noPrev = derive([FIXTURE[0]], NOW) // only one recent PR
  assert.equal(noPrev.mom, null)
})

test('momDeltas populates when prior period has data', () => {
  const d = derive(FIXTURE, NOW)
  assert.ok(d.mom)
  assert.equal(d.mom.total, 3 - 1) // last30 (3) vs prev30 (1)
})

test('render produces a dashboard with marker, badges, pies', () => {
  const body = render(derive(FIXTURE, NOW))
  assert.match(body, /<!-- dependency-dashboard -->/)
  assert.match(body, /# 📊 Dependency Update Dashboard/)
  assert.match(body, /img\.shields\.io\/badge/)
  assert.match(body, /```mermaid\npie showData title Risk \(30d\)/)
  assert.match(body, /xychart-beta/)
})

test('render shows an empty-state when there is no data', () => {
  const body = render(derive([], NOW))
  assert.match(body, /No risk-labeled merged PRs found yet/)
  assert.doesNotMatch(body, /xychart-beta/)
})
