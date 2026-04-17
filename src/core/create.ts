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
  variables?: { author: string; license: string }; // NEW
}) {
  const { name, template, skipInstall, git, open, variables } = options;
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`\n❌ Error: Folder '${name}' already exists.\n`));
    process.exit(1);
  }

  const spinner = ora(`Fetching ${template} template...`).start();

  try {
    // 1. Fetch Template
    if (template.startsWith("github:")) {
      const repoUrl = `https://github.com/${template.replace("github:", "")}.git`;
      await execa("git", ["clone", "--depth", "1", repoUrl, targetPath]);
      fs.rmSync(path.join(targetPath, ".git"), { recursive: true, force: true });
    } else {
      const templatePath = path.join(__dirname, "../../templates", template);
      if (!fs.existsSync(templatePath)) throw new Error(`Template '${template}' not found.`);
      fs.copySync(templatePath, targetPath);
    }

    // 2. Inject Variables (Using the new author/license)
    spinner.text = "Injecting project variables...";
    await replaceVariablesInDir(targetPath, { 
      projectName: name,
      author: variables?.author || "Developer",
      license: variables?.license || "MIT"
    });

    // 3. Install
    if (fs.existsSync(path.join(targetPath, "package.json")) && !skipInstall) {
      spinner.text = "Installing dependencies...";
      await installDependencies(targetPath);
    }

    // 4. Git Init
    if (git) {
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa("git", ["commit", "-m", "Initial commit from Forgix 🚀"], { cwd: targetPath });
    }

    spinner.succeed(chalk.green("Project created successfully!"));

    // 5. Open Editor
    if (open) {
      try {
        await execa("code", ["."], { cwd: targetPath, shell: true });
      } catch {
        await execa("code.cmd", ["."], { cwd: targetPath, shell: true });
      }
    }

    console.log(`\n🚀 ${chalk.cyan(name)} is ready!\n`);
  } catch (error: any) {
    spinner.fail(chalk.red("Failed to create project."));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
