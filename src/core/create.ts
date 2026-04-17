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

// Added skipInstall to the expected options
export async function runCreate(options: { name: string; template: string; skipInstall?: boolean }) {
  const { name, template, skipInstall } = options;
  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`\n❌ Error: Folder '${name}' already exists.\n`));
    process.exit(1);
  }

  console.log(""); 
  const spinner = ora(`Fetching ${template} template...`).start();

  try {
    if (template.startsWith("github:")) {
      const repoPath = template.replace("github:", "");
      const repoUrl = `https://github.com/${repoPath}.git`;
      
      spinner.text = `Cloning remote template from ${repoUrl}...`;
      await execa("git", ["clone", "--depth", "1", repoUrl, targetPath]);
      fs.rmSync(path.join(targetPath, ".git"), { recursive: true, force: true });
    } else {
      const templatePath = path.join(__dirname, "../../templates", template);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Local template '${template}' not found.`);
      }
      fs.copySync(templatePath, targetPath);
    }

    spinner.text = "Injecting project variables...";
    await replaceVariablesInDir(targetPath, { projectName: name });

    // --- NEW: SKIP INSTALL LOGIC ---
    if (fs.existsSync(path.join(targetPath, "package.json"))) {
      if (skipInstall) {
        spinner.info(chalk.yellow("Skipping dependency installation."));
      } else {
        spinner.text = "Installing dependencies... (this might take a minute)";
        await installDependencies(targetPath);
      }
    }

    spinner.succeed(chalk.green("Project created successfully!"));
    console.log(`\n🚀 ${chalk.cyan(name)} is ready!\n`);
    
    // Remind the user to install manually if they skipped it!
    if (skipInstall) {
      console.log(chalk.yellow(`⚠️  You skipped installation. Don't forget to run:`));
      console.log(chalk.yellow(`   cd ${name} && npm install\n`));
    }

  } catch (error: any) {
    spinner.fail(chalk.red("Failed to create project."));
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
