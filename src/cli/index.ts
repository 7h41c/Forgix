import { Command } from "commander";
import { createCommand } from "../commands/create.js";
import { addCommand } from "../commands/add.js"; // NEW IMPORT

const program = new Command();

program
  .name("forgix")
  .description("An elite project scaffolding CLI")
  .version("1.0.0");

// Attach our specific commands
program.addCommand(createCommand);
program.addCommand(addCommand); // NEW ATTACHMENT

// Parse the arguments passed by the user
program.parse(process.argv);
