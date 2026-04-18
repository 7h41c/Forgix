import { Command } from "commander";
import chalk from "chalk";
import { createCommand } from "../commands/create.js";
import { addCommand } from "../commands/add.js";
import { listCommand } from "../commands/list.js";
import { doctorCommand } from "../commands/doctor.js";
import { linkCommand } from "../commands/link.js";
import { configCommand } from "../commands/config.js";
import { checkCommand } from "../commands/check.js";
import { registryCommand } from "../commands/registry.js";

const program = new Command();

function showBanner() {
  console.log(chalk.cyan(`
  ███████╗ ██████╗ ██████╗  ██████╗ ██╗██╗  ██╗
  ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██║╚██╗██╔╝
  █████╗  ██║   ██║██████╔╝██║  ███╗██║ ╚███╔╝ 
  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██║ ██╔██╗ 
  ██║     ╚██████╔╝██║  ██║╚██████╔╝██║██╔╝ ██╗
  ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═╝
  `));
  console.log(chalk.gray(`  v1.1.0 - Agent-Aware Edition\n`));
}

program
  .name("forgix")
  .description("An elite project scaffolding CLI")
  .version("1.1.0");

showBanner();

program.addCommand(createCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(doctorCommand);
program.addCommand(linkCommand);
program.addCommand(configCommand);
program.addCommand(checkCommand);
program.addCommand(registryCommand);

program.parse(process.argv);
