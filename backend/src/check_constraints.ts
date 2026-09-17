import { db } from './config/db';

async function main() {
  try {
    const res = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.table(res.rows);
  } catch (err: any) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
main();
