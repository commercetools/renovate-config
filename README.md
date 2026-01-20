# Renovate Config Presets

Shared Renovate configuration presets for commercetools and organization repositories.

## Overview

This repository provides a collection of modular Renovate configuration presets that standardize dependency update patterns across commercetools projects.

## Available Presets

| Preset | File | Description | When to Use |
|--------|------|-------------|-------------|
| **Base** | `default.json` | Foundation configuration with best practices, scheduling, and PR limits | **Required** - All repositories should extend this |
| **Application Kit** | `application-kit.json` | Groups `@commercetools-frontend/*` packages | Repositories using Merchant Center Application Kit |
| **UI Kit** | `ui-kit.json` | Groups `@commercetools-uikit/*` packages | Repositories using commercetools UI Kit |
| **Test Data** | `test-data.json` | Groups test data packages | Repositories using `@commercetools-test-data/*` |
| **Internal Extensions** | `internal-extensions.json` | Groups internal frontend extensions | Repositories using extensions like change-history, export-resources-modal, etc. |
| **Internal CLIs** | `internal-clis.json` | Groups `@commercetools-scripts/*` and CLI tools | Repositories using internal CLI packages |
| **Node.js** | `nodejs.json` | Manages Node.js runtime updates | Repositories tracking Node.js versions |
| **React** | `react.json` | Groups React core packages (react, react-dom, @types/react) | React applications |
| **Cypress** | `cypress.json` | Groups Cypress and related E2E testing packages | Repositories using Cypress for testing |
| **GraphiQL** | `graphiql.json` | Groups GraphiQL packages | Repositories with GraphQL IDE functionality |
| **pnpm** | `pnpm.json` | Manages pnpm package manager updates | Repositories using pnpm |

## Usage

### Basic Setup

The simplest configuration extends only the base preset:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config"]
}
```

### Selective Presets

Extend only the presets for dependencies your repository actually uses:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config:nodejs",
    "github>commercetools/renovate-config:react",
    "github>commercetools/renovate-config:pnpm"
  ]
}
```

### Full Frontend Application

For a complete frontend application using all commercetools packages:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config:application-kit",
    "github>commercetools/renovate-config:ui-kit",
    "github>commercetools/renovate-config:test-data",
    "github>commercetools/renovate-config:internal-extensions",
    "github>commercetools/renovate-config:internal-clis",
    "github>commercetools/renovate-config:nodejs",
    "github>commercetools/renovate-config:react",
    "github>commercetools/renovate-config:cypress",
    "github>commercetools/renovate-config:graphiql",
    "github>commercetools/renovate-config:pnpm"
  ]
}
```

### With Repository-Specific Overrides

Combine shared presets with local configuration for repository-specific needs:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config:nodejs",
    "github>commercetools/renovate-config:react"
  ],
  "gitAuthor": "Renovate Bot <bot@example.com>",
  "reviewers": ["team:frontend"],
  "packageRules": [
    {
      "matchPackageNames": ["moment", "moment-timezone"],
      "groupName": "all moment dependencies",
      "schedule": ["after 10pm every weekday", "before 8am every weekday"]
    }
  ],
  "ignoreDeps": ["legacy-package"]
}
```

## How to Extend

Use the standard Renovate preset syntax:

```
github>commercetools/renovate-config:preset-name
```

Where `preset-name` matches the filename (without `.json` extension).

### Examples

- Base config: `github>commercetools/renovate-config`
- Application Kit: `github>commercetools/renovate-config:application-kit`
- React: `github>commercetools/renovate-config:react`
- Node.js: `github>commercetools/renovate-config:nodejs`

## Version Pinning

To pin to a specific version of these presets, use Git tags:

```json
{
  "extends": ["github>commercetools/renovate-config#v1.2.3"]
}
```

This ensures your configuration won't change unexpectedly. However, you'll need to manually update to receive improvements and new features.

## Configuration Details

### Base Configuration (`default.json`)

The base configuration provides:

- **Best practices**: Extends `config:best-practices`
- **Semver preservation**: Preserves existing semver ranges
- **Weekly schedule**: Updates run on a weekly schedule
- **Security**: Minimum release age for npm packages
- **PR management**: 
  - 1 PR at a time (`prConcurrentLimit: 1`)
  - 2 branches concurrently (`branchConcurrentLimit: 2`)
  - 1 PR per hour (`prHourlyLimit: 1`)
