import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export class PrismaTestEnvironment {
  private static container: StartedPostgreSqlContainer;

  /**
   * Boots an ephemeral PostgreSQL container and pushes the Prisma schema.
   * @param schema The database schema name (e.g., 'monitoring')
   * @param schemaPath Optional path to the schema.prisma file
   */
  static async setup(
    schema: string = "public",
    schemaPath: string = "schema.prisma",
  ): Promise<void> {
    console.log(
      `Booting ephemeral PostgreSQL container for schema: ${schema}...`,
    );
    this.container = await new PostgreSqlContainer("postgres:16-alpine")
      .withDatabase("erm_test")
      .withUsername("testuser")
      .withPassword("testpass")
      .start();

    // Dynamically inject the ephemeral DB URI to overriding existing local connection strings
    const databaseUrl = `${this.container.getConnectionUri()}?schema=${schema}`;
    process.env.DATABASE_URL = databaseUrl;

    console.log(`Pushing Prisma schema (${schemaPath}) to Testcontainer...`);

    // Cross-platform compatible script execution (Unix vs Windows CI safeguard)
    const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

    // Resilient path discovery: Handle both local root execution and CI package-level execution
    let resolvedSchemaPath = schemaPath;
    if (!fs.existsSync(resolvedSchemaPath)) {
      // If the path doesn't exist relative to CWD, try to find it relative to the monorepo root.
      // We look for 'package.json' in the parent directories to identify the root.
      let currentDir = process.cwd();
      let rootDir = "";
      while (currentDir !== path.parse(currentDir).root) {
        if (fs.existsSync(path.join(currentDir, "turbo.json"))) {
          rootDir = currentDir;
          break;
        }
        currentDir = path.dirname(currentDir);
      }

      const pathFromRoot = path.join(rootDir, schemaPath);
      if (rootDir && fs.existsSync(pathFromRoot)) {
        resolvedSchemaPath = pathFromRoot;
      } else {
        // Fallback: search for the filename anywhere in the sub-tree if it's just a filename
        const fileName = path.basename(schemaPath);
        if (fileName === schemaPath && fs.existsSync(fileName)) {
          resolvedSchemaPath = fileName;
        }
      }
    }

    try {
      execSync(
        `${npxCmd} prisma db push --schema=${resolvedSchemaPath} --accept-data-loss --skip-generate`,
        {
          env: { ...process.env, DATABASE_URL: databaseUrl },
          stdio: "pipe",
        },
      );
      console.log("Test database is ready.");
    } catch (error: any) {
      console.error(
        "Failed to push Prisma schema:",
        error?.stdout?.toString() || error,
      );
      throw error;
    }
  }

  /**
   * Stops the container definitively.
   */
  static async teardown(): Promise<void> {
    if (this.container) {
      console.log("Tearing down Testcontainer...");
      await this.container.stop();
    }
  }
}
