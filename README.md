<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12&height=200&section=header&text=Forgix%20🚀&fontSize=80&animation=fadeIn&fontAlignY=35" width="100%" alt="Forgix Animated Banner" />
  <br />
  <p><b>An elite, blazing-fast project scaffolding CLI designed to eliminate project setup fatigue.</b></p>
  <img src="https://img.shields.io/npm/v/@7h41c/forgix.svg?style=flat-square" alt="NPM Version" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green.svg?style=flat-square" alt="Node" />
</div>

---

## 🧠 Why it exists
Starting a new project shouldn't mean spending 20 minutes copying boilerplate, manually changing variables, and resetting git histories. **Forgix** automates the entire repetitive process so you can go straight from a great idea to writing actual code. 

## ✨ Elite Features
* **👨‍⚕️ Forgix Doctor:** Built-in system diagnostics to ensure your environment is healthy and ready to build.
* **👤 Personalization:** Interactive prompts for Author and License injection—making every project yours from the start.
* **📂 Smart Scaffolding:** Choose from Node, React, Python, or Vue templates with one click.
* **🚀 Elite Flow:** Use `--git` to initialize your repo and `--open` to launch VS Code automatically.

## 🚀 Installation & Usage

You can run Forgix instantly without installing it globally using `npx`:

\`\`\`bash
npx -p @7h41c/forgix forgix create
\`\`\`

Or, install it globally on your machine to use the `forgix` command anywhere:

\`\`\`bash
npm install -g @7h41c/forgix
\`\`\`

## 💻 Demo Commands

**1. Scaffold a local template interactively:**
\`\`\`bash
forgix create
\`\`\`

**2. Bypass prompts using flags (Speed Mode):**
\`\`\`bash
forgix create my-new-app --template node-api --skip-install
\`\`\`

**3. Clone a remote repository from GitHub directly:**
\`\`\`bash
forgix create remote-app --template github:fireship-io/react-firebase-chat
\`\`\`

**4. Inject a plugin into an existing project:**
\`\`\`bash
cd my-new-app
forgix add docker
\`\`\`

## 🗺️ Roadmap
- [x] Add \`--skip-install\` flag to skip dependency installation for faster remote clones.
- [x] Implement a plugin system (e.g., \`forgix add docker\` to inject Dockerfiles).
- [ ] Add official built-in React (Vite), Vue, and Python templates.
- [ ] Support custom variable injection via CLI flags.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to fork the repository and submit a pull request if you want to add new templates or features.
