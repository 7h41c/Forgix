import fs from "fs-extra";
import path from "path";
import os from "os";
import { execa } from "execa";
import chalk from "chalk";
import YAML from "yaml";

export interface RegistryConfig {
  registries: {
    [name: string]: {
      url: string;
      default?: boolean;
      auth?: string;
    };
  };
}

export interface TemplateSearchResult {
  name: string;
  version: string;
  description: string;
  source: string;
}

const REGISTRY_CONFIG = path.join(os.homedir(), ".forgix-registry.yaml");

export function loadRegistryConfig(): RegistryConfig {
  if (fs.existsSync(REGISTRY_CONFIG)) {
    try {
      const content = fs.readFileSync(REGISTRY_CONFIG, "utf-8");
      return YAML.parse(content) as RegistryConfig;
    } catch {
      // Fall through to default
    }
  }

  return {
    registries: {
      npm: {
        url: "https://registry.npmjs.org",
        default: true,
      },
    },
  };
}

export function saveRegistryConfig(config: RegistryConfig): void {
  fs.writeFileSync(REGISTRY_CONFIG, YAML.stringify(config, { lineWidth: 120 }));
  try {
    fs.chmodSync(REGISTRY_CONFIG, "0600");
  } catch {
    // chmod may fail on Windows
  }
}

export function addRegistry(name: string, url: string, auth?: string): void {
  const config = loadRegistryConfig();
  config.registries[name] = { url, ...(auth && { auth }) };
  saveRegistryConfig(config);
}

export function removeRegistry(name: string): void {
  const config = loadRegistryConfig();
  delete config.registries[name];
  saveRegistryConfig(config);
}

function getTemplateInstallDir(): string {
  const dir = path.join(os.homedir(), ".forgix", "registry-templates");
  fs.ensureDirSync(dir);
  return dir;
}

export async function installFromRegistry(
  packageName: string,
  version?: string
): Promise<string | null> {
  const installDir = getTemplateInstallDir();
  const spec = version ? `${packageName}@${version}` : packageName;
  const targetDir = path.join(installDir, packageName.replace(/[^a-zA-Z0-9@/-]/g, "_"));

  // Clean and prepare
  if (fs.existsSync(targetDir)) {
    fs.removeSync(targetDir);
  }
  fs.ensureDirSync(targetDir);

  // Create a minimal package.json to install into
  fs.writeJsonSync(path.join(targetDir, "package.json"), {
    private: true,
    dependencies: { [packageName]: version || "latest" },
  }, { spaces: 2 });

  try {
    await execa("npm", ["install", "--production", "--no-optional"], {
      cwd: targetDir,
      timeout: 60000,
    });

    const templatePath = path.join(targetDir, "node_modules", packageName);
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }
    return null;
  } catch {
    // Clean up on failure
    try { fs.removeSync(targetDir); } catch {}
    return null;
  }
}

export async function searchRegistry(query: string): Promise<TemplateSearchResult[]> {
  try {
    const { stdout } = await execa("npm", [
      "search",
      "--json",
      `forgix-template ${query}`,
    ], { timeout: 30000 });

    const results = JSON.parse(stdout);
    return results
      .filter((r: any) =>
        r.name?.includes("template") ||
        r.keywords?.includes("forgix-template") ||
        r.keywords?.includes("scaffold")
      )
      .map((r: any) => ({
        name: r.name,
        version: r.version,
        description: r.description || "",
        source: "npm",
      }));
  } catch {
    return [];
  }
}

export async function publishTemplate(
  templateDir: string,
  packageName: string,
  registry?: string
): Promise<boolean> {
  // Validate template
  const templateYaml = path.join(templateDir, "template.yaml");
  if (!fs.existsSync(templateYaml)) {
    console.log(chalk.red("  Error: template.yaml not found. Add a manifest before publishing."));
    return false;
  }

  // Check for package.json
  const pkgPath = path.join(templateDir, "package.json");
  let pkg: any;
  if (fs.existsSync(pkgPath)) {
    pkg = fs.readJsonSync(pkgPath);
  } else {
    // Generate one
    const manifest = YAML.parse(fs.readFileSync(templateYaml, "utf-8"));
    pkg = {
      name: packageName,
      version: manifest.version || "1.0.0",
      description: manifest.description || "A Forgix template",
      keywords: ["forgix-template", "scaffold"],
      license: manifest.license || "MIT",
      files: ["**/*"],
    };
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
  }

  // Ensure keywords
  pkg.keywords = [...new Set([...(pkg.keywords || []), "forgix-template", "scaffold"])];
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

  try {
    const args = ["publish", "--access", "public"];
    if (registry) {
      args.push("--registry", registry);
    }
    await execa("npm", args, { cwd: templateDir, timeout: 60000 });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(chalk.red(`  Publish failed: ${message}`));
    return false;
  }
}
