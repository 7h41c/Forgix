import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { runCreate } from "../core/create.js";

export const createCommand = new Command("create")
  .description("Scaffold a new project")
  .argument("[name]", "Name of your project (optional)")
  .option("-t, --template <type>", "Template to use (e.g., node-api, github:user/repo)")
  .option("--skip-install", "Skip dependency installation for faster scaffolding") // NEW FLAG
  .action(async (nameArg, options) => {
    try {
      let projectName = nameArg;
      if (!projectName) {
        projectName = await input({
          message: "Project name:",
          default: "my-app",
        });
      }

      let template = options.template;
      if (!template) {
        template = await select({
          message: "Select template:",
          choices: [
            { name: "Node.js API", value: "node-api" },
            { name: "React (Vite)", value: "react-vite" },
            { name: "Python Script", value: "python-script" }
          ],
        });
      }

      // Pass the skipInstall option to the core engine
      await runCreate({ 
        name: projectName, 
        template, 
        skipInstall: options.skipInstall 
      });
      
    } catch (error) {
      console.log("\nExiting Forgix...");
      process.exit(1);
    }
  });
