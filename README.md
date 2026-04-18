# Forgix

CLI project scaffolding tool with template versioning, post-scaffold hooks, governance checks, registry support, and composition. Generates production-ready project structures with lifecycle management.

```
npm install -g @7h41c/forgix
forgix create my-app --template react-vite --ts --ci --docker
```

## What It Does

Forgix copies a template into a new directory, injects variables, runs your package manager's install, executes post-scaffold hooks, and writes a `.scaffold-lock.yaml` tracking the template version. Optionally initializes git, CI, linting, testing, and Docker — in one command.

For CI/CD pipelines, it runs non-interactively when all required flags are provided.

## Install

```bash
npm install -g @7h41c/forgix
```

Requires: Node.js >= 22, Git (optional, for `--git` and remote templates).

Verify setup:
```bash
forgix doctor
```

## Commands

| Command | Description |
|---------|-------------|
| `forgix create` | Scaffold a new project |
| `forgix check` | Audit project for governance, security, best practices |
| `forgix registry` | Manage template registries (npm-based) |
| `forgix config` | Set global defaults |
| `forgix doctor` | Check Node, Git, npm, VS Code availability |
| `forgix list` | List templates, plugins, linked templates |
| `forgix add <plugin>` | Inject a plugin into existing project |
| `forgix link <name> [path]` | Register a local folder as named template |

## Usage

```
forgix create [name] [options]
```

If `name` or `--template` is omitted, Forgix prompts interactively.

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `-t, --template <name>` | (prompt) | Template to scaffold from |
| `--pm <npm\|yarn\|pnpm>` | `npm` | Package manager for install |
| `--ts` | off | Use TypeScript |
| `--css <tailwind\|sass>` | off | CSS framework |
| `--docker` | off | Generate Dockerfile + docker-compose.yml |
| `--eslint` | off | Add ESLint configuration |
| `--prettier` | off | Add Prettier configuration |
| `--test` | off | Add Jest test setup |
| `--ci` | off | Add GitHub Actions workflow |
| `--git` | off | `git init` + initial commit |
| `--open` | off | Open in VS Code |
| `--skip-install` | off | Skip `npm install` |
| `--dry-run` | off | Preview files without creating anything |
| `--layers <names...>` | off | Apply composition layers |
| `-n, --non-interactive` | off | Skip prompts, use defaults |
| `--trust-remote` | off | Auto-accept remote template clones |
| `-a, --author <name>` | Developer | Author name |
| `-l, --license <type>` | MIT | License type |
| `-p, --plugins <names...>` | [] | Plugins to inject |

### Examples

```bash
# Interactive
forgix create

# Non-interactive, full stack
forgix create my-app -t react-vite-ts --pm pnpm --ts --eslint --prettier --test --ci --docker --git

# Preview what would be created
forgix create my-app -t react-vite --dry-run

# From a GitHub repo
forgix create my-app -t github:user/repo --trust-remote

# With composition layers
forgix create my-app -t my-base --layers auth database testing
```

## Templates

| Template | Stack |
|----------|-------|
| `react-vite` | React 18 + Vite |
| `react-vite-ts` | React 18 + Vite + TypeScript |
| `shadcn-next` | React + Next.js 14 + shadcn/ui + Tailwind |
| `vue-app` | Vue 3 + Vite |
| `nextjs` | Next.js 14 (App Router) |
| `svelte` | Svelte 4 + Vite |
| `node-api` | Node.js + Express |
| `express-ts` | Express + TypeScript |
| `python-script` | Python script |
| `fastapi` | FastAPI + Uvicorn |
| `github:<owner/repo>` | Any public GitHub repository |

## Plugins

```bash
cd my-app
forgix add docker
```

| Plugin | Adds |
|--------|------|
| `docker` | Dockerfile + docker-compose.yml |
| `tailwind` | Tailwind CSS config |
| `eslint` | ESLint config |
| `prettier` | Prettier config |
| `jest` | Jest test setup |

## Post-Scaffold Hooks

Templates can include a `hooks.yaml` that runs scripts after scaffolding.

```yaml
# hooks.yaml (in template root)
post_scaffold:
  - id: init-git
    name: Initialize Git
    run: "git init && git add . && git commit -m 'initial'"
    on_error: warn
    condition: "not_exists(.git)"

  - id: setup-ci
    name: Configure CI
    run: "cp .ci/github-actions.yml .github/workflows/ci.yml"

  - id: notify
    name: Notify Slack
    run: "curl -X POST $SLACK_WEBHOOK -d '{\"text\": \"Project created\"}'"
    on_error: ignore
    async: true
```

### Hook Options

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `name` | Display name |
| `run` | Shell command (supports `{projectName}`, `{author}`, `{license}` vars) |
| `cwd` | Working directory (relative to project root) |
| `on_error` | `fail` (default), `warn`, `ignore` |
| `timeout` | e.g. `30s`, `5m` |
| `retry` | Number of retries on failure |
| `condition` | `exists(file)` or `not_exists(file)` |
| `async` | Run in background without blocking |

## Template Versioning

Every scaffolded project gets a `.scaffold-lock.yaml` tracking its template origin:

```yaml
template:
  name: react-vite-ts
  version: "1.0.0"
  source: local
scaffolded_at: "2026-04-18T16:00:00Z"
engine_version: "1.1.0"
files_generated:
  - src/index.ts
  - package.json
variables:
  projectName: my-app
  author: Developer
  license: MIT
hooks_ran:
  - init-git
patches_applied: []
```

Templates can include a `template.yaml` manifest:

