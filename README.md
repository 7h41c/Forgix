<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=200&section=header&text=Forgix%20🚀&fontSize=80&animation=fadeIn&fontAlignY=35" width="100%" alt="Forgix Animated Banner" />
  <br />
  <p><b>Instant project scaffolding — from template to ready-to-code in seconds.</b></p>

  <img src="https://img.shields.io/npm/v/@7h41c/forgix.svg?style=flat-square&color=cb3837" alt="NPM Version" />
  <img src="https://img.shields.io/badge/Node.js-22+-green.svg?style=flat-square" alt="Node Support" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</div>

---

## ⚡ What is Forgix?

Forgix is a **CLI tool** that creates new projects from templates — automatically.

**Instead of this:**
```bash
git clone https://github.com/facebook/react.git my-app
cd my-app
rm -rf .git
# Edit package.json with your name
# Edit index.html with your name
# Run npm install
# Run git init
# Open in VS Code
```

**You do this:**
```bash
forgix create my-app
```

Forgix handles everything: cloning, cleaning, injecting your info, installing deps, init git, and opening your editor.

---

## 🏗️ What It Actually Does

When you run `forgix create my-app`, here's what happens:

| Step | What Forgix Does |
|------|------------------|
| 1 | Fetches the template (built-in, GitHub, or your custom link) |
| 2 | Copies files to your new project folder |
| 3 | Replaces `{{author}}`, `{{license}}`, `{{projectName}}` with your info |
| 4 | Injects any plugins or customizations (Docker, ESLint, etc.) |
| 5 | Runs `npm install` (or yarn/pnpm) to install dependencies |
| 6 | Runs `git init` with an initial commit |
| 7 | Opens the project in VS Code |

All in one command.

---

## 📦 Templates Included

### Frontend
- `react-vite` — React + Vite
- `react-vite-ts` — React + Vite + TypeScript
- `vue-app` — Vue.js 3
- `nextjs` — Next.js 14
- `svelte` — Svelte 4

### Backend
- `node-api` — Node.js Express API
- `express-ts` — Express + TypeScript
- `python-script` — Python script
- `fastapi` — Python FastAPI

### Remote
- Any public GitHub repo with `--template github:user/repo`

---

## 🧩 CLI Flags & Options

```bash
forgix create my-app [options]
```

| Flag | Description |
|------|-------------|
| `-t, --template <name>` | Choose a template |
| `--pm <npm|yarn|pnpm>` | Package manager to use |
| `--ts` | Use TypeScript |
| `--js` | Use JavaScript (default) |
| `--css <tailwind|sass>` | Add CSS framework |
| `--docker` | Add Docker support |
| `--eslint` | Add ESLint configuration |
| `--prettier` | Add Prettier configuration |
| `--test` | Add Jest testing setup |
| `--ci` | Add GitHub Actions CI workflow |
| `--git` | Initialize git repository |
| `--open` | Open in VS Code |
| `--skip-install` | Skip dependency installation |

### Examples

```bash
# Interactive mode
forgix create

# One-liner with all options
forgix create my-app --template react-vite --pm pnpm --ts --eslint --prettier --docker --ci --git --open
```

---

## 🛠️ CLI Commands

| Command | What It Does |
|---------|-------------|
| `forgix create` | Create a new project from a template |
| `forgix config` | Set your name and license (saved globally) |
| `forgix doctor` | Check if Node, Git, NPM, and VS Code are installed |
| `forgix list` | Show all available templates and plugins |
| `forgix add <plugin>` | Add a plugin to your current project |
| `forgix link <name>` | Link a local folder as a custom template |

---

## 🚀 Quick Start

### Install
```bash
npm install -g @7h41c/forgix
```

### Create a Project
```bash
# Interactive mode (prompts for everything)
forgix create

# One-liner (skip prompts)
forgix create my-app --template react-vite --git --open
```

### Configure Your Identity (do once)
```bash
forgix config
```
This saves your name and license — Forgix uses them automatically for every new project.

---

## 🧩 Variable Injection

Templates can use placeholders that Forgix replaces:

```html
<!-- In your template files -->
<h1>Welcome to {{projectName}}</h1>
<!-- Becomes: <h1>Welcome to my-app</h1> -->
```

| Placeholder | Replaced With |
|-------------|----------------|
| `{{projectName}}` | Your project folder name |
| `{{author}}` | Your name (from `forgix config`) |
| `{{license}}` | Your license (from `forgix config`) |

---

## 🗺️ Roadmap

- [x] v1.0.8 — CLI flags, package managers, new templates, customizations
- [x] v1.0.7 — Global config profile
- [x] v1.0.6 — Plugin selection
- [x] v1.0.5 — Custom template linking
- [ ] v1.0.9 — Deep Lens (analyze existing projects)
- [ ] v1.1.0 — Forgix Cloud (sync templates)

---

## 🔒 Security

- **Remote templates:** When using `github:` templates, always verify the source is trusted
- **Check package.json:** Look for suspicious `preinstall` or `postinstall` scripts before running `npm install`
- Forgix removes `.git` from cloned repos to prevent accidental pushes to attacker-controlled remotes

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add something"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ by T7h41</p>
</div>