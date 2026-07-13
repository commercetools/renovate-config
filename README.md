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

### Platforms (2)
- `nodejs` — Node.js runtime
- `pnpm` — pnpm package manager

### Libraries (27+)
Grouped by ecosystem: React, GraphQL, Testing, TypeScript, Styling, etc.

### Composite Bundles (5)
Pre-configured for common project types:
- `merchant-center-application` — Full Merchant Center apps
- `merchant-center-application-kit` — Application Kit development
- `component-library` — UI component libraries (with Storybook)
- `typescript-service` — Backend utilities and libraries
- `auto-merging` — Label-gated automerge policy (minor/patch automerge, label by update type)

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
