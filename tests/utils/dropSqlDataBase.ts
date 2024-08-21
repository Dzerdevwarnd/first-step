import { DataSource } from 'typeorm';

export async function dropSqlDataBase(app) {
  const dataSource = await app.resolve(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const tables = await queryRunner.query(`
			SELECT tablename 
			FROM pg_tables 
			WHERE schemaname = 'public'
		`);

  try {
    await queryRunner.startTransaction();

    for (const table of tables) {
      await queryRunner.query(
        `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`,
      );
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
  return;
}
