# Renovate Config Presets

Shared Renovate configuration presets for commercetools projects.

## What Is This?

This repository provides modular Renovate presets to standardize dependency updates across projects. Instead of duplicating Renovate configuration, projects extend presets from here.

## Quick Start

### Basic (extends only base config)
```json
{
  "extends": ["github>commercetools/renovate-config"]
}
```

### Using a Composite Bundle
```json
{
  "extends": ["github>commercetools/renovate-config//composite/merchant-center-application"]
}
```

### Custom Selection
```json
{
  "extends": [
    "github>commercetools/pull-request-config",
    "github>commercetools/renovate-config//platforms/nodejs",
    "github>commercetools/renovate-config//libraries/react"
  ]
}
```

## Preset Categories

### Platforms (3)
- `nodejs` — Node.js runtime
- `pnpm` — pnpm package manager
- `docker` — Base image freshness: digest pinning + refresh, tiered update policy (see below)

### Libraries (27+)
Grouped by ecosystem: React, GraphQL, Testing, TypeScript, Styling, etc.

### Composite Bundles (5)
Pre-configured for common project types:
- `merchant-center-application` — Full Merchant Center apps
- `merchant-center-application-kit` — Application Kit development
- `component-library` — UI component libraries (with Storybook)
- `typescript-service` — Backend utilities and libraries
- `auto-merging` — Label-gated automerge policy (minor/patch automerge, label by update type)

## Base Image Updates (`platforms/docker`)

Opt-in preset for Dockerfiles and docker-compose files. Pins every `FROM` image to a
digest and keeps digests fresh, so rebuilt base images (patched glibc, OpenSSL, etc.)
land automatically. Updates are tiered by risk:

| Update type | Behaviour |
| --- | --- |
| digest / pin / patch | Grouped into one weekly off-hours PR and automerged (gated by `renovate-action` 🤖 Risk: Low), `minimumReleaseAge: 1 day` |
| minor | PR for review, never automerged, `minimumReleaseAge: 5 days` |
| major | **Dependency Dashboard approval** required (no auto-PR), `minimumReleaseAge: 90 days` — adopt new majors on a stable cadence |
| node | Constrained to even (LTS) majors only |

Extend it directly to pilot:
```json
{
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config//platforms/docker"
  ]
}
```

> Not yet part of the base `default` config. Once pilots confirm PR volume and automerge
> behaviour, it will be added to `default.json` so every consumer gets base-image coverage.

## Preset Syntax

```
github>commercetools/renovate-config//folder/preset-name
```

Examples:
- `github>commercetools/renovate-config//platforms/nodejs`
- `github>commercetools/renovate-config//libraries/react`
- `github>commercetools/renovate-config//composite/merchant-center-application`
- `github>commercetools/renovate-config//composite/component-library`

## Base Configuration Defaults

- Best practices extended
- Weekly scheduling, non-office hours for commercetools packages
- 1 concurrent PR, 2 concurrent branches
- Minor and patch updates grouped together
- Auto-labeled with `🤖 Type: Dependencies`
- Lock file maintenance enabled

## Customization

Override or extend any preset in your local config:

```json
{
  "extends": ["github>commercetools/renovate-config//composite/merchant-center-application"],
  "ignoreDeps": ["legacy-package"],
  "packageRules": [
    {
      "matchPackageNames": ["moment"],
      "schedule": ["before 8am on Monday"]
    }
  ]
}
```

## Version Pinning

Pin to a specific version:
```json
{
  "extends": ["github>commercetools/renovate-config#v1.2.3"]
}
```

## Contributing

Propose new presets when the pattern appears in 3+ repositories. Open a PR with:
- New preset file
- README documentation
- Example repositories using it
- Current duplication across repos

## Resources

- [Renovate Docs](https://docs.renovatebot.com/)
- [Preset Config](https://docs.renovatebot.com/config-presets/)
- [Best Practices](https://docs.renovatebot.com/presets-config/#configbest-practices)
