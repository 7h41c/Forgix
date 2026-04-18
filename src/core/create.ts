import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import os from "os";
import { confirm } from "@inquirer/prompts";
import { replaceVariablesInDir } from "./template-engine.js";
import { installDependencies, PackageManager } from "./install.js";
import { loadHooks, runHooks, HooksConfig } from "./hooks.js";
import { loadTemplateManifest, createLockFile, TemplateManifest } from "./versioning.js";
import { scanTemplate, printDryRun, exportDryRunJSON } from "./dry-run.js";
import { resolveCompositionLayers, applyLayer } from "./composition.js";
import { execa } from "execa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CreateOptions {
  name: string;
  template: string;
  skipInstall?: boolean;
  git?: boolean;
  open?: boolean;
  variables?: { author: string; license: string };
  plugins?: string[];
  packageManager?: PackageManager;
  typescript?: boolean;
  css?: string;
  docker?: boolean;
  eslint?: boolean;
  prettier?: boolean;
  test?: boolean;
  ci?: boolean;
  trustRemote?: boolean;
  dryRun?: boolean;
  layers?: string[];
  nonInteractive?: boolean;
}

export async function runCreate(options: CreateOptions) {
  const {
    name,
    template,
    skipInstall,
    git,
    open,
    variables,
    plugins,
    packageManager = "npm",
    typescript,
    css,
    docker,
    eslint,
    prettier,
    test,
    ci,
    trustRemote = false,
    dryRun = false,
    layers = [],
    nonInteractive = false,
  } = options;

  const targetPath = path.join(process.cwd(), name);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`\n❌ Error: Folder '${name}' already exists.\n`));
    process.exit(1);
  }

  try {
    let templatePath = "";

    // 1. Fetch Template
    if (template.startsWith("github:")) {
      const repoPart = template.replace("github:", "");
      const githubRegex = /^([a-zA-Z0-9][a-zA-Z0-9-_]*\/)?[a-zA-Z0-9][a-zA-Z0-9-_]*$/;
      if (!githubRegex.test(repoPart) || repoPart.includes("..") || repoPart.includes("/.")) {
        throw new Error("Invalid GitHub repository format.");
      }
      
      const repoUrl = `https://github.com/${repoPart}.git`;
      
      if (!trustRemote && !nonInteractive) {
        console.log(chalk.red.bold("\n⚠️  SECURITY WARNING"));
        console.log(chalk.yellow("You are cloning a remote repository. Always inspect the code"));
        console.log(chalk.yellow("for malicious 'postinstall' scripts before running installation commands.\n"));
        
        const proceed = await confirm({ message: "Do you trust this source and want to proceed?", default: true });
        if (!proceed) {
          console.log(chalk.gray("Aborting for safety."));
          process.exit(1);
        }
      } else if (nonInteractive) {
        console.log(chalk.yellow("⚠️  Cloning remote template. Ensure you trust the source."));
        // Auto-accept in non-interactive mode
      }
      
      const spinner = ora(`Cloning remote template from GitHub...`).start();
      await execa("git", ["clone", "--depth", "1", repoUrl, targetPath]);
      
      const gitDir = path.join(targetPath, ".git");
      if (fs.existsSync(gitDir)) {
        try {
          fs.rmSync(gitDir, { recursive: true, force: true });
        } catch {
          throw new Error("Failed to remove .git directory - clone may be compromised.");
        }
        if (fs.existsSync(gitDir)) {
          throw new Error("Security error: .git directory still present after removal.");
        }
      }
      
      spinner.succeed(chalk.green("Remote template cloned."));
    } else {
      const spinner = ora(`Fetching ${template} template...`).start();
      
      const CONFIG_PATH = path.join(os.homedir(), ".forgix-links.json");
      let customLinks: Record<string, string> = {};
      
      if (fs.existsSync(CONFIG_PATH)) {
        customLinks = fs.readJsonSync(CONFIG_PATH);
      }

      if (customLinks[template]) {
        templatePath = customLinks[template];
        
        const resolvedPath = path.resolve(templatePath);
        const normalizedPath = path.normalize(templatePath);
        if (normalizedPath.includes("..") || !path.isAbsolute(resolvedPath)) {
          throw new Error("Invalid template path in custom link.");
        }
        
        const stat = fs.statSync(resolvedPath);
        if (!stat.isDirectory()) {
          throw new Error("Template path must be a directory, not a file.");
        }
        
        const sensitiveDirs = [".ssh", ".gnupg", ".aws", ".npm", ".cache"];
        if (sensitiveDirs.some(dir => resolvedPath.includes(dir))) {
          throw new Error("Cannot use system directories as templates.");
        }
      } else {
        templatePath = path.join(__dirname, "../../templates", template);
      }

      if (!fs.existsSync(templatePath)) {
        spinner.fail();
        throw new Error(`Template '${template}' not found in local templates or links.`);
      }
      
      fs.copySync(templatePath, targetPath);
      spinner.succeed(chalk.green(`Template '${template}' loaded.`));

      // Load template manifest for versioning
      const manifest = loadTemplateManifest(templatePath);

      // Apply composition layers if selected
      if (layers.length > 0) {
        const compLayers = resolveCompositionLayers(templatePath, layers);
        for (const { path: layerDir, layer } of compLayers) {
          spinner.text = `Applying layer: ${layer.name}...`;
          applyLayer(layerDir, targetPath, layer.conflicts || "overwrite");
        }
      }

      // Dry-run: show preview and exit
      if (dryRun) {
        spinner.stop();
        const preview = scanTemplate(templatePath, targetPath);
        if (nonInteractive) {
          console.log(JSON.stringify(exportDryRunJSON(preview), null, 2));
        } else {
          printDryRun(preview);
        }
        // Don't create anything, just exit
        fs.removeSync(targetPath);
        console.log(chalk.gray("  Dry run complete. No files were created."));
        return;
      }
    }

    // Load hooks if present
    const hooks = loadHooks(templatePath);

    // Run pre-scaffold hooks
    if (hooks) {
      const vars = {
        projectName: name,
        author: variables?.author || "Developer",
        license: variables?.license || "MIT",
      };
      const ok = await runHooks("pre_scaffold", hooks, targetPath, vars);
      if (!ok) {
        throw new Error("Pre-scaffold hooks failed. Aborting.");
      }
    }

    // Apply CLI customizations
    await applyCustomizations(targetPath, { typescript, css, docker, eslint, prettier, test, ci });

    const spinner = ora("Configuring project...").start();

    // 2. Inject Variables
    spinner.text = "Injecting project variables...";
    await replaceVariablesInDir(targetPath, { 
      projectName: name,
      author: variables?.author || "Developer",
      license: variables?.license || "MIT"
    });

    // 3. Inject Plugins
    if (plugins && plugins.length > 0) {
      for (const plugin of plugins) {
        spinner.text = `Injecting plugin: ${plugin}...`;
        const pluginPath = path.join(__dirname, "../../plugins", plugin);
        if (fs.existsSync(pluginPath)) {
          fs.copySync(pluginPath, targetPath, { overwrite: true });
        }
      }
    }

    // 4. Install Dependencies
    if (fs.existsSync(path.join(targetPath, "package.json")) && !skipInstall) {
      spinner.text = `Installing dependencies with ${packageManager}...`;
      await installDependencies(targetPath, packageManager);
    }

    // 5. Initialize Git
    if (git) {
      spinner.text = "Initializing Git repository...";
      await execa("git", ["init"], { cwd: targetPath });
      await execa("git", ["add", "."], { cwd: targetPath });
      await execa("git", ["commit", "-m", "Initial commit from Forgix 🚀"], { cwd: targetPath });
    }

    spinner.succeed(chalk.green("Project created successfully!"));

    // 6. Run post-scaffold hooks
    const ranHookIds: string[] = [];
    if (hooks) {
      const vars = {
        projectName: name,
        author: variables?.author || "Developer",
        license: variables?.license || "MIT",
      };
      await runHooks("post_scaffold", hooks, targetPath, vars);
      ranHookIds.push(...(hooks.post_scaffold || []).map(h => h.id));
    }

    // 7. Write scaffold lock file
    const manifest = loadTemplateManifest(path.join(__dirname, "../../templates", template));
    createLockFile(
      template,
      manifest?.version || "1.0.0",
      "local",
      targetPath,
      {
        projectName: name,
        author: variables?.author || "Developer",
        license: variables?.license || "MIT",
      },
      ranHookIds
    );

    // 8. Open in VS Code
    if (open) {
      const openCommands = [
        { cmd: "code", args: ["."] },
        { cmd: "code.cmd", args: ["."] },
        { cmd: "powershell.exe", args: ["-Command", "code ."] }
      ];

      for (const attempt of openCommands) {
        try {
          await execa(attempt.cmd, attempt.args, { cwd: targetPath, shell: false });
          console.log(chalk.magenta("📂 Project opened in VS Code."));
          break; 
        } catch {
          continue; 
        }
      }
    }

    console.log(`\n🚀 ${chalk.cyan(name)} is ready!\n`);

    // 7. Agent-friendly summary output
    if (nonInteractive) {
      console.log(JSON.stringify({
        status: "created",
        name,
        template,
        path: targetPath,
        packageManager,
        git: !!git,
        plugins: plugins || []
      }, null, 2));
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(chalk.red(`\n❌ Error: ${message}`));
    process.exit(1);
  }
}

