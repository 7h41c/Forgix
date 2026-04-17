<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=200&section=header&text=Forgix%20🚀&fontSize=80&animation=fadeIn&fontAlignY=35" width="100%" alt="Forgix Animated Banner" />
  <br />
  <p><b>The elite, blazing-fast project scaffolding engine designed to eliminate boilerplate fatigue.</b></p>

  <img src="https://img.shields.io/npm/v/@7h41c/forgix.svg?style=flat-square&color=cb3837" alt="NPM Version" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green.svg?style=flat-square" alt="Node Support" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</div>

---

## ⚡ What is Forgix?

Forgix is not just a cloner — it's an intelligent **Project Architect**.

Instead of manually copying files and editing configurations, Forgix automates the entire project creation process:
- Injects your personal details
- Sets up your environment
- Opens your workspace instantly
- Remembers who you are with global config

---

## ✨ Elite Features

- 🆔 **Developer Profile**  
  Set your global identity once with `forgix config`. No more re-typing your name or license for every project.

- 🎨 **Visual Identity**  
  Sleek ASCII art branding and categorized, easy-to-read terminal menus.

- 🩺 **Smart Doctor**  
  Built-in diagnostics that don't just find problems—they help fix them.

- 👤 **Personalization Engine**  
  Automatically injects your **name** and **license** into:
  - `package.json`
  - `index.html`
  - `README.md`

- 📂 **Smart Scaffolding**  
  - Use pre-built templates (React, Vue, Node, Python)  
  - Or clone any public GitHub repository
  - Or link any custom folder on your drive

- 🧩 **Plugin Injection**  
  Select multiple plugins (Docker, Tailwind, etc.) during project creation.

- 🚀 **Elite Flow**  
  - `--git` → auto initialize repository  
  - `--open` → launch VS Code instantly  

---

## 🚀 Installation

### Run instantly (no install)
```bash
npx @7h41c/forgix create
```

### Install globally
```bash
npm install -g @7h41c/forgix
```

---

## 🛠️ CLI Commands

| Command | Description |
|--------|-------------|
| `forgix config` | Set your global developer name, license, and editor |
| `forgix doctor` | Run system diagnostics with auto-fix capabilities |
| `forgix list` | Show available templates, plugins, and custom links |
| `forgix create` | Start interactive scaffolding wizard |
| `forgix add <plugin>` | Inject a plugin (e.g. Docker) |
| `forgix link <name>` | Link any folder on your PC as a custom template |

---

## 💻 Usage Examples

### 1. Interactive Mode (Standard)
```bash
forgix create
```

### 2. Speed Mode (Skip Prompts)
```bash
forgix create my-app --template react-vite --git --open
```

### 3. Remote GitHub Template
```bash
forgix create remote-app --template github:user/repo
```

### 4. Configure Once, Create Forever
```bash
forgix config
forgix create my-app --git --open
```

---

## 🧩 Variable Injection

Forgix scans template files and replaces placeholders automatically:

| Variable | Description |
|----------|------------|
| `{{projectName}}` | Your project folder name |
| `{{author}}` | Your name |
| `{{license}}` | Selected license (MIT, ISC, Apache) |

---

## 💡 Pro Tips

- 🧼 **Keep it clean**  
  Run:
  ```bash
  forgix doctor
  ```

- ⚡ **Auto open project**
  ```bash
  --open
  ```

- ⏭️ **Skip dependency install**
  ```bash
  --skip-install
  ```

- 🆔 **Set your identity once**
  ```bash
  forgix config
  ```

---

## 🗺️ Roadmap

- [x] v1.0.7 — Global Config Profile & Smart Doctor Fixes
- [x] v1.0.6 — Interactive Plugin Selection
- [x] v1.0.5 — Custom template linking (`forgix link`)
- [x] v1.0.4 — ASCII branding & categorized menus
- [x] v1.0.3 — System diagnostics & variable injection
- [ ] v1.0.8 — Forgix Cloud - Sync templates across machines
- [ ] v1.0.9 — "Deep Lens" - Scan existing projects for missing plugins

---

## 🤝 Contributing

Contributions are welcome and help improve Forgix.

### Steps:

1. Fork the repository  
2. Create a branch  
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes  
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push to your branch  
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request  

---

<div align="center">
  <p>Built with ❤️ by T7h41 and the Forgix Community.</p>
</div>