import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import os from "os";
import { replaceVariablesInDir } from "./template-engine.js";
import { installDependencies } from "./install.js";
import { execa } from "execa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCreate(options: { 
  name: string; 
  template: string; 
  skipInstall?: boolean;
  git?: boolean;
  open?: boolean;
  variables?: { author: string; license: string };
  plugins?: string[]; // NEW
}) {
  const { name, template, skipInstall, git, open, variables, plugins } = options;
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`\n❌ Error: Folder '${name}' already exists.\n`));
    process.exit(1);
  }

  const spinner = ora(`Fetching ${template} template...`).start();

  try {
    // 1. Fetch Template Path
    let templatePath = "";

    if (template.startsWith("github:")) {
      const repoPart = template.replace("github:", "");
      
      // Validate the repo format (must be user/repo or org/repo)
      const githubRegex = /^([a-zA-Z0-9][a-zA-Z0-9-_]*\/)?[a-zA-Z0-9][a-zA-Z0-9-_]*$/;
      if (!githubRegex.test(repoPart) || repoPart.includes("..") || repoPart.includes("/.")) {
        throw new Error("Invalid GitHub repository format.");
      }
      
      const repoUrl = `https://github.com/${repoPart}.git`;
      spinner.text = `Cloning remote template from GitHub...`;
      await execa("git", ["clone", "--depth", "1", "--shallow-since=2024-01-01", repoUrl, targetPath]);
      fs.rmSync(path.join(targetPath, ".git"), { recursive: true, force: true });
    } else {
      const CONFIG_PATH = path.join(os.homedir(), ".forgix-links.json");
      let customLinks: Record<string, string> = {};
      if (fs.existsSync(CONFIG_PATH)) customLinks = fs.readJsonSync(CONFIG_PATH);

      if (customLinks[template]) {
        templatePath = customLinks[template];
        
        // Validate the linked path is safe (prevent path traversal)
        const resolvedPath = path.resolve(templatePath);
        const normalizedPath = path.normalize(templatePath);
        if (normalizedPath.includes("..") || !path.isAbsolute(resolvedPath)) {
          throw new Error("Invalid template path in custom link.");
        }
      } else {
        templatePath = path.join(__dirname, "../../templates", template);
      }

      if (!fs.existsSync(templatePath)) throw new Error(`Template '${template}' not found.`);
      fs.copySync(templatePath, targetPath);
    }

    // 2. Inject Variables
    spinner.text = "Injecting project variables...";
    await replaceVariablesInDir(targetPath, { 
      projectName: name,
      author: variables?.author || "Developer",
      license: variables?.license || "MIT"
    });

    // --- NEW: INJECT PLUGINS ---
    if (plugins && plugins.length > 0) {
      for (const plugin of plugins) {
        spinner.text = `Injecting plugin: ${plugin}...`;
        const pluginPath = path.join(__dirname, "../../plugins", plugin);
        if (fs.existsSync(pluginPath)) {
          fs.copySync(pluginPath, targetPath, { overwrite: true });
        }
      }
    }

    // 3. Install Dependencies
    if (fs.existsSync(path.join(targetPath, "package.json")) && !skipInstall) {
      spinner.text = "Installing dependencies (this may take a minute)...";
      await installDependencies(targetPath);
    }

    // 4. Initialize Git
    if (git) {
      spinner.text = "Initializing Git repository...";
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa("git", ["commit", "-m", "Initial commit from Forgix 🚀"], { cwd: targetPath });
    }

    spinner.succeed(chalk.green("Project created successfully!"));

    // 5. Open Logic
    if (open) {
      const openCommands = [{ cmd: "code", args: ["."] }, { cmd: "code.cmd", args: ["."] }];
      for (const attempt of openCommands) {
        try {
          await execa(attempt.cmd, attempt.args, { cwd: targetPath, shell: true });
          console.log(chalk.magenta("📂 Project opened in VS Code."));
          break; 
        } catch { continue; }
      }
    }

    console.log(`\n🚀 ${chalk.cyan(name)} is ready!\n`);

  } catch (error: any) {
    spinner.fail(chalk.red("Failed to create project."));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
