import { Command } from "commander";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import {
  loadRegistryConfig,
  addRegistry,
  removeRegistry,
  searchRegistry,
  publishTemplate,
} from "../core/registry.js";

export const registryCommand = new Command("registry")
  .description("Manage template registries (npm-based)")
  .argument("<action>", "Action: add, remove, list, search, publish")
  .argument("[args...]", "Action arguments")
  .option("--url <url>", "Registry URL (for add)")
  .option("--json", "Output as JSON")
  .action(async (action, args, options) => {
    switch (action) {
      case "add": {
        const name = args[0];
        const url = options.url || (await input({ message: "Registry URL:" }));
        if (!name) {
          console.log(chalk.red("Usage: forgix registry add <name> --url <url>"));
          process.exit(1);
        }
        addRegistry(name, url);
        console.log(chalk.green(`\n  ✓ Registry '${name}' added: ${url}\n`));
        break;
      }

      case "remove": {
        const name = args[0];
        if (!name) {
          console.log(chalk.red("Usage: forgix registry remove <name>"));
          process.exit(1);
        }
        removeRegistry(name);
        console.log(chalk.green(`\n  ✓ Registry '${name}' removed.\n`));
        break;
      }

      case "list": {
        const config = loadRegistryConfig();
        if (options.json) {
          console.log(JSON.stringify(config, null, 2));
        } else {
          console.log(chalk.cyan("\n  Configured Registries:\n"));
          for (const [name, reg] of Object.entries(config.registries)) {
            const def = reg.default ? chalk.gray(" (default)") : "";
            console.log(`  ${chalk.white(name)}${def}`);
            console.log(`    ${chalk.gray(reg.url)}`);
          }
          console.log("");
        }
        break;
      }

      case "search": {
        const query = args[0] || "";
        console.log(chalk.cyan(`\n  Searching for templates: "${query}"...\n`));
        const results = await searchRegistry(query);
        if (results.length === 0) {
          console.log(chalk.gray("  No templates found. Try different keywords."));
        } else {
          for (const r of results) {
            console.log(`  ${chalk.white(r.name)} ${chalk.gray(`v${r.version}`)}`);
            if (r.description) {
              console.log(`    ${chalk.gray(r.description)}`);
            }
          }
        }
        console.log("");
        break;
      }

      case "publish": {
        const dir = args[0] || ".";
        const name = args[1];
        if (!name) {
          console.log(chalk.red("Usage: forgix registry publish <dir> <package-name>"));
          process.exit(1);
        }
        console.log(chalk.cyan(`\n  Publishing ${name}...\n`));
        const ok = await publishTemplate(dir, name);
        if (ok) {
          console.log(chalk.green(`\n  ✓ Published ${name} successfully!\n`));
        } else {
          process.exit(1);
        }
        break;
      }

      default:
        console.log(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.gray("Available: add, remove, list, search, publish"));
        process.exit(1);
    }
  });
