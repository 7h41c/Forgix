import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
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
}) {
  const { name, template, skipInstall, git, open } = options;
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`\n❌ Error: Folder '${name}' already exists.\n`));
    process.exit(1);
  }

  const spinner = ora(`Fetching ${template} template...`).start();

  try {
    // 1. Fetch Template
    if (template.startsWith("github:")) {
      const repoPath = template.replace("github:", "");
      const repoUrl = `https://github.com/${repoPath}.git`;
      spinner.text = `Cloning remote template...`;
      await execa("git", ["clone", "--depth", "1", repoUrl, targetPath]);
      fs.rmSync(path.join(targetPath, ".git"), { recursive: true, force: true });
    } else {
      const templatePath = path.join(__dirname, "../../templates", template);
      if (!fs.existsSync(templatePath)) throw new Error(`Template '${template}' not found.`);
      fs.copySync(templatePath, targetPath);
    }

    // 2. Inject Variables
    spinner.text = "Injecting project variables...";
    await replaceVariablesInDir(targetPath, { projectName: name });

    // 3. Install Dependencies
    if (fs.existsSync(path.join(targetPath, "package.json"))) {
      if (skipInstall) {
        spinner.info(chalk.yellow("Skipping dependency installation."));
      } else {
        spinner.text = "Installing dependencies...";
        await installDependencies(targetPath);
      }
    }

    // 4. Initialize Git
    if (git) {
      spinner.text = "Initializing Git repository...";
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa("git", ["commit", "-m", "Initial commit from Forgix 🚀"], { cwd: targetPath });
      spinner.info(chalk.blue("Git repository initialized."));
    }

    spinner.succeed(chalk.green("Project created successfully!"));

    // 5. Robust Open Logic
    if (open) {
      const openCommands = [
        { cmd: "code", args: ["."] },
        { cmd: "code.cmd", args: ["."] },
        { cmd: "powershell.exe", args: ["-Command", "code ."] }
      ];

      let opened = false;
      for (const attempt of openCommands) {
        try {
          await execa(attempt.cmd, attempt.args, { cwd: targetPath, shell: true });
          opened = true;
          break; 
        } catch {
          continue; 
        }
      }

      if (opened) {
        console.log(chalk.magenta("📂 Project opened in VS Code."));
      } else {
        try {
          await execa("explorer.exe", ["."], { cwd: targetPath });
          console.log(chalk.yellow("⚠️  Opened in Explorer (couldn't find 'code' command)."));
        } catch {
          console.log(chalk.gray("💡 Note: Navigate to the folder to start coding!"));
        }
      }
    }

    console.log(`\n🚀 ${chalk.cyan(name)} is ready!\n`);

  } catch (error: any) {
    spinner.fail(chalk.red("Failed to create project."));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