```yaml
# template.yaml
name: react-vite-ts
version: "2.1.0"
description: "React + TypeScript + Vite"
author: "Team"
license: MIT
min_engine_version: "1.1.0"
hooks: true
```

## Dry Run Mode

Preview what files would be created without writing anything:

```bash
forgix create my-app -t react-vite --dry-run
```

Output (human):
```
  Preview — files that would be created/modified:

  src/
  + src/index.ts 1.2KB
  + src/App.tsx 0.8KB
  + package.json 0.5KB

  Summary:
    + 15 files to create
    3 directories
    Total: 12.4KB
```

Output (JSON, with `-n`):
```json
{
  "total_files": 15,
  "total_size": 12697,
  "directories": 3,
  "files": [{ "action": "create", "path": "src/index.ts", "size": 1234 }]
}
```

## Governance Check

Audit any project against best practices:

```bash
forgix check [dir]
forgix check . --deps --json
```

Checks:
- Scaffold lock file present
- Git initialized
- License file exists
- README present
- .gitignore configured
- Package metadata complete
- Dependency lock file
- No dangerous install scripts
- Test script configured
- node_modules excluded
- .env files not exposed
- Dockerfile non-root user
- CI/CD configured
- No hardcoded secrets

Scoring: 0-100% based on pass/warn/fail. Exits non-zero if score < 50%.

`--deps` flag adds dependency analysis: deprecated packages, npm audit vulnerabilities, missing lock files.

## Registry

Publish and fetch templates from npm:

```bash
# Search for templates
forgix registry search react

# List configured registries
forgix registry list

# Add a private registry
forgix registry add company --url https://npm.internal.company.com

# Publish a template
forgix registry publish ./my-template @company/react-service

# Install from registry (during create)
forgix create my-app -t @company/react-service
```

Templates published to npm should include `template.yaml` and use the `forgix-template` keyword.

## Template Composition

Templates can declare layers in `composition.yaml`:

```yaml
base: base/
layers:
  - name: auth
    path: layers/auth/
    description: "JWT authentication"
    conflicts: overwrite
  - name: database
    path: layers/database/
    description: "PostgreSQL + Prisma"
    conflicts: skip
  - name: testing
    path: layers/testing/
    description: "Jest + Testing Library"
```

Usage:
```bash
forgix create my-app -t my-base --layers auth testing
```

## Configuration

Set persistent defaults via `forgix config`:

```bash
forgix config
```

Config file: `~/.forgix-config.json` (permissions: `0600`)

Options: default template, package manager, author name, license, and auto-apply flags (`--git`, `--open`, `--eslint`, etc.).

### Custom Templates

Link a local directory as a named template:

```bash
forgix link my-org-template ./path/to/template
forgix create my-app -t my-org-template
```

Links stored in: `~/.forgix-links.json`

## Template Variables

Files in templates can contain these placeholders, replaced at scaffold time:

| Placeholder | Value |
|-------------|-------|
| `{{projectName}}` | Project directory name |
| `{{author}}` | From CLI prompt or `forgix config` |
| `{{license}}` | From CLI prompt or `forgix config` |

Binary files (images, archives, etc.) are skipped automatically.

## Security Model

| Concern | Mitigation |
|---------|------------|
| Remote template trust | Confirmation prompt; `--trust-remote` for CI |
| `.git` from cloned repos | Removed automatically after clone |
| `postinstall` scripts | Warning shown; `forgix check` detects |
| Config file exposure | Written with `0600` permissions (owner-only) |
| Path traversal | Resolved paths validated; `..` blocked |
| Sensitive directories | `.ssh`, `.aws`, etc. blocked from linking |
| Install scripts | `forgix check` flags preinstall/postinstall |
| Hardcoded secrets | `forgix check` scans for patterns |

## Agent Mode (Non-Interactive)

All commands support non-interactive mode for CI pipelines, scripts, and AI agents.

Set `FORGIX_NON_INTERACTIVE=1` or pass `-n`/`--non-interactive`.

| Command | Flags | Description |
|---------|-------|-------------|
| `forgix config --show` | | Display current config |
| `forgix config --json` | | Output config as JSON |
| `forgix config --set key=value` | | Set values non-interactively |
| `forgix list --json` | | List templates/plugins as JSON |
| `forgix doctor --fix` | | Auto-fix issues without prompting |
| `forgix doctor -n` | | Report only, no prompts |
| `forgix check --json` | | Audit results as JSON |
| `forgix check . --deps --json` | | Full audit with dependency analysis |
| `forgix registry search <query>` | | Search npm for templates |

`forgix create --non-interactive` outputs a JSON summary on success.

Full reference: see [AGENT.md](./AGENT.md).

## Architecture

```
src/
  cli/index.ts          Entry point, command registration
  commands/
    create.ts           Interactive create flow (prompts + flags)
    add.ts              Plugin injection
    config.ts           Profile configuration
    check.ts            Governance audit command
    doctor.ts           System health checks
    registry.ts         Registry management
    list.ts             Template/plugin listing
    link.ts             Custom template registration
  core/
    create.ts           Template copy, variable injection, hooks, lock file
    hooks.ts            Post-scaffold hook execution engine
    versioning.ts       Template manifest + .scaffold-lock.yaml
    dry-run.ts          Preview mode file scanner
    composition.ts      Template layer system
    registry.ts         npm publish/install for templates
    check.ts            Governance checks (security, best practices)
    deps-intel.ts       Dependency analysis (deprecated, vulnerable)
    install.ts          Package manager abstraction
    template-engine.ts  Recursive {{variable}} replacement
    config.ts           Read/write ~/.forgix-config.json
templates/              Built-in project templates
plugins/                Injectable feature modules
```

## License

MIT
