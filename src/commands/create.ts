import { Command } from "commander";
import { input, select, checkbox, Separator } from "@inquirer/prompts";
import { runCreate } from "../core/create.js";
import { getConfig } from "../core/config.js";
import { PackageManager } from "../core/install.js";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createCommand = new Command("create")
  .description("Scaffold a new project")
  .argument("[name]", "Name of your project")
  .option("-t, --template <type>", "Template to use (react-vite, vue-app, node-api, python-script, nextjs, express, svelte)")
  .option("--skip-install", "Skip dependency installation")
  .option("--git", "Initialize a git repository")
  .option("--open", "Open the project in VS Code")
  .option("--pm, --package-manager <pm>", "Package manager to use (npm, yarn, pnpm)", "npm")
  .option("--ts, --typescript", "Use TypeScript")
  .option("--js, --javascript", "Use JavaScript (default)")
  .option("--css <framework>", "CSS framework (tailwind, sass)")
  .option("--docker", "Add Docker support (Dockerfile + docker-compose)")
  .option("--eslint", "Add ESLint configuration")
  .option("--prettier", "Add Prettier configuration")
  .option("--test", "Add testing setup (Jest)")
  .option("--ci", "Add GitHub Actions CI workflow")
  .action(async (nameArg, options) => {
    try {
      const config = await getConfig();

      let projectName = nameArg || await input({ message: "Project name:", default: "my-app" });

      // Validate package manager
      const validPM: PackageManager[] = ["npm", "yarn", "pnpm"];
      const packageManager = validPM.includes(options.packageManager as PackageManager) 
        ? options.packageManager as PackageManager 
        : "npm";

      let template = options.template || await select({
        message: "Select a Template:",
        choices: [
          new Separator(chalk.yellow("--- Frontend ---")),
          { name: "React (Vite)", value: "react-vite" },
          { name: "React + TypeScript (Vite)", value: "react-vite-ts" },
          { name: "Vue.js 3", value: "vue-app" },
          { name: "Next.js", value: "nextjs" },
          { name: "Svelte", value: "svelte" },
          new Separator(chalk.blue("--- Backend ---")),
          { name: "Node.js Express API", value: "node-api" },
          { name: "Express + TypeScript", value: "express-ts" },
          { name: "Python Script", value: "python-script" },
          { name: "Python FastAPI", value: "fastapi" },
          new Separator(chalk.magenta("--- Remote ---")),
          { name: "GitHub Repository", value: "github-prompt" }
        ],
      });

      const author = await input({ message: "Author Name:", default: config.defaultAuthor });
      const license = await select({
        message: "Select License:",
        choices: [
          { name: "MIT", value: "MIT" },
          { name: "ISC", value: "ISC" },
          { name: "Apache-2.0", value: "Apache-2.0" },
          { name: "GPL-3.0", value: "GPL-3.0" }
        ],
        default: config.defaultLicense
      });

      // Plugins
      const pluginsPath = path.join(__dirname, "../../plugins");
      let availablePlugins: string[] = [];
      if (fs.existsSync(pluginsPath)) availablePlugins = fs.readdirSync(pluginsPath);

      const selectedPlugins = await checkbox({
        message: "Select Plugins to inject:",
        choices: availablePlugins.map(p => ({ name: p, value: p }))
      });

      await runCreate({
        name: projectName,
        template,
        skipInstall: options.skipInstall,
        git: options.git || config.autoGit,
        open: options.open,
        variables: { author, license },
        plugins: selectedPlugins,
        packageManager,
        typescript: options.typescript,
        css: options.css,
        docker: options.docker,
        eslint: options.eslint,
        prettier: options.prettier,
        test: options.test,
        ci: options.ci
      });

    } catch (error) {
      console.log("\nExiting Forgix...");
      process.exit(1);
    }
  });