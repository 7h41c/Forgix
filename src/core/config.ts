import fs from "fs-extra";
import path from "path";
import os from "os";

const CONFIG_PATH = path.join(os.homedir(), ".forgix-config.json");

export interface ForgixConfig {
  defaultAuthor: string;
  defaultLicense: string;
  preferredEditor: string;
  autoGit: boolean;
}

const defaultConfig: ForgixConfig = {
  defaultAuthor: "Developer",
  defaultLicense: "MIT",
  preferredEditor: "code",
  autoGit: true
};

export async function getConfig(): Promise<ForgixConfig> {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const userConfig = await fs.readJson(CONFIG_PATH);
      return { ...defaultConfig, ...userConfig };
    } catch {
      return defaultConfig;
    }
  }
  return defaultConfig;
}

export async function saveConfig(config: Partial<ForgixConfig>) {
  const current = await getConfig();
  const updated = { ...current, ...config };
  await fs.writeJson(CONFIG_PATH, updated, { spaces: 2 });
  // SECURITY: Restrict config to owner-only (was world-readable)
  fs.chmodSync(CONFIG_PATH, "0600");
}
