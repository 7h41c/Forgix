import { Command } from "commander";
import chalk from "chalk";
import path from "path";
import { runGovernanceChecks, printCheckReport, exportCheckJSON } from "../core/check.js";
import { analyzeDependencies, printDepReport, exportDepJSON } from "../core/deps-intel.js";

export const checkCommand = new Command("check")
  .description("Audit a project for governance, security, and best practices")
  .argument("[dir]", "Project directory to check", ".")
  .option("--json", "Output as JSON")
  .option("--deps", "Include dependency analysis (slower)")
  .action(async (dir, options) => {
    const projectDir = path.resolve(dir);

    // Governance checks
    const report = await runGovernanceChecks(projectDir);

    // Dependency analysis
    let depIssues: any[] = [];
    if (options.deps) {
      depIssues = await analyzeDependencies(projectDir);
    }

    if (options.json) {
      const output: any = { governance: exportCheckJSON(report) };
      if (options.deps) {
        output.dependencies = exportDepJSON(depIssues);
      }
      console.log(JSON.stringify(output, null, 2));
    } else {
      printCheckReport(report);
      if (options.deps) {
        printDepReport(depIssues);
      }
    }

    // Exit code based on score
    const hasCriticalDeps = depIssues.some((i: any) => i.severity === "critical" || i.severity === "high");
    if (report.score < 50 || hasCriticalDeps) {
      process.exit(1);
    }
  });
