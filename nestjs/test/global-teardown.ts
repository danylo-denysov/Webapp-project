import { DataSource } from 'typeorm';

export default async () => {
  // Connect to database to cleanup test data
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'task-management',
  });

  try {
    await dataSource.initialize();
    console.log('Cleaning up test data...');

    // Delete all test users (CASCADE will handle related data)
    const result = await dataSource.query(
      `DELETE FROM "user" WHERE
       email LIKE '%@example.com' OR
       username LIKE 'test%' OR
       username LIKE '%user-%' OR
       username LIKE '%board%' OR
       username LIKE '%task%' OR
       username LIKE '%second%' OR
       username LIKE '%other%' OR
       username LIKE '%outsider%' OR
       username LIKE '%nonmember%'
       RETURNING id`,
    );

    console.log(`Cleaned up ${result.length} test users and their related data`);
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};
