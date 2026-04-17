import { Command } from "commander";
import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";
import { confirm } from "@inquirer/prompts";

export const doctorCommand = new Command("doctor")
  .description("Check system health and auto-fix common issues")
  .action(async () => {
    console.log(chalk.cyan("\n👨‍⚕️ Forgix Diagnostic & Auto-Fix Report\n"));
    const spinner = ora("Analyzing your development environment...").start();

    const checkTool = async (name: string, cmd: string, args: string[]) => {
      try {
        const { stdout } = await execa(cmd, args, { shell: true });
        return { name, status: "pass", version: stdout.trim().split('\n')[0], cmd };
      } catch {
        return { name, status: "fail", version: "Not found", cmd };
      }
    };

    const results = await Promise.all([
      checkTool("Node.js", "node", ["-v"]),
      checkTool("Git", "git", ["--version"]),
      checkTool("NPM", "npm", ["-v"]),
      checkTool("VS Code", "code", ["--version"])
    ]);

    spinner.stop();

    for (const res of results) {
      const icon = res.status === "pass" ? chalk.green("✔") : chalk.red("✘");
      console.log(`${icon} ${res.name.padEnd(10)} : ${res.version}`);

      if (res.status === "fail") {
        console.log(chalk.gray(`   └─ Recommendation: Please install ${res.name} to unlock all Forgix features.`));
        
        // Auto-fix attempt for Git (Common in Linux/WSL)
        if (res.name === "Git") {
          const fix = await confirm({ message: "Would you like me to try installing Git for you?", default: true });
          if (fix) {
            const fixSpinner = ora("Installing Git...").start();
            try {
              // Use separate args array instead of shell: true to prevent injection
              await execa("sudo", ["apt-get", "update"]);
              await execa("sudo", ["apt-get", "install", "-y", "git"]);
              fixSpinner.succeed(chalk.green("Git installed successfully!"));
            } catch {
              fixSpinner.fail(chalk.red("Auto-fix failed. Please install Git manually: https://git-scm.com"));
            }
          }
        }
      }
    }

    const fails = results.filter(r => r.status === "fail");
    if (fails.length === 0) {
      console.log(chalk.green("\n✨ Your system is elite! No issues found.\n"));
    } else {
      console.log(chalk.yellow("\n⚠️  Environment partially configured. Check recommendations above.\n"));
    }
  });
