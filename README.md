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

Forgix is not just a cloner; it's an intelligent **Project Architect**. Instead of manually copying files and editing configurations, Forgix automates the entire birth of a project—injecting your personal details, initializing your environment, and opening your workspace in seconds.

---

## ✨ Elite Features

* **🎨 Visual Identity:** Sleek ASCII art branding and categorized, easy-to-read terminal menus for a premium developer experience.
* **🩺 Forgix Doctor:** Built-in system diagnostics to ensure your Node, Git, and VS Code environments are healthy and ready to code.
* **👤 Personalization Engine:** Automatically injects your **Name** and **License** into `package.json`, `index.html`, and README files dynamically.
* **📂 Smart Scaffolding:** Choose from pre-configured templates (React, Vue, Node, Python) or clone any public GitHub repo instantly.
* **🚀 Elite Flow:** Use `--git` to initialize your repo and `--open` to launch VS Code automatically the moment creation finishes.

---

## 🚀 Installation

You can run Forgix instantly without installing it globally using `npx`:

```bash
npx @7h41c/forgix create

Or, install it globally to access the forgix command anywhere:

Bash
npm install -g @7h41c/forgix

🛠️ CLI CommandsCommandDescriptionforgix doctorRuns a system diagnostic check (Node, Git, VS Code).forgix listDisplays all locally available templates and plugins.forgix createStarts the interactive project scaffolding wizard.forgix add <plugin>Injects a plugin (like Docker) into an existing project.


💻 Usage Examples
1. The Interactive "Elite" Start
The standard way to start. It will prompt you for project names, authors, and templates.

Bash
forgix create
2. The "Speed Mode" (Bypass Prompts)
Perfect for power users who know exactly what they want.

Bash
forgix create my-app --template react-vite --git --open
3. The "Remote Clone"
Turn any GitHub repository into a fresh template. It clones the repo and wipes the old Git history for you.

Bash
forgix create remote-app --template github:user/repo
🧩 Variable Injection
Forgix automatically scans your template files and replaces the following placeholders:

{{projectName}}: Swapped with the name of your new folder.

{{author}}: Swapped with your name (provided during the prompt).

{{license}}: Swapped with your chosen license (MIT, ISC, Apache).

💡 Pro Tips
Keep it Clean: Use forgix doctor before a big coding session to ensure your tools are correctly configured.

Auto-Open: Use the --open flag to skip the "cd folder" step and jump straight into VS Code.

Skip Install: Use --skip-install if you want to scaffold the files without waiting for node_modules to download.

🗺️ Roadmap
[x] v1.0.4: ASCII Art branding & Categorized selection menus.

[x] v1.0.3: System Diagnostics (Doctor) & Variable Injection.

[ ] v1.0.5: Custom Template Linking (forgix link <path>).

[ ] v1.0.6: Interactive Plugin Selection during the creation process.

🤝 Contributing
Contributions make the open-source community an amazing place to learn and create.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

<div align="center">
<p>Built with ❤️ by T7h41 and the Forgix Community.</p>
</div>

