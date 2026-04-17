import { Command } from "commander";
import { createCommand } from "../commands/create.js";
import { addCommand } from "../commands/add.js";
import { listCommand } from "../commands/list.js"; // NEW IMPORT

const program = new Command();

program
  .name("forgix")
  .description("An elite project scaffolding CLI")
  .version("1.0.2");

// Register all commands
program.addCommand(createCommand);
program.addCommand(addCommand);
program.addCommand(listCommand); // NEW REGISTRATION

program.parse(process.argv);