- **Grouping**: Minor and patch updates grouped together
- **Labels**: Automatic PR labeling with `🙏 Status: code review needed` and `🤖 Type: Dependencies`
- **Lock files**: Automatic lock file maintenance
- **Peer dependencies**: Uses `widen` range strategy

### commercetools Package Presets

All commercetools-specific presets (`application-kit`, `ui-kit`, `test-data`, `internal-extensions`, `internal-clis`) share:

- **Non-office hours scheduling**: Updates after 10pm or before 8am on weekdays
- **No release age requirement**: Updates available immediately (`minimumReleaseAge: null`)
- **Grouped updates**: All packages from the same source grouped into one PR

### Third-Party Package Presets

Third-party presets (`react`, `graphiql`, `cypress`, `nodejs`, `pnpm`) follow standard weekly scheduling patterns and use appropriate grouping strategies.

## Repository-Specific Configuration

Keep these items in your local Renovate configuration (not in shared presets):

- **Git author**: Different repos may use different bot accounts
- **Reviewers**: Team assignments vary by repository
- **Base branch patterns**: Repository-specific branch strategies
- **CI/CD toggles**: Settings like `circleci.enabled`
- **Version constraints**: Allowable versions based on compatibility requirements
- **Ignored dependencies**: Repository-specific packages that shouldn't be updated
- **Custom dependency groupings**: Until patterns emerge across multiple repositories

## Adding New Presets

New presets should be added when:

1. The pattern appears in **3+ repositories**
2. Configuration is **identical or very similar** across repos
3. The dependency group is **stable** and unlikely to change frequently
4. There's **team consensus** that it's a useful shared pattern

To propose a new preset:

1. Create a PR with the new preset file
2. Include documentation in this README
3. Provide examples of repositories that would benefit
4. Show the pattern currently duplicated across repos

## Migration Guide

To migrate an existing repository to use these shared presets:

### Step 1: Analyze Current Configuration

Review your current `.github/renovate.json` and identify:

- Configurations that match available presets
- Repository-specific settings to keep
- Custom patterns not yet available as shared presets

### Step 2: Update Configuration

1. Replace duplicated patterns with preset extends
2. Keep repository-specific configuration
3. Maintain any custom groupings for dependencies without shared presets

**Before:**

```json
{
  "extends": ["config:best-practices"],
  "separateMajorMinor": true,
  "packageRules": [
    {
      "matchPackageNames": ["react", "react-dom", "@types/react"],
      "groupName": "all react dependencies"
    },
    {
      "matchPackageNames": ["cypress"],
      "matchPackagePatterns": ["^cypress-"],
      "groupName": "all Cypress updates"
    }
  ]
}
```

**After:**

```json
{
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config:react",
    "github>commercetools/renovate-config:cypress"
  ]
}
```

### Step 3: Test

1. Commit the changes to a test branch
2. Verify Renovate successfully loads all presets
3. Check that PRs are created with expected groupings
4. Ensure schedules and labels are correctly applied

### Step 4: Deploy

Once validated, merge to your default branch and monitor the first few update cycles.

## Troubleshooting

### Preset Not Found

**Error**: `Cannot find preset "github>commercetools/renovate-config:preset-name"`

**Solution**: Verify the preset name matches the filename (without `.json`). Check that the preset exists in this repository.

### Duplicate PRs

**Issue**: Multiple PRs for the same package group

**Cause**: Conflicting package rules between shared presets and local configuration

**Solution**: Review local `packageRules` and remove duplicates. Shared preset rules should take precedence.

### Incorrect Scheduling

**Issue**: Updates running at unexpected times

**Cause**: Multiple schedules defined across presets and local config

**Solution**: Check that local configuration isn't overriding preset schedules. Later rules in the extends array take precedence.

### Missing Expected Groups

**Issue**: Packages not grouped as expected

**Cause**: Package doesn't match the preset's matchers

**Solution**: Verify package name/pattern matches the preset. You may need to add a local rule or propose updating the shared preset.

## Maintenance

### Requesting Changes

To request changes to existing presets:

1. Open an issue describing the desired change
2. Explain the rationale and which repositories would benefit
3. Propose specific configuration changes

### Contributing

Contributions are welcome! Please:

1. Follow the existing preset structure and naming conventions
2. Update this README with documentation for new presets
3. Provide usage examples
4. Test changes in at least one repository before submitting

## Additional Resources

- [Renovate Documentation](https://docs.renovatebot.com/)
- [Renovate Preset Configuration](https://docs.renovatebot.com/config-presets/)
- [Renovate Best Practices](https://docs.renovatebot.com/presets-config/#configbest-practices)