interface CustomizationOptions {
  typescript?: boolean;
  css?: string;
  docker?: boolean;
  eslint?: boolean;
  prettier?: boolean;
  test?: boolean;
  ci?: boolean;
}

async function applyCustomizations(targetPath: string, options: CustomizationOptions) {
  const { typescript, css, docker, eslint, prettier, test, ci } = options;
  
  // TypeScript: Rename jsconfig.json to tsconfig.json if present
  if (typescript) {
    const jsconfigPath = path.join(targetPath, "jsconfig.json");
    if (fs.existsSync(jsconfigPath)) {
      fs.renameSync(jsconfigPath, path.join(targetPath, "tsconfig.json"));
    }
  }

  // Docker: Add docker-compose if requested
  if (docker) {
    const dockerComposePath = path.join(targetPath, "docker-compose.yml");
    if (!fs.existsSync(dockerComposePath)) {
      const pkg = fs.existsSync(path.join(targetPath, "package.json")) 
        ? fs.readJsonSync(path.join(targetPath, "package.json"))
        : { name: "app" };
      
      fs.writeFileSync(dockerComposePath, 
`version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    command: ${typescript ? "npm run dev" : "npm start"}
`);
    }
  }

  // ESLint: Add .eslintrc.json
  if (eslint) {
    const eslintConfig = path.join(targetPath, ".eslintrc.json");
    
    if (!fs.existsSync(eslintConfig)) {
      const config = typescript
        ? { env: { browser: true, es2021: true, node: true }, extends: ["eslint:recommended"], parser: "@typescript-eslint/parser", parserOptions: { ecmaVersion: "latest", sourceType: "module" }, rules: {} }
        : { env: { browser: true, es2021: true, node: true }, extends: ["eslint:recommended"], parserOptions: { ecmaVersion: "latest", sourceType: "module" }, rules: {} };
      
      fs.writeFileSync(eslintConfig, JSON.stringify(config, null, 2));
    }
  }

  // Prettier: Add .prettierrc
  if (prettier) {
    const prettierPath = path.join(targetPath, ".prettierrc");
    if (!fs.existsSync(prettierPath)) {
      fs.writeFileSync(prettierPath, JSON.stringify({ semi: true, singleQuote: true, tabWidth: 2, trailingComma: "es5" }, null, 2));
    }
  }

  // Test: Add basic test setup
  if (test) {
    const testDir = path.join(targetPath, "tests");
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, "example.test.js"), 
`describe('Example Test', () => {
  test('should pass', () => {
    expect(true).toBe(true);
  });
});
`);
    }
    
    // Update package.json with test script if exists
    const pkgPath = path.join(targetPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = fs.readJsonSync(pkgPath);
      pkg.scripts = pkg.scripts || {};
      pkg.scripts.test = "jest";
      fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    }
  }

  // CI: Add GitHub Actions workflow
  if (ci) {
    const workflowDir = path.join(targetPath, ".github", "workflows");
    if (!fs.existsSync(workflowDir)) {
      fs.mkdirSync(workflowDir, { recursive: true });
      
      const nodeVersion = typescript ? "20" : "18";
      
      fs.writeFileSync(path.join(workflowDir, "ci.yml"), 
`name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '${nodeVersion}'
        cache: 'npm'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
`);
    }
  }
}

// Helper to detect package manager from lock files
export function detectPackageManager(dir: string): PackageManager {
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
  return "npm";
}