import { Command } from "commander";
import { runAdd } from "../core/add.js";

export const addCommand = new Command("add")
  .description("Add a plugin feature to an existing project")
  .argument("<plugin>", "Name of the plugin (e.g., docker)")
  .action(async (plugin) => {
    await runAdd(plugin);
  });
