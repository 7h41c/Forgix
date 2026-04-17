import { Command } from "commander";
import chalk from "chalk";
import { execa } from "execa";
import ora from "ora";

export const doctorCommand = new Command("doctor")
  .description("Check if your system is ready for elite development")
  .action(async () => {
    console.log(chalk.cyan("\n👨‍⚕️ Forgix Diagnostic Report\n"));
    const spinner = ora("Checking dependencies...").start();

    const check = async (name: string, cmd: string, args: string[]) => {
      try {
        const { stdout } = await execa(cmd, args, { shell: true });
        return { name, status: "pass", version: stdout.trim().split('\n')[0] };
      } catch {
        return { name, status: "fail", version: "Not found" };
      }
    };

    const results = await Promise.all([
      check("Node.js", "node", ["-v"]),
      check("Git", "git", ["--version"]),
      check("VS Code", "code", ["--version"]),
      check("NPM", "npm", ["-v"])
    ]);

    spinner.stop();

    results.forEach(res => {
      const icon = res.status === "pass" ? chalk.green("✔") : chalk.red("✘");
      const label = res.name.padEnd(10);
      console.log(`${icon} ${label} : ${res.version}`);
    });

    const fails = results.filter(r => r.status === "fail");
    if (fails.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Warning: Some tools are missing. Forgix might have limited features.`));
    } else {
      console.log(chalk.green(`\n✨ Your system is elite! You are ready to build.`));
    }
    console.log("");
  });
