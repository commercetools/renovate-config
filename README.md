# Renovate Config Presets

Shared Renovate configuration presets for commercetools and organization repositories.

## Repository Structure

```
renovate-config/
├── default.json              # Base configuration (extends this for all repos)
├── platforms/                # Runtime and platform-level presets
│   ├── nodejs.json          # Node.js runtime version management
│   └── pnpm.json            # pnpm package manager
├── libraries/                # Library and dependency ecosystem presets
│   ├── application-kit.json
│   ├── ui-kit.json
│   ├── react.json
│   ├── testing.json
│   └── ... (20+ more)
└── composite/                # Composite presets combining multiple libraries
    ├── merchant-center-application.json
    ├── merchant-center-application-kit.json
    ├── component-library.json
    └── typescript-service.json
```

## Overview

This repository provides a collection of modular Renovate configuration presets that standardize dependency update patterns across commercetools projects. Presets are organized into three categories for clarity and maintainability.

## Available Presets

### Platform Presets

Runtime and platform-level configuration.

| Preset | File | Description | When to Use |
|--------|------|-------------|-------------|
| **Node.js** | `platforms/nodejs.json` | Manages Node.js runtime and @types/node | Repositories tracking Node.js versions |
| **pnpm** | `platforms/pnpm.json` | Manages pnpm package manager updates | Repositories using pnpm |

### Library Presets

Fine-grained presets that group related dependencies by ecosystem. Use them individually or combine them via bundle presets.

