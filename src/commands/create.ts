import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { runCreate } from "../core/create.js";

export const createCommand = new Command("create")
  .description("Scaffold a new project")
  .argument("[name]", "Name of your project")
  .option("-t, --template <type>", "Template to use")
  .option("--skip-install", "Skip dependency installation")
  .option("--git", "Initialize a git repository")
  .option("--open", "Open the project in VS Code")
  .action(async (nameArg, options) => {
    try {
      let projectName = nameArg || await input({ message: "Project name:", default: "my-app" });

      let template = options.template || await select({
        message: "Select template:",
        choices: [
          { name: "Node.js API", value: "node-api" },
          { name: "React (Vite)", value: "react-vite" },
          { name: "Python Script", value: "python-script" },
          { name: "Vue.js App", value: "vue-app" }
        ],
      });

      // --- NEW QUESTIONS ---
      const author = await input({ message: "Author Name:", default: "Developer" });
      const license = await select({
        message: "Select License:",
        choices: [
          { name: "MIT", value: "MIT" },
          { name: "ISC", value: "ISC" },
          { name: "Apache-2.0", value: "Apache-2.0" }
        ]
      });

      await runCreate({
        name: projectName,
        template,
        skipInstall: options.skipInstall,
        git: options.git,
        open: options.open,
        variables: { author, license } // PASSING DATA TO CORE
      });

    } catch (error) {
      console.log("\nExiting Forgix...");
      process.exit(1);
    }
  });
