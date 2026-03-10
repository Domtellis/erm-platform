import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execSync } from "child_process";

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

    try {
      execSync(
        `${npxCmd} prisma db push --schema=${schemaPath} --accept-data-loss --skip-generate`,
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
