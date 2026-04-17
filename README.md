<div align="center">
  <h1>🚀 Forgix</h1>
  <p><b>An elite, blazing-fast project scaffolding CLI designed to eliminate project setup fatigue.</b></p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-green.svg" alt="Node" />
</div>

---

## 🧠 Why it exists
Starting a new project shouldn't mean spending 20 minutes copying boilerplate, manually changing variables, and resetting git histories. **Forgix** automates the entire repetitive process so you can go straight from a great idea to writing actual code. 

## ✨ Elite Features
* **Interactive Prompts:** Clean, modern CLI interface for seamlessly selecting project types.
* **Intelligent Templating:** Automatically scans and injects your project name (and other custom variables) into configuration files.
* **Remote GitHub Cloning:** Pull down *any* public GitHub repository to use as a starting point, instantly stripping old commit history so you start fresh.
* **Auto-Install:** Automatically triggers your package manager to install dependencies so you are ready to code immediately.
* **Power-User Flags:** Bypass prompts entirely using single-line commands for instant, zero-friction scaffolding.

## 🚀 Installation

If you are developing Forgix locally, you can build and link it:
\`\`\`bash
git clone https://github.com/7h41c/Forgix.git
cd Forgix
npm install
npm run build
npm link
\`\`\`

## 💻 Demo Commands

**1. Scaffold a local template interactively:**
\`\`\`bash
forgix create
\`\`\`

**2. Bypass prompts using flags (Speed Mode):**
\`\`\`bash
forgix create my-new-app --template node-api
\`\`\`

**3. Clone a remote repository from GitHub directly:**
\`\`\`bash
forgix create remote-app --template github:fireship-io/react-firebase-chat
\`\`\`

## 🗺️ Roadmap
We are constantly upgrading Forgix to make it the ultimate developer tool:
- [ ] Add \`--no-install\` flag to skip dependency installation for faster remote clones.
- [ ] Implement a plugin system (e.g., \`forgix add docker\` to inject Dockerfiles).
- [ ] Add official built-in React (Vite), Vue, and Python templates.
- [ ] Support custom variable injection via CLI flags.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to fork the repository and submit a pull request if you want to add new templates or features.
