# Forgix

**Vite project scaffolder for React, Vue, Node.js APIs, and Python scripts.**

Scaffold a project in seconds. Forgix injects your author name and license into template files, initialises git, and opens VS Code — all from one command.

---

## Templates

| Template | Stack |
|----------|-------|
| `react-vite` | React 18 + Vite + TypeScript |
| `vue-app` | Vue 3 + Vite |
| `node-api` | Node.js + Express |
| `python-script` | Python (plain script, no framework) |

Use `forgix list` to see all available templates and plugins.

---

## Installation

```bash
npm install -g @7h41c/forgix
```

Or run without installing:

```bash
npx @7h41c/forgix create
```

Requires **Node.js 18+**.

---

## Quick start

**Interactive — answer the prompts:**

```bash
forgix create
```

**Non-interactive — all flags on the command line:**

```bash
forgix create my-app --template react-vite --git --open
```

---

## CLI reference

| Command | Description |
|---------|-------------|
| `forgix create [name]` | Scaffold a new project |
| `forgix config` | Set your default author name, license, and editor |
| `forgix doctor` | Run diagnostics and fix common issues |
| `forgix list` | Show available templates and plugins |
| `forgix add <plugin>` | Inject a plugin into an existing project (e.g. `docker`) |
| `forgix link <name>` | Register a local folder as a custom template |

### `create` options

| Flag | Description |
|------|-------------|
| `-t, --template <name>` | Template to use (see Templates above) |
| `--skip-install` | Skip `npm install` / `pip install` after scaffolding |
| `--git` | Initialise a git repository |
| `--open` | Open the project in VS Code |

### `forgix config`

On first run, set your defaults:

```
forgix config
```

This stores your author name, preferred license, and editor globally — they're injected into every new project.

---

## Variable injection

Templates use placeholder tokens that Forgix replaces at scaffold time:

| Variable | Description |
|----------|-------------|
| `{{projectName}}` | Project folder name |
| `{{author}}` | Your name (from `forgix config`) |
| `{{license}}` | Selected license (MIT, ISC, Apache-2.0) |

---

## Security

Forgix clones templates from two sources:

- **Built-in templates** — bundled with the package, reviewed before release.
- **Remote GitHub repos** — when you supply a GitHub URL, Forgix clones the repo. It validates paths to prevent traversal attacks and removes `.git` directories after cloning.

> **Remote templates:** Always inspect `package.json` scripts (`preinstall`, `postinstall`, etc.) before running `npm install`. Do not clone repos from untrusted sources.

---

## Changelog

- **v1.0.8** — Security hardening: path traversal guards, sensitive directory blocking, config file permissions set to `0600`.
- **v1.0.7** — Global config profile and doctor fixes.
- **v1.0.6** — Interactive plugin selection.
- **v1.0.5** — Custom template linking via `forgix link`.
- **v1.0.4** — Categorised template menus.
- **v1.0.3** — System diagnostics and variable injection.

---

<div align="center">
  <p>Built by T7h41 · MIT License</p>
</div>
