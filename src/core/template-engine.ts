import fs from "fs-extra";
import path from "path";

const BINARY_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg", ".pdf", ".zip", ".tar", ".gz", ".exe", ".dll", ".so", ".dylib", ".bin"];

function isBinaryFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return BINARY_EXTENSIONS.includes(ext);
}

export async function replaceVariablesInDir(dir: string, vars: Record<string, string>) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Skip node_modules or .git if they accidentally exist in templates
    if (file === "node_modules" || file === ".git") continue;

    if (fs.statSync(fullPath).isDirectory()) {
      await replaceVariablesInDir(fullPath, vars);
    } else {
      // Skip binary files to prevent corruption
      if (isBinaryFile(fullPath)) continue;
      
      let content = fs.readFileSync(fullPath, "utf-8");
      
      // Replace {{key}} with actual values
      content = content.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        return vars[key.trim()] || "";
      });
      
      fs.writeFileSync(fullPath, content);
    }
  }
}
