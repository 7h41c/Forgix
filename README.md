# Forgix

CLI project scaffolding tool. Generates ready-to-develop project structures from templates with configurable defaults, dependency installation, and tooling setup.

```
npm install -g @7h41c/forgix
forgix create my-app --template react-vite --ts --ci --docker
```

## What It Does

Forgix copies a template into a new directory, injects variables (`projectName`, `author`, `license`), runs your package manager's install, and optionally initializes git, CI, linting, testing, and Docker — in one command.

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

### Examples

```bash
# Interactive (prompts for everything)
forgix create

# Full-stack project, non-interactive
forgix create my-app -t react-vite-ts --pm pnpm --ts --eslint --prettier --test --ci --docker --git

# Scaffold from a GitHub repo
forgix create my-app -t github:user/repo
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

Inject features into an existing project:

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

## Other Commands

| Command | Description |
|---------|-------------|
| `forgix doctor` | Check Node, Git, npm, VS Code availability |
| `forgix list` | List installed templates, plugins, and linked templates |
| `forgix link <name> [path]` | Register a local folder as a named template |

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
| Remote template trust | Explicit confirmation prompt before cloning GitHub repos |
| `.git` from cloned repos | Removed automatically after clone |
| `postinstall` scripts | Warning shown; user must inspect manually |
| Config file exposure | Written with `0600` permissions (owner-only) |
| Path traversal in custom links | Resolved paths validated; `..` and sensitive directories (`.ssh`, `.aws`, etc.) blocked |
| Symlink attacks | Templates and plugins checked for symlinks |

**For pipeline use:** Remote templates (`github:`) require user confirmation. For unattended CI, use local or linked templates only.

## CI/CD Integration

The `--ci` flag generates a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `npm install` and `npm test`.

For pipeline use, run non-interactively:

```bash
forgix create my-app -t react-vite --pm npm --ci --skip-install
```

## Architecture

```
src/
  cli/index.ts          Entry point, command registration
  commands/
    create.ts           Interactive create flow (prompts + flags)
    add.ts              Plugin injection
    config.ts           Profile configuration
    doctor.ts           System health checks
    list.ts             Template/plugin listing
    link.ts             Custom template registration
  core/
    create.ts           Template copy, variable injection, plugin install, git init
    install.ts          Package manager abstraction (npm/yarn/pnpm)
    template-engine.ts  Recursive {{variable}} replacement
    config.ts           Read/write ~/.forgix-config.json
templates/              Built-in project templates
plugins/                Injectable feature modules (docker, tailwind, etc.)
```

## License

MIT