| Preset | File | Description | When to Use |
|--------|------|-------------|-------------|
| **Application Kit** | `libraries/application-kit.json` | Groups `@commercetools-frontend/*` packages | Repositories using Merchant Center Application Kit |
| **UI Kit** | `libraries/ui-kit.json` | Groups `@commercetools-uikit/*` packages | Repositories using commercetools UI Kit |
| **Test Data** | `libraries/test-data.json` | Groups `@commercetools-test-data/*` packages | Repositories using commercetools test data |
| **Internal Extensions** | `libraries/internal-extensions.json` | Groups internal frontend extensions | Repositories using extensions like change-history, export-resources-modal, etc. |
| **Internal CLIs** | `libraries/internal-clis.json` | Groups `@commercetools-scripts/*` and CLI tools | Repositories using internal CLI packages |
| **React** | `libraries/react.json` | Groups React core packages (react, react-dom, @types/react, @types/react-dom) | React applications |
| **Internationalization** | `libraries/internationalization.json` | Groups react-intl and @formatjs/* packages | Applications using internationalization |
| **Apollo GraphQL** | `libraries/apollo-graphql.json` | Groups @apollo/client and graphql | Applications using Apollo Client |
| **GraphQL Codegen** | `libraries/graphql-codegen.json` | Groups @graphql-codegen/* packages | Projects using GraphQL code generation |
| **State & Routing** | `libraries/state-routing.json` | Groups redux, react-redux, react-router-dom and their types | Applications using Redux and React Router |
| **Emotion** | `libraries/emotion.json` | Groups @emotion/* packages | Applications using Emotion CSS-in-JS |
| **Testing Library** | `libraries/testing-library.json` | Groups @testing-library/* packages | Projects using Testing Library |
| **Testing** | `libraries/testing.json` | Combines Jest and Testing Library | Convenience bundle for common testing setup |
| **TypeScript** | `libraries/typescript.json` | Groups TypeScript and generic @types/* | TypeScript projects |
| **Babel** | `libraries/babel.json` | Groups @babel/* packages | Projects using Babel |
| **Webpack** | `libraries/webpack.json` | Groups webpack and webpack-* packages | Projects using Webpack bundler |
| **Linting** | `libraries/linting.json` | Groups eslint, prettier, and their plugins | All projects (code quality) |
| **PostCSS** | `libraries/postcss.json` | Groups postcss and postcss-* plugins | Projects using PostCSS |
| **Storybook** | `libraries/storybook.json` | Groups @storybook/* packages | Component libraries using Storybook |
| **Test Generators** | `libraries/test-generators.json` | Groups @faker-js/faker and casual | Projects generating test data |
| **Cypress** | `libraries/cypress.json` | Groups Cypress and related E2E testing packages | Repositories using Cypress for testing |
| **Jest** | `libraries/jest.json` | Groups Jest and related testing packages | Repositories using Jest for testing |
| **GraphiQL** | `libraries/graphiql.json` | Groups GraphiQL packages | Repositories with GraphQL IDE functionality |

### Composite Bundle Presets

These bundle presets combine multiple library presets for common repository types, reducing configuration complexity.

| Bundle | File | Description | Target Repositories |
|--------|------|-------------|---------------------|
| **Merchant Center Application** | `composite/merchant-center-application.json` | Complete stack for full Merchant Center applications | merchant-center-frontend, audit-log, merchant-center-prices, merchant-center-operations, merchant-center-services |
| **Merchant Center Application Kit** | `composite/merchant-center-application-kit.json` | For developing the Application Kit framework itself | merchant-center-application-kit |
| **Component Library** | `composite/component-library.json` | For UI component library development with Storybook | ui-kit |
| **TypeScript Service** | `composite/typescript-service.json` | Minimal preset for utility and test libraries without UI | test-data |

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
    "github>commercetools/renovate-config:platforms/nodejs",
    "github>commercetools/renovate-config:libraries/react",
    "github>commercetools/renovate-config:platforms/pnpm"
  ]
}
```

### Using Composite Presets

Composite presets provide a simplified configuration for common repository types:

#### Merchant Center Application

For full Merchant Center applications (merchant-center-frontend, audit-log, etc.):

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"]
}
```

#### Merchant Center Application Kit

For developing the Application Kit framework:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application-kit"]
}
```

#### Component Library

For UI component libraries like ui-kit:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/component-library"]
}
```

#### TypeScript Service

For utility and test libraries without UI:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/typescript-service"]
}
```

### With Repository-Specific Overrides

Combine shared presets with local configuration for repository-specific needs:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config:platforms/nodejs",
    "github>commercetools/renovate-config:libraries/react"
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
github>commercetools/renovate-config:folder/preset-name
```

Where `folder/preset-name` matches the file path (without `.json` extension).

### Examples

**Platform Presets:**
- Node.js: `github>commercetools/renovate-config:platforms/nodejs`
- pnpm: `github>commercetools/renovate-config:platforms/pnpm`

**Library Presets:**
- Application Kit: `github>commercetools/renovate-config:libraries/application-kit`
- React: `github>commercetools/renovate-config:libraries/react`
- Testing (convenience): `github>commercetools/renovate-config:libraries/testing`
- TypeScript: `github>commercetools/renovate-config:libraries/typescript`
- Internationalization: `github>commercetools/renovate-config:libraries/internationalization`

**Composite Presets:**
- Merchant Center Application: `github>commercetools/renovate-config:composite/merchant-center-application`
- Merchant Center Application Kit: `github>commercetools/renovate-config:composite/merchant-center-application-kit`
- Component Library: `github>commercetools/renovate-config:composite/component-library`
- TypeScript Service: `github>commercetools/renovate-config:composite/typescript-service`

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

Third-party presets follow standard weekly scheduling patterns and use appropriate grouping strategies:

- **Core Libraries**: `react`, `nodejs`, `pnpm`, `typescript`
- **GraphQL**: `apollo-graphql`, `graphql-codegen`, `graphiql`
- **State & Routing**: `state-routing`
- **Styling**: `emotion`, `postcss`
- **Testing**: `jest`, `testing-library`, `testing` (convenience), `cypress`, `test-generators`
- **Build Tools**: `babel`, `webpack`, `linting`
- **Development**: `storybook`
- **Internationalization**: `internationalization`

## Design Principles

The preset architecture follows these key principles:

1. **Comprehensive Coverage**: Every dependency category used across commercetools repositories has a corresponding preset
2. **Semantic Grouping**: Related packages that must update together are grouped in the same preset
3. **Type Co-location**: Library-specific `@types/*` packages are bundled with their libraries for version compatibility
   - `@types/react` and `@types/react-dom` → bundled with `react.json`
   - `@types/node` → bundled with `nodejs.json`
   - `@types/jest` → bundled with `jest.json`
   - `@types/react-redux`, `@types/react-router-dom` → bundled with `state-routing.json`
   - Generic types remain in `typescript.json`
4. **Scheduling Alignment**: commercetools packages use non-office hours; third-party use weekly schedules
5. **Progressive Enhancement**: Bundles include more than minimal dependencies to provide sensible defaults
6. **Convenience Bundles**: Commonly-used preset combinations (e.g., `testing.json`) reduce configuration complexity
7. **Flexibility**: Repositories can override or extend with custom rules while benefiting from shared presets

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

## Migration Guide (temp)

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
    "github>commercetools/renovate-config:libraries/react",
    "github>commercetools/renovate-config:libraries/cypress"
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

## Repository-Specific Migration Examples

### merchant-center-frontend

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"]
}
```

This composite includes: default, libraries/application-kit, libraries/ui-kit, libraries/test-data, libraries/internal-extensions, libraries/internal-clis, platforms/nodejs, platforms/pnpm, libraries/react, libraries/internationalization, libraries/apollo-graphql, libraries/graphql-codegen, libraries/state-routing, libraries/emotion, libraries/testing, libraries/cypress, libraries/typescript, libraries/babel, libraries/webpack, libraries/linting, libraries/postcss, libraries/graphiql.

### ui-kit

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/component-library"]
}
```

This composite includes: default, libraries/test-data, platforms/nodejs, platforms/pnpm, libraries/react, libraries/internationalization, libraries/emotion, libraries/testing, libraries/typescript, libraries/babel, libraries/webpack, libraries/linting, libraries/postcss, libraries/storybook, libraries/test-generators.

### audit-log

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"],
  "packageRules": [
    {
      "description": "Add backend-specific dependency rules here if needed",
      "matchPackagePatterns": ["^@commercetools-backend/"],
      "groupName": "backend packages"
    }
  ]
}
```

Uses the full application bundle with option to add backend-specific rules.

### merchant-center-application-kit

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application-kit"]
}
```

This composite includes: default, libraries/ui-kit, libraries/test-data, platforms/nodejs, platforms/pnpm, libraries/react, libraries/internationalization, libraries/apollo-graphql, libraries/graphql-codegen, libraries/state-routing, libraries/emotion, libraries/testing, libraries/cypress, libraries/typescript, libraries/babel, libraries/webpack, libraries/linting, libraries/postcss.

**Note:** Excludes `libraries/application-kit` (can't depend on itself), `libraries/internal-extensions`, `libraries/internal-clis`, and `libraries/graphiql`.

### merchant-center-prices

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"]
}
```

Full Merchant Center application stack.

### merchant-center-operations

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"]
}
```

Full Merchant Center application stack.

### merchant-center-services

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"]
}
```

Full Merchant Center application stack.

### test-data

**Recommended Configuration:**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/typescript-service"]
}
```

This composite includes: default, platforms/nodejs, platforms/pnpm, libraries/testing, libraries/typescript, libraries/babel, libraries/linting, libraries/test-generators.

**Note:** This preset is ideal for TypeScript-based services and utilities without UI dependencies.

## Customizing Bundle Presets

If a bundle preset includes more than you need, you can:

### Option 1: Use Individual Presets

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>commercetools/renovate-config",
    "github>commercetools/renovate-config:platforms/nodejs",
    "github>commercetools/renovate-config:libraries/react",
    "github>commercetools/renovate-config:libraries/testing",
    "github>commercetools/renovate-config:libraries/typescript"
  ]
}
```

### Option 2: Extend Bundle and Override

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>commercetools/renovate-config:composite/merchant-center-application"],
  "ignoreDeps": ["specific-package-to-ignore"],
  "packageRules": [
    {
      "matchPackageNames": ["package-with-custom-rule"],
      "enabled": false
    }
  ]
}
```

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
