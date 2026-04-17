import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import os from "os";
import { confirm } from "@inquirer/prompts"; // Added for Security Warning
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
  plugins?: string[];
}) {
  const { name, template, skipInstall, git, open, variables, plugins } = options;
  const targetPath = path.join(process.cwd(), name);

  // 0. Initial Validation
  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`\n❌ Error: Folder '${name}' already exists.\n`));
    process.exit(1);
  }

  try {
    // 1. Fetch Template Path
    let templatePath = "";

    if (template.startsWith("github:")) {
      const repoPart = template.replace("github:", "");

      // SECURITY: Validate repo format before any network call
      const githubRegex = /^([a-zA-Z0-9][a-zA-Z0-9-_]*\/)?[a-zA-Z0-9][a-zA-Z0-9-_]*$/;
      if (!githubRegex.test(repoPart) || repoPart.includes("..") || repoPart.includes("/.")) {
        throw new Error("Invalid GitHub repository format — path traversal or illegal characters detected.");
      }

      const repoUrl = `https://github.com/${repoPart}.git`;

      // --- SECURITY AUDIT FIX: REMOTE WARNING ---
      console.log(chalk.red.bold("\n⚠️  SECURITY WARNING"));
      console.log(chalk.yellow("You are cloning a remote repository. Always inspect the code"));
      console.log(chalk.yellow("for malicious 'postinstall' scripts before running installation commands.\n"));

      const proceed = await confirm({ message: "Do you trust this source and want to proceed?", default: true });
      if (!proceed) {
        console.log(chalk.gray("Aborting for safety."));
        process.exit(1);
      }

      const spinner = ora(`Cloning remote template from GitHub...`).start();
      await execa("git", ["clone", "--depth", "1", repoUrl, targetPath]);

      // SECURITY: Verify .git was removed — fail if it persists
      const gitDir = path.join(targetPath, ".git");
      if (fs.existsSync(gitDir)) {
        try {
          fs.rmSync(gitDir, { recursive: true, force: true });
        } catch {
          throw new Error("Failed to remove .git directory — clone may be compromised.");
        }
        if (fs.existsSync(gitDir)) {
          throw new Error("Security error: .git directory still present after removal.");
        }
      }
      spinner.succeed(chalk.green("Remote template cloned."));
    } else {
      const spinner = ora(`Fetching ${template} template...`).start();
      
      // Check for Custom Linked Templates first
      const CONFIG_PATH = path.join(os.homedir(), ".forgix-links.json");
      let customLinks: Record<string, string> = {};
      
      if (fs.existsSync(CONFIG_PATH)) {
        customLinks = fs.readJsonSync(CONFIG_PATH);
      }

      if (customLinks[template]) {
        templatePath = customLinks[template];

        // SECURITY: Validate resolved path
        const resolvedPath = path.resolve(templatePath);
        const normalizedPath = path.normalize(templatePath);
        if (normalizedPath.includes("..") || !path.isAbsolute(resolvedPath)) {
          throw new Error("Invalid template path — path traversal detected.");
        }

        // SECURITY: Must be a directory
        const stat = fs.statSync(resolvedPath);
        if (!stat.isDirectory()) {
          throw new Error("Template path must be a directory.");
        }

        // SECURITY: Block sensitive system directories
        const sensitiveDirs = [".ssh", ".gnupg", ".aws", ".npm", ".cache"];
        if (sensitiveDirs.some(dir => resolvedPath.includes(dir))) {
          throw new Error(`Cannot use system directory '${resolvedPath}' as a template — denied.`);
        }
      } else {
        templatePath = path.join(__dirname, "../../templates", template);
      }

      if (!fs.existsSync(templatePath)) {
        spinner.fail();
        throw new Error(`Template '${template}' not found in local templates or links.`);
      }
      
      fs.copySync(templatePath, targetPath);
      spinner.succeed(chalk.green(`Template '${template}' loaded.`));
    }

    const spinner = ora("Configuring project...").start();

    // 2. Inject Variables
    spinner.text = "Injecting project variables...";
    await replaceVariablesInDir(targetPath, { 
      projectName: name,
      author: variables?.author || "Developer",
      license: variables?.license || "MIT"
    });

    // 3. Inject Plugins
    if (plugins && plugins.length > 0) {
      for (const plugin of plugins) {
        spinner.text = `Injecting plugin: ${plugin}...`;
        const pluginPath = path.join(__dirname, "../../plugins", plugin);
        if (fs.existsSync(pluginPath)) {
          fs.copySync(pluginPath, targetPath, { overwrite: true });
        }
      }
    }

    // 4. Install Dependencies
    if (fs.existsSync(path.join(targetPath, "package.json")) && !skipInstall) {
      spinner.text = "Installing dependencies (this may take a minute)...";
      await installDependencies(targetPath);
    }

    // 5. Initialize Git
    if (git) {
      spinner.text = "Initializing Git repository...";
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa("git", ["commit", "-m", "Initial commit from Forgix 🚀"], { cwd: targetPath });
    }

    spinner.succeed(chalk.green("Project created successfully!"));

    // 6. Robust Open Logic
    if (open) {
      const openCommands = [
        { cmd: "code", args: ["."] },
        { cmd: "code.cmd", args: ["."] },
        { cmd: "powershell.exe", args: ["-Command", "code ."] }
      ];

      for (const attempt of openCommands) {
        try {
          await execa(attempt.cmd, attempt.args, { cwd: targetPath, shell: true });
          console.log(chalk.magenta("📂 Project opened in VS Code."));
          break; 
        } catch {
          continue; 
        }
      }
    }

    console.log(`\n🚀 ${chalk.cyan(name)} is ready!\n`);

  } catch (error: any) {
    console.log(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}
