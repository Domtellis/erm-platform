export async function truncateDatabase(
  prisma: any,
  schema: string = "public",
): Promise<void> {
  // CRITICAL SAFEGUARD: Never allow this to run outside of the CI test suite!
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      `FATAL: Attempted to aggressively truncate database outside of test environment! NODE_ENV is '${process.env.NODE_ENV}', must be 'test'. Execution halted.`,
    );
  }

  // Introspect the database to find all tables within the active schema,
  // ignoring internal migration tables.
  const tables = (await (prisma as any).$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname='${schema}' AND tablename != '_prisma_migrations';`,
  )) as Array<{ tablename: string }>;

  if (tables.length > 0) {
    const tableNames = tables
      .map((t) => `"${schema}"."${t.tablename}"`)
      .join(", ");
    // Execute a hyper-fast PostgreSQL CASCADE truncation to wipe all records
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE;`);
  }
}
